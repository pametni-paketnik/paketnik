const mongoose = require('mongoose');

const PaketnikSchema = new mongoose.Schema({
    ime: {type: String, required: [true, "Ime paketnika je obvezno"], trim: true}, 
    lokacija: { type: String, required: true },
    lat: { type: Number, required: true}, 
    lng: { type: Number, required: true}, 
    status: { type: String, enum: ['prosto', 'zasedeno', 'napaka'], default: 'prosto' },
    details: { type: String, default: "Dostop 24/7"}, 
    lastnik_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Uporabnik' }, // Povezava na uporabnika!
}, { timestamps: true });

module.exports = mongoose.model('Paketnik', PaketnikSchema, 'paketniki');