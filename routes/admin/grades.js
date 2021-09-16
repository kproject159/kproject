const express = require('express');
const Assignment = require('../../models/Assignment');
const Course = require('../../models/Course');
const Grade = require('../../models/Grade');
const router = express.Router();
const { isAdmin } = require('../../helper-functions/authentication');

router.all('/*', isAdmin(1), (req, res, next) => {
    req.app.locals.layout = "admin";
    next();
});

router.get('/', (req, res) => {
    if (req.user.role == 0) {
        Grade.find().populate('student').populate('assignment').then(grades => {
            res.render('admin/grades', {
                grades: grades
            });
        })
    } else {
        Course.find({ 'lecturer': req.user.name }).then(courses => {
            let coursesArray = [];
            for (let i = 0; i < courses.length; i++) {
                coursesArray.push(courses[i].title)
            }
            Assignment.find({ 'course': { $in: coursesArray } }).then(assignments => {
                let assignmentIDs = [];
                for (let i = 0; i < assignments.length; i++) {
                    assignmentIDs.push(assignments[i].id)
                }
                Grade.find({ 'assignment': { $in: assignmentIDs } }).populate('student').populate('assignment').then(grades => {
                    res.render('admin/grades', {
                        grades: grades,
                    });
                })
            })

        })
    }


})

module.exports = router;