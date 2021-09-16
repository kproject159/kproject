const passport2 = require('passport');

exports.postLogin = (req, res, next) => {
    passport2.authenticate('local', function (err, next, info) {
        if (err) { return next(err) }
        if (!user) {
            console.log(info);
            return res.redirect('/login')
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            return res.redirect('/admin')
        })
    })
};