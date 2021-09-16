const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const Lecturer = require('../models/Lecturer');
const Student = require('../models/Student');

module.exports = function (passport) {

    function SessionConstructor(userId, userGroup) {
        this.userId = userId;
        this.userGroup = userGroup;
    }

    passport.serializeUser(function (userObject, done) {
        let userGroup = 'student';
        let userPrototype = Object.getPrototypeOf(userObject);

        if (userPrototype === Student.prototype) {
            userGroup = 'student';
        } else if (userPrototype === Lecturer.prototype) {
            userGroup = 'lecturer';
        }

        let sessionConstructor = new SessionConstructor(userObject.id, userGroup);
        done(null, sessionConstructor);
    })
    passport.deserializeUser(function (sessionConstructor, done) {
        if (sessionConstructor.userGroup == 'student') {
            Student.findById(sessionConstructor.userId, '-password', function (err, user) {
                done(err, user)
            })
        }
        else if (sessionConstructor.userGroup == "lecturer") {
            Lecturer.findById(sessionConstructor.userId, '-password', function (err, user) {
                done(err, user)
            })
        }
    })

    passport.use('student-login', new LocalStrategy(
        { usernameField: 'facNumber' }, (facNumber, password, done) => {
            Student.findOne({ facultyNumber: facNumber }).then(student => {
                if (!student) {
                    return done(null, false, { message: 'Невалиден факултетен номер.' });
                }
                bcrypt.compare(password, student.password, (err, matched) => {
                    if (err) return err;
                    if (matched) {
                        return done(null, student);
                    } else {
                        return done(null, false, { message: 'Грешна парола.' })
                    }
                })
            })
        }
    ));

    passport.use('lecturer-login', new LocalStrategy(
        { usernameField: 'email' }, (email, password, done) => {
            Lecturer.findOne({ email: email }).then(lecturer => {
                if (!lecturer) {
                    return done(null, false, { message: 'Емейл адресът не е намерен.' });
                }
                bcrypt.compare(password, lecturer.password, (err, matched) => {
                    if (err) return err;
                    if (matched) {
                        return done(null, lecturer);
                    } else {
                        return done(null, false, { message: 'Грешна парола' });
                    }
                })
            })
        }));
}