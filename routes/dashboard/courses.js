const express = require('express');
const router = express.Router();
const { loggedStudent } = require('../../helper-functions/authentication')
const Course = require('../../models/Course');
const { today } = require('../../helper-functions/date')

router.all('/*', loggedStudent, (req, res, next) => {
    req.app.locals.layout = 'dashboard';
    next();
});

router.get('/', (req, res) => {
    Course.find({
        'semester': req.user.semester,
        'endDate': { $gt: today() },
        'startDate': { $lt: today() }
    }).then(courses => {
        res.render('dashboard/courses', {
            courses: courses,
        });
    });
});

router.get('/archive', (req, res) => {
    Course.find({
        'semester': req.user.semester,
        'endDate': { $lt: today() }
    }).then(courses => {
        res.render('dashboard/courses/archive', {
            courses: courses,
        });
    })
})

router.get('/:id', (req, res) => {
    Course.findOne({ _id: req.params.id }).then(course => {
        res.render('dashboard/courses/view', { course: course })
    })
})

module.exports = router;