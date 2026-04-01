const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  animeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Anime',
    required: true
  },
  text: {
    type: String,
    required: true,
    maxlength: 2000
  },
  score: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  }
}, { timestamps: true });

// One review per user per title
reviewSchema.index({ userId: 1, animeId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);