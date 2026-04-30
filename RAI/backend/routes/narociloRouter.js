const express = require('express'); 
const router = express.Router(); 
const narociloContorller = require('../controllers/narociloController'); 

router.post('/', narociloContorller.dodajNarocilo); 
router.post('/', narociloContorller.pripraviVsaNarocila); 
router.post('/:id', narociloContorller.pridobiNarociloPodId); 
router.post('/:id/prevzem', narociloContorller.dodajNarocilo); 
router.post('/', narociloContorller.posodobiPrevzem); 
router.post('/:id', narociloContorller.izbrisiNarocilo); 

module.exports = router; 