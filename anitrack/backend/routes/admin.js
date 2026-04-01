const express = require('express');
const router = express.Router();

const Anime = require('../models/Anime');
const Genre = require('../models/Genre');
const { protect, adminOnly } = require('../middleware/auth');


// ===========================
// GENRE ROUTES
// ===========================

// Create genre
router.post('/genres', protect, adminOnly, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Genre name is required' });
    }

    const existingGenre = await Genre.findOne({ name: name.trim() });
    if (existingGenre) {
      return res.status(400).json({ message: 'Genre already exists' });
    }

    const genre = await Genre.create({
      name: name.trim(),
      description,
    });

    res.status(201).json(genre);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all genres
router.get('/genres', protect, adminOnly, async (req, res) => {
  try {
    const genres = await Genre.find().sort({ name: 1 });
    res.json(genres);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single genre
router.get('/genres/:id', protect, adminOnly, async (req, res) => {
  try {
    const genre = await Genre.findById(req.params.id);

    if (!genre) {
      return res.status(404).json({ message: 'Genre not found' });
    }

    res.json(genre);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update genre
router.put('/genres/:id', protect, adminOnly, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (name) {
      const existingGenre = await Genre.findOne({
        name: name.trim(),
        _id: { $ne: req.params.id },
      });

      if (existingGenre) {
        return res.status(400).json({ message: 'Genre name already exists' });
      }
    }

    const updatedGenre = await Genre.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description }),
      },
      { new: true, runValidators: true }
    );

    if (!updatedGenre) {
      return res.status(404).json({ message: 'Genre not found' });
    }

    res.json(updatedGenre);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete genre
router.delete('/genres/:id', protect, adminOnly, async (req, res) => {
  try {
    const genre = await Genre.findById(req.params.id);

    if (!genre) {
      return res.status(404).json({ message: 'Genre not found' });
    }

    // Remove this genre reference from all anime before deleting
    await Anime.updateMany(
      { genres: genre._id },
      { $pull: { genres: genre._id } }
    );

    await Genre.findByIdAndDelete(req.params.id);

    res.json({ message: 'Genre deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ===========================
// ANIME ROUTES
// ===========================

// Create anime
router.post('/anime', protect, adminOnly, async (req, res) => {
  try {
    const {
      title,
      synopsis,
      episodes,
      status,
      imageUrl,
      releaseYear,
      averageRating,
      genres,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Anime title is required' });
    }

    if (genres && genres.length > 0) {
      const validGenres = await Genre.find({ _id: { $in: genres } });
      if (validGenres.length !== genres.length) {
        return res.status(400).json({ message: 'One or more genre IDs are invalid' });
      }
    }

    const anime = await Anime.create({
      title: title.trim(),
      synopsis,
      episodes,
      status,
      imageUrl,
      releaseYear,
      averageRating,
      genres: genres || [],
    });

    const populatedAnime = await Anime.findById(anime._id).populate('genres');

    res.status(201).json(populatedAnime);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all anime
router.get('/anime', protect, adminOnly, async (req, res) => {
  try {
    const animeList = await Anime.find()
      .populate('genres')
      .sort({ createdAt: -1 });

    res.json(animeList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single anime
router.get('/anime/:id', protect, adminOnly, async (req, res) => {
  try {
    const anime = await Anime.findById(req.params.id).populate('genres');

    if (!anime) {
      return res.status(404).json({ message: 'Anime not found' });
    }

    res.json(anime);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update anime
router.put('/anime/:id', protect, adminOnly, async (req, res) => {
  try {
    const {
      title,
      synopsis,
      episodes,
      status,
      imageUrl,
      releaseYear,
      averageRating,
      genres,
    } = req.body;

    if (genres) {
      const validGenres = await Genre.find({ _id: { $in: genres } });
      if (validGenres.length !== genres.length) {
        return res.status(400).json({ message: 'One or more genre IDs are invalid' });
      }
    }

    const updatedAnime = await Anime.findByIdAndUpdate(
      req.params.id,
      {
        ...(title && { title: title.trim() }),
        ...(synopsis !== undefined && { synopsis }),
        ...(episodes !== undefined && { episodes }),
        ...(status && { status }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(releaseYear !== undefined && { releaseYear }),
        ...(averageRating !== undefined && { averageRating }),
        ...(genres !== undefined && { genres }),
      },
      { new: true, runValidators: true }
    ).populate('genres');

    if (!updatedAnime) {
      return res.status(404).json({ message: 'Anime not found' });
    }

    res.json(updatedAnime);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete anime
router.delete('/anime/:id', protect, adminOnly, async (req, res) => {
  try {
    const anime = await Anime.findByIdAndDelete(req.params.id);

    if (!anime) {
      return res.status(404).json({ message: 'Anime not found' });
    }

    res.json({ message: 'Anime deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
