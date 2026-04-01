const mongoose = require('mongoose');

const animeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    synopsis: {
      type: String,
      default: '',
      trim: true,
    },
    episodes: {
      type: Number,
      default: 0,
      min: [0, 'Episodes cannot be negative'],
    },
    status: {
      type: String,
      enum: ['Finished Airing', 'Currently Airing', 'Not Yet Aired'],
      default: 'Finished Airing',
    },
    imageUrl: {
      type: String,
      default: '',
      trim: true,
    },
    releaseYear: {
      type: Number,
      min: [1900, 'Release year must be valid'],
      max: [2100, 'Release year must be valid'],
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be below 0'],
      max: [10, 'Rating cannot be above 10'],
    },
    genres: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Genre',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Anime', animeSchema);
