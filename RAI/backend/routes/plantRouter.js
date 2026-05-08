const express = require('express');
const router = express.Router();
const Plant = require('../models/Plant'); 

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { naZalogi } = req.body;

        const updatedPlant = await Plant.findByIdAndUpdate(
            {id: Number(id) }, 
            {naZalogi: naZalogi}, 
            {new: true}
        ); 

        if (!updatedPlant) {
            return res.status(404).json({ message: "Rastlina ni bila najdena" });
        }

        res.json(updatedPlant);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const plants = await Plant.find();
        res.json(plants);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;