var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var crypto = require('crypto');
var mongo = require('mongodb');
var db_url = "mongodb://localhost:27017/"
var router = express();
module.exports = router;



var client = new mongo.MongoClient(db_url);
var restaurants_db = client.db("restaurants")


passport.use(new LocalStrategy(function verify(username, password, cb) {
    client.connect()
    let db = restaurants_db.collection("users")

    let rowOfUserDetails = db.findOne({username: username})
    rowOfUserDetails.then(function(row){

    console.log(row);
    
      crypto.pbkdf2(password, Buffer.from(row.salt), 310000, 32, 'sha256', function(err, hashedPassword) {
        if (err) { return cb(err); }
        console.log(Buffer.from(hashedPassword));
        console.log(Buffer.from(row.hashed_password));
        console.log(row.hashed_password);
        if (!crypto.timingSafeEqual(Buffer.from(row.hashed_password), Buffer.from(hashedPassword))) {
          return cb(null, false, { message: 'Incorrect username or password.' });
        }
        return cb(null, row);
      })

    })


    

}));

router.get('/login', function(req, res, next) {
    client.connect() 
    let db = restaurants_db.collection("users")

    let records = db.find({}).toArray(function(err, result){
        if(err) throw err
        console.log(result);
        client.close()
    })

  res.render('login');
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/signup',
  failureRedirect: '/login'
}));




router.get('/signup', function(req, res){
    res.render('auth/signup') 
})

router.post('/signup', function(req, res, next) {


  var salt = crypto.randomBytes(16);
  
  crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', function(err, hashedPassword) {
    hashedPassword = hashedPassword

    client.connect()
    let db = restaurants_db.collection("users")

    let doc = {username: req.body.username, hashed_password: hashedPassword, salt}

    console.log(doc);
    
    var insertPromise = db.insertOne(doc)

   
    insertPromise.then(function(data){
      console.log(data);
      var user = {
          id: data._id,
          username: req.body.username
        };

      req.login(user, function(err) {
      if (err) { return next(err); }
      res.redirect('/');
      });
      })

  });
});
