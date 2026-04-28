const mongoose = require('mongoose');

const UporabnikSchema = new mongoose.Schema({
    ime: { type: String, required: true },
    priimek: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    geslo: { type: String, required: true },
    vloga: { type: String, default: 'lastnik' }, // npr. lastnik, dostavljalec
    slika_obraza: { type: String } // Tukaj bo kasneje pot do slike za tisto prepoznavo
}, { timestamps: true }); // Samodejno doda datum nastanka (createdAt)

module.exports = mongoose.model('Uporabnik', UporabnikSchema);