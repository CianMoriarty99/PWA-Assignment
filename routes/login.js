const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/', (req,res) => {
    res.render('login.ejs')
});

router.post('/', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

module.exports = router;