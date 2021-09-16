const express = require('express');
const router = express.Router();
const Lecturer = require('../../models/Lecturer');
const Courses = require('../../models/Course')
const bcrypt = require('bcryptjs');
const { isAdmin } = require('../../helper-functions/authentication');

router.all('/*', (req, res, next) => {

    req.app.locals.layout = "admin";
    next();
})

router.get('/', isAdmin(1), (req, res) => {
    Lecturer.find({})
        .lean()
        .then(lecturers => {
            res.render('admin/lecturers', { lecturers: lecturers });
        })
});

router.get('/create', isAdmin(0), (req, res) => {
    res.render('admin/lecturers/create');
});

router.post('/create', isAdmin(0), (req, res) => {
    const newLecturer = new Lecturer({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: 1,    //Default lecturer privileges
    });
    bcrypt.genSalt(10, (err, salt) => {
        if (err) throw err;
        bcrypt.hash(newLecturer.password, salt, (err, hash) => {
            if (err) throw err;
            newLecturer.password = hash;
            newLecturer.save().then(savedLecturer => {
                req.flash('success_message', 'Преподавателя е добавен успешно.');
                res.redirect('/admin/lecturers');
            }).catch(err => {
                console.log(`ERR: ${err}`);
            })
        })
    })
});

router.get('/edit/:id', isAdmin(0), (req, res) => {

    Lecturer.findOne({ _id: req.params.id })
        .then(lecturer => {
            res.render('admin/lecturers/edit', { lecturer: lecturer })
        })

});

router.put('/edit/:id', isAdmin(0), (req, res) => {
    Lecturer.findOne({ _id: req.params.id })
        .then(lecturer => {
            lecturer.name = req.body.name;
            lecturer.email = req.body.email;

            lecturer.save()
                .then(() => {
                    res.redirect('/admin/lecturers');
                });
        });
});

router.delete('/:id', isAdmin(0), (req, res) => {
    Lecturer.deleteOne({ _id: req.params.id })
        .then(result => {
            res.redirect('/admin/lecturers');
        })
});

router.get('/pwdchange/:id', isAdmin(0), (req, res) => {
    Lecturer.findOne({ _id: req.params.id })
        .then(lecturer => {
            res.render('admin/lecturers/pwdchange', { lecturer: lecturer });
        });
});

router.put('/pwdchange/:id', isAdmin(0), (req, res) => {
    if (req.body.password !== req.body.passwordConfirm) {
        req.flash('error_message', 'Въведените пароли не съвпадат. Моля опитайте отново.');
        res.redirect('back')
    }
    Lecturer.findOne({ _id: req.params.id })
        .then(lecturer => {
            if (req.body.password == req.body.passwordConfirm) {
                bcrypt.genSalt(10, (err, salt) => {
                    if (err) throw err;
                    bcrypt.hash(req.body.password, salt, (err, hash) => {
                        if (err) throw err;
                        lecturer.password = hash;
                        lecturer.save().then((result) => {
                            req.flash('success_message', 'Паролата беше променена успешно.');
                            res.redirect('/admin/lecturers');
                        }).catch(err => {
                            req.flash('error_message', 'Изникна проблем с промяна на паролата, моля опитайте отново.');
                            console.log(`Err: ${err}`);
                            res.redirect('back');
                        });
                    });
                });
            };
        });
});

module.exports = router;