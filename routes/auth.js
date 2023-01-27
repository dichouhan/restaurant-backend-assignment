var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var crypto = require('crypto');
var mongo = require('mongodb');
var db_url = "mongodb://localhost:27017/"
var router = express.Router();

var client = new mongo.MongoClient(db_url);
var restaurants_db = client.db("restaurants")



router.get('/login', function(req, res, next) {
    client.connect() 
    let db = restaurants_db.collection("users")

    let records = db.find({}).toArray(function(err, result){
        if(err) throw err
        console.log(result);
        client.close()
    })
    console.log(records);

  res.render('login');
});

module.exports = router;


passport.use(new LocalStrategy(function verify(username, password, cb) {
    client.connect()
    let db = restaurants_db.collection("users")
  db.get('SELECT * FROM users WHERE username = ?', [ username ], function(err, row) {
    if (err) { return cb(err); }
    if (!row) { return cb(null, false, { message: 'Incorrect username or password.' }); }

    crypto.pbkdf2(password, row.salt, 310000, 32, 'sha256', function(err, hashedPassword) {
      if (err) { return cb(err); }
      if (!crypto.timingSafeEqual(row.hashed_password, hashedPassword)) {
        return cb(null, false, { message: 'Incorrect username or password.' });
      }
      return cb(null, row);
    });
  });
}));

router.get('/signup', function(req, res){
    
})

router.post('/signup', function(req, res, next) {
  var salt = crypto.randomBytes(16);
  crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', function(err, hashedPassword) {
    if (err) { return next(err); }

    let db = restaurants_db.collection("users")

    let doc = {username: username, hashed_password: hashedPassword}
    
    db.insertOne(doc)

    
    req.login(user, function(err) {
    if (err) { return next(err); }
    res.redirect('/');
    });

  });
});


