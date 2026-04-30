const express = require('express');
const router = express.Router();
const paketnikController = require('../controllers/PaketnikController');

router.get('/', paketnikController.pridobiVsePaketnike);
router.get('/prosti', paketnikController.pridobiProstePaketnike);
router.post('/', paketnikController.dodajPaketnik);
router.put('/:id', paketnikController.posodobiPaketnik); // Za spreminjanje statusa ali temp.
router.delete('/:id', paketnikController.izbrisiPaketnik);

module.exports = router;