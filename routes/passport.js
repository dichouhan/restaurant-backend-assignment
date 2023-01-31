const passportJWT = require("passport-jwt");
const passport = require("passport");
var crypto = require('crypto');
const JWTStrategy   = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
var mongo = require('mongodb');
var db_url = "mongodb://127.0.0.1:27017/"
let LocalStrategy = require('passport-local');
var client = new mongo.MongoClient(db_url);


var restaurants_db = client.db("restaurants")

let db = restaurants_db.collection("users")


passport.use(new LocalStrategy(function verify(username, password, cb) {
    client.connect().then(()=>{

    db.findOne({username: username}).then(function(row){
        console.log(row);
      try {
        
            console.log(username);
        crypto.pbkdf2(password, row.salt, 310000, 32, 'sha256', function(err, hashedPassword) {

          if (err) { return cb(err); }

          let hashed_password = row.hashed_password
          
          if (!crypto.timingSafeEqual(Buffer.from(hashed_password, 'hex'), Buffer.from(hashedPassword, 'hex'))) {
            return cb(null, false, { message: 'Incorrect username or password.' });
          }
          console.log(row._id.toString());
          return cb(null, row);
        })
      } catch (error) {
        console.log(error);
        return cb(error) 
      }

    })
    })
    

}));

var cookieExtractor = function(req) {
  console.log(req.cookies);
    var token = null;
    if (req && req.cookies) {
        token = req.cookies['auth'];
    }
    return token;
};

function parseJwt (token) {
  console.log(token);
    return Buffer.from(token.split('.')[1], 'base64').toString();
}

function getUserIdFromCookie(req, cb){
    const token = cookieExtractor(req)
      console.log(token + "token here");
      return cb(parseJwt(token))

 }

 


passport.use(new JWTStrategy({
        jwtFromRequest: cookieExtractor,
        secretOrKey   : 'islit!'
    },
    function (jwtPayload, cb) {
        try{

          console.log(jwtPayload);

        client.connect().then(()=>{

            console.log(jwtPayload + "jwt hreere !");

            db.findOne(mongo.ObjectId(jwtPayload))
                .then(user => {
                  console.log(user);
                    return cb(null, user);
                })
                .catch(err => {
                  console.log(err);
                    return cb(err);
                });
        })
        
        }catch(err){
            console.log(err);
        }
    }
));



module.exports = {passport, getUserIdFromCookie};