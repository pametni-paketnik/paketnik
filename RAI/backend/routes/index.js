var express = require('express');
var router = express.Router(); 

router.get('/', function(req, res, next) {
    res.json({ 
        naslov: 'InPlant API', 
        status: 'Online',
        sporocilo: 'Backend uspešno povezan z Reactom!' 
    });
});

module.exports = router;