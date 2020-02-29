var express = require('express');
var router = express.Router();

var Product = require("../models/product");




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
      res.render('shop/index', { products: allProducts, successMsg: successMsg, errorMsg: errorMsg ,noMessages: !successMsg, noError: !errorMsg, isIcon: isIcon});
    }
  });
});

router.get('/developer',function(req,res){
  res.render('developers/developer');
});


router.get('/products/:id',function(req,res){
  var productId = req.params.id;
  Product.findById(productId, function(err,foundProduct){
    if(err){
      console.log(err);
    }
    else{
      res.render('shop/show',{product: foundProduct })
    }
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