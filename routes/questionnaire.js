const express = require('express');
const router = express.Router();
const { Questionnaire } = require('../models/questionnaire');
const { Question } = require('../models/question');
const { Trait } = require('../models/trait');
const { Response } = require('../models/response');

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
router.get('/aggregated-ratings', async (req, res) => {
    try {
        const { eventId } = req.query;  // Get the eventId from the query parameters

        // Ensure eventId is provided
        if (!eventId) {
            return res.status(400).json({ message: "Event ID is required." });
        }

        // Fetch the questionnaires for the given event
        const questionnaires = await Questionnaire.find({ eventId });  // Filter by eventId
        console.log('Questionnaires for event:', questionnaires);

        // If no questionnaires found, return empty aggregatedRatings
        if (!questionnaires || questionnaires.length === 0) {
            return res.status(200).json({ aggregatedRatings: [] });  // No questionnaires, return empty array
        }

        // Get questionnaire IDs
        const questionnaireIds = questionnaires.map(q => q._id);
        
        // Fetch responses for the given questionnaireIds and populate questionId and traitId
        const responses = await Response.find({ 'questionnaireId': { $in: questionnaireIds } })
            .populate({
                path: 'questions.questionId',
                populate: { path: 'traitId' }  // Populate the traitId to get the trait data
            });
        console.log('Responses with populated questionId and traitId:', responses);

        // If no responses found, return empty aggregatedRatings
        if (!responses || responses.length === 0) {
            return res.status(200).json({ aggregatedRatings: [] });  // No responses, return empty array
        }

        // Initialize an object to store trait ratings
        const traitRatings = {};

        // Process each response
        responses.forEach((response) => {
            if (!response.questions) {
                console.error('Response has no questions:', response);
                return;
            }

            // Initialize a temporary object to accumulate scores per response
            const responseTraitScores = {};

            response.questions.forEach((question) => {
                // Fetch the trait and rating
                const trait = question.questionId.traitId.trait;  // Get the trait from the populated traitId
                const rating = question.rating;

                // Check if the necessary data is valid
                if (!trait || typeof rating !== 'number') {
                    console.error('Invalid question data:', question);
                    return;
                }

                // Accumulate scores for the same trait within the response
                if (!responseTraitScores[trait]) {
                    responseTraitScores[trait] = 0;
                }
                responseTraitScores[trait] += rating;
            });

            // Now, accumulate the total scores for each trait across all responses
            Object.keys(responseTraitScores).forEach((trait) => {
                if (!traitRatings[trait]) {
                    traitRatings[trait] = { totalScore: 0, totalResponses: 0 };
                }

                // Add the total score for this response for the trait
                traitRatings[trait].totalScore += responseTraitScores[trait];
                // Increment the response count for this trait
                traitRatings[trait].totalResponses += 1;
            });
        });

        // Map the trait ratings to an array
        const aggregatedRatings = Object.keys(traitRatings).map((trait) => {
            const { totalScore, totalResponses } = traitRatings[trait];
            return {
                trait,
                averageRating: totalScore / totalResponses,  // Calculate average per trait
                totalResponses,
            };
        });

        // Send the aggregated ratings as the response
        res.status(200).json({ aggregatedRatings });
    } catch (error) {
        console.error('Error in /aggregated-ratings:', error);
        res.status(500).json({ message: "Server error", error });
    }
});


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
  
      // Count the number of responses
      const responseCount = await Response.countDocuments({ questionnaireId: questionnaire._id });
  
      res.status(200).json({
        questionnaireId: questionnaire._id, 
        questionnaire: questionnaire,
        responseCount: responseCount, // Include the response count
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
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
