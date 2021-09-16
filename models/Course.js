const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CourseSchema = new Schema({

    title: {
        type: String,
        required: true,

    },
    lecturer: {
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
    startDate: {
        type: String,
        required: true,
    },
    endDate: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    }


}, { usePushEach: true });

module.exports = mongoose.model('courses', CourseSchema);
