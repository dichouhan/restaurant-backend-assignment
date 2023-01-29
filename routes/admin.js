
var express = require('express');
var mongo = require('mongodb');
var db_url = "mongodb://127.0.0.1:27017/"
var router = express();
module.exports = router;


var client = new mongo.MongoClient(db_url);
var admin_db = client.db("restaurants").collection("admin")



router.get("/admin", function(req, res, next){

    client.connect().then(()=>{
        let cursor = admin_db.find()
        admin_db.estimatedDocumentCount().then((num)=>{
            console.log(num);
            if(num === 0){
                res.render("admin/admin", {items: []});
            }else{
                let items = []

                cursor.toArray().then((items)=>{
                    res.render("admin/admin", {items: items});
                })
            }
        })
    })


})


router.post("/admin/add_item", function(req, res, next){

    let doc = {name: req.body.name, price: req.body.price, image: req.body.image}
    
    client.connect().then(()=>{
        admin_db.insertOne(doc).then((result)=>{
            admin_db.find().then(function(value){
                value.toArray().then(function(items){
                    res.render("/admin/admin", {items: items});
                })
            })
        })
    })
})


router.post("/admin/add_item/:itemID", function(req, res, next){
    let itemID = req.params["itemID"]
    client.connect().then(()=>{

        // admin_db.find().then(function(value){
        //     value.toArray().then(function(items){
        //         res.render("admin/admin", {items: items});
        //     })
        // })

        // console.log(itemID);

        res.render("admin/admin", {items: items});
    })

})