const express = require('express');
const router = express.Router();
const Response = require('../models/response');

router.post('/', async (req, res) => {
    const { questions, userId, questionnaireId } = req.body;
    console.log("Received Questions:", questions);

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ success: false, message: "No responses provided." });
    }

    if (!questionnaireId) {
        return res.status(400).json({ success: false, message: "Questionnaire ID is required." });
    }

    try {
        console.log("Received request body:", req.body);
        const allQuestions = questions.map(question => {
            if (!question.questionId || question.rating == null) {
                throw new Error("Each question must have 'questionId' and 'rating'.");
            }
            return {
                questionId: question.questionId,
                rating: question.rating,
            };
        });

        const responseDocument = {
            questionnaireId,
            userId,           
            questions: allQuestions, 
        };

        const savedResponse = await Response.create(responseDocument);

        res.status(201).json({ success: true, data: savedResponse });
    } catch (error) {
        console.error("Error inserting responses:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
