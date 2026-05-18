var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

const PlantSchema = new mongoose.Schema({ 
    'name': {type: String, required: true}, 
    'path': {type: String}, 
    'description': {type: String, required: true}, 
    'care': { type: String, required: true},
    'price': {type: String, required: true}, 
    'date' : {type: Date, default: Date.now},
    'naZalogi': {type: Boolean, default: true}
}); 

module.exports = mongoose.model('Plant', PlantSchema, "plants"); 
