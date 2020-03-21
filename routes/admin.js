var express = require('express');
var router = express.Router();

var Order = require("../models/order");
var Product = require("../models/product");
var User = require("../models/user");


router.get('/admin',isLoggedIn,isAdmin,function(req,res){
    Order.countDocuments({},function(err,c){
        if(!err){
            Product.countDocuments({},function(err,pc){
                if(!err){
                    User.countDocuments({},function(err,uc){
                        if(!err){
                            Order.aggregate(
                                [
                                    {$match: {}},
                                    {$group: {_id: '',total: {$sum: "$cart.totalPrice"}}},
                                    {$project: {total: '$total' }}
                                ], function(err,result){
                                    Order.aggregate(
                                        [
                                            {$match: {}},
                                            {$group: {_id: "$user",  name : { $first: '$name' },total: {$sum: "$cart.totalPrice"}}},
                                            {$sort: {total: -1}},
                                            {$limit: 5}
                                        ], function(err,result2){
                                            Product.aggregate(
                                                [
                                                    {$match: {}},
                                                    {$project: {_id: 1,title: 1,price: 1,soldQty: 1,brand: 1,qty: 1}},
                                                    {$sort: {soldQty: -1}},
                                                    {$limit: 5}
                                                ], function(err,results){
                                                    var orderCount = c;
                                                    var productCount = pc;
                                                    var userCount = uc;
                                                    var revenue = result[0].total;
                                                    res.render('admin/dashboard', {orderCount: orderCount, productCount: productCount, userCount: userCount, revenue: revenue, topUser: result2, topProduct: results });
                                                }
                                            )
                                            
                                            
                                        }
                                    )
                                }
                            )
                        }
                    })
                }
            });
        }
    });
});



router.get("/admin/store",function(req,res){
    Product.find({category: 'ayurveda'}, function(err,foundProduct){
        if(err){
            console.log(err);
        } else {
            res.render('admin/store', {products: foundProduct});
        }
    })
});


router.get("/admin/store/:category",function(req,res){
    var cat = req.params.category;
    Product.find({category: cat}, function(err,foundProducts){
        if(err){
            console.log(err);
        } else {
            res.render('admin/store', {products: foundProducts});
        }
    });
});





router.get('/admin/products',isLoggedIn,isAdmin,function(req,res){
    var successMsg = req.flash('success')[0];
    Product.find({},function(err, allProducts){
        if(err){
            console.log(err);
        }else{
            res.render('admin/index', { products: allProducts, successMsg: successMsg, noMessages: !successMsg });
        }
    });
    
});





//CREATE
router.post('/admin/products',isLoggedIn,isAdmin,function(req,res){
    var title = req.body.title; 
    var desc = req.body.description; 
    var image = req.body.image;
    var price = req.body.price;
    var qty = req.body.qty;

    var newProduct = {image: image,title: title, description: desc, price: price, qty: qty};

    //create new cmpground and save to db
    Product.create(newProduct,  function(err, newlyCreated){
        if(err){
            console.log(err);
        }
        else{
            console.log(newlyCreated);  
            req.flash('success', 'Sucessfully added product'); 
            res.redirect("/admin/products");
        }
    });
});

router.get('/admin/products/new',isLoggedIn,isAdmin,function(req,res){
    res.render("admin/new");
});

router.get('/admin/products/:id',function(req,res){
    var productId = req.params.id;
    Product.findById(productId, function(err,foundProduct){
    if(err){
        console.log(err);
    }
    else{
        res.render('admin/show',{product: foundProduct })
    }
    }); 
});
//EDIT 

router.get("/admin/products/:id/edit", isLoggedIn,isAdmin, function(req,res){  
    Product.findById(req.params.id, function(err, foundProduct){
        if(err){
            res.redirect("/admin/products");
        }
        else{                
            res.render("admin/edit", {product: foundProduct});
        }
    }); 
});


router.put("/admin/products/:id", isLoggedIn, isAdmin, function(req,res){
    //find and update
    var title = req.body.title; 
    var desc = req.body.description; 
    var image = req.body.image;
    var price = req.body.price;
    var qty = req.body.qty;

    var updatedProduct = {image: image,title: title, description: desc, price: price, qty: qty};
    Product.findByIdAndUpdate(req.params.id, updatedProduct, function(err,product){
        if(err){
            res.redirect("/admin");  
        }
        else{
            res.redirect("/admin/products");
        }
    });
    //redirect
});

//Destroy Route
router.delete("/admin/products/:id",isLoggedIn, isAdmin, function(req,res){
    Product.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/admin");
        }
        else{
            res.redirect("/admin/products");
        }
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

function isAdmin(req, res, next){
    if(req.user.isSeller){
        return next();
    }
    req.session.oldUrl = req.url;
    req.flash('error', 'Sorry, you are not an admin'); 
    res.redirect('/');
}
