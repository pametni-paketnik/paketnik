const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const UporabnikSchema = new Schema({
    ime: { type: String, required: true },
    priimek: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    geslo: { type: String, required: true },
    vloga: { type: String, enum: ['admin', 'user', 'cvetlicarna'], default: 'user'},
    profilna_slika: { type: String },
    stevilka_kartice: { type: String, default: '' },
    ime_na_kartici: { type: String, default: '' },
    datum_poteka: { type: String, default: '' },
    cvv: { type: String, default: '' },
}, { timestamps: true });

// 1. KRIPTIRANJE GESLA (Brez callbackov, samo async/await)
UporabnikSchema.pre('save', async function(next) {
    const uporabnik = this;

    // Če geslo ni bilo spremenjeno, ne delaj nič in nadaljuj
    if (!uporabnik.isModified('geslo')) {
        return; 
    }
    
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(uporabnik.geslo, salt);
        uporabnik.geslo = hash;
    } catch (err) {
        throw err; 
    }
});

// 2. METODA ZA AVTENTIKACIJO
UporabnikSchema.statics.authenticate = async function(email, geslo) {
    const user = await this.findOne({ email: email.toLowerCase().trim() });
    if (!user) return null;

    const isMatch = await bcrypt.compare(geslo, user.geslo);
    if (isMatch) return user;
    return null;
};

// POPRAVEK: Tretji parameter 'uporabniki' prisili Mongoose, da uporabi točno to ime zbirke
module.exports = mongoose.model('Uporabnik', UporabnikSchema, 'uporabniki');