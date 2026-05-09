var express = require('express');
var multer = require('multer');
// install: multer
var upload = multer({dest: 'public/images/'});

var router = express.Router();
var plantController = require('../controllers/plantController.js');

router.get('/', plantController.list);
router.get('/:id', plantController.show);
router.post('/', upload.single('image'), plantController.create);

router.put('/:id', plantController.update);
router.delete('/:id', plantController.remove);

module.exports = router; 
