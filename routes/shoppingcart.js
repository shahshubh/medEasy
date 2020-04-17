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
        req.flash('success', 'Added to Cart');
        res.redirect("back");
        //res.redirect('/category/'+product.category);  
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
    var errMsg = req.flash('error')[0];
    if (!req.session.cart) {
        return res.render('shop/shopping-cart', { products: null });
    }
    var cart = new Cart(req.session.cart);
    res.render('shop/shopping-cart', { products: cart.generateArray(), totalPrice: cart.totalPrice,errMsg: errMsg, noErrors: !errMsg});
});


router.get('/products/:id', function(req,res){
    var successMsg = req.flash('success')[0];
    var isIcon;
    if(successMsg==="Added to Cart"){
        isIcon = true;
    }

    var productId = req.params.id;
    Product.findById(productId, function(err,foundProduct){
    if(err){
        console.log(err);
    }
    else{
        res.render('shop/show',{product: foundProduct, successMsg: successMsg,noMessages: !successMsg, isIcon: isIcon })
    }
    });
});


router.get('/checkout', isLoggedIn, isNotAdmin, function (req, res) {
    var errMsg = req.flash('error')[0];
    if (!req.session.cart) {
        res.redirect('/shopping-cart');
    }
    var cart = new Cart(req.session.cart);
    var flag = 0;
    var cartItems =  Object.values(cart.items);
    for(var i=0; i<cartItems.length; i++){
        if(cartItems[i].qty>cartItems[i].item.qty){
            flag = 1;
            break;
        } 
    };
    if(flag === 1){
        var outOfStockProduct = cartItems[i].item.title;
        req.flash('error',`Product - '${outOfStockProduct}' is out of stock. Please decrease its quantity. `);
        res.redirect('/shopping-cart');
    } else {
        Order.find({user: req.user} ,function(err,result){
            var previousOrderDetails;
            if(result.length === 0){
                previousOrderDetails = {};
            } else if(result.length === 1){
                previousOrderDetails = result[0];
            } else {
                result.sort(function(a, b) {
                    a = new Date(a.purchaseDate);
                    b = new Date(b.purchaseDate);
                    return a>b ? -1 : a<b ? 1 : 0;
                });
                previousOrderDetails = result[0];
            }            
            res.render('shop/checkout', {cart: cart, total: cart.totalPrice, errMsg: errMsg, noErrors: !errMsg, previousOrderDetails: previousOrderDetails });
        });
    }
});

router.post('/checkout', isLoggedIn, isNotAdmin, function (req, res) {
    if (!req.session.cart) {
        res.redirect('/shopping-cart');
    }
    var cart = new Cart(req.session.cart);
    if(req.body.name==="" || req.body.address==="" || req.body.city==="" || req.body.state==="" || req.body.zip===""){
        req.flash('error', "Please fill out all the shipping details");
        return res.redirect('/checkout');
    }
    if(req.body.Radio==='online')
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
                purchaseDate: date,
                city: req.body.city,
                state: req.body.state,
                zip: req.body.zip
            });
            Object.values(cart.items).forEach(function(product){
                let prevQty = product.item.qty;
                let newQty = prevQty-product.qty; 
                //UPDATE QTY in database
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
                html: ` <h2>Successfully recieved your order ${order.user.fullname}</h2>
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
                req.flash('success', 'Order Placed Succesfully.');
                req.session.cart = null;
                res.redirect('/');
            });
        });
    }
    else if(req.body.Radio==='b') /* Cash On Delivery */
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
            purchaseDate: date,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip
        });
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
            req.flash('success', 'Order Placed Succesfully.');
            req.session.cart = null;
            res.redirect('/');
        });
    }
    else{
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

function isNotAdmin(req, res, next){
    if(!req.user.isSeller){
        return next();
    }
    req.session.oldUrl = req.url;
    req.flash('error','Please signin as user to order');
    res.redirect('/admin');
}