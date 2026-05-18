const mongoose = require('mongoose');

const NarociloSchema = new mongoose.Schema({
    uporabnik_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Uporabnik', required: true },
    stranka: {
        ime: { type: String, required: true },
        priimek: { type: String, required: true },
        email: { type: String, required: true },
        telefon: { type: String, required: true }
    },
    izdelki: { 
        type: [
            {
                izdelek_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Izdelek', required: true },
                ime_izdelka: { type: mongoose.Schema.Types.ObjectId, required: true },
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
                    return izdelki.length >= 1 && izdelki.length <= 2;
                },
                message: 'Na eno naročilo lahko najmanj 1 in največ 2 izdelka.'
            }
        ], 
        placilo: {
        imetnik: { type: String, required: true },
        kartica_maskirana: { type: String, required: true },
        potek: { type: String, required: true } // npr. "05/28"
        },

    skupna_cena: { type: Number, required: true },
    },
    koda_za_odpiranje: { type: String, required: true },
    datum_dostave: { type: Date, required: true },
    status: { type: String, enum: ['oddano', 'v_dostavi', 'prevzeto', 'preklicano'], default: 'oddano' },
    prevzeto: { type: Boolean, default: false },
    datum_prevzema: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Narocilo', NarociloSchema, 'narocila');