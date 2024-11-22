const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    }, 
    // department: {
    //     type: String,
    //     required: true
    // },
    // organization: {
    //     type: String,
    //     required: true
    // },
    dateStart: {
        type: Date,
        required: true
    },
    dateEnd: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    images: [{
        type: String
    }], 
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // feedback: [
    //     {
    //         user: {
    //             type: String,
    //             required: true
    //         },
    //         rating: {
    //             type: String,
    //             required: true
    //         },
    //         comment: {
    //             type: String,
    //             required: true
    //         },
    //         date: {
    //             type: Date,
    //             default: Date.now
    //         }
    //     }
    // ]
});

exports.Event = mongoose.model('Event', eventSchema);
