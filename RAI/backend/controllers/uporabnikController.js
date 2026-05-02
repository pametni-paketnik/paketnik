const Uporabnik = require('../models/Uporabnik.js');
var moment = require('moment');

module.exports = {
    // 1. Seznam uporabnikov 
    list: async function (req, res) {
        try {
            const uporabniki = await Uporabnik.find().select('-geslo'); // Ne pošiljaj gesel v seznamu
            return res.json(uporabniki); 
        } catch (napaka) {
            return res.status(500).json({ sporocilo: "Napaka pri pridobivanju", napaka }); 
        }
    },

    // 2. Registracija (Popravljeno na async/await)
    create: async function (req, res) {
    console.log("Prejeti podatki iz Reacta:", req.body); // Preveri, če sploh dobiš podatke!
    try {
        var user = new Uporabnik({
            ime : req.body.ime,
            priimek : req.body.priimek,
            email : req.body.email, 
            geslo: req.body.geslo
        });

        const savedUser = await user.save();
        console.log("Uporabnik shranjen!");
        return res.status(201).json({ message: "Registracija uspela" });

    } catch (err) {
        console.error("Podrobna napaka baze:", err); // TOLE TI BO POVEDALO VSE
        return res.status(400).json({ message: err.message });
    }
    },

    // 3. Prijava (Z dodano diagnostiko za iskanje napake)
    login: async function (req, res) {
        console.log("LOGIN FUNKCIJA SE JE ZAGNALA!");
    try {
        const { email, geslo } = req.body;
        const preprostIskalnik = await Uporabnik.findOne({ email: email.toLowerCase().trim() });
        
        if (!preprostIskalnik) {
            console.log("NAPAKA: Uporabnik s tem emailom sploh ne obstaja v bazi.");
            return res.status(401).json({ message: "Napačen email." });
        }

        const bcrypt = require('bcrypt');
        const match = await bcrypt.compare(geslo, preprostIskalnik.geslo);
        console.log("Ali se geslo ujema?", match);

        if (!match) {
            return res.status(401).json({ message: "Napačno geslo." });
        }

        req.session.userId = preprostIskalnik._id;
        return res.json({ message: "Uspeh!", user: preprostIskalnik });

    } catch (err) {
        console.error("Kritična napaka:", err);
        res.status(500).json({ message: "Napaka na strežniku" });
    }
},
    // 4. Profil
    profile: async function (req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ message: "Niste prijavljeni." });
            }
            const user = await Uporabnik.findById(req.session.userId).select('-geslo');
            if (!user) {
                return res.status(404).json({ message: "Uporabnik ni najden." });
            }
            var userObj = user.toObject();
            userObj.datum_registracije = moment(userObj.createdAt).format('DD.MM.YYYY HH:mm:ss');
            return res.json(userObj);
        } catch (error) {
            return res.status(500).json({ message: "Napaka na strežniku." });
        }
    },

    // 5. Prikaži posameznega
    show: async function (req, res) {
        try {
            const uporabnik = await Uporabnik.findById(req.params.id).select('-geslo');
            if (!uporabnik) return res.status(404).json({ message: "Ni najden" });
            return res.json(uporabnik);
        } catch (err) {
            return res.status(500).json({ message: "Napaka" });
        }
    },

    // 6. Posodabljanje (Popravljeno: varno posodabljanje)
    update: async function (req, res) {
    try {
        const id = req.params.id;
        const uporabnik = await Uporabnik.findById(id);

        if (!uporabnik) return res.status(404).json({ message: "Ni najden" });
        if (req.body.ime) uporabnik.ime = req.body.ime;
        if (req.body.priimek) uporabnik.priimek = req.body.priimek;
        if (req.body.email) uporabnik.email = req.body.email;
        if (req.body.geslo) uporabnik.geslo = req.body.geslo; // To bo sprožilo kriptiranje!

        await uporabnik.save(); // Uporabimo .save(), da sprožimo hook za kriptiranje
        
        return res.json({ message: "Posodobljeno" });
    } catch (err) {
        return res.status(500).json({ message: "Napaka pri posodabljanju" });
    }
    },

    // 7. Brisanje
    remove: async function (req, res) {
        try {
            await Uporabnik.findByIdAndDelete(req.params.id); 
            return res.status(204).send(); 
        } catch (napaka) {
            return res.status(500).json({ sporocilo: "Napaka pri brisanju" }); 
        }
    },

    // 8. Odjava
    logout: function (req, res) {
        if (req.session) {
            req.session.destroy(function (err) {
                if (err) return res.status(500).json({ message: "Napaka pri odjavi" });
                res.clearCookie('connect.sid'); 
                return res.status(200).json({ message: "Odjava uspešna" });
            });
        } else {
            return res.status(200).json({ message: "Že odjavljeni" });
        }
    }
};