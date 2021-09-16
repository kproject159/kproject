const express = require('express');
const router = express.Router();
const Assignment = require('../../models/Assignment');
const { loggedStudent } = require('../../helper-functions/authentication')
const { today } = require('../../helper-functions/date');
const { isEmpty, uploadDir } = require('../../helper-functions/upload');
const Submission = require('../../models/Submission');
const Student = require('../../models/Student');
const bbb = require('bigbluebutton-js')

router.all('/*', loggedStudent, (req, res, next) => {
    req.app.locals.layout = 'dashboard';
    next();
});

router.get('/', (req, res) => {
    let assignmentArray = req.user.assignments;
    Assignment.find({
        '_id': { $in: assignmentArray },
        'defenseDate': { $gte: today() }
    }).then(assignments => {
        res.render('dashboard/assignments', { assignments: assignments })
    });
});

router.get('/archive', (req, res) => {
    let assignmentArray = req.user.assignments;
    Assignment.find({
        '_id': { $in: assignmentArray },
        'defenseDate': { $lt: today() },
    }).then(assignments => {
        res.render('dashboard/assignments/archive', {
            assignments: assignments,
        })
    });
});

router.get('/:id', (req, res) => {
    Assignment.findOne({ _id: req.params.id }).then(assignment => {
        Submission.find({ student: req.user.id, assignment: req.params.id }).then(submissions => {

            res.render('dashboard/assignments/view', {
                assignment: assignment,
                submissions: submissions

            })
        })
    })
})

router.get('/:id/submit', (req, res) => {
    Assignment.findOne({ _id: req.params.id }).then(assignment => {
        if (assignment.dueDate <= today()) {
            req.flash('error_message', 'Не може да се предават материали след крайният срок.');
            res.redirect('/dashboard/assignments');
        } else {
            res.render('dashboard/assignments/submit', {
                assignment: assignment
            })
        }
    })
})

router.post('/:id/submit', (req, res) => {

    if (isEmpty(req.files) && req.body.textInput == '') {
        res.redirect('/dashboard/assignments/' + req.params.id)
    } else {
        let fileName = 'null';
        let hasUpload = false;
        if (!isEmpty(req.files)) {
            hasUpload = true;
            let file = req.files.file;
            fileName = Date.now() + '_' + file.name;

            file.mv(uploadDir + fileName, (err) => {
                if (err) throw err;
            });
        }
        const newSubmission = new Submission({
            student: req.user.id,
            assignment: req.params.id,
            text: req.body.textInput,
            hasUpload: hasUpload,
            file: fileName
        });
        Student.findById({ _id: req.user.id }).then(user => {
            user.submissions.push(newSubmission);
            user.save().then(savedUser => {
                newSubmission.save().then(savedSubmission => {
                    res.redirect('/dashboard/assignments/' + req.params.id)
                })
            })
        })
    }
});

router.get('/join/:id', (req, res) => {
    Assignment.findOne({ '_id': req.params.id }).populate('meeting').then(result => {
        let joinUrl = api.administration.join(req.user.names, result.meeting.meetingId, result.meeting.studentPW);
        res.redirect(joinUrl);
    });
})


let api = bbb.api(
    process.env.BBB_URL = 'https://bbb.kproject.app/bigbluebutton/',
    process.env.BBB_SECRET = '9oRQMKEzdSsvFaQC2gL3ypLvQMFx0eo1F9uyBF0kRE'
)
let http = bbb.http;

module.exports = router;