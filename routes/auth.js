var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var crypto = require('crypto');
var mongo = require('mongodb');
var db_url = "mongodb://127.0.0.1:27017/"
var router = express();
module.exports = router;


var client = new mongo.MongoClient(db_url);
var restaurants_db = client.db("restaurants")
client.connect()

passport.use(new LocalStrategy(function verify(username, password, cb) {
    client.connect()
    let db = restaurants_db.collection("users")

    let rowOfUserDetails = db.findOne({username: username})
    rowOfUserDetails.then(function(row){

      crypto.pbkdf2(password, row.salt, 310000, 32, 'sha256', function(err, hashedPassword) {

        if (err) { return cb(err); }

        let hashed_password = row.hashed_password
        
        if (!crypto.timingSafeEqual(Buffer.from(hashed_password, 'hex'), Buffer.from(hashedPassword, 'hex'))) {
          return cb(null, false, { message: 'Incorrect username or password.' });
        }
        return cb(null, row);
      })

    })

}));


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

router.post('/login', passport.authenticate('local', {
  successRedirect: '/signup',
  failureRedirect: '/login'
}));


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

      req.login(user, function(err) {
      if (err) {
        console.log(err);
         return next(err); }

        res.redirect('/login?registered=true');
      });
      })

  });
});
