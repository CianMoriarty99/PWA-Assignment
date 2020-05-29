const express = require('express');

require('../controllers/init').init();

const router = express.Router();

router.get('/', (req, res) => res.render('index', { title: 'Setup!' }));


module.exports = router;