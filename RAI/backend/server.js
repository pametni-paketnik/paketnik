const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware (srednja oprema)
app.use(cors());
app.use(express.json());

// Povezava na bazo (iz .env datoteke)
const uri = process.env.MONGO_URI;

mongoose.connect(uri)
    .then(() => console.log("Povezava z MongoDB Atlas uspela! 🚀"))
    .catch(err => console.error("Napaka pri povezavi:", err));

// Osnovni testni naslov
app.get('/', (req, res) => {
    res.send('Backend za Pametni Paketnik teče!');
});

// Zagon strežnika
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Strežnik teče na portu: ${PORT}`);
});