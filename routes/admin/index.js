const express = require('express');
const router = express.Router();
const { loggedAdmin, isAdmin } = require('../../helper-functions/authentication');
const { isEmpty } = require('../../helper-functions/upload');
const Post = require('../../models/Post');
const fs = require('fs');
const { uploadDir } = require('../../helper-functions/upload');

router.all('/*', loggedAdmin, (req, res, next) => {
    req.app.locals.layout = 'admin';
    next();
});
router.get('/', (req, res) => {
    Post.find({ 'status': 'public' }).then(posts => {
        res.render('admin/index', {
            posts: posts
        });
    })
});

router.get('/posts', (req, res) => {
    Post.find().then(posts => {
        res.render('admin/posts-list', {
            posts: posts
        });
    })
});

router.get('/create-post', (req, res) => {
    res.render('admin/create-post')
});

router.post('/create-post', (req, res) => {
    let errors = [];

    if (!req.body.title) { error.push({ message: 'Моля добавете заглавие.' }) };
    if (!req.body.body) { error.push({ message: 'Моля добавете съдържание.' }) };
    if (errors.length > 0) {
        res.render('admin/create-post'), {
            errors: errors
        }
    } else {
        let filename = 'tu.jpeg';
        if (!isEmpty(req.files)) {
            let file = req.files.file;
            filename = Date.now() + '-' + file.name;

            file.mv('./public/uploads/' + filename, (err) => {
                if (err) throw err;
            })
        }

        const newPost = new Post({
            title: req.body.title,
            status: req.body.status,
            description: req.body.description,
            body: req.body.body,
            file: filename,
        });

        newPost.save().then(savedPost => {
            req.flash('success_message', 'Статията беше създадена успешно.')
            res.redirect('/admin/posts')
        })
    }
});
router.get('/post/:id', (req, res) => {
    Post.findOne({ '_id': req.params.id }).then(post => {
        res.render('admin/view-post', {
            post: post
        });
    })
});
router.get('/post/:id/edit', (req, res) => {
    Post.findOne({ '_id': req.params.id }).then(post => {
        res.render('admin/edit-post', {
            post: post
        });
    })
});
router.put('/post/:id/edit', (req, res) => {
    Post.findOne({ '_id': req.params.id })
        .then(post => {


            if (!isEmpty(req.files)) {
                let file = req.files.file;
                filename = Date.now() + '-' + file.name;
                post.file = filename;

                file.mv('./public/uploads/' + filename, (err) => {
                    if (err) throw err;

                })
            }

            post.title = req.body.title;
            post.status = req.body.status;
            post.description = req.body.description;
            post.body = req.body.body;


            post.save().then(updatedPost => {
                req.flash('success_message', 'Статията беше редактирана успешно.')
                res.redirect('/admin/posts')
            });
        })
});
router.delete('/post/:id', isAdmin(0), (req, res) => {
    Post.findOne({ '_id': req.params.id }).then(post => {

        if (post.file !== 'tu.jpeg') {
            fs.unlink(uploadDir + post.file, (err) => { })
        }
        post.remove();
        req.flash('success_message', 'Статията беше изтрита.')
        res.redirect('/admin/posts')
    })
});

module.exports = router;