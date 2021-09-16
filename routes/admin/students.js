const express = require('express');
const router = express.Router();
const Student = require('../../models/Student');
const bcrypt = require('bcryptjs');
const { isAdmin } = require('../../helper-functions/authentication');
const Submission = require('../../models/Submission');
const Assignment = require('../../models/Assignment');
const Grade = require('../../models/Grade');

router.all('/*', isAdmin(1), (req, res, next) => {

    req.app.locals.layout = 'admin';
    next();

});

router.get('/', (req, res) => {

    Student.find({})
        .lean()
        .then(students => {
            res.render('admin/students', { students: students });
        })

});

router.get('/add', isAdmin(0), (req, res) => {

    res.render('admin/students/add');

});

router.post('/add', isAdmin(0), (req, res) => {
    Student.findOne({ 'egn': req.body.egn }).then(student => {
        if (student) {
            req.flash('error_message', 'Вече има добавен студент с това ЕГН.');
            res.redirect('/admin/students/');
        }
    }).then()
    Student.findOne({ 'facultyNumber': req.body.facultyNumber }).then(student => {
        if (student) {
            req.flash('error_message', 'Вече има добавен студент с този факултетен номер.');
            res.redirect('/admin/students/');
        }
    })
    const newStudent = new Student({
        names: req.body.names,
        facultyNumber: req.body.facultyNumber,
        egn: req.body.egn,
        password: req.body.egn,
        semester: req.body.semester,
        specialty: req.body.specialty,
        role: 3,    //Default student privileges
    });

    bcrypt.genSalt(10, (err, salt) => {
        if (err) throw err;
        bcrypt.hash(newStudent.password, salt, (err, hash) => {
            if (err) throw err;
            newStudent.password = hash;
            newStudent.save().then(savedStudent => {
                req.flash('success_message', 'Студентът беше добавен успешно.');
                res.redirect('/admin/students');
            }).catch(err => {
                req.flash('error_message', 'Изникна проблем с добавянето на студента.');
                console.log(`Err: ${err}`);
            });
        });
    });
});

router.get('/edit/:id', (req, res) => {
    Student.findOne({ _id: req.params.id })
        .then(student => {
            res.render('admin/students/edit', { student: student });
        })
});

router.put('/edit/:id', isAdmin(0), (req, res) => {
    Student.findOne({ _id: req.params.id })
        .then(student => {
            student.names = req.body.names;
            student.facultyNumber = req.body.facultyNumber;
            student.egn = req.body.egn;
            student.semester = req.body.semester;
            student.specialty = req.body.specialty;

            student.save()
                .then(updatedStudent => {
                    req.flash('success_message', 'Студентът беше редактиран успешно.');
                    res.redirect('/admin/students');
                }).catch(err => {
                    req.flash('error_message', 'Изникна проблем с редактирането на студента. Моля проверете въведените ЕГН/Факултетен номер');
                    console.log(`Err: ${err}`);
                    res.redirect('/admin/students');
                });
        });
});

router.delete('/:id', isAdmin(0), (req, res) => {

    Submission.deleteMany({ 'student': req.params.id }, (err, result) => { });
    Assignment.updateMany({ $pull: { 'students': req.params.id } }, (err, result) => { })
    Grade.deleteMany({ 'student': req.params.id }, (err, result) => { })
    Student.deleteOne({ _id: req.params.id })
        .then(result => {
            req.flash('success_message', 'Студентът беше изтрит.');
            res.redirect('/admin/students');
        })
})

router.get('/pwdchange/:id', (req, res) => {
    Student.findOne({ _id: req.params.id })
        .then(student => {
            res.render('admin/students/pwdchange', { student: student });
        });
});

router.put('/pwdchange/:id', (req, res) => {
    if (req.body.password !== req.body.passwordConfirm) {
        req.flash('error_message', 'Въведените пароли не съвпадат. Моля опитайте отново.');
        res.redirect('back')
    }
    Student.findOne({ _id: req.params.id })
        .then(student => {
            if (req.body.password == req.body.passwordConfirm) {
                bcrypt.genSalt(10, (err, salt) => {
                    if (err) throw err;
                    bcrypt.hash(req.body.password, salt, (err, hash) => {
                        if (err) throw err;
                        student.password = hash;
                        student.save().then((result) => {
                            req.flash('success_message', 'Паролата беше променена успешно.');
                            res.redirect('/admin/students');
                        }).catch(err => {
                            req.flash('error_message', 'Изникна проблем с промяна на паролата, моля опитайте отново.');
                            console.log(`Err: ${err}`);
                            res.redirect('/admin/students');
                        });
                    });
                });
            };
        });
});

module.exports = router;
