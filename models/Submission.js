const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SubmissionSchema = new Schema({

    student: {
        type: Schema.Types.ObjectId,
        ref: 'students',
        required: true
    },
    assignment: {
        type: Schema.Types.ObjectId,
        ref: 'assignments',
        required: true
    },
    text: {
        type: String,
        required: false
    },
    hasUpload: {
        type: Boolean,
        required: true,
        default: false,
    },
    file: {
        type: String,
        required: false
    }
});

module.exports = mongoose.model('submissions', SubmissionSchema);