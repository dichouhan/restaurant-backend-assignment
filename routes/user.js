var express = require('express');
var mongo = require('mongodb');
var db_url = "mongodb://127.0.0.1:27017/"
var router = express();
module.exports = router;
var flash = require('connect-flash');

console.log("client here!");

var client = new mongo.MongoClient(db_url);
var items_db = client.db("restaurants").collection("admin")
var cart_db = client.db("restaurants").collection("cart")


router.get("/home", function(req, res, next){
    client.connect().then(()=>{
        items_db.find().toArray().then(function(items){
            res.render("user/user", {items: items})
        })
    })
})


router.post("/cart")