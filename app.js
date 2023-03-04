var createError = require('http-errors');
var express = require('express');
const cors = require('cors');
var bodyParser = require('body-parser');
var path = require('path');
var flash = require('connect-flash');
var cookieParser = require('cookie-parser');
let jwt = require('jsonwebtoken');
 global.config = require('./config/jwtconfig');
var logger = require('morgan');
var mongoose = require('mongoose');
mongoose.set('strictQuery', true);


//global Variable
global.imageBaseDir = '/public/';

// mongoose.connect("mongodb+srv://fortsmithdb:g2ALaPWlp1obLJ65@cluster0.4x1bczr.mongodb.net/MyFirstDatabase?retryWrites=true&w=majority", {
//       useNewUrlParser: true,
//       useUnifiedTopology: true
//   }).then(() => console.log('mongo connected')).catch(err => console.log(err)); 

const dbUrl = "mongodb+srv://fortsmithdb:g2ALaPWlp1obLJ65@cluster0.4x1bczr.mongodb.net/MyFirstDatabase?retryWrites=true&w=majority";
mongoose.connect(dbUrl, {useNewUrlParser:true,useUnifiedTopology: true});
const con= mongoose.connection;
con.on('open', ()=> {
  console.log('Database Connected');
});

// const dbUrl = "";
// mongoose.connect(dbUrl, {useNewUrlParser:true,useUnifiedTopology: true});
// const con= mongoose.connection;
// con.on('open', ()=> {
//   console.log('Database Connected');
// });



var app = express();

app.use(logger('dev'));  // to get log in terminal
//parser
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));   // to get body in function
app.use(express.static(path.join(__dirname, 'public')));

app.all('*',function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/api/adminauth', require('./routes/admin/adminauth'));
app.use('/api/admin/dashboard', require('./controllers/admin/dashboardcontroller'));
app.use('/api/admin/user', require('./controllers/admin/usercontroller'));
app.use('/api/admin/store', require('./controllers/admin/storecontroller'));
app.use('/api/admin/category', require('./controllers/admin/categorycontroller'));
app.use('/api/admin/products', require('./controllers/admin/productscontroller'));

app.use('/api/userauth', require('./controllers/user/authcontroller'));
app.use('/api/user/dashboard', require('./controllers/user/dashboardcontroller'));
app.use('/api/user/store', require('./controllers/user/storecontroller'));
app.use('/api/user/products', require('./controllers/user/productcontroller'));
app.use('/api/user/orders', require('./controllers/user/orderscontroller'));
app.use('/api/user/bank', require('./controllers/user/bankcontroller'));
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.send('error');
});

module.exports = app;
