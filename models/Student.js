const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const StudentSchema = new Schema({

    names: {
        type: String,
        required: true,
    },
    egn: {
        type: Number,
        required: true,
    },
    facultyNumber: {
        type: Number,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    semester: {
        type: Number,
        required: true,
    },
    specialty: {
        type: String,
        required: true,
    },
    role: {
        type: Number,
        required: true,
    },
    assignments: [{
        type: Schema.Types.ObjectId,
        ref: 'assignments'
    }],
    submissions: [{
        type: Schema.Types.ObjectId,
        ref: 'submissions'
    }],
    grades: [{
        type: Schema.Types.ObjectId,
        ref: 'grades'
    }],
});

module.exports = mongoose.model('students', StudentSchema);