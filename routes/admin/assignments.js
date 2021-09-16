const express = require('express');
const Assignment = require('../../models/Assignment');
const Course = require('../../models/Course');
const Student = require('../../models/Student');
const Submission = require('../../models/Submission');
const Grade = require('../../models/Grade');
const Meeting = require('../../models/Meeting');
const router = express.Router();
const { today, timePlus10, time } = require('../../helper-functions/date')
const { isAdmin, generatePassword } = require('../../helper-functions/authentication');
const fs = require('fs');
const { uploadDir } = require('../../helper-functions/upload');
const cron = require('node-cron');
const bbb = require('bigbluebutton-js');

router.get('/', isAdmin(1), (req, res) => {
    if (req.user.role == '0') {
        Assignment.find({
            'defenseDate': { $gte: today() }
        }).populate('meeting').then(assignment => {
            Course.find({})
                .then(course => {
                    res.render('admin/assignments', {
                        assignment: assignment,
                        course: course
                    });
                })
        });
    } else {
        Course.find({ 'lecturer': req.user.name }).then(course => {
            let coursesTitleArray = [];
            course.forEach(course => coursesTitleArray.push(course.title))
            Assignment.find({
                'defenseDate': { $gte: today() },
                'course': { $in: coursesTitleArray }
            }).populate('meeting').then(assignment => {
                res.render('admin/assignments', {
                    assignment: assignment,
                    course: course
                });
            })
        })
    }


});
router.get('/archive', (req, res) => {
    if (req.user.role == '0') {
        Assignment.find({
            'defenseDate': { $lt: today() }
        }).then(assignment => {
            Course.find({})
                .then(course => {
                    res.render('admin/assignments/archive', {
                        assignment: assignment,
                        course: course
                    });
                })
        });
    } else {
        Course.find({ 'lecturer': req.user.name }).then(course => {
            let coursesTitleArray = [];
            course.forEach(course => coursesTitleArray.push(course.title))
            Assignment.find({
                'defenseDate': { $lt: today() },
                'course': { $in: coursesTitleArray }
            }).then(assignment => {
                res.render('admin/assignments/archive', {
                    assignment: assignment,
                    course: course
                });
            })
        })
    }
});
router.get('/create/:id', (req, res) => {
    Course.findOne({ _id: req.params.id })
        .then(course => {
            Student.find({
                'semester': course.semester,
                'specialty': course.specialty
            }).then(students => {
                res.render('admin/assignments/create', {
                    course: course,
                    students: students,
                })
            })
        })
});

router.post('/create/:id', (req, res) => {
    Course.findOne({ '_id': req.params.id }).then(course => {
        Student.find({
            'semester': course.semester,
            'specialty': course.specialty

        }).populate('assignments').then(students => {
            let newAssignment = new Assignment({
                title: req.body.title,
                course: course.title,
                dueDate: req.body.dueDate,
                defenseDate: req.body.defenseDate,
                defenseTime: req.body.defenseTime,
                description: req.body.description,
            })
            if (req.body.studentsList) {
                let studentsArray = [];
                studentsArray.push(req.body.studentsList);
                studentsArray = studentsArray.flat();
                newAssignment.students = studentsArray
                studentsArray.forEach(student => {
                    Student.findOne({ '_id': student }).then(selectedStudents => {
                        selectedStudents.assignments.push(newAssignment);
                        selectedStudents.save(err => { })
                    })
                })
            }
            newAssignment.save().then(savedAssignment => { })
            req.flash('success_message', 'Проекта беше създаден успешно.');
            res.redirect('/admin/assignments')
        })
    })
});

router.get('/edit/:id', (req, res) => {
    Assignment.findOne({ '_id': req.params.id }).populate('students').then(assignment => {
        Course.findOne({ 'title': assignment.course }).then(course => {
            Student.find({
                '_id': { $nin: assignment.students },
                'semester': course.semester,
                'specialty': course.specialty
            }).then(uncheckedStudents => {
                Student.find({
                    '_id': { $in: assignment.students },
                    'semester': course.semester,
                    'specialty': course.specialty
                }).then(checkedStudents => {
                    res.render('admin/assignments/edit',
                        {
                            assignment: assignment,
                            course: course,
                            checkedStudents: checkedStudents,
                            uncheckedStudents: uncheckedStudents,
                        })
                })
            })
        })
    })
});

router.put('/edit/:id', (req, res) => {
    Assignment.findOne({ '_id': req.params.id }).then(assignment => {
        assignment.updateOne({ $set: { students: [] } }, err => {
            if (err) console.log(`Error: ${err}`);
        })
        Course.findOne({ 'title': assignment.course }).then(course => {
            Student.find(
                {
                    'semester': course.semester,
                    'specialty': course.specialty
                }).then(students => {
                    assignment.title = req.body.title;
                    assignment.dueDate = req.body.dueDate;
                    assignment.defenseDate = req.body.defenseDate;
                    assignment.defenseTime = req.body.defenseTime;
                    assignment.description = req.body.description;
                    Student.updateMany({ $pull: { assignments: assignment._id } }, (err, data) => {
                        if (err) console.log(`error: ${err}`);
                    }).then(
                        //не махай callback-a
                        result => {
                            if (req.body.studentsList) {
                                let studentsArray = [];
                                studentsArray.push(req.body.studentsList);
                                studentsArray = studentsArray.flat();
                                studentsArray.forEach(student => {
                                    assignment.updateOne({ $addToSet: { 'students': student } }, (err, data) => { });
                                    Student.updateOne({ '_id': student }, { $addToSet: { 'assignments': assignment._id } }, (err, data) => { })
                                });
                            };
                        }
                    )

                    assignment.save();
                    req.flash('success_message', 'Промените по проекта бяха запазени успешно.');
                    res.redirect('/admin/assignments');
                })
        })
    })
});

router.delete('/:id', (req, res) => {
    Assignment.findOne({ '_id': req.params.id }).then(assignment => {
        Student.updateMany({ $pull: { 'assignments': req.params.id } }, (err, result) => {
            if (err) console.log(err);
        });
        Submission.find({ 'assignment': req.params.id }).then(submissions => {
            for (let i = 0; i < submissions.length; i++) {
                fs.unlink(uploadDir + submissions[i].file, (err) => { });
            }
            Submission.deleteMany({ 'assignment': req.params.id }, (err, result) => {
                if (err) console.log(err);
            });

        })
        assignment.remove();
        Grade.deleteMany({ 'assignment': req.params.id }, (err, result) => {
            if (err) console.log(err)
        });
        req.flash('success_message', 'Проекта беше изтрит.');
        res.redirect('/admin/assignments')
    })

});

router.get('/join/:id', (req, res) => {
    Assignment.findOne({ '_id': req.params.id }).populate('meeting').then(result => {
        let moderatorUrl = api.administration.join(req.user.name, result.meeting.meetingId, result.meeting.moderatorPW);
        res.redirect(moderatorUrl)
    });
})



let api = bbb.api(
    process.env.BBB_URL = 'https://bbb.kproject.app/bigbluebutton/',
    process.env.BBB_SECRET
)

let api = bbb.api(
    process.env.BBB_URL,
    process.env.BBB_SECRET
)

let http = bbb.http;

var task = cron.schedule('* * * * *', () => {
    Assignment.find({ 'defenseDate': { $eq: today() }, 'defenseTime': { $lt: timePlus10() }, 'meetingCreated': { $ne: true } }).then(assignments => {
        assignments.forEach(assignment => {
            let moderatorPW = generatePassword()
            let attendeePW = generatePassword()
            let meetingId = assignment._id + time();
            meetingId = meetingId.slice(18, 29)

            let meetingCreateUrl = api.administration.create(assignment.title, meetingId, {
                moderatorPW: moderatorPW,
                attendeePW: attendeePW
            })

            http(meetingCreateUrl).then(result => {
                console.log(result)
                let meetingEndUrl = api.administration.end(meetingId, moderatorPW);
                const newMeeting = new Meeting({
                    assignment: assignment._id,
                    moderatorPW: moderatorPW,
                    studentPW: attendeePW,
                    endUrl: meetingEndUrl,
                    meetingId: meetingId,
                });

                Assignment.updateOne({ _id: assignment._id }, { meetingCreated: true, meeting: newMeeting.id }).then(() => { })
                newMeeting.save().then(savedMeeting => { })
            })
        })
    }).catch(err => console.log(err));
});






module.exports = router;