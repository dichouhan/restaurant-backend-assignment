const express = require('express');
// const passport = require('passport');
var mongo = require('mongodb');
const db_url = "mongodb://127.0.0.1:27017/"
const jwt = require('jsonwebtoken');
const passport = require("./passport").passport;
const router = express();
var crypto = require('crypto');

// https://medium.com/front-end-weekly/learn-using-jwt-with-passport-authentication-9761539c4314


var client = new mongo.MongoClient(db_url);
var restaurants_db = client.db("restaurants")



passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});


router.get('/login', function(req, res, next) {
  res.render('login');
});

router.post('/login', function(req, res, next){

  passport.authenticate('local', {session: false}, function(err, user, info){
    if(err || !user){
      return res.status(400).send({message : "something went wrong!"})
    }
      const token = jwt.sign(user._id.toString(), 'islit!');
      res.cookie("auth", token)
          res.redirect("/home")

  })(req, res)

});


router.get('/signup', function(req, res){
    res.render('auth/signup') 
})

router.post('/signup', function(req, res, next) {


  var salt = crypto.randomBytes(16);
  
  crypto.pbkdf2(req.body.password, salt.toString('hex'), 310000, 32, 'sha256', function(err, hashedPassword) {

    console.log(hashedPassword.length);
    console.log(hashedPassword);
    client.connect()
    let db = restaurants_db.collection("users")

    let doc = {username: req.body.username, hashed_password: hashedPassword.toString('hex'), salt: salt.toString('hex')}

    console.log(doc);
    
    var insertPromise = db.insertOne(doc)
   
    insertPromise.then(function(data){
      console.log(data + "-data inserted!");
      var user = {
          id: data._id,
          username: req.body.username
        };

      // req.login(user, function(err) {
      // if (err) {
      //   console.log(err);
      //    return next(err); }

        res.redirect('/login?registered=true');
      // });
      // })
      });
  });
});

module.exports = router;