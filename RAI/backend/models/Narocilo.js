const mongoose = require('mongoose');

const NarociloSchema = new mongoose.Schema({
    uporabnik_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Uporabnik', required: true },
    paketnik_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Paketnik', required: true },
    izdelki: { 
        type: [
            {
                izdelek_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Izdelek', required: true },
                kolicina: { type: Number, required: true, min: 1, default: 1 }
            }
        ], 
        validate: [
            {
                validator: function(izdelki) {
                    return izdelki.length >= 1 && izdelki.length <= 2;
                },
                message: 'Na eno naročilo lahko najmanj 1 in največ 2 izdelka.'
            }
        ]
    },
    koda_za_odpiranje: { type: String, required: true },
    datum_dostave: { type: Date, required: true },
    status: { type: String, enum: ['oddano', 'v_dostavi', 'prevzeto', 'preklicano'], default: 'oddano' },
    prevzeto: { type: Boolean, default: false },
    datum_prevzema: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Narocilo', NarociloSchema, 'narocila');