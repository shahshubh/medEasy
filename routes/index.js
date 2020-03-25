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


/*router.get('/allproducts', function(req, res, next) {
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
      var result = Paginator(allProducts,req.query.page,req.query.limit)
      res.render('shop/category_products', { products: result.data, paginationResult: result ,successMsg: successMsg, errorMsg: errorMsg ,noMessages: !successMsg, noError: !errorMsg});
    }
  });
});*/

/*function cat(){
  var catg = req.params.name;
  Product.find({category: catg},function(err, catgProducts){
    if(err){
      console.log(err);
    }else{
      return catgProducts;
    }
  });
}*/



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
      console.log(result);
      res.render('shop/category_products', { products: result.data, paginationResult: result ,successMsg: successMsg, errorMsg: errorMsg ,noMessages: !successMsg, noError: !errorMsg, isIcon: isIcon});
    }
  })
});

/*
router.get('/category/:name', function(req, res, next) {
  var successMsg = req.flash('success')[0];
  var errorMsg = req.flash('error')[0];
  var catg = req.params.name;
  Product.find({category: catg},function(err, catgProducts){
    if(err){
      console.log(err);
    }else{
      res.render('shop/category_products', { products: catgProducts, successMsg: successMsg, errorMsg: errorMsg ,noMessages: !successMsg, noError: !errorMsg});
    }
  });
});
*/












router.get('/developer',function(req,res){
  res.render('developers/developer');
});



router.get('/test',function(req,res){
  Order.aggregate(
    [
      {$match: {}},
      {$group: {_id: "$purchaseDate", total: {$sum: "$cart.totalPrice"}}}
    ], function(err,result){
      res.json(result);
    }
  )
});

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
});

router.get('/test2',function(req,res){
  Order.aggregate(
    [
      {$match: {}},
      {$group: {_id: "$user",  name : { $first: '$name' },total: {$sum: "$cart.totalPrice"}}},
      {$sort: {total: -1}},
      {$limit: 5}
    ], function(err,result){
      res.json(result);
      /*User.findById(result[0]._id,function(err,result){
        res.json(result);
      });*/
    }
  )
});

router.get('/test3',function(req,res){
  Product.aggregate(
    [
      {$match: {}},
      {$project: {_id: 1,title: 1,price: 1,soldQty: 1,brand: 1,qty: 1}},
      {$sort: {soldQty: -1}},
      {$limit: 5}
    ], function(err,result){
      res.json(result);
    }
  )
});

router.get('/test5',function(req,res){
  Order.aggregate(
    [
      {$match: {}},
      {$group: {_id: '',total: {$sum: "$cart.totalPrice"}}},
      {$project: {total: '$total' }}
      
    ], function(err,result){
      res.json(result);
    }
  )
});

router.get('/test4',function(req,res){
  Order.aggregate(
    [
      {$match: {}},
      {$group: {_id: "$purchaseDate", count: {$sum: 1}}}
      
    ], function(err,result){
      res.json(result);
    }
  )
});

router.get('/test6',function(req,res){
  Product.aggregate(
    [
      {$match: {}},

      {$sort: -1}
      
    ], function(err,result){
      res.json(result);
    }
  )
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

