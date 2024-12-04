const express = require('express');
const router = express.Router();
const { Questionnaire } = require('../models/questionnaire');


router.post('/create', async (req, res) => {
    const { eventId, questions } = req.body;

    if (!eventId || !questions || questions.length === 0) {
        return res.status(400).json({ message: "Event ID and questions are required" });
    }

    try {
        const questionnaire = new Questionnaire({
            eventId,
            questions,
        });

        const savedQuestionnaire = await questionnaire.save();
        res.status(201).json({ message: "Questionnaire created successfully", questionnaire: savedQuestionnaire });
    } catch (error) {
        console.error('Error creating questionnaire:', error);
        res.status(500).json({ message: "Error creating questionnaire", error });
    }
});

router.get('/', async (req, res) => {
    try {
        const questionnaires = await Questionnaire.find().populate('userId', 'name email');
        res.status(200).json(questionnaires);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving questionnaires", error });
    }
});

router.get('/:id', async (req, res) => {
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

router.get('/check-questionnaire/:eventId', async (req, res) => {
    try {
      const { eventId } = req.params;
  
      const existingQuestionnaire = await Questionnaire.findOne({ eventId });
  
      if (existingQuestionnaire) {
        return res.status(200).json({ hasQuestionnaire: true });
      } else {
        return res.status(200).json({ hasQuestionnaire: false });
      }
    } catch (error) {
      console.error('Error checking for questionnaire:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  });

module.exports = router;
