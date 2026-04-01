const express = require('express');
const router = express.Router();
const ListEntry = require('../models/ListEntry');
const { protect } = require('../middleware/auth');

// All routes here require the user to be logged in


// GET /api/list
// Get the logged in user's full list
router.get('/', protect, async (req, res) => {
  try {
    const entries = await ListEntry.find({ userId: req.user.id })
      .populate('animeId', 'title type imageUrl status');
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/list
// Add a title to the logged in user's list
router.post('/', protect, async (req, res) => {
  const { animeId, status, progress, rating, notes } = req.body;
  try {
    const entry = new ListEntry({
      userId: req.user.id,
      animeId,
      status,
      progress,
      rating,
      notes
    });
    const saved = await entry.save();
    res.status(201).json(saved);
  } catch (err) {

    // Handle duplicate entry (same user adding the same anime twice)
    if (err.code === 11000) {
      return res.status(400).json({ message: 'This title is already on your list' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/list/:id
// Update an entry - only the owner can do this
router.put('/:id', protect, async (req, res) => {
  try {
    const entry = await ListEntry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'List entry not found' });
    }
    // Make sure the logged in user owns this entry
    if (entry.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this entry' });
    }
    const { status, progress, rating, notes } = req.body;
    if (status !== undefined) entry.status = status;
    if (progress !== undefined) entry.progress = progress;
    if (rating !== undefined) entry.rating = rating;
    if (notes !== undefined) entry.notes = notes;

    const updated = await entry.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/list/:id
// Remove an entry - only the owner can do this
router.delete('/:id', protect, async (req, res) => {
  try {
    const entry = await ListEntry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'List entry not found' });
    }
    // Make sure the logged in user owns this entry
    if (entry.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this entry' });
    }
    await entry.deleteOne();
    res.json({ message: 'Entry removed from your list' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;