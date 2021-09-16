const userAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/login');
    }
};
const loggedAdmin = (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.role <= 1) {
            return next();
        } else {
            res.status(401).render('home/permissions');
        }
    } else {
        res.redirect('/login-l');
    }
}
const loggedStudent = (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.role > 1) {
            return next();
        } else {
            res.status(401).render('home/permissions');
        }
    } else {
        res.redirect('/login');
    }
}
const isAdmin = (permissions) => {
    return (req, res, next) => {
        const userRole = req.user.role;
        if (permissions >= userRole) {
            next();
        }
        else {
            res.status(401).render('home/permissions');
        }
    }
};
const isStudent = (req, res, next) => {
    return (req, res, next) => {
        if (req.user.role > 1) {
            next();
        } else {
            res.redirect('/admin')
        }
    }
};
const generatePassword = () => {
    var length = 8,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

module.exports = { userAuthenticated, isAdmin, isStudent, loggedAdmin, loggedStudent, generatePassword }