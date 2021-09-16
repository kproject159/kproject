const express = require('express');
const Assignment = require('../../models/Assignment');
const Student = require('../../models/Student');
const Grade = require('../../models/Grade');
const router = express.Router();
const { isAdmin } = require('../../helper-functions/authentication');
const Submission = require('../../models/Submission');
const { connection } = require('mongoose');


//Извинявам се за следващите редове.

router.get('/:id', (req, res) => {
    Assignment.findOne({ '_id': req.params.id }).then(assignment => {
        let studentsArray = assignment.students;
        Grade.find({ 'assignment': req.params.id }).then(grades => {
            let gradedStudents = [];
            for (let i = 0; i < grades.length; i++) {
                gradedStudents.push(grades[i].student)
            }
            Student.find({ '_id': { $in: gradedStudents } }).populate({
                path: 'submissions',
                match: { 'assignment': assignment.id }
            }).then(gradedStudent => {
                Student.find({ '_id': { $in: studentsArray, $nin: gradedStudents } }).populate({
                    path: 'submissions',
                    match: { 'assignment': assignment.id }
                }).then(ungradedStudent => {
                    res.render('admin/submissions', {
                        assignment: assignment,
                        ungradedStudent: ungradedStudent,
                        gradedStudent: gradedStudent
                    })
                })
            })
        })
    })
});

router.get('/:assignment/:student', (req, res) => {
    Student.findOne({ '_id': req.params.student }).populate('submissions').then(student => {
        Assignment.findOne({ '_id': req.params.assignment }).then(assignment => {
            Submission.find({
                'student': req.params.student,
                'assignment': req.params.assignment
            }).then(studentSubmissions => {
                student.submissions = studentSubmissions;
                res.render('admin/submissions/grade', {
                    student: student,
                    assignment: assignment
                })
            });
        })

    })
});

router.post('/:assignment/:student', (req, res) => {
    Student.findOne({ '_id': req.params.student }).then(student => {
        Assignment.findOne({ '_id': req.params.assignment }).then(assignment => {
            let newGrade = new Grade({
                student: req.params.student,
                course: assignment.course,
                assignment: assignment.id,
                grade: req.body.score,
            });
            if (req.body.comment) {
                newGrade.comment = req.body.comment;
            }
            Student.updateOne({ '_id': req.params.student }, { $addToSet: { 'grades': newGrade } }, (err, result) => {
                if (err) console.log(err)
                // if (result) console.log(result)
            });
            newGrade.save();
            req.flash('success_message', 'Оценката беше записана.');
            res.redirect('/admin/submissions/' + req.params.assignment);
        })
    })
});

router.get('/:assignment/:student/edit', (req, res) => {
    Student.findOne({ '_id': req.params.student }).populate('submissions').then(student => {
        Assignment.findOne({ '_id': req.params.assignment }).then(assignment => {
            Grade.findOne({ 'student': req.params.student, 'assignment': req.params.assignment }).then(grades => {
                Submission.find({
                    'student': req.params.student,
                    'assignment': req.params.assignment
                }).then(studentSubmissions => {
                    student.submissions = studentSubmissions;
                    res.render('admin/submissions/edit', {
                        student: student,
                        assignment: assignment,
                        grades: grades
                    })
                });

            })

        })

    })
});

router.post('/:assignment/:student/edit', (req, res) => {
    Grade.findOneAndUpdate({ 'student': req.params.student, 'assignment': req.params.assignment }).then(updatedGrade => {
        updatedGrade.grade = req.body.score;
        if (req.body.comment) {
            updatedGrade.comment = req.body.comment;
        }
        updatedGrade.save().then(result => {
            req.flash('success_message', 'Оценката беше запазена.');
            res.redirect('/admin/submissions/' + req.params.assignment);
        })

    })
});

module.exports = router;