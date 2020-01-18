var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');


var csrfProtection = csrf();
router.use(csrfProtection);

router.get('/user/profile', isLoggedIn ,function (req, res) {
    res.render('user/profile', {currentUser: req.user});
});
router.get('/user/logout', function(req, res, next){
    req.logout();
    res.redirect('/');
});

router.get('/user/signup', function (req, res) {
    var messages = req.flash('error');
    res.render('user/signup', { csrfToken: req.csrfToken(), messages: messages, hasError: messages.length > 0 });
});

router.post('/user/signup', passport.authenticate('local.signup', {
    successRedirect: '/user/profile',
    failureRedirect: '/user/signup',
    failureFlash: true

}));

router.get('/user/signin', function (req, res) {
    var messages = req.flash('error');
    res.render('user/signin', { csrfToken: req.csrfToken(), messages: messages, hasError: messages.length > 0 });
});

router.post('/user/signin', passport.authenticate('local.signin', {
    successRedirect: '/',
    failureRedirect: '/user/signin',
    failureFlash: true
}), function(req,res){

});



module.exports = router;

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/user/signin');
}

