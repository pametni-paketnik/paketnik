const mongoose = require('mongoose');

const DnevnikOdklepovSchema = new mongoose.Schema({
    uporabnik_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Uporabnik', required: true },
    paketnik_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Paketnik', required: true },
    nacin: { type: String, required: true }, // npr. 'aplikacija' ali 'obraz'
    uspesno: { type: Boolean, default: true }
}, {
    timestamps: { createdAt: 'casovna_znacka', updatedAt: 'posodobljeno_ob' }
});
module.exports = mongoose.model('DnevnikOdklepov', DnevnikOdklepovSchema);