const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
    questionnaireId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the Questionnaire ID
        ref: 'Questionnaire',
        required: true,
    },
    questions: [{
        questionId: {
            type: mongoose.Schema.Types.ObjectId, // Reference to the Question ID
            ref: 'Question',
            required: true,
        },
        rating: {
            type: Number, // The rating given by the user
            required: true,
            min: 1, // Assuming a scale minimum value of 1
            max: 5, // Assuming a scale maximum value of 5
        }
    }],
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Optional: Reference to the User ID who answered
        ref: 'User',
    },
    createdAt: {
        type: Date,
        default: Date.now, // Automatically capture response creation time
    },
});
exports.Response = mongoose.model('Response', responseSchema);