const express = require('express');
const { hostname } = require('os');
const app = express();
var authRouter = require('./routes/auth');

app.use('/', authRouter)

app.set('view engine', 'ejs')

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