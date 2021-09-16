const express = require('express');
const router = express.Router();
const { loggedStudent } = require('../../helper-functions/authentication');
const Grade = require('../../models/Grade');

router.all('/*', loggedStudent, (req, res, next) => {
    req.app.locals.layout = 'dashboard';
    next();
});

router.get('/', (req, res) => {
    Grade.find({ 'student': req.user.id }).populate('assignment').then(grades => {
        res.render('dashboard/grades', { grades: grades })
    })
})


module.exports = router;