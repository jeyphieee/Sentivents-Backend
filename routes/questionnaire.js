const express = require('express');
const router = express.Router();
const Questionnaire = require('../models/questionnaire');
// const authJwt  = require('../middleware/authJwt'); // Commenting out the JWT middleware

// Create a new questionnaire
router.post('/', async (req, res) => { // Removed authJwt()
    const { questionnaires } = req.body; // Expecting the entire questionnaires structure

    const questionnaire = new Questionnaire({
        questionnaires, // Save the entire array of questionnaires with traits and questions
    });

    try {
        await questionnaire.save();
        res.status(201).json({ message: "Questionnaire created successfully", questionnaire });
    } catch (error) {
        res.status(400).json({ message: "Error creating questionnaire", error });
    }
});
// Get all questionnaires
router.get('/', async (req, res) => { // Removed authJwt()
    try {
        const questionnaires = await Questionnaire.find().populate('userId', 'name email'); // Optionally populate user info
        res.status(200).json(questionnaires);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving questionnaires", error });
    }
});

// Get a specific questionnaire by ID
router.get('/:id', async (req, res) => { // Removed authJwt()
    try {
        const questionnaire = await Questionnaire.findById(req.params.id).populate('userId', 'name email');

        if (!questionnaire) {
            return res.status(404).json({ message: "Questionnaire not found" });
        }

        res.status(200).json(questionnaire);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving questionnaire", error });
    }
});

// Export the router
module.exports = router;
