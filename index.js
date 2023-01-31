const express = require('express');
const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.json())

app.set('view engine', 'ejs')

app.use(require("cookie-parser")());


var authRouter = require('./routes/auth');
var adminRouter = require('./routes/admin')
var userRouter = require('./routes/user')

app.use('/home', userRouter)
app.use('/', authRouter)
app.use('/admin', adminRouter)


let server = app.listen(3000, 'localhost', () => {
    port = server.address().port
    host = server.address().hostname
  console.log(`Server running at http://${host}:${port}/`);
});