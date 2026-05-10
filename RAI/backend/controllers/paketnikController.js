const Paketnik = require('../models/Paketnik'); 
const Uporabnik = require('../models/Uporabnik'); 

// shranjevanje novega paketnika 
exports.dodajPaketnik = async (req, res) => {
    // 1. Logiraj, kaj sploh pride do sem
    console.log("--- NOVI POSKUS DODAJANJA ---");
    console.log("Podatki (req.body):", req.body);

    try {
        const novPaketnik = new Paketnik(req.body); 
        const shranjen = await novPaketnik.save(); 
        console.log("USPEH: Paketnik shranjen!");
        res.status(201).json(shranjen); 

    } catch (napaka) {
        // 2. IZPIS V TERMINAL STREŽNIKA (Poglej sem!)
        console.log("!!! NAPAKA PRI SHRANJEVANJU !!!");
        if (napaka.errors) {
            Object.keys(napaka.errors).forEach(key => {
                console.log(`Polje [${key}]: ${napaka.errors[key].message}`);
            });
        } else {
            console.log("Splošna napaka:", napaka.message);
        }

        // 3. Pošlji podrobnosti nazaj v React
        res.status(400).json({
            sporocilo: "Napaka pri validaciji",
            napaka: napaka.message
        }); 
    }
};

// pridobi seznam vseh paketnikov 
exports.pridobiVsePaketnike = async(req, res) => {
    try{
        const paketniki = await Paketnik.find().populate('lastnik_id', 'ime priimek email'); 
        res.status(200).json(paketniki); 
    }catch(napaka){
        res.status(500).json({sporocilo: "Napaka pri branju paketnikov", napaka}); 
    }
}; 

// psoodobi 
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