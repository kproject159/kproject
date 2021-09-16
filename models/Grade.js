const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const GradeSchema = new Schema({

    student: {
        type: Schema.Types.ObjectId,
        ref: 'students',
        required: true
    },
    course: {
        type: String,
        required: true
    },
    assignment: {
        type: Schema.Types.ObjectId,
        ref: 'assignments'
    },
    grade: {
        type: Number,
        required: true
    },
    comment: {
        type: String,
        required: false
    }
});


module.exports = mongoose.model('grades', GradeSchema);