const mongoose = require('mongoose');

const DnevnikOdklepovSchema = new mongoose.Schema({
    narocilo_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Narocilo', required: true }, 
    uporabnik_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Uporabnik', required: true },
    paketnik_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Paketnik', required: true },
    cas_odklepanja: { type: Date, default: Date.now },
    nacin: { type: String, required: true }, // npr. 'aplikacija' ali 'obraz'
    uspesno: { type: Boolean, default: true }
}, {
    timestamps: { createdAt: 'casovna_znacka', updatedAt: 'posodobljeno_ob' }
});
module.exports = mongoose.model('DnevnikOdklepov', DnevnikOdklepovSchema, 'dnevnik_odklepov');