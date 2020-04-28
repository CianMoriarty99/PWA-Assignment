const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();
const user = require('../controllers/users');


router.post('/register', user.register);

module.exports = router;
