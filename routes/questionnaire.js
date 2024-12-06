const express = require('express');
const router = express.Router();
const { Questionnaire } = require('../models/questionnaire');
const { Question } = require('../models/question');
const { Trait } = require('../models/trait');
const { Response } = require('../models/response');

// Create Questionnaire
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


// Get Questionnaire
router.get('/', async (req, res) => {
    try {
        const questionnaires = await Questionnaire.find().populate('userId', 'name email');
        res.status(200).json(questionnaires);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving questionnaires", error });
    }
});

// Get Event's Behavioral Analysis Ratings
router.get('/aggregated-ratings', async (req, res) => {
    try {
        const { eventId } = req.query;  

        if (!eventId) {
            return res.status(400).json({ message: "Event ID is required." });
        }

        const questionnaires = await Questionnaire.find({ eventId });
        console.log('Questionnaires for event:', questionnaires);

        if (!questionnaires || questionnaires.length === 0) {
            return res.status(200).json({ aggregatedRatings: [] });
        }

        const questionnaireIds = questionnaires.map(q => q._id);
        
        const responses = await Response.find({ 'questionnaireId': { $in: questionnaireIds } })
            .populate({
                path: 'questions.questionId',
                populate: { path: 'traitId' }
            });
        console.log('Responses with populated questionId and traitId:', responses);

        if (!responses || responses.length === 0) {
            return res.status(200).json({ aggregatedRatings: [] });
        }

        const traitRatings = {};

        responses.forEach((response) => {
            if (!response.questions) {
                console.error('Response has no questions:', response);
                return;
            }

            const responseTraitScores = {};

            response.questions.forEach((question) => {
                const trait = question.questionId.traitId.trait;
                const rating = question.rating;

                if (!trait || typeof rating !== 'number') {
                    console.error('Invalid question data:', question);
                    return;
                }

                if (!responseTraitScores[trait]) {
                    responseTraitScores[trait] = 0;
                }
                responseTraitScores[trait] += rating;
            });

            Object.keys(responseTraitScores).forEach((trait) => {
                if (!traitRatings[trait]) {
                    traitRatings[trait] = { totalScore: 0, totalResponses: 0 };
                }

                traitRatings[trait].totalScore += responseTraitScores[trait];
                traitRatings[trait].totalResponses += 1;
            });
        });

        const aggregatedRatings = Object.keys(traitRatings).map((trait) => {
            const { totalScore, totalResponses } = traitRatings[trait];
            return {
                trait,
                averageRating: Math.round((totalScore / totalResponses) * 100) / 100,
                totalResponses,
            };
        });
        

        res.status(200).json({ aggregatedRatings });
    } catch (error) {
        console.error('Error in /aggregated-ratings:', error);
        res.status(500).json({ message: "Server error", error });
    }
});

// Get Event's Questionnaire Questions
router.get('/event/:eventId', async (req, res) => {
    try {
      const { eventId } = req.params;
      const questionnaire = await Questionnaire.findOne({ eventId })
        .populate('questions')
        .populate({
          path: 'questions',
          populate: { path: 'traitId' },
        });
  
      if (!questionnaire) {
        return res.status(404).json({ message: 'Questionnaire not found' });
      }
  
      const responseCount = await Response.countDocuments({ questionnaireId: questionnaire._id });
  
      res.status(200).json({
        questionnaireId: questionnaire._id, 
        questionnaire: questionnaire,
        responseCount: responseCount,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
// Checks if Event has Questionnaire, used on opening and closing the questionnaire
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
