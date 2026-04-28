const mongoose = require('mongoose');

const PaketnikSchema = new mongoose.Schema({
    lokacija: { type: String, required: true },
    status: { type: String, default: 'prost' }, // prost, zaseden, napaka
    temperatura: { type: Number, default: 20 },
    lastnik_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Uporabnik' } // Povezava na uporabnika!
}, { timestamps: true });

module.exports = mongoose.model('Paketnik', PaketnikSchema);