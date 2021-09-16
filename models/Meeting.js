const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MeetingSchema = new Schema({

    assignment: {
        type: Schema.Types.ObjectId,
        required: true
    },
    moderatorPW: {
        type: String,
        required: true
    },
    studentPW: {
        type: String,
        required: true
    },
    endUrl: {
        type: String,
        required: true
    },
    meetingId: {
        type: String,
        required: true
    }

});

module.exports = mongoose.model('meetings', MeetingSchema);