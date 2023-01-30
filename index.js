const express = require('express');
const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.json())
app.set('view engine', 'ejs')

var passport = require('passport');
var session = require('express-session');
var SQLiteStore = require('connect-sqlite3')(session);


app.use(session({
  secret: 'islit!',
  resave: false,
  saveUninitialized: false,
  store: new SQLiteStore({ db: 'sessions.db', dir: './session/db' })
}));


app.use(passport.authenticate('session'));



var authRouter = require('./routes/auth');

app.use('/', authRouter)


app.get('/', function(req, res) {
  var users = ["a", "b", "c", "d"]
  var temp = 2
  res.render('test', {users: users, temp: temp })
  
});


let server = app.listen(3000, 'localhost', () => {
    port = server.address().port
    host = server.address().hostname
  console.log(`Server running at http://${host}:${port}/`);
});