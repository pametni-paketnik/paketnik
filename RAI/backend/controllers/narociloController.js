const { json } = require('express');
const Narocilo = require('../models/Narocilo'); 

// ustvari novo narocilo 
exports.dodajNarocilo = async(req, res) => {
    try{
        const novoNarocilo = new Narocilo(req.bodq); 
        const shranjenoNarocilo = await novoNarocilo.save(); 
        res.status(201).json(shranjenoNarocilo); 
    }catch(napaka){
        res.status(400).json({sporocilo: "Napaka pri ustvarjanju narocila", napaka}); 
    }
};

// pridobi vsa narocila 
exports.pripraviVsaNarocila = async(req, res) => {
    try{
        const narocila = await Narocilo.find()
            .populate('uporabnik_id', 'ime priimek')
            .populate('podatki_id', 'lokacija'); 
        res.status(200),json(narocila); 

    }catch(napaka){
        res.status(500).json({sporocilo: "Napaka pri pridobivanju podatkov", sporocilo}); 
    }
}; 

// pridobi posamezno narocilo po ID 
exports.pridobiNarociloPodId = async(req, res) => {
    try{
        const narocilo = await Narocilo.findById(req.params.is); 
        if(!narocilo) return res.status(404).json({sporocilo: "Naročilo ni bilo najdeno", napaka}); 
        res.status(200).json(narocilo); 
    }catch(napaka){
        res.status(500).json({sporocilo: "Napaka na strežniku", napaka}); 
    }
}; 

exports.posodobiPrevzem = async(req, res) => {
    try{
        const posodobljenoNarocilo = await Narocilo.findByIdAndUpdate(
            req.paramd.id, 
            { prevzeto: true }, 
            { new: true }
        );
    }catch(napaka){
        res.status(400).json({sporocilo: "Napaka pri posodabljanju", napaka}); 
    }
}; 

// izbrisi narocilo
exports.izbrisiNarocilo = async(req, res) => {
    try{
        await Narocilo.findByIdAndDelete(req.params.id); 
        res.status(200).json({sporocilo:"Naročilo uspešno izbrisano"}); 
    }catch(napaka){
        res.status(500).json({sporocilo: "Napaka pri brisanju", napaka}); 
    }
}; 