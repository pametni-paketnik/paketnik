const Plant = require('../models/Plant');

module.exports = {

    list: async function (req, res) {
        try{
            const plants = await Plant.find(); 
            return res.json(plants); 
        } catch(err){
            return res.status(500).json({
            message: 'Napaka pri pridobivanju rastlin.',
            error: err
            });
        }      
    },

    show: async function (req, res) {
        try {
            const plant = await Plant.findById(req.params.id);
            if (!plant) return res.status(404).json({ message: 'Rastlina ne obstaja.' });
            return res.json(plant);
        } catch (err) {
            return res.status(500).json({ message: 'Napaka pri pridobivanju.', error: err });
        }
    },

    create: async function (req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "Niste izbrali slike rastline." });
            }

            const plant = new Plant({
                name: req.body.name,
                path: "/images/" + req.file.filename,
                description: req.body.description,
                care: req.body.care,
                price: req.body.price,
                date: req.body.date,
                naZalogi: req.body.naZalogi === 'true' || req.body.naZalogi === true || req.body.naZalogi === undefined
            });

            const savedPlant = await plant.save();
            return res.status(201).json(savedPlant);
        } catch (err) {
            console.error("Napaka pri shranjevanju:", err);
            return res.status(500).json({
                message: "Napaka pri ustvarjanju rastline",
                error: err.message
            });
        }
    },

    update: async function (req, res) {
        try {
            const plant = await Plant.findById(req.params.id);
            if (!plant) return res.status(404).json({ message: 'Rastlina ne obstaja.' });

            plant.name = req.body.name || plant.name;
            plant.path = req.file ? "/images/" + req.file.filename : plant.path;
            plant.description = req.body.description || plant.description;
            plant.care = req.body.care || plant.care;
            plant.price = req.body.price || plant.price;
            plant.naZalogi = (req.body.naZalogi !== undefined) ? (req.body.naZalogi === 'true' || req.body.naZalogi === true) : plant.naZalogi;

            const updated = await plant.save();
            return res.json(updated);
        } catch (err) {
            return res.status(500).json({ message: 'Napaka pri posodabljanju.', error: err });
        }
    },

    remove: async function (req, res) {
        try {
            await Plant.findByIdAndDelete(req.params.id);
            return res.status(204).send();
        } catch (err) {
            return res.status(500).json({ message: 'Napaka pri brisanju.', error: err });
        }
    }
};