var express = require('express');
var router = express.Router();

var Product = require("../models/product");
var Cart = require('../models/cart');
var Order = require('../models/order');

const nodemailer = require('nodemailer');


/* api route */ 
router.get('/api/products',function(req,res){
  Product.find({},function(err,allProducts){
    if(err){
      console.log(err);
    }
    else{
      res.json(allProducts);
    }
  });
});


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

router.get('/products/:id',function(req,res){
  var productId = req.params.id;
  Product.findById(productId, function(err,foundProduct){
    if(err){
      console.log(err);
    }
    else{
      console.log(foundProduct);
      res.render('shop/show',{product: foundProduct })
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
    console.log(cart);
    console.log("ORDER: ",order);

    //mail
    //Object.value(cart.items).forEach(fn(product){


    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: 'shahshubh1010@gmail.com',
          pass: 'chandra#401'
      }
  });
  
  let mailOptions = {
      from: 'shahshubh1010@gmail.com',
      to:    req.user.email,
      subject: 'MedEasy',
      text: '',
      html: `
      <h2>Successfully recieved your order ${order.user.fullname}</h2>
      <br>
      Your order quantity: <b>${cart.totalQty}</b>
      <br>
      Your order price: <b>₹ ${cart.totalPrice}</b>
      <p>You can view you order details in order history under your account</p>
      <hr>
      <b>
      <h3>Thank you for ordering with MedEasy!</h3>
      <h4>Get Well Soon !!</h4>
      </b>
      
      `
  };
  
  transporter.sendMail(mailOptions, function(err,data){
      if(err){
          console.log("Failed ",err);
      }
      else{
          console.log("Email sent !!");
      }
  });








    
    order.save(function(err, result){
      req.flash('success', 'Sucessfully bought the product');
      req.session.cart = null;
      res.redirect('/');
    });    
  });
});

/*
router.get('/autocomplete',function(req,res,next){
  var regex = new RegExp(req.query["term"],'i');
  var productfilter = Product.find({title: regex},{'title': 1}).sort({"updated_at": -1}).sort({"created_at": -1}).limit(5)
  productfilter.exec(function(err,data){
    console.log(data);
    var result =[];
    if(!err){
      if(data && data.length && data.length >0){
        data.forEach(function(user){
          let obj={
            id: user._id,
            label: user.title
          };
          result.push(obj);
        })
      }
      res.jsonp(result);
    }
  })
});
*/
module.exports = router;

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
      return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/user/signin');
}