const express = require('express');
const router = express.Router();
const { loggedStudent } = require('../../helper-functions/authentication')
const { today } = require('../../helper-functions/date');
const { uploadDir } = require('../../helper-functions/upload');
const Submission = require('../../models/Submission');
const fs = require('fs');
const Assignment = require('../../models/Assignment');
const Student = require('../../models/Student');
const { resolveSoa } = require('dns');

router.all('/*', loggedStudent, (req, res, next) => {
    req.app.locals.layout = 'dashboard';
    next();
});

router.post('/deleteImage/:id', (req, res) => {
    Submission.findById({ _id: req.params.id }).populate('assignment').populate('student').then(submission => {
        if (submission.assignment.dueDate < today()) {
            res.status(401).render('home/permissions');
        } else {
            fs.unlink(uploadDir + submission.file, (err) => { });
            if (submission.text == '') {
                Submission.deleteOne({ _id: req.params.id }).then(result => {
                    Student.updateOne({ _id: submission.student._id }, { $pull: { submissions: req.params.id } }).then(result => {
                        res.redirect('back');
                    });
                });
            } else {
                submission.file = '';
                submission.hasUpload = 'false';
                submission.save().then(result => {
                    res.redirect('back');
                });
            }
        };
    });
});

router.post('/deleteText/:id', (req, res) => {
    Submission.findById({ _id: req.params.id }).populate('assignment').populate('student').then(submission => {
        if (submission.assignment.dueDate < today()) {
            res.status(401).render('home/permissions');
        } else {
            submission.text = '';
            if (submission.hasUpload) {
                submission.save().then(result => {
                    res.redirect('back');
                })
            } else {
                Submission.deleteOne({ _id: req.params.id }).then(result => {
                    Student.updateOne({ _id: submission.student._id }, { $pull: { submissions: req.params.id } }).then(result => {
                        res.redirect('back');
                    });
                })
            }
        }
    });
});



module.exports = router;