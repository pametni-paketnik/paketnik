const Paketnik = require('../models/Paketnik'); 
const Uporabnik = require('../models/Uporabnik'); 

// shranjevanje novega paketnika 
exports.dodajPaketnik = async(req, res) => {
    console.log("Podatki (req.body):", req.body);
    try{
        const novPaketnik = new Paketnik(req.body); 
        const shranjen = await novPaketnik.save(); 
        res.status(201).json(shranjen); 

    }catch(napaka){
        res.status(400).json({sporocilo: "Napaka pri dodajanju paketnika", napaka}); 
    }
}; 

// pridobi seznam vseh paketnikov 
exports.pridobiVsePaketnike = async(req, res) => {
    try{
        const paketniki = await Paketnik.find()
        .populate('lastnik_id', 'ime priimek email')
        .sort({ createdAt: -1 }); 
        res.status(200).json(paketniki); 
    }catch(napaka){
        res.status(500).json({sporocilo: "Napaka pri branju paketnikov", napaka}); 
    }
}; 

//prodobi paketnik po id
exports.pridobiPaketnikPoId = async(req, res) => {
    try {
        const paketnik = await Paketnik.findById(req.params.id);

        if(!paketnik) return res.status(404).json({ sporocilo: 'Paketnik ni bil najden' });
        
        res.status(200).json(paketnik); 
    } catch (napaka) {
        res.status(500).json({sporocilo: "Napaka pri pridobivanju paketnika", napaka}); 
    }
}; 

//prodobi proste paketnike
exports.pridobiProstePaketnike = async(req, res) => {
    try {
        const paketniki = await Paketnik.find({ status: 'prosto' });

        res.status(200).json(paketniki); 
    } catch (napaka) {
        res.status(500).json({sporocilo: "Napaka pri pridobivanju prostih paketnikov", napaka}); 
    }
}; 

// posoodobi 
exports.posodobiPaketnik = async(req, res) => {
    try{
        const posodobljen = await Paketnik.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        ); 

        if(!posodobljen) return res.status(404).json({sporocilo: "Paketnik ne obstaja"}); 
        res.status(200).json(posodobljen); 
    }catch(napaka){
        res.status(400).json({sporocilo: "Napaka pri dodajanju paketnika", napaka}); 
    }
}; 

// brisanje paketnika
exports.izbrisiPaketnik = async(req, res) => {
    try{
        const izbrisan = await Paketnik.findByIdAndDelete(req.params.id);

        if(!izbrisan) return res.status(404).json({sporocilo: "Paketnik ne obstaja"}); 
        res.status(200).json({sporocilo: "Paketnik odstranjen iz seznama"}); 
    }catch(napaka){
        res.status(400).json({sporocilo: "Napaka pri brisanju paketnika", napaka}); 
    }
}; 