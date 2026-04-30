require('dotenv').config(); 

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors'); 
var mongoose = require('mongoose');
var session = require('express-session');
const MongoStore = require('connect-mongo');

// 1. INICIALIZACIJA APP
var app = express(); 

// 2. POVEZAVA NA BAZO
// Prepričaj se, da imaš v .env datoteki: MONGO_URI=mongodb://127.0.0.1:27017/ime_tvoje_baze
var mongoDB = process.env.MONGO_URI;
mongoose.connect(mongoDB)
    .then(() => console.log("Povezano na MongoDB"))
    .catch(err => console.error("Napaka pri povezavi na bazo:", err)); 

mongoose.Promise = global.Promise;

// 3. MIDDLEWARE (Vrstni red je pomemben!)

// CORS nastavitev za React (port 3001)
app.use(cors({
  origin: 'http://localhost:3001', // Naslov tvojega React frontenda
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true // Nujno za pošiljanje piškotkov/sej
})); 

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 4. SESSION
app.use(session({
  secret: process.env.SESSION_SECRET || 'work hard', // Priporočljivo v .env
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Nastavi na true samo, če uporabljaš HTTPS
    httpOnly: true, // Varnost: prepreči dostop JS do piškotka na frontendu
    maxAge: 1000 * 60 * 60 * 24 // 1 dan
  },
  store: MongoStore.create({
    mongoUrl: mongoDB
  })
}));

// 5. ROUTES
var indexRouter = require('./routes/index');
var uporabnikRouter = require('./routes/uporabnikRouter');
var narociloRouter = require('./routes/narociloRouter'); // Dodaj svoje nove poti
var paketnikRouter = require('./routes/paketnikRouter');
var dnevnikRouter = require('./routes/dnevnikRouter');

app.use('/', indexRouter);
app.use('/uporabnik', uporabnikRouter);
app.use('/narocila', narociloRouter);
app.use('/paketniki', paketnikRouter);
app.use('/dnevnik', dnevnikRouter);

// 6. ERROR HANDLING (Prilagojeno za API / React)

// Ulovi 404 in pošlji naprej v error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Končni error handler - vrača JSON namesto renderiranja strani
app.use(function(err, req, res, next) {
  // Nastavi status napake
  res.status(err.status || 500);
  
  // Reactu vrnemo JSON objekt z napako
  res.json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});

module.exports = app;