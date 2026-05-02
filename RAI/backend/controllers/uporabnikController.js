const Uporabnik = require('../models/Uporabnik.js');
var moment = require('moment');
var bcrypt = require('bcrypt');

module.exports = {
    // 1. Seznam uporabnikov 
    list: async function (req, res) {
        try {
            const uporabniki = await Uporabnik.find().select('-geslo'); // Ne pošiljaj gesel v seznamu
            return res.json(uporabniki); 
        } catch (err) {
            return res.status(500).json({ message: "Napaka pri pridobivanju", err }); 
        }
    },

    // 2. Registracija (Popravljeno na async/await)
    create: async function (req, res) {
    try {
        var user = new Uporabnik({
            ime : req.body.ime,
            priimek : req.body.priimek,
            email : req.body.email, 
            geslo: req.body.geslo
        });

        await user.save(); 
        return res.status(201).json({ message: "Registracija uspela" });

    } catch (err) {
        if(err.code === 11000){
            return res.status(400).json({ message: "Uporabnik s tem email naslovom je že registriran"}); 
        }
        if(err.name === "ValidationError"){
            return res.status(400).json({ message: "Podatki niso pravilni: " + Object.values(err.errors).map(val => val.message).json(', ')}); 
        }
        return res.status(500).json({ message: "Prislo je do napake na strežniku", sporocilo });
    }
    },

    // 3. Prijava (Z dodano diagnostiko za iskanje napake)
    login: async function (req, res) {
        console.log("LOGIN FUNKCIJA SE JE ZAGNALA!");
    try {
        const { email, geslo } = req.body;
        const uporabnik = await Uporabnik.findOne({email: email.toLowerCase().trim()}); 

        if (!uporabnik) {
            console.log("NAPAKA: Email ne obstaja");
            return res.status(401).json({ message: "Napačen email ali geslo." });
        }

        const match = await bcrypt.compare(geslo, uporabnik.geslo);
        console.log("Ali se geslo ujema?", match);

        if (!match) {
            return res.status(401).json({ message: "Napačen email ali geslo." });
        }

        req.session.userId = uporabnik._id;
        const userResponse = uporabnik.toObject(); 
        delete userResponse.geslo; 

        return res.json({ message: "Uspeh!", user: userResponse });

    } catch (err) {
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