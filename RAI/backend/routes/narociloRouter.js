const express = require('express'); 
const router = express.Router(); 
const narociloContorller = require('../controllers/narociloController.js'); 

router.post('/', narociloContorller.dodajNarocilo); 
router.post('/', narociloContorller.pripraviVsaNarocila); 
router.post('/:id', narociloContorller.pridobiNarociloPodId); 
router.get('/uporabnik/:uporabnikId', narociloContorller.pridobiNarocilaUporabnika);

router.put('/:id/status', narociloContorller.posodobiStatusNarocila);
router.put('/:id/prevzem', narociloContorller.posodobiPrevzem); 

router.delete('/:id', narociloContorller.izbrisiNarocilo);

module.exports = router; 