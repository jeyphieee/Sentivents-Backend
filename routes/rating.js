const express = require('express');
const router = express.Router();
const { Rating } = require('../models/ratings');
const mongoose = require('mongoose');


router.get(`/`, async (req, res) => {
    const ratings = await Rating.find().populate('rating');

    if (!ratings) {
        res.status(500).json({ success: false })
    }
   
    res.status(201).json(ratings)
})

router.post('/', async (req, res) => {
    try {
        const { eventId, userId, score, feedback } = req.body;
        const newRating = new Rating({ eventId, userId, score, feedback });
        const savedRating = await newRating.save();
        res.status(201).json(savedRating);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
}); 

router.get('/:userId/:eventId', async (req, res) => {
    const { userId, eventId } = req.params;

    try {
        const rating = await Rating.findOne({ userId, eventId });

        if (!rating) {
            return res.status(200).json({
                message: 'No feedback found from this user for this event.',
            });
        }
        res.status(200).json(rating);
        console.log(rating);
    } catch (error) {
        console.error('Error fetching rating:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;
