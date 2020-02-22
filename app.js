var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var logger = require('morgan');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var MongoStore = require('connect-mongo')(session);
var methodOverride = require("method-override");

var app = express();

var flash = require('connect-flash');
var indexRoutes = require('./routes/index');
var userRoutes = require('./routes/user');
var cartRoutes = require('./routes/shoppingcart');
var adminRoutes = require('./routes/admin');


require('./config/passport');




mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
var url = process.env.DATABASEURL || "mongodb://localhost/medlife";
//mongodb+srv://shubh:medeasy@cluster0-tikja.mongodb.net/test?retryWrites=true&w=majority
console.log(process.env.DATABASEURL);
console.log(url);
mongoose.connect("mongodb+srv://shubh:medeasy@cluster0-tikja.mongodb.net/test?retryWrites=true&w=majority");




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'supersecret',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: { maxAge: 180 * 60 * 1000 }/* 180 minutes */ 
}));

app.use(methodOverride("_method"));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  res.locals.session = req.session;
  next();
});

app.use(userRoutes);
app.use(indexRoutes);
app.use(cartRoutes);
app.use(adminRoutes);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(process.env.PORT || 3000, process.env.IP, function(){
  console.log("medlife server Started");
});