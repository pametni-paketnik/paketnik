const express = require('express');
const router = express.Router();
const uporabnikController = require('../controllers/uporabnikController.js');
const Uporabnik = require('../models/Uporabnik.js');

const isAdmin = async function(req, res, next) {
    if(!req.session.userId){
        return res.status(401).json({message: "Prijavite se"});
    }
    const user = await Uporabnik.findById(req.session.userId); 
    if(user && user.vloga === 'admin'){
        next(); 
    } else{
        res.status(403).json({message: "Nimate admin dovoljneja"}); 
    }
}


router.get('/', uporabnikController.list);

router.get('/profile', uporabnikController.profile);
router.get('/logout', uporabnikController.logout);
router.get('/:id', uporabnikController.show); 

router.post('/', uporabnikController.create);
router.post('/login', uporabnikController.login);

router.put('/:id', uporabnikController.update);
router.delete('/:id', isAdmin, uporabnikController.remove);

module.exports = router;