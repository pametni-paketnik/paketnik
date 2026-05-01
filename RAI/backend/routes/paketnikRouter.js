const express = require('express');
const router = express.Router();
const paketnikController = require('../controllers/PaketnikController.js');

router.get('/', paketnikController.pridobiVsePaketnike);
router.get('/prosti', paketnikController.pridobiProstePaketnike);
router.post('/', paketnikController.dodajPaketnik);
router.delete('/:id', paketnikController.izbrisiPaketnik);

module.exports = router;