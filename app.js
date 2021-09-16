const express = require('express');
const app = express();
const path = require('path');
const expresshbs = require('express-handlebars');
const mongoose = require('mongoose');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const Handlebars = require('handlebars');
const methodOverride = require('method-override');
const upload = require('express-fileupload');
const session = require('express-session');
const flash = require('connect-flash');
const { mongoDbUrl } = require('./config/database.js');
const passport = require('passport');
require('./config/passport')(passport);

// Initializing Mongo DB connection
mongoose.connect(mongoDbUrl, { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false }).then((db) => {

    console.log('Mongo connected')

}).catch(error => console.log(`Could not connect to DB. Error: ${error}`));



app.use(express.static(path.join(__dirname, 'public')));


// Initializing Handlebars

const { select, generateTime } = require('./helper-functions/handlebars-helpers'); //handlebars helper functions

app.engine('handlebars', expresshbs({ handlebars: allowInsecurePrototypeAccess(Handlebars), defaultLayout: 'home', helpers: { select: select, generateTime: generateTime } }));
app.set('view engine', 'handlebars');

//Upload middleware

app.use(upload());

//Body Parser

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Method override
app.use(methodOverride('_method'));


app.use(session({
    secret: 'kproject159adsf?Taina!~',
    resave: true,
    saveUninitialized: true,
}));


app.use(flash());

//Passport
app.use(passport.initialize());
app.use(passport.session());


// local variables using middleware

app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.error = req.flash('error')
    next();
});

//Load Routes
const home = require('./routes/home/index');
const admin = require('./routes/admin/index');
const grades = require('./routes/admin/grades');
const courses = require('./routes/admin/courses');
const students = require('./routes/admin/students');
const Assignment = require('./models/Assignment.js');
const lecturers = require('./routes/admin/lecturers');
const dashboard = require('./routes/dashboard/index');
const assignments = require('./routes/admin/assignments');
const submissions = require('./routes/admin/submissions');
const gradesStudent = require('./routes/dashboard/grades');
const coursesStudent = require('./routes/dashboard/courses');
const assignmentsStudent = require('./routes/dashboard/assignments');
const submissionsStudent = require('./routes/dashboard/submissions');


//Use Routes
app.use('/', home);
app.use('/admin', admin);
app.use('/admin/grades', grades);
app.use('/dashboard', dashboard);
app.use('/admin/courses', courses)
app.use('/admin/students', students);
app.use('/admin/lecturers', lecturers);
app.use('/admin/assignments', assignments);
app.use('/admin/submissions', submissions);
app.use('/dashboard/grades', gradesStudent);
app.use('/dashboard/courses', coursesStudent);
app.use('/dashboard/assignments', assignmentsStudent);
app.use('/dashboard/submissions', submissionsStudent);

const port = process.env.PORT || 5000;

app.listen(port, () => {

    console.log(`listening to port: ${port}`)

});





