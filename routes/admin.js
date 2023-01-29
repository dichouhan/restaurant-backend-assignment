
var express = require('express');
var mongo = require('mongodb');
var db_url = "mongodb://127.0.0.1:27017/"
var router = express();
module.exports = router;


var client = new mongo.MongoClient(db_url);
var admin_db = client.db("restaurant").collection("admin")


router.get("/admin", function(req, res){

    client.connect().then(()=>{
        let items = admin_db.get({})
        res.render("admin/admin", {items: items})
    })

    res.render("admin/admin", {items: []})

})


router.post("/admin/add_item", function(req, res){

    let doc = {name: req.body.name, price: req.body.price, image: req.body.image}
    
    client.connect().then(()=>{
        admin_db.insertOne(doc).then((result)=>{
            console.log(result);

        })
    })
})