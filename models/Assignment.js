const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AssignmentSchema = new Schema({

    course: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    students: [{
        type: Schema.Types.ObjectId,
        ref: 'students',
    }],
    dueDate: {
        type: String,
        required: true,
    },
    defenseDate: {
        type: String,
        required: true,
    },
    defenseTime: {
        type: String,
    },
    description: {
        type: String,
        required: false,
    },
    meetingCreated: {
        type: Boolean,
        default: false
    },
    meeting: {
        type: Schema.Types.ObjectId,
        ref: 'meetings',
    }
});

module.exports = mongoose.model('assignments', AssignmentSchema);
