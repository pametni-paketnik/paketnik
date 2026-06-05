const { json } = require('express');
const Narocilo = require('../models/Narocilo');
const Paketnik = require('../models/Paketnik');
const { set } = require('mongoose');

// ustvari novo narocilo 
exports.dodajNarocilo = async (req, res) => {
    try {
        const {
            uporabnik_id,
            stranka,
            izdelki,
            placilo,
            skupna_cena
        } = req.body;

        if (!izdelki || izdelki.length < 1) {
            return res.status(400).json({ message: "Naročilo mora vsebovati vsaj en izdelek." });
        }

        if (!uporabnik_id) {
            return res.status(401).json({
                sporocilo: 'Za oddajo naročila se morate prijaviti.'
            });
        }

        const koda = Math.floor(100000 + Math.random() * 900000).toString();

        const ocisceniIzdelki = izdelki.map(izdelek => {
            if (izdelek.paketnik && izdelek.paketnik.paketnik_id === null) {
                izdelek.paketnik.paketnik_id = undefined;
            }
            return izdelek;
        });

        const novoNarocilo = new Narocilo({
            uporabnik_id: uporabnik_id ? uporabnik_id : undefined,
            stranka: stranka,
            izdelki: ocisceniIzdelki,
            placilo: placilo,
            skupna_cena: skupna_cena || 0,
            koda_za_odpiranje: koda,
            datum_dostave: null,
            datum_narocila: new Date(),
            status: 'oddano'
        });

        const shranjeno = await novoNarocilo.save();

        for (const izdelek of izdelki) {
            if (izdelek.paketnik && izdelek.paketnik.paketnik_id) {
                await Paketnik.findByIdAndUpdate(izdelek.paketnik.paketnik_id, {
                    status: 'zasedeno'
                });
            }
        }

        res.status(201).json(shranjeno);
    } catch (napaka) {
        res.status(400).json({
            sporocilo: 'Napaka pri ustvarjanju naročila',
            napaka: napaka.message
        });
    }
};

// pridobi vsa narocila 
exports.pripraviVsaNarocila = async (req, res) => {
    try {
        const narocila = await Narocilo.find()
            .populate('uporabnik_id', 'ime priimek email')
            .sort({ createdAt: -1 });

        res.status(200).json(narocila);
    } catch (napaka) {
        console.error('Napaka pri pridobivanju naročil:', napaka);

        res.status(500).json({
            sporocilo: 'Napaka pri pridobivanju podatkov',
            napaka: napaka.message
        });
    }
};

// pridobi posamezno narocilo po ID 
exports.pridobiNarociloPodId = async (req, res) => {
    try {
        const narocilo = await Narocilo.findById(req.params.id)
            .populate('uporabnik_id', 'ime priimek email')
            .populate('paketnik_id', 'ime lokacija lat lng');

        if (!narocilo) return res.status(404).json({ sporocilo: "Naročilo ni bilo najdeno", napaka });

        res.status(200).json(narocilo);
    } catch (napaka) {
        res.status(500).json({ sporocilo: "Napaka na strežniku", napaka });
    }
};

// Pridobi Narocilo Uporabnika
exports.pridobiNarocilaUporabnika = async (req, res) => {
    try {
        console.log("USER PARAM:", req.params.uporabnikId);
        
        const narocila = await Narocilo.find({
            uporabnik_id: req.params.uporabnikId
        })
            .populate('uporabnik_id', 'ime priimek email')
            .sort({ createdAt: -1 });

        res.status(200).json(narocila);
    } catch (napaka) {
        res.status(500).json({ sporocilo: "Napaka na strežniku", napaka });
    }
}

// Posodobi Status Narocila
exports.posodobiStatusNarocila = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, cvetlicarna_id } = req.body;

        console.log("STATUS UPDATE BODY:", req.body);

<<<<<<< Updated upstream
         const allowedStatuses = [
            'oddano',
            'v_pripravi',
            'caka_na_prevzem',
            'prevzeto',
            'aborting'
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ sporocilo: 'Neveljaven status' });
        }

        const setData = { status };

        if (cvetlicarna_id) {
            setData.cvetlicarna_id = cvetlicarna_id;
        }

        if (status === 'caka_na_prevzem') {
            setData.datum_dostave = new Date();
        }

        if (status === 'prevzeto') {
=======
        const setData = {
            status: status
        };

        if (status === 'dostavljeno') {
>>>>>>> Stashed changes
            setData.datum_dostave = new Date();
        }

        if (status === 'v_dostavi' && cvetlicarna_id) {
            setData.cvetlicarna_id = cvetlicarna_id;
        }

        console.log("SET DATA:", setData);

        const narocilo = await Narocilo.findByIdAndUpdate(
            id,
            {
                $set: setData
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!narocilo) {
            return res.status(404).json({
                sporocilo: 'Naročilo ni najdeno.'
            });
        }

        res.status(200).json(narocilo);

    } catch (error) {
        console.error('Napaka pri posodabljanju statusa naročila:', error);
        res.status(500).json({
            sporocilo: 'Napaka pri posodabljanju statusa naročila.',
            napaka: error.message
        });
    }
};
<<<<<<< Updated upstream

exports.checkAbortingOrders = async () => {
    const limit = 30 * 1000; 
    const now = Date.now();

    const result = await Narocilo.updateMany(
        {
            status: 'caka_na_prevzem',
            updatedAt: { $lte: new Date(now - limit) }
        },
        {
            $set: { status: 'aborting' }
        }
    );

    console.log("Aborted (not picked up in time):", result.modifiedCount);
};
=======
>>>>>>> Stashed changes

// Posodobi Prevzem
exports.posodobiPrevzem = async (req, res) => {
    try {
        const narocilo = await Narocilo.findByIdAndUpdate(
            req.params.id,
            {
                prevzeto: true,
                status: 'prevzeto',
                datum_prevzema: new Date()
            },
            { new: true }
        );

        if (!narocilo) return res.status(404).json({ sporocilo: "Naročilo ni bilo najdeno", napaka });

        await Paketnik.findByIdAndUpdate(narocilo.paketnik_id, {
            status: 'prosto'
        });

        res.status(200).json(narocilo);

    } catch (napaka) {
        res.status(400).json({ sporocilo: "Napaka pri posodabljanju", napaka });
    }
};

// izbrisi narocilo
exports.izbrisiNarocilo = async (req, res) => {
    try {
        const narocilo = await Narocilo.findByIdAndDelete(req.params.id);

        if (!narocilo) return res.status(404).json({ sporocilo: "Naročilo ni bilo najdeno", napaka });

        res.status(200).json({ sporocilo: "Naročilo uspešno izbrisano" });
    } catch (napaka) {
        res.status(500).json({ sporocilo: "Napaka pri brisanju", napaka });
    }
}; 