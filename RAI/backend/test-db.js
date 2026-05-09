require('dotenv').config();
var mongoose = require('mongoose');
var mongoDB = process.env.MONGO_URI;
console.log('Connecting to: ', mongoDB);
mongoose.connect(mongoDB, { serverSelectionTimeoutMS: 5000 })
  .then(() => { console.log('Connected'); process.exit(0); })
  .catch((err) => { console.error('Napaka', err); process.exit(1); });
