
const express = require('express');
const ps = require('./passport');
var mongo = require('mongodb');

var db_url = process.env.MONGO;
const router = express.Router();

const passportVerify = ps.passport.authenticate("jwt", {session: false});

router.use(passportVerify);

console.log("client here!");

var client = new mongo.MongoClient(db_url);
var items_db = client.db("restaurants").collection("admin")
var cart_db = client.db("restaurants").collection("cart")
var orders_db = client.db("restaurants").collection("orders")


router.get("/", function(req, res, next){
    client.connect().then(()=>{
        items_db.find().toArray().then(function(items){
            res.render("user/user", {items: items})
        })
    })
})


router.get("/cart", function(req, res, next){
    
    ps.getUserIdFromCookie(req, function(userID){
        console.log(userID);

        getCart(userID, res).catch((reason)=>{
            console.log(reason);

            res.statusCode = 400;
            res.send("something went wrong!")
        })
        
    })
})


async function getCart(userID, res){

    await client.connect();
    let cartDoc = await cart_db.findOne({user_id: userID}).catch((reason)=>{
        res.statusCode = 400;
        res.send("something went wrong")
        return
    })

    let items = cartDoc.items;

    let prodIds = Object.keys(items);
    var totalAmount = 0
    var productObjs = []
    let priceDetailsObjs = {}

    prodIds.forEach((value)=>{
        let obj = items[value]
        let _amount = obj.quantity*obj.product.price
        priceDetailsObjs[value] = {"quantity": obj.quantity, "total_price": _amount}
        totalAmount += _amount
        productObjs.push(obj.product)
    })
    res.render("user/cart", {items: productObjs, amount: totalAmount, quantity: priceDetailsObjs})

}

router.put("/cart", function(req, res, next){
    ps.getUserIdFromCookie(req, function(userID){
        console.log("userid - "+ userID);
        console.log(req.body);
        const productID = req.body.product_id
        const qty = req.body.quantity

        
            updateCart(userID, productID, qty).then(()=>{
                res.statusCode = 204;
                res.send("successful!")
            }).catch((reason)=>{
                console.log(reason);
                res.statusCode = 400;
                res.send("something went wrong!")
            })
    })
})


router.delete("/cart", (req, res, next)=>{
    ps.getUserIdFromCookie(req, function(userID){
        client.connect().then(()=>{

            let item_id = req.body.item_id

            cart_db.updateOne({user_id: userID}, {
                $unset: {["items." + item_id]: null}
            }).then((result)=>{
                console.log(result);

                res.statusCode = 202
                res.send("deleted!")
            }).catch((reason)=>{
                console.log(reason);

                res.status = 400;
                res.send("something went wrong!")
            })


        })
    })
})


async function updateCart(user_id, product_id, qty){

    await client.connect();
    console.log(product_id + "prod id");
    const product_doc = await items_db.findOne(mongo.ObjectId(product_id))
    console.log(product_doc + "prodoc here ");
    if(product_doc){
        
        var cart = await cart_db.findOne({user_id: user_id})
        cart = (cart) ? cart : {user_id: user_id, items: {}} 
        cart.items[product_id] = {product: product_doc, quantity: qty}

        if(cart._id){
            cart_db.replaceOne({_id: cart._id}, cart)
       }else{
            cart_db.insertOne(cart)
       }
        return true
    }else{
        throw "Not Found!"
    }
    
}

module.exports = router;


router.get("/confirm_order", (req, res,next)=>{
    ps.getUserIdFromCookie(req, function(userID){

        let amount = req.query["amount"]
        console.log(req.query);

        client.connect().then(()=>{

            cart_db.findOne({user_id: userID}).then((value)=>{
                let cart_id = value._id
                res.render("user/confirm_order", {cart_id: cart_id, amount: amount})
            }).catch((reason)=>{
                console.log(reason);
                res.statusCode = 400;
                res.send("something went wrong")
            })
        })
        
    })
})

router.post("/confirm_order", (req, res, next)=>{
    
    ps.getUserIdFromCookie(req, function(userID){
        createOrder(userID, req.query.cart_id).then(()=>{
            res.status = 204
            res.redirect("/home/orders")
        }).catch((reason)=>{
            console.log(reason);
            res.statusCode = 400;
            res.send("something went wrong!")
        })
    })
})


async function createOrder(userID, cart_id){
    await client.connect();
    let cart = await cart_db.findOne(mongo.ObjectId(cart_id))

    var totalAmount = 0

    
    for(value in cart.items){
        let obj = cart.items[value]

        let _amount = obj.quantity*obj.product.price

        totalAmount += _amount
    }

    let doc = {user_id: userID, cart: cart, total_amount: totalAmount}

    orders_db.insertOne(doc)
}


router.get("/orders", (req, res, next)=>{

    ps.getUserIdFromCookie(req, (userID)=>{

        getAllOrders(userID).then((orders)=>{
            res.render("user/orders", {orders: orders})
        }).catch((reason)=>{
            console.log(reason);
            res.statusCode = 400;
            res.send("something went wrong!")
        })

    })

})


async function getAllOrders(userID){
    await client.connect();

    let orders =  await orders_db.find({user_id: userID}).toArray()

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