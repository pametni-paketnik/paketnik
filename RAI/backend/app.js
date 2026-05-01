require('dotenv').config(); 

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors'); 

var hbs = require('hbs'); 

// vključimo mongoose in ga povežemo z MongoDB
var mongoose = require('mongoose');
var mongoDB = process.env.MONGO_URI;
mongoose.connect(mongoDB)
  .then(() => console.log('Uspesno povezani na MongoDB'))
  .catch((err) => console.log('Napaka pri povezavi z MongoDB', err)); 

mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// vključimo routerje
var indexRouter = require('./routes/index');
var uporabnikRouter = require('./routes/uporabnikRouter');
var paketnikRouter = require('./routes/paketnikRouter');
var narociloRouter = require('./routes/narociloRouter');
var dnevnikRouter = require('./routes/dnevnikRouter');

var app = express();

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`🚀 Strežnik uspešno zagnan na: http://localhost:${port}`);
});

app.use(cors({
  origin: 'http://localhost:3001', 
  credentials: true
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

hbs.registerHelper('equals', function(arg1, arg2){
  return String(arg1) === String(arg2); 
}); 
hbs.registerHelper('String', function (arg) {
    return String(arg);
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var session = require('express-session');
var MongoStore = require('connect-mongo');
app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false,
  store: MongoStore.create({mongoUrl: mongoDB})
}));
//Shranimo sejne spremenljivke v locals
//Tako lahko do njih dostopamo v vseh view-ih (glej layout.hbs)
app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

app.use('/uporabnik', uporabnikRouter);
app.use('/', indexRouter);
app.use('/narocilo', narociloRouter);
app.use('/paketnik', paketnikRouter); 
app.use('/dnevnik', dnevnikRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  
  res.json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});

module.exports = app;
