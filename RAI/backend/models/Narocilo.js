const mongoose = require('mongoose');

const NarociloSchema = new mongoose.Schema({
    uporabnik_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Uporabnik', required: true },
    paketnik_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Paketnik', required: true },
    vrsta_cvetja: { type: String, required: true },
    koda_za_odpiranje: { type: String, required: true },
    datum_dostave: { type: Date, required: true },
    prevzeto: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Narocilo', NarociloSchema);