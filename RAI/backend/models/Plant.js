const mongoose = require('mongoose');

const PlantSchema = new mongoose.Schema({
    id: {type: Number, required: true, unique: true}, 
    name: {type: String, required: true}, 
    price: {type: String, required: true}, 
    naZalogi: {type: Boolean, default: true}
}); 

module.exports = mongoose.model('Plant', PlantSchema); 