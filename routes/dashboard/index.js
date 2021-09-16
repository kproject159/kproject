const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { loggedStudent } = require('../../helper-functions/authentication');
const Student = require('../../models/Student');
const Post = require('../../models/Post');


router.all('/*', loggedStudent, (req, res, next) => {
    req.app.locals.layout = 'dashboard';
    next();

});

router.get('/', (req, res) => {
    Post.find({ 'status': 'public' }).then(posts => {
        res.render('dashboard/index', {
            posts: posts
        });
    })
});

router.get('/profile', (req, res) => {
    res.render('dashboard/profile');
});
router.get('/pwdchange/:id', (req, res) => {
    res.render('dashboard/pwdchange')
})
router.put('/pwdchange/:id', (req, res) => {
    if (req.body.password !== req.body.passwordConfirm) {
        req.flash('error_message', 'Въведените пароли не съвпадат. Моля опитайте отново.');
        res.redirect('back')
    }
    Student.findOne({ _id: req.user.id })
        .then(student => {
            if (req.body.password == req.body.passwordConfirm) {
                bcrypt.genSalt(10, (err, salt) => {
                    if (err) throw err;
                    bcrypt.hash(req.body.password, salt, (err, hash) => {
                        if (err) throw err;
                        student.password = hash;
                        student.save().then((result) => {
                            req.flash('success_message', 'Паролата беше променена успешно.');
                            res.redirect('/dashboard/profile');
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

router.get('/post/:id', (req, res) => {
    Post.findOne({ 'id': req.body.id }).then(post => {
        res.render('dashboard/view-post', {
            post: post
        });
    });
});
module.exports = router;