const mongoose = require('mongoose');

const listEntrySchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['watching', 'reading', 'completed', 'plan to watch', 'plan to read', 'dropped'],
    default: 'plan to watch'
  },
  progress: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    default: null
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// This line prevents a user from adding the same anime twice
listEntrySchema.index({ userId: 1, animeId: 1 }, { unique: true });

module.exports = mongoose.model('ListEntry', listEntrySchema);