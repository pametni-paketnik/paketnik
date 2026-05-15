const express = require('express');
const router = express.Router();
const dnevnikController = require('../controllers/dnevnikController.js');

router.post('/', dnevnikController.dodajZapis);
router.get('/', dnevnikController.pridobiVseZapise);
router.get('/uporabnik/:uporabnikId', dnevnikController.pridobiZapiseZaPaketnik);
router.get('/paketnik/:paketnikId', dnevnikController.pridobiZapiseZaUporabnika);

module.exports = router;