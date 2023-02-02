
const express = require('express');
var mongo = require('mongodb');
var db_url = process.env.MONGO;
const router = express();

const client = new mongo.MongoClient(db_url);
const admin_db = client.db("restaurants").collection("admin")
const orders_db = client.db("restaurants").collection("orders")
const users_db = client.db("restaurants").collection("users")

const ps = require("./passport");


const admin_auth_middleware = function(req, res, next){
    ps.getUserIdFromCookie(req, (userID)=>{

    getUser(userID).then((user)=>{
       if(!user){
            res.status = 403;
            res.send("unauthorized")
       }else{
            next()
       }
    }).catch((reason)=>{
        console.log(reason);
        res.status = 400;
        res.send("something went wrong!")
        
    }
    )
    })

}

router.use(admin_auth_middleware);

async function getUser(userID){
    
    await client.connect();
    console.log(userID);
    const user = await users_db.findOne({_id: mongo.ObjectId(userID), role: "admin"});
    console.log(user + "user here");
    return user
    
}


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

router.get("/sales", function(req, res, next){
    getSales().then((orders)=>{
        let _amount = orders.map(x => x.amount).reduce((a, b) => a + b, 0)

        res.render("admin/sales", {orders: orders, amount: _amount})
    }).catch((reason)=>{
        console.log(reason);
        res.status = 404;
        res.send("something went wrong!")
    })
})

async function getSales(){
    await client.connect();

    let orders =  await orders_db.find().toArray()

    res_orders = []

    orders.forEach((order)=>{
        
        let doc = {}
        order_name_join = ""
        let _amount = 0
        Object.keys(order.cart.items).forEach((key)=>{
            let total_price = order.cart.items[key].quantity*order.cart.items[key].product.price
            _amount += total_price
            order_name_join += order.cart.items[key].product.name + " quantity: " + order.cart.items[key].quantity + " total price - " + total_price + "</br>";
        })

        doc["amount"] = _amount
        
        doc["order_name"] = order_name_join

        doc["order_id"] = order._id
        res_orders.push(doc)

/*
{"amount": 3333, "order_name": <order_name>, "order_id": 338241758123}
*/
    })
    console.log(res_orders);

    return res_orders
}

module.exports = router;