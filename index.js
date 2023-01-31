const express = require('express');
const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.json())

app.set('view engine', 'ejs')

var session = require('express-session');
// var SQLiteStore = require('connect-sqlite3')(session);

var client = ""

// app.use(session({
//   secret: 'islit!',
//   resave: false,
//   saveUninitialized: false,
//   store: new SQLiteStore({ db: 'sessions.db', dir: './session/db' })
// }));

app.use(require("cookie-parser")());

var authRouter = require('./routes/auth');
var adminRouter = require('./routes/admin')
var userRouter = require('./routes/user')

const passportVerify = require("./routes/passport").passport.authenticate("jwt", {session: false});


app.use('/home', userRouter)
app.use('/', authRouter)
app.use('/admin', adminRouter)

userRouter.use(passportVerify)

let server = app.listen(3000, 'localhost', () => {
    port = server.address().port
    host = server.address().hostname
  console.log(`Server running at http://${host}:${port}/`);
});