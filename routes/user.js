
const express = require('express');
const ps = require('./passport');
var mongo = require('mongodb');

var db_url = "mongodb://127.0.0.1:27017/"
const router = express.Router();


// var passportVrify = passport.authenticate()


console.log("client here!");

var client = new mongo.MongoClient(db_url);
var items_db = client.db("restaurants").collection("admin")
var cart_db = client.db("restaurants").collection("cart")


router.get("/", function(req, res, next){
    client.connect().then(()=>{
        items_db.find().toArray().then(function(items){
            res.render("user/user", {items: items})
        })
    })
})


router.get("/cart", function(req, res, next){
    
    ps.getUserIdFromCookie(req, function(userID){

        res.send("done")
    })
})

router.put("/cart", function(req, res, next){
    ps.getUserIdFromCookie(req, function(userID){
        const productID = req.body.product_id
        const qty = req.body.quantity

       try {
        
            updateCart(userID, productID, qty).then(()=>{
                res.statusCode = 204;
                res.send("successful!")
            })
       } catch (error) {
            res.statusCode = 400;
            res.send("something went wrong!")
       } 
    })
})

async function updateCart(user_id, product_id, qty){

    await client.connect();
    const product_doc = await items_db.findOne(mongo.ObjectId(product_id))
    if(product_doc){
        var cart = await cart_db.findOne({user_id: user_id})
        cart = (cart) ? cart : {user_id: user_id, items: {}} 
        cart.items.product_id = {product: product_doc, quantity: qty}

        cart_db.insertOne(cart)
        return true
    }else{
        throw "Not Found!"
    }
    
}

module.exports = router;