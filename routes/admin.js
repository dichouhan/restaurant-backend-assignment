
const express = require('express');
var mongo = require('mongodb');
var db_url = "mongodb://127.0.0.1:27017/"
const router = express();
module.exports = router;
var flash = require('connect-flash');


const client = new mongo.MongoClient(db_url);
const admin_db = client.db("restaurants").collection("admin")

router.use(flash())



router.get("/", function(req, res, next){

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


router.post("/add_item", function(req, res, next){

    let doc = {name: req.body.name, price: req.body.price, image: req.body.image}
    
    client.connect().then(()=>{
        admin_db.insertOne(doc).then((result)=>{
            res.redirect("/admin");
        })
    })
})


router.post("/add_item/:itemID", function(req, res, next){
    let itemID = req.params.itemID

    client.connect().then(()=>{

        const updateDoc = {
            $set: {
                name: req.body.name,
                price: req.body.price,
                image: req.body.image
            },
        };

        const options = { upsert: true };

        admin_db.updateOne({_id: itemID}, updateDoc, options).then((result)=>{
            res.redirect("/admin");
        })

    })

})

router.delete("/delete", function(req, res, next){
    let itemID = req.body.id
    console.log(itemID);
    client.connect().then(()=>{
        let filter = {_id: mongo.ObjectId(itemID)};
        console.log(filter);
        
        admin_db.findOneAndDelete(filter).then((result)=>{
            console.log(result);

            res.send("deleted successfuly!")
            // res.redirect("/admin")
        })
    })
})