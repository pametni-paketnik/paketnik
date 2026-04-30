var express = require('express');
var router = express.Router('../');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Moja prva stran', message: 'Dobrodošli na mojem backendu!' });
});

module.exports = router;