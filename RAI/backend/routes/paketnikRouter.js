const express = require('express');
const router = express.Router();
const paketnikController = require('../controllers/paketnikController.js');

const preveriAdmina = (req, res, next) => {
    if(req.session && req.session.vloga === 'admin'){
        return next(); 
    } else{
        return res.status(403).json({sporocilo: "Dostop zavrnjen"}); 
    }
}; 

router.post('/', preveriAdmina, paketnikController.dodajPaketnik);

router.get('/', paketnikController.pridobiVsePaketnike);
router.get('/prosti', preveriAdmina, paketnikController.pridobiProstePaketnike);
router.get('/:id', preveriAdmina, paketnikController.pridobiPaketnikPoId);

router.put('/:id', preveriAdmina, paketnikController.posodobiPaketnik); 
router.delete('/:id', preveriAdmina, paketnikController.izbrisiPaketnik);

module.exports = router;