var express = require('express');
var router = express.Router();

var Product = require("../models/product");
var Cart = require('../models/cart');
var Order = require('../models/order');

const nodemailer = require('nodemailer');


router.get('/add-to-cart/:id', function (req, res) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    Product.findById(productId, function (err, product) {
        if (err) {
            return res.redirect('/');
        }
        cart.add(product, product.id);
        req.session.cart = cart;
        console.log(req.session.cart);
        res.redirect('/');
    });
});

router.get('/reduce/:id', function (req, res) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.reduceByOne(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

router.get('/increase/:id', function (req, res) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.increaseByOne(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

router.get('/remove/:id', function (req, res) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.removeItem(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

router.get('/shopping-cart', function (req, res) {
    if (!req.session.cart) {
        return res.render('shop/shopping-cart', { products: null });
    }
    var cart = new Cart(req.session.cart);
    res.render('shop/shopping-cart', { products: cart.generateArray(), totalPrice: cart.totalPrice });
});

router.get('/checkout', isLoggedIn, function (req, res) {
    if (!req.session.cart) {
        res.redirect('/shopping-cart');
    }
    var cart = new Cart(req.session.cart);
    var errMsg = req.flash('error')[0];
    res.render('shop/checkout', { total: cart.totalPrice, errMsg: errMsg, noErrors: !errMsg });
});

router.post('/checkout', isLoggedIn, function (req, res) {
    if (!req.session.cart) {
        res.redirect('/shopping-cart');
    }
    var cart = new Cart(req.session.cart);
    var stripe = require('stripe')('sk_test_D7997ZtAIPpJolaDEaFl4cp0007MSV4quL');
    // `source` is obtained with Stripe.js; see https://stripe.com/docs/payments/accept-a-payment-charges#web-create-token
    stripe.charges.create(
        {
            amount: cart.totalPrice * 100,
            currency: 'inr',
            source: req.body.stripeToken,
            description: 'MedEasy',
        },
        function (err, charge) {
            // asynchronously called
            if (err) {
                req.flash('error', err.message);
                return res.redirect('/checkout');
            }


            var order = new Order({
                user: req.user,
                cart: cart,
                address: req.body.address,
                name: req.body.name,
                paymentId: charge.id
            });
            //console.log(cart);
            //console.log("ORDER: ", order);
            Object.values(cart.items).forEach(function(product){
                let prevQty = product.item.qty;
                let newQty = prevQty-product.qty; 

                //UPDATE QTY in database
                Product.findOneAndUpdate({"title": product.item.title},{$set: {"qty": newQty}},function(err,data){
                    if(err){
                        console.log(err);
                    }
                });
            });
            //SEND ORDER CONFIRMATION EMAIL TO CUSTOMER
            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'shahshubh1010@gmail.com',
                    pass: 'chandra#401'
                }
            });

            let mailOptions = {
                from: 'shahshubh1010@gmail.com',
                to: req.user.email,
                subject: 'MedEasy',
                text: '',
                html: `<h2>Successfully recieved your order ${order.user.fullname}</h2>
        <br>
        Your order quantity: <b>${cart.totalQty}</b>
        <br>
        Your order price: <b>₹ ${cart.totalPrice}</b>
        <p>You can view you order details in order history under your account</p>
        <hr>
        <b>
        <h3>Thank you for ordering with MedEasy!</h3>
        <h4>Get Well Soon !!</h4>
        </b>`
            };

            transporter.sendMail(mailOptions, function (err, data) {
                if (err) {
                    console.log("Failed ", err);
                }
                else {
                    console.log("Email sent !!");
                }
            });









            order.save(function (err, result) {
                req.flash('success', 'Sucessfully bought the product');
                req.session.cart = null;
                res.redirect('/');
            });
        });
});

module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.oldUrl = req.url;
    res.redirect('/user/signin');
}