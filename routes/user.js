var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');


var Order = require('../models/order');
var Cart = require('../models/cart');
var User = require('../models/user');


// var csrfProtection = csrf();
// router.use(csrfProtection);

router.get('/user/order-history', isLoggedIn ,function (req, res) {
    Order.find({user: req.user}, function(err, orders){
        if(err){
            return res.write('Error !');
        }
        var cart;
        orders.forEach(function(order){
            cart = new Cart(order.cart);
            order.items = cart.generateArray();
        });
        res.render('user/my_orders', {currentUser: req.user, orders: orders});
    });
});

router.get('/user/order-history/details/:oid', isLoggedIn ,function (req, res) {
    Order.findById(req.params.oid, function(err, order){
        if(err){
            return res.write('Error !');
        }
        var products = Object.values(order.cart.items);
        res.render('user/user_order_details', {order: order, products: products});
    });
});

router.get('/user/logout', function(req, res, next){
    req.logout();
    res.redirect('/');
});

router.get('/user/signup', function (req, res) {
    var messages = req.flash('error');
    var siteKey = process.env.CAPTCHASITEKEY;
    res.render('user/signup', { /*csrfToken: req.csrfToken(),*/ messages: messages, hasError: messages.length > 0, siteKey: siteKey });
});

router.post('/user/signup', passport.authenticate('local.signup', {
    failureRedirect: '/user/signup',
    failureFlash: true
}),function(req,res){
    if(req.session.oldUrl){
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
    } else {
        User.findOne({'email': req.body.email}, function(err, user){
            if(user.isSeller){
                res.redirect('/admin');
            } else {
                res.redirect('/user/order-history');
            }
        });
    }
});

router.get('/user/signin', function (req, res) {
    var messages = req.flash('error');
    res.render('user/signin', { /*csrfToken: req.csrfToken(),*/ messages: messages, hasError: messages.length > 0 });
});

router.post('/user/signin', passport.authenticate('local.signin', {
    failureRedirect: '/user/signin',
    failureFlash: true
}), function(req,res){
    if(req.session.oldUrl){
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
    } else {
        User.findOne({'email': req.body.email}, function(err, user){
            if(user.isSeller){
                res.redirect('/admin');
            } else {
                res.redirect('/user/order-history');
            }
        });
    }
});



module.exports = router;

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/user/signin');
}

