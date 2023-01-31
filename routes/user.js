var express = require('express');
require('./passport');
const passport = require("passport")
var mongo = require('mongodb');
const { authenticate } = require('passport');
const { route } = require('./auth');
var db_url = "mongodb://127.0.0.1:27017/"
const router = express.Router();

// router.use()

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


router.get("/../user", function(req, res, next){
    res.send("done")
})


module.exports = router;