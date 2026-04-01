const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');

// GET /api/reviews/:animeId
// Get all reviews for a specific anime/manga - anyone logged in can see these
router.get('/:animeId', protect, async (req, res) => {
  try {
    const reviews = await Review.find({ animeId: req.params.animeId })
      .populate('userId', 'username');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/reviews
// Write a review - logged-in users only
router.post('/', protect, async (req, res) => {
  const { animeId, text, score } = req.body;
  try {
    const review = new Review({
      userId: req.user.id,
      animeId,
      text,
      score
    });
    const saved = await review.save();
    res.status(201).json(saved);
  } catch (err) {

    // Handle duplicate review (user already reviewed this title)
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this title' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/reviews/:id
// Delete a review - only the person who wrote it can delete it
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    // Make sure the logged in user wrote this review
    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }
    await review.deleteOne();
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;