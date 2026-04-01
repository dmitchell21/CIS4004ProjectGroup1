const mongoose = require('mongoose');
const Genre = require('./models/Genre');
const Anime = require('./models/Anime');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Genre.deleteMany();
    await Anime.deleteMany();

    const action = await Genre.create({
      name: 'Action',
      description: 'Combat, adventure, and intense scenes',
    });

    const fantasy = await Genre.create({
      name: 'Fantasy',
      description: 'Magic, supernatural worlds, and mythical elements',
    });

    const drama = await Genre.create({
      name: 'Drama',
      description: 'Emotion-focused storytelling',
    });

    await Anime.create([
      {
        title: 'Attack on Titan',
        synopsis: 'Humans fight for survival against giant Titans.',
        episodes: 87,
        status: 'Finished Airing',
        imageUrl: 'https://example.com/aot.jpg',
        releaseYear: 2013,
        averageRating: 9.1,
        genres: [action, drama],
      },
      {
        title: 'Fullmetal Alchemist: Brotherhood',
        synopsis: 'Two brothers search for the Philosopher’s Stone.',
        episodes: 64,
        status: 'Finished Airing',
        imageUrl: 'https://example.com/fmab.jpg',
        releaseYear: 2009,
        averageRating: 9.2,
        genres: [action, fantasy, drama],
      },
    ]);

    console.log('Seed data inserted');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();
