var express = require('express');
var router = express.Router();

var Product = require("../models/product");
var Cart = require('../models/cart');
var Order = require('../models/order');


/* GET home page. */
router.get('/', function(req, res, next) {
  var successMsg = req.flash('success')[0];
  Product.find({},function(err, allProducts){
    if(err){
      console.log(err);
    }else{
      res.render('shop/index', { products: allProducts, successMsg: successMsg, noMessages: !successMsg });
    }
  });
});

router.get('/add-to-cart/:id', function(req, res){
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {} );

  Product.findById(productId, function(err, product){
    if(err){
      return res.redirect('/');
    }
    cart.add(product, product.id);
    req.session.cart = cart;
    console.log(req.session.cart);
    res.redirect('/');
  });
});

router.get('/reduce/:id', function(req,res){
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {} );

  cart.reduceByOne(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/increase/:id', function(req,res){
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {} );

  cart.increaseByOne(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/remove/:id', function(req,res){
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {} );

  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/shopping-cart', function(req,res){
  if(!req.session.cart){
    return res.render('shop/shopping-cart', {products: null});
  }
  var cart = new Cart(req.session.cart);
  res.render('shop/shopping-cart', {products: cart.generateArray(), totalPrice: cart.totalPrice});
});

router.get('/checkout', isLoggedIn, function(req, res){
  if(!req.session.cart){
    res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  var errMsg = req.flash('error')[0];
  res.render('shop/checkout', {total: cart.totalPrice, errMsg: errMsg, noErrors: !errMsg});
});

router.post('/checkout', isLoggedIn, function(req, res){
  if(!req.session.cart){
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
    description: 'My First Test Charge (created for API docs)',
  },
  function(err, charge) {
    // asynchronously called
    if(err){
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
    order.save(function(err, result){
      req.flash('success', 'Sucessfully bought the product');
      req.session.cart = null;
      res.redirect('/');
    });    
  });
});

module.exports = router;

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
      return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/user/signin');
}