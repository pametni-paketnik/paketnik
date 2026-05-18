const express = require('express'); 
const router = express.Router(); 
const narociloContorller = require('../controllers/narociloController.js'); 

router.post('/', narociloContorller.dodajNarocilo); 

router.get('/', narociloContorller.pripraviVsaNarocila); 

router.get('/uporabnik/:uporabnikId', narociloContorller.pridobiNarocilaUporabnika);

router.get('/:id', narociloContorller.pridobiNarociloPodId);

router.put('/:id/status', narociloContorller.posodobiStatusNarocila);

router.put('/:id/prevzem', narociloContorller.posodobiPrevzem); 

router.delete('/:id', narociloContorller.izbrisiNarocilo);

module.exports = router; 