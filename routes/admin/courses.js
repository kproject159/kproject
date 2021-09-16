const express = require('express');
const router = express.Router();
const Course = require('../../models/Course');
const Student = require('../../models/Student');
const Lecturer = require('../../models/Lecturer');
const Assignment = require('../../models/Assignment');
const Submission = require('../../models/Submission');
const Grade = require('../../models/Grade');
const { userAuthenticated } = require('../../helper-functions/authentication');
const { today } = require('../../helper-functions/date')

router.all('/*', userAuthenticated, (req, res, next) => {

    req.app.locals.layout = 'admin';
    next();

});

router.get('/', (req, res) => {
    if (req.user.role == '0') {
        Course.find({
            'endDate': { $gt: today() }
        })
            .then(courses => {
                Lecturer.find({})
                    .then(lecturers => {
                        res.render('admin/courses', {
                            courses: courses,
                            lecturers: lecturers
                        });
                    })
            });
    } else {
        Course.find({
            'endDate': { $gt: today() },
            'lecturer': req.user.name
        })
            .then(courses => {
                Lecturer.find({})
                    .then(lecturers => {
                        res.render('admin/courses', {
                            courses: courses,
                            lecturers: lecturers
                        });
                    })
            });
    }


});

router.get('/archive', (req, res) => {
    if (req.user.role == '0') {
        Course.find({
            'endDate': { $lt: today() },
        }).then(courses => {
            res.render('admin/courses/archive', {
                courses: courses
            })
        });
    } else {
        Course.find({
            'endDate': { $lt: today() },
            'lecturer': req.user.name
        }).then(courses => {
            res.render('admin/courses/archive', {
                courses: courses
            })
        });
    }

})

router.get('/create', (req, res) => {
    if (req.user.role == '0') {
        Lecturer.find({})
            .lean()
            .populate()
            .then(lecturers => {
                res.render('admin/courses/create', { lecturers: lecturers });
            })
    } else {
        Lecturer.findOne({ 'name': req.user.name }).then(lecturer => {
            res.render('admin/courses/create', { lecturer: req.user })
        })
    }
})

router.get('/edit/:id', (req, res) => {
    Course.findOne({ _id: req.params.id }).then(course => {
        if (req.user.role == '0') {
            Lecturer.find({})
                .then(lecturers => {
                    res.render('admin/courses/edit', {
                        course: course,
                        lecturers: lecturers
                    });
                })
        } else {
            Lecturer.findOne({ 'name': req.user.name })
                .then(lecturer => {
                    res.render('admin/courses/edit', {
                        course: course,
                        lecturer: lecturer
                    });
                })
        }
    })
});

router.post('/create', (req, res) => {

    const newCourse = new Course({
        title: req.body.title,
        lecturer: req.body.lecturer,
        semester: req.body.semester,
        specialty: req.body.specialty,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        description: req.body.description,
    });

    newCourse.save().then(savedCourse => {
        req.flash('success_message', 'Курсът беше създаден успешно.');
        res.redirect('/admin/courses');
    }).catch(err => {
        console.log(`ERR: ${err}`);
    });
});



router.put('/edit/:id', (req, res) => {

    Course.findOne({ _id: req.params.id })
        .then(course => {

            course.title = req.body.title;
            course.lecturer = req.body.lecturer;
            course.semester = req.body.semester;
            course.specialty = req.body.specialty;
            course.startDate = req.body.startDate;
            course.endDate = req.body.endDate;
            course.description = req.body.description;

            course.save().then(updatedPost => {
                req.flash('success_message', 'Курсът беше редактиран успешно.');
                res.redirect('/admin/courses')
            });
        })
});

router.get('/create/:id', (req, res) => {
    Course.findOne({ _id: req.params.id })
        .then(course => {
            Student.find({
                'semester': course.semester,
                'specialty': course.specialty
            }).then(students => {
                res.render('admin/courses/new-project', {
                    course: course,
                    students: students,
                })
            })
        })
});


router.delete('/:id', (req, res) => {

    Course.findOne({ '_id': req.params.id }).then(course => {
        Grade.deleteMany({ 'course': course.title }, (err, result) => { })
        Assignment.deleteMany({ 'course': course.title }, (err, result) => { });
    })
    Course.deleteOne({ _id: req.params.id })
        .then(result => {
            console.log(result);
            req.flash('success_message', 'Курсът беше изтрит.');
            res.redirect('/admin/courses');
        });
})

module.exports = router;