const mongoose = require('mongoose');

const questionnaireSchema = mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    }]
}, { 
    timestamps: true
}); 

exports.Questionnaire = mongoose.model('Questionnaire', questionnaireSchema);
