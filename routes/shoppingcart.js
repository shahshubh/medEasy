var express = require('express');
var router = express.Router();
var Product = require("../models/product");
var Cart = require('../models/cart');
var Order = require('../models/order');
var ObjectId = require('mongoose').Types.ObjectId;

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
        //console.log(req.session.cart);
        req.flash('success', 'Added to Cart');
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
    console.log(cart);
    cart.removeItem(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

router.get('/shopping-cart', function (req, res) {  
    if (!req.session.cart) {
        return res.render('shop/shopping-cart', { products: null });
    }
    let result;
    let referer = req.get('referer');
    let temp = "http://"+req.get('host');
    if(referer){
        result = referer.replace(temp, '');
    } else {
        result = "/"
    }
    console.log("CART: ",result);
    //console.log(temp);
    //console.log(req.get('referer'));
    //console.log(req.get('host'));
    var cart = new Cart(req.session.cart);
    res.render('shop/shopping-cart', { products: cart.generateArray(), totalPrice: cart.totalPrice, prevUrl: result });
});


router.get('/products/:id',function(req,res){
    var productId = req.params.id;
    Product.findById(productId, function(err,foundProduct){
    if(err){
        console.log(err);
    }
    else{
        var cat = foundProduct.category;
        var category = cat.toUpperCase();
        res.render('shop/show',{product: foundProduct, category: category })
    }
    });
});


router.get('/checkout', isLoggedIn, function (req, res) {
    if (!req.session.cart) {
        res.redirect('/shopping-cart');
    }
    let result;
    let referer = req.get('referer');
    let temp = "http://"+req.get('host');
    if(referer){
        result = referer.replace(temp, '');
    } else {
        result = "/"
    }
    console.log("CHECKOUT: ",result);

    var cart = new Cart(req.session.cart);
    var errMsg = req.flash('error')[0];
    res.render('shop/checkout', {cart: cart, total: cart.totalPrice, errMsg: errMsg, noErrors: !errMsg, prevUrl: result });
});

router.post('/checkout', isLoggedIn, function (req, res) {
    if (!req.session.cart) {
        res.redirect('/shopping-cart');
    }
    var cart = new Cart(req.session.cart);
    if(req.body.name==="" || req.body.address==="" || req.body.city==="" || req.body.state==="" || req.body.zip===""){
        req.flash('error', "Please fill out all the shipping details");
        return res.redirect('/checkout');
    }
    if(req.body.Radio==='a')
    {
        
        var stripe = require('stripe')('sk_test_D7997ZtAIPpJolaDEaFl4cp0007MSV4quL');
    // `source` is obtained with Stripe.js; see https://stripe.com/docs/payments/accept-a-payment-charges#web-create-token
    //console.log(req.body.Radio);
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
            var date = new Date();
            date.setHours(0,0,0,0);
            console.log("Date: ",date);
            console.log("DATE: ",date.getDate(),"-",date.getMonth(),"-",date.getFullYear());
            var order = new Order({
                user: req.user,
                cart: cart,
                address: req.body.address,
                name: req.body.name,
                paymentId: charge.id,
                paymentMode: "Online",
                purchaseDate: date
            });
            //console.log(cart);
            //console.log("ORDER: ", order);
            Object.values(cart.items).forEach(function(product){
                let prevQty = product.item.qty;
                let newQty = prevQty-product.qty; 

//UPDATE QTY in database

/*
    const getId = (id) => {
        if(id){
            if(id.length !== 24){
                return id;
            }
        }
        return ObjectId(id);
    };
*/
    //db.orders.findOne({ _id: getId(req.params.id) })
                Product.findOneAndUpdate({"_id": ObjectId(`${product.item._id}`)},{$set: {"qty": newQty}},function(err,data){
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
                    pass: process.env.MAILPASS
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
    }
    else if(req.body.Radio==='b')
    {
        var date = new Date();
        date.setHours(0,0,0,0);
        console.log("Date: ",date);
        console.log("DATE: ",date.getDate(),"-",date.getMonth(),"-",date.getFullYear());
        var order = new Order({
            user: req.user,
            cart: cart,
            address: req.body.address,
            name: req.body.name,
            paymentMode: "Cash",
            purchaseDate: date
        });
        //console.log(cart);
        //console.log("ORDER: ", order);
        Object.values(cart.items).forEach(function(product){
            let prevQty = product.item.qty;
            let newQty = prevQty-product.qty; 

            let newsoldQty = product.item.soldQty + product.qty;

            //UPDATE QTY in database
            Product.findOneAndUpdate({"_id": ObjectId(`${product.item._id}`)},{$set: {qty: newQty, soldQty: newsoldQty}},function(err,data){
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
                pass: process.env.MAILPASS
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
    }
    else{
        console.log("NOTHING");
        res.redirect('/');

    }
});

module.exports = router;



//MIDDLEWARE
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.oldUrl = req.url;
    res.redirect('/user/signin');
}