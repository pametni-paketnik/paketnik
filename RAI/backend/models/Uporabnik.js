const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Nujno dodaj to!
const Schema = mongoose.Schema;

const UporabnikSchema = new Schema({
    ime: { type: String, required: true },
    priimek: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    geslo: { type: String, required: true },
    vloga: { type: String, default: 'lastnik' }, // npr. lastnik, dostavljalec
    slika_obraza: { type: String } 
}, { timestamps: true });

// Kriptiranje gesla pred shranjevanjem
UporabnikSchema.pre('save', function(next) {
    var user = this;
    // Preveri, če je bilo geslo spremenjeno (da ne kriptiramo že kriptiranega)
    if (!user.isModified('geslo')) return next();

    bcrypt.hash(user.geslo, 10, function(err, hash) {
        if (err) {
            return next(err);
        }
        user.geslo = hash;
        next();
    });
});

// Metoda za preverjanje prijave (avtentikacija)
UporabnikSchema.statics.authenticate = function(email, geslo, callback) {
    // Iščemo po emailu, ker je unikaten
    this.findOne({ email: email })
        .exec(function(err, user) {
            if (err) {
                return callback(err);
            } else if (!user) {
                var err = new Error("Uporabnik ni bil najden.");
                err.status = 401;
                return callback(err);
            }
            // Primerjava gesel
            bcrypt.compare(geslo, user.geslo, function(err, result) {
                if (result === true) {
                    return callback(null, user);
                } else {
                    return callback();
                }
            });
        });
}

// Izvoz modela - uporabi samo eno ime (Uporabnik)
module.exports = mongoose.model('Uporabnik', UporabnikSchema);