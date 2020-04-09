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


router.get("/admin/store", isLoggedIn, isAdmin, function(req,res){
    var successMsg = req.flash('success')[0];
    Product.find({}, function(err,foundProduct){
        if(err){
            console.log(err);
        } else {
            res.render('admin/store', {products: foundProduct, successMsg: successMsg, noMessages: !successMsg });
        }
    })
});

router.get('/admin/store/new', isLoggedIn, isAdmin, function(req,res){
    var errMsg = req.flash('error')[0];
    res.render("admin/new", {errMsg: errMsg, noMessages: !errMsg });
}); 

//CREATE
router.post('/admin/store', isLoggedIn, isAdmin, function(req,res){
    var title = req.body.title; 
    var brand = req.body.brand; 
    var mfgDate = req.body.mfgDate; 
    var expDate = req.body.expDate; 
    var price = req.body.price;
    var tablets = req.body.tablets; 
    var image = req.body.image;
    var qty = req.body.qty;
    var tags = req.body._tags;
    var _tags = tags.split(",");

    var composition = req.body.composition; 
    var desc = req.body.description; 
    var precautions = req.body.precautions; 
    var category = req.body.select;

    var newProduct = {
        title: title, 
        brand: brand, 
        mfgDate: mfgDate, 
        expDate: expDate, 
        price: price, 
        tablets: tablets, 
        image: image, 
        qty: qty,
        _tags: _tags,
        composition: composition,
        description: desc,
        precautions: precautions,
        category: category
    };

    if(title.length == 0 || brand.length == 0 || mfgDate.length == 0 || expDate.length == 0 || price.length == 0 || 
        tablets.length == 0 || image.length == 0 || qty.length == 0 || composition.length == 0 || 
        desc.length == 0 || precautions.length == 0 || category.length == 0 ){
            req.flash('error', 'Please fill all the fields'); 
            res.redirect("/admin/store/new");
    } else {
        //create new cmpground and save to db
        Product.create(newProduct,  function(err, newlyCreated){
            if(err){
                console.log(err);
            }
            else{
                console.log(newlyCreated);  
                req.flash('success', 'Sucessfully added product'); 
                res.redirect("/admin/store");
            }
        });
    }
});



router.get("/admin/store/:category", isLoggedIn, isAdmin, function(req,res){
    var successMsg = req.flash('success')[0];
    var cat = req.params.category;
    Product.find({category: cat}, function(err,foundProducts){
        if(err){
            console.log(err);
        } else {
            res.render('admin/store', {products: foundProducts, successMsg: successMsg, noMessages: !successMsg });
        }
    });
});


router.get('/admin/orders', isLoggedIn, isAdmin, function(req,res){
    Order.find({}, function(err,allOrder){
        if(err){
            console.log(err);
        } else {
            res.render('admin/orders',{orders: allOrder});
        }
    })
});


router.get('/admin/order-details/:id',isLoggedIn, isAdmin, function(req,res){
    Order.findById(req.params.id, function(err, foundOrder){
        if(err){
            console.log(err);
        } else {
            res.render('admin/order_list',{order: foundOrder});
        }
    });
});


router.get('/admin/pending-orders',isLoggedIn, isAdmin, function(req,res){
    var successMsg = req.flash('success')[0];
    Order.find({isDelivered: false}, function(err,allOrder){
        if(err){
            console.log(err);
        } else {
            res.render('admin/pending-orders',{orders: allOrder, successMsg: successMsg, noMessages: !successMsg});
        }
    });
});

router.put('/admin/orders/status/:id/confirmed',isLoggedIn, isAdmin, function(req,res){
    var orderId = req.params.id;
    Order.findByIdAndUpdate(orderId, {isConfirmed: true}, function(err,order){
        if(err){
            console.log(err);
        } else {
            req.flash('success',"Order Confirmed");
            res.redirect("/admin/pending-orders");
        }
    });
});

router.put('/admin/orders/status/:id/delivered',isLoggedIn, isAdmin, function(req,res){
    var orderId = req.params.id;
    Order.findByIdAndUpdate(orderId, {isDelivered: true}, function(err,order){
        if(err){
            console.log(err);
        } else {
            req.flash('success',"Order Delivered");
            res.redirect("/admin/pending-orders");
        }
    });
});



router.get('/admin/users',isLoggedIn, isAdmin, function(req,res){
    User.find({isSeller: 'false'}, function(err,allUser){
        if(err){
            console.log(err);
        } else {
            res.render('admin/users',{users: allUser});
        }   
    })
});

router.get('/admin/admins',isLoggedIn, isAdmin, function(req,res){
    User.find({isSeller: 'true'}, function(err,allAdmin){
        if(err){
            console.log(err);
        } else {
            res.render('admin/admins',{admins: allAdmin});
        }   
    })
});

router.get('/admin/map',isLoggedIn, isAdmin, function(req,res){
    res.render('admin/map');
});



//EDIT 
router.get("/admin/store/:id/edit", isLoggedIn,isAdmin, function(req,res){  
    var errMsg = req.flash('error')[0];
    Product.findById(req.params.id, function(err, foundProduct){
        if(err){
            res.redirect("/admin/store");
        }
        else{                
            res.render("admin/edit", {product: foundProduct, errMsg: errMsg, noMessages: !errMsg });
        }
    }); 
});


router.put("/admin/store/:id", isLoggedIn, isAdmin, function(req,res){
    var successMsg = req.flash('success')[0];
    //find and update
    var title = req.body.title; 
    var brand = req.body.brand; 
    var mfgDate = req.body.mfgDate; 
    var expDate = req.body.expDate; 
    var price = req.body.price;
    var tablets = req.body.tablets; 
    var image = req.body.image;
    var qty = req.body.qty;
    var tags = req.body._tags;
    var composition = req.body.composition; 
    var desc = req.body.description; 
    var precautions = req.body.precautions; 

    var tags = req.body._tags;
    var _tags = tags.split(",");
    var category = req.body.select
    if(title.length == 0 || brand.length == 0 || mfgDate.length == 0 || expDate.length == 0 || price.length == 0 || 
        tablets.length == 0 || image.length == 0 || qty.length == 0 || composition.length == 0 || 
        desc.length == 0 || precautions.length == 0 || category.length == 0 ){
            req.flash('error', 'Please fill all the fields'); 
            res.redirect(`/admin/store/${req.params.id}/edit`);
        } else {
            var updatedProduct = {
                title: title, 
                brand: brand, 
                mfgDate: mfgDate, 
                expDate: expDate, 
                price: price, 
                tablets: tablets, 
                image: image, 
                qty: qty,
                _tags: _tags,
                composition: composition,
                description: desc,
                precautions: precautions,
                category: category
            };
        
            Product.findByIdAndUpdate(req.params.id, updatedProduct, function(err,product){
                if(err){
                    res.redirect("/admin");  
                }
                else{
                    req.flash('success', 'Sucessfully Updated product'); 
                    res.redirect("/admin/store");
                }
            });
        }   
    
});


//Destroy Route
router.delete("/admin/store/:id",isLoggedIn, isAdmin, function(req,res){
    Product.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/admin");
        }
        else{
            req.flash('success','Product Deleted sucessfully');
            res.redirect("/admin/store");
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
