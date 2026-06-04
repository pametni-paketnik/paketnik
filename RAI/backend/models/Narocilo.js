const mongoose = require('mongoose');

const NarociloSchema = new mongoose.Schema({
    uporabnik_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Uporabnik', required: true },
    stranka: {
        ime: { type: String, required: true },
        priimek: { type: String, required: true },
        email: { type: String, required: true },
        telefonska_stevilka: { type: String, required: false }
    },
    izdelki: { 
        type: [
            {
                izdelek_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Izdelek', required: true },
                ime_izdelka: { type: String, required: true },
                kolicina: { type: Number, required: true, min: 1, default: 1 }, 
                paketnik: {
                    paketnik_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Paketnik', required: false },
                    ime: { type: String, default: "Glavni Paketnik" },
                    naslov: { type: String, default: "Naslov paketnika ni izbran" }
                }
            }
        ], 
        validate: [
            {
                validator: function(izdelki) {
                    return izdelki.length === 1;
                },
                message: 'V enem naročilu je lahko samo 1 izdelek.'
            }
        ]
    }, 
    placilo: {
        imetnik: { type: String, required: true },
        kartica_maskirana: { type: String, required: true },
        potek: { type: String, required: true } // npr. "05/28"
    },
    skupna_cena: { type: Number, required: true },
    koda_za_odpiranje: { type: String, required: true },
    datum_dostave: { type: Date, default: null },
    status: { type: String,enum: ['oddano','v_pripravi','caka_na_prevzem','prevzeto','preklicano'], default: 'oddano' },
    prevzeto: { type: Boolean, default: false },
    datum_prevzema: { type: Date, default: null },
    cvetlicarna_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Uporabnik', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Narocilo', NarociloSchema, 'narocila');