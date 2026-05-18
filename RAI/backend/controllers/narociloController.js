const { json } = require('express');
const Narocilo = require('../models/Narocilo'); 
const Paketnik = require('../models/Paketnik');

// ustvari novo narocilo 
exports.dodajNarocilo = async (req, res) => {
  try {
    const {
      uporabnik_id,
      paketnik_id,
      izdelki,
      datum_dostave
    } = req.body;

    if (!izdelki || izdelki.length < 1 || izdelki.length > 2) {
      return res.status(400).json({
        sporocilo: 'Na eno naročilo lahko dodate najmanj 1 in največ 2 izdelka.'
      });
    }

    const koda = Math.floor(100000 + Math.random() * 900000).toString();

    const novoNarocilo = new Narocilo({
      uporabnik_id: finalOrder.uporabnik_id || null, // Če je uporabnik prijavljen, sicer null
      
      stranka: {
        ime: finalOrder.customer?.firstName,
        priimek: finalOrder.customer?.lastName,
        email: finalOrder.customer?.email,
        telefon: finalOrder.customer?.phone
      },
      
      izdelki: finalOrder.items.map(item => ({
        izdelek_id: item._id, 
        ime_izdelka: item.name,
        cena: Number(item.price) || 0,
        kolicina: 1, 
        paketnik: {
          paketnik_id: item.selectedLocker?._id || null,
          ime: item.selectedLocker?.name || "Glavni Paketnik",
          naslov: item.selectedLocker?.address || "Naslov paketnika ni izbran"
        }
      })),
      
      placilo: {
        imetnik: finalOrder.payment?.cardholder || "Ni podatka",
        kartica_maskirana: finalOrder.payment?.cardNumber 
          ? `•••• •••• •••• ${finalOrder.payment.cardNumber.slice(-4)}` 
          : "Ni podatka",
        potek: `${String(finalOrder.payment?.month).padStart(2, '0')}/${String(finalOrder.payment?.year).slice(-2)}`
      },
      
      skupna_cena: Number(finalOrder.totalPrice) || 0,
      koda_za_odpiranje: koda,
      datum_dostave: new Date(), // Ker na frontend-u nimaš datuma, nastavimo trenutni čas dostave/oddaje
      status: 'oddano'
    });

    const shranjeno = await novoNarocilo.save();

    await Paketnik.findByIdAndUpdate(paketnik_id, {
      status: 'zasedeno'
    });

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
exports.pridobiNarociloPodId = async(req, res) => {
    try{
        const narocilo = await Narocilo.findById(req.params.id)
            .populate('uporabnik_id', 'ime priimek email')
            .populate('paketnik_id', 'ime lokacija lat lng');

        if(!narocilo) return res.status(404).json({sporocilo: "Naročilo ni bilo najdeno", napaka}); 
        
        res.status(200).json(narocilo); 
    } catch (napaka) {
        res.status(500).json({ sporocilo: "Napaka na strežniku", napaka }); 
    }
}; 

// Pridobi Narocilo Uporabnika
exports.pridobiNarocilaUporabnika = async (req, res) => {
    try {
        const narocilo = await Narocilo.find({
            uporabnik_id: req.params.uporabnikId
        })
        .populate('paketnik_id', 'ime lokacija lat lng')
        .sort({ createdAt: -1 });

        res.status(200).json(narocilo);
    } catch (napaka) {
        res.status(500).json({ sporocilo: "Napaka na strežniku", napaka });
    }
}

// Posodobi Status Narocila
exports.posodobiStatusNarocila = async (req, res) => {
    try {
        const narocilo = await Narocilo.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            {new: true, runValidators: true }
        );

        if(!narocilo) return res.status(404).json({sporocilo: "Naročilo ni bilo najdeno", napaka}); 

        res.status(200).json(narocilo);
    } catch (napaka) {
        res.status(500).json({ sporocilo: "Napaka na strežniku", napaka });
    }
}

// Posodobi Prevzem
exports.posodobiPrevzem = async(req, res) => {
    try {
        const narocilo = await Narocilo.findByIdAndUpdate(
            req.paramd.id, 
            { 
                prevzeto: true,
                ststus: 'prevzeto',
                datum_prevzema: new Date()
            }, 
            { new: true }
        );
        
        if(!narocilo) return res.status(404).json({sporocilo: "Naročilo ni bilo najdeno", napaka}); 

        await Paketnik.findByIdAndUpdate(narocilo.paketnik_id, {
            status: 'prosto'
        });

        res.status(200).json(narocilo);

    } catch (napaka) {
        res.status(400).json({sporocilo: "Napaka pri posodabljanju", napaka}); 
    }
}; 

// izbrisi narocilo
exports.izbrisiNarocilo = async(req, res) => {
    try {
        const narocilo = await Narocilo.findByIdAndDelete(req.params.id);

        if(!narocilo) return res.status(404).json({sporocilo: "Naročilo ni bilo najdeno", napaka}); 

        res.status(200).json({sporocilo:"Naročilo uspešno izbrisano"}); 
    } catch (napaka) {
        res.status(500).json({sporocilo: "Napaka pri brisanju", napaka}); 
    }
}; 