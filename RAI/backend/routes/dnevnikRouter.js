const express = require('express');
const router = express.Router();
const dnevnikController = require('../controllers/DnevnikOdklepovController');

router.post('/', dnevnikController.ustvariZapis);
router.get('/', dnevnikController.list);
router.get('/uporabnik/:uporabnikId', dnevnikController.listZaUporabnika);
router.get('/paketnik/:paketnikId', dnevnikController.listZaPaketnik);

module.exports = router;