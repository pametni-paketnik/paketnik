const express = require('express');
const router = express.Router();
const uporabnikController = require('../controllers/uporabnikController.js');

router.get('/', uporabnikController.list);

router.get('/profile', uporabnikController.profile);
router.get('/logout', uporabnikController.logout);
router.get('/:id', uporabnikController.show); 

router.post('/', uporabnikController.create);
router.post('/login', uporabnikController.login);

router.put('/:id', uporabnikController.update);
router.delete('/:id', uporabnikController.remove);

module.exports = router;