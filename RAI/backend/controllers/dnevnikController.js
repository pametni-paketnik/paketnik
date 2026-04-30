const DnevnikOdklepov = require('../models/DnevnikOdklepov');

module.exports = {

    /**
     * Zabeleži nov dogodek odklepanja.
     * To funkcijo pokličeš, ko nekdo odpre paketnik preko aplikacije ali obraza.
     */
    ustvariZapis: async function (req, res) {
        try {
            const novZapis = new DnevnikOdklepov({
                uporabnik_id: req.body.uporabnik_id,
                paketnik_id: req.body.paketnik_id,
                nacin: req.body.nacin, // 'aplikacija' ali 'obraz'
                uspesno: req.body.uspesno !== undefined ? req.body.uspesno : true
            });

            const shranjeno = await novZapis.save();
            return res.status(201).json(shranjeno);
        } catch (napaka) {
            return res.status(500).json({
                sporocilo: "Napaka pri beleženju odklepa.",
                napaka: napaka.message
            });
        }
    },

    /**
     * Pridobi celotno zgodovino odklepov (za administratorja).
     */
    list: async function (req, res) {
        try {
            const zapisi = await DnevnikOdklepov.find()
                .populate('uporabnik_id', 'ime priimek email')
                .populate('paketnik_id', 'lokacija')
                .sort({ casovna_znacka: -1 }); // Najnovejši zapisi na vrhu
            return res.json(zapisi);
        } catch (napaka) {
            return res.status(500).json({ sporocilo: "Napaka pri pridobivanju dnevnika.", napaka });
        }
    },

    /**
     * Pridobi zgodovino odklepov za določenega uporabnika.
     */
    listZaUporabnika: async function (req, res) {
        try {
            const uporabnikId = req.params.uporabnikId;
            const zapisi = await DnevnikOdklepov.find({ uporabnik_id: uporabnikId })
                .populate('paketnik_id', 'lokacija')
                .sort({ casovna_znacka: -1 });
            return res.json(zapisi);
        } catch (napaka) {
            return res.status(500).json({ sporocilo: "Napaka pri pridobivanju zgodovine za uporabnika.", napaka });
        }
    },

    /**
     * Pridobi zgodovino odklepov za določen paketnik.
     */
    listZaPaketnik: async function (req, res) {
        try {
            const paketnikId = req.params.paketnikId;
            const zapisi = await DnevnikOdklepov.find({ paketnik_id: paketnikId })
                .populate('uporabnik_id', 'ime priimek')
                .sort({ casovna_znacka: -1 });
            return res.json(zapisi);
        } catch (napaka) {
            return res.status(500).json({ sporocilo: "Napaka pri pridobivanju zgodovine paketnika.", napaka });
        }
    }
};