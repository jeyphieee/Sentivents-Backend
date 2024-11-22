const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    question: { type: String, required: true },
    scale: { type: [Number], required: true }
}, { _id: false }); // Disable auto-generated _id for this subdocument

const traitSchema = new mongoose.Schema({
    trait: { type: String, required: true },
    questions: [questionSchema]
}, { _id: false }); // Disable auto-generated _id for this subdocument

const questionnaireSchema = new mongoose.Schema({
    questionnaires: [traitSchema]
}, { timestamps: true });

const Questionnaire = mongoose.model('Questionnaire', questionnaireSchema);

module.exports = Questionnaire;
