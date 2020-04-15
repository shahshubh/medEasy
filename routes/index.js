var express = require('express');
var router = express.Router();

var Product = require("../models/product");
var Order = require("../models/order");
var User = require("../models/user");
var ObjectId = require('mongoose').Types.ObjectId;


function Paginator(items, page, per_page) {
  var page = parseInt(page) || 1,
  per_page = parseInt(per_page) || 6,
  offset = (page - 1) * per_page,

  paginatedItems = items.slice(offset).slice(0, per_page),
  total_pages = Math.ceil(items.length / per_page);
  return {
    page: page,
    limit: per_page,
    prev_page: page - 1 ? page - 1 : null,
    next_page: (total_pages > page) ? page + 1 : null,
    total: items.length,
    total_pages: total_pages,
    data: paginatedItems
  };
}

/* GET home page. */
router.get('/', function(req, res, next) {
    var successMsg = req.flash('success')[0];
    var errorMsg = req.flash('error')[0];
    var isIcon;
    if(successMsg==="Added to Cart"){
      isIcon = true;
    }
    
    Product.find({},function(err, allProducts){
      if(err){
        console.log(err);
      }else{
        res.render('shop/homepg', { products: allProducts, successMsg: successMsg, errorMsg: errorMsg ,noMessages: !successMsg, noError: !errorMsg, isIcon: isIcon});
      }
    });
});

router.get('/category/allproducts' ,(req, res) => {
  var successMsg = req.flash('success')[0];
  var errorMsg = req.flash('error')[0];
  var isIcon;
  if(successMsg==="Added to Cart"){
    isIcon = true;
  }
  var catg = "All products";
  Product.find({}, function(err, foundProducts){
    if(err){
      console.log(err);
    } else {
      console.log("Found: ",foundProducts);
      var result = Paginator(foundProducts,req.query.page,req.query.limit || 12);
      res.render('shop/all-products', { products: result.data, paginationResult: result ,category: catg ,successMsg: successMsg, errorMsg: errorMsg ,noMessages: !successMsg, noError: !errorMsg, isIcon: isIcon});
    }
  })
});

router.get('/category/:name' ,(req, res) => {
  var successMsg = req.flash('success')[0];
  var errorMsg = req.flash('error')[0];
  var isIcon;
  if(successMsg==="Added to Cart"){
    isIcon = true;
  }
  var catg = req.params.name;
  Product.find({category: catg}, function(err, foundProducts){
    if(err){
      console.log(err);
    } else {
      var result = Paginator(foundProducts,req.query.page,req.query.limit);
      //console.log(result);
      res.render('shop/category_products', { products: result.data, paginationResult: result ,category: catg ,successMsg: successMsg, errorMsg: errorMsg ,noMessages: !successMsg, noError: !errorMsg, isIcon: isIcon});
    }
  })
});




router.get('/developer',function(req,res){
  res.render('developers/developer');
});


/* ************************************************ */

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

/* Daily Sales Data */ 
router.get('/api/daily-sales',function(req,res){
  Order.aggregate(
    [
      {$match: {}},
      {$group: {_id: "$purchaseDate", total: {$sum: "$cart.totalPrice"}}}
    ], function(err,result){
      res.json(result);
    }
  )
});

/*
router.get('/test1',function(req,res){
  Order.aggregate(
    [
      {$match: {}},
      {$group: {
                _id: {
                      month: {$month: "$purchaseDate"},
                      year: {$year: "$purchaseDate"}
                    }, total: {$sum: "$cart.totalPrice"}}}
    ], function(err,result){
      res.json(result);
    }
  )
});*/

/* Every Product Sales Data */ 

router.get('/api/product-sales/:category',function(req,res){
  Product.aggregate(
    [
      {$match: {category: req.params.category}},
      {$project: {_id: 1,title: 1,price: 1,soldQty: 1,brand: 1,qty: 1,category: 1}},
      {$sort: {soldQty: -1}}    
    ], function(err,result){
      res.json(result);
    }
  )
});

/* Daily Orders Data */

router.get('/api/daily-orders-count',function(req,res){
  Order.aggregate(
    [
      {$match: {}},
      {$group: {_id: "$purchaseDate", count: {$sum: 1}}}
      
    ], function(err,result){
      res.json(result);
    }
  )
});



module.exports = router;

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
      return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/user/signin');
}

