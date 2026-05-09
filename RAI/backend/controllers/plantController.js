const Plant = require('../models/Plant'); 

exports.getAllPlants = async (req, res) => {
    try{
        const plants = await Plant.find(); 
        res.json(plants); 
    }catch(err){
        res.status(500).json({message: err.message}); 
    }
}; 

exports.createPlant = async (req, res) => {
    try{
        const newPlant = new Plant(req.body); 
        const savePlant = await newPlant.save(); 
        res.status(201).json(savePlant); 

    }catch(err){
        res.status(400).json({message: err.message}); 
    }
};

exports.updatePlant = async (req, res) => {
    try{
        const { id } = req.params; 
        const { naZalogi } = req.body; 

        const updatedPlant = await Plant.findByIdAndUpdate(
            id, 
            { naZalogi: naZalogi }, 
            { new: true, runValidators: true }
        ); 

        if(!updatedPlant){
            return res.status(404).json({message: "Rastlina ni bila najdena"}); 
        }
        res.json(updatedPlant); 

    }catch(err){
        res.status(400).json({message: err.message}); 
    }
};

exports.deletePlant = async (req, res) => {
    try{
        const { id } = req.params; 
        const deletedPlant = await Plant.findByIdAndDelete(id);
        
        if(!deletedPlant){
            return res.status(404).json({message: "Rastlina ne obstaja"}); 
        }
        res.json({message: "Rastlina uspesšno izbrisana"}); 

    }catch(err){
        res.status(400).json({message: err.message}); 
    }
};
