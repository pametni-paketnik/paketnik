const express = require('express'); 
const router = express.Router(); 
const uporabnikControlller = require('../controllers/uporabnikCOntroller'); 


router.get('/', uporabnikCOntroller.list);
router.get('/profile', uporabnikCOntroller.profile);
router.get('/logout', uporabnikCOntroller.logout);

router.get('/:id', uporabnikController.show);

router.post('/', uporabnikCOntroller.create);
router.post('/login', uporabnikCOntroller.login);

router.put('/:id', uporabnikCOntroller.update);
router.delete('/:id', uporabnikCOntroller.remove);

module.exports = router;
