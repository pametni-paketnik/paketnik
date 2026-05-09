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


const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });


router.get('/', uporabnikController.list);

router.get('/profile', uporabnikController.profile);
router.get('/logout', uporabnikController.logout);
router.get('/:id', uporabnikController.show); 

router.post('/', uporabnikController.create);
router.post('/login', uporabnikController.login);

//router.put('/:id', uporabnikController.update);
router.put('/:id', upload.single('profilna_slika'), uporabnikController.update);
router.delete('/:id', isAdmin, uporabnikController.remove);

module.exports = router;