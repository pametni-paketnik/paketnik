const Paketnik = require('../models/Paketnik'); 

// shranjevanje novega paketnika 
exports.dodajPaketnik = async(req, res) => {
    try{
        const novPaketnik = new Paketnik(req.body); 
        const shranjevanjePaketnika = await novPaketnik.save(); 
        res.status(201).json(shranjevanjePaketnika); 

    }catch(napaka){
        res.status(400).json({sporocilo: "Napaka pri dodajanju paketnika", napaka}); 
    }
}; 

// pridobi seznam vseh paketnikov 
exports.pridobiVsePaketnike = async(req, res) => {
    try{
        const paketniki = await Paketnik.find().populate('lastnik_id', 'ime priimek email'); 
        re.status(200).json(paketniki); 
    }catch(napaka){
        res.status(500).json({sporocilo: "Napaka pri branju paketnikov", napaka}); 
    }
}; 

// psoodobi "senzorje" - temperatura, status,...
exports.pridobiProstePaketnike = async(req, res) => {
    try{
        const posodobljen = await Paketnik.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
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
        await Paketnik.findByIdAndDelete(res.params.id);
        res.status(200).json({sporocilo: "Paketnik odstranjen iz seznama"}); 
    }catch(napaka){
        res.status(400).json({sporocilo: "Napaka pri brisanju paketnika", napaka}); 
    }
}; 