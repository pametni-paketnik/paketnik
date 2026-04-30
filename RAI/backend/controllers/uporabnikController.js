const Uporabnik = require('../models/Uporabnik.js');
var moment = require('moment');

module.exports = {

    // seznam uporabnikov 
    list: async function (req, res) {
        try{
            const uporabniki = await Uporabnik.find(); 
            return res.json(uporabniki); 
        }catch(napaka){
            return res.status(500).json({sporocilo: "Napaka pri pridobivanju", napaka}); 
        }
    },

    // registracija
    create: async function (req, res) {
        try{
            const uporabnik = new Uporabnik ({
                ime: req.body.ime,
                priimek: req.body.priimek,
                email: req.body.email,
                geslo: req.body.geslo,
                vloga: req.body.vloga || 'lastnik',
                slika_obraza: req.body.slika_obraza
            });
            const shranjenUporabnik = await uporabnik.save(); 
            return res.status(201).json(shranjenUporabnik); 
        }catch(napaka){
            res.status(500).json({sporocilo: "Napaka pri registraciji", napaka}); 
        }
    }, 

    show: async function (req, res) {
        try{
            const user = await Uporabnik.findById(req.params.id); 
            if(!user) return res.status(404).json({sporocilo: "Uporabnik ni najden"}); 
            return res.json(user); 
        }catch(napaka){
            return res.status(500).json({sporocilo: "Napka", napaka}); 
        }
    },

    // prijava 
    login: async function (req, res, next) {
        Uporabnik.authenticate(req.body.email, req.body.geslo, function (err, user) {
            if (err || !user) {
                return res.status(401).json({
                    message: "Napačen email ali geslo."
                });
            }
            // Shranimo ID uporabnika v sejo (session)
            req.session.userId = user._id;
            
            // Vrnemo uspeh Reactu
            return res.json({
                message: "Prijava uspešna",
                user: {
                    _id: user._id,
                    ime: user.ime,
                    priimek: user.priimek,
                    email: user.email
                }
            });
        });
    },

    // profil
    profile: async function (req, res, next) {
        Uporabnik.findById(req.session.userId)
            .exec(function (error, user) {
                if (error) {
                    return res.status(500).json({ message: "Napaka na strežniku." });
                } else {
                    if (user === null) {
                        return res.status(401).json({ message: "Niste prijavljeni." });
                    } else {
                        // Preoblikujemo v objekt in odstranimo občutljive podatke
                        var userObj = user.toObject();
                        delete userObj.geslo;
                        
                        // Formatiramo datum s poljem createdAt (ki ga doda timestamps: true)
                        userObj.datum_registracije = moment(userObj.createdAt).format('DD.MM.YYYY HH:mm:ss');

                        return res.json(userObj);
                    }
                }
            });
    },

    // posodobitev
    update: async function (req, res) {
        try {
            const id = req.params.id;
            const user = await Uporabnik.findById(id);
            
            if (!user) return res.status(404).json({ message: 'Uporabnik ni bil najden.' });

            user.ime = req.body.ime || user.ime;
            user.priimek = req.body.priimek || user.priimek;
            user.email = req.body.email || user.email;
            user.vloga = req.body.vloga || user.vloga;
            
            if (req.body.geslo) user.geslo = req.body.geslo;

            const updatedUser = await user.save();
            return res.json(updatedUser);
        } catch (err) {
            return res.status(500).json({ message: 'Napaka pri posodabljanju.', error: err });
        }
    },

    // brisanje
    remove: async function (req, res) {
        try{
            const id = req.params.id; 
            await Uporabnik.findByIdAndDelete(id); 
            return re.status(204).send(); 
        } catch(napaka){
            return res.status(500).json({sporocilo: "Napaka pri brisanju", sporocilo}); 
        }
    },

    logout: function (req, res, next) {
        if (req.session) {
            req.session.destroy(function (err) {
                if (err) {
                    return next(err);
                } else {
                    return res.status(200).json({ message: "Odjava uspešna" });
                }
            });
        }
    }
};