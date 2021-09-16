const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Lecturer = require('../../models/Lecturer');


router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'home';
    next();
})

router.get('/', (req, res) => {
    if (req.user === undefined) {
        res.redirect('/login')
    } else if (req.user.role >= 1) {
        res.redirect('/dashboard')
    } else {
        res.redirect('/admin')
    }
});

router.get('/login', (req, res) => {
    res.render('home/login')
});

router.get('/login-l', (req, res) => {
    res.render('home/login-l')
});

router.post('/login-l', passport.authenticate('lecturer-login', {
    successRedirect: '/admin',
    failureRedirect: '/login-l',
    failureFlash: true
}));
router.post('/login', passport.authenticate('student-login', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
}));


router.get('/logout', (req, res) => {
    req.logOut();
    res.redirect('/login')
})


module.exports = router;