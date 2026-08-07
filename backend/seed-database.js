import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import SongModel from "./src/models/songModel.js";
import albumModel from "./src/models/albumModel.js";
import artistModel from "./src/models/artistModel.js";
import MovieAlbum from "./src/models/MovieAlbum.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

// Reusing the existing files on Cloudinary
const SAMPLE_IMAGE = "https://res.cloudinary.com/djnfecvb6/image/upload/v1781012509/soundlink/images/yrzjhhuf4qxivbkgyr7h.jpg";
const SAMPLE_AUDIO = "https://res.cloudinary.com/djnfecvb6/video/upload/v1781012507/soundlink/audio/qpdmbupdowuehymaaqst.mp3";

const colors = ["#1DB954", "#e11d48", "#2563eb", "#d97706", "#7c3aed", "#0891b2", "#be123c"];

const seedDatabase = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI, {
      dbName: "SoundLive"
    });
    console.log("Connected to MongoDB!");

    console.log("Creating artists...");
    const artists = [];
    for (let i = 1; i <= 20; i++) {
      const artist = new artistModel({
        name: `Sample Artist ${i}`,
        bio: `This is a generated bio for Sample Artist ${i}. They are known for their incredible music and have millions of fans worldwide.`,
        image: SAMPLE_IMAGE
      });
      await artist.save();
      artists.push(artist);
    }
    console.log(`Created ${artists.length} artists.`);

    console.log("Creating albums...");
    const albums = [];
    for (let i = 1; i <= 30; i++) {
      const artist = artists[Math.floor(Math.random() * artists.length)];
      const album = new albumModel({
        name: `Epic Album ${i}`,
        desc: `A masterpiece by ${artist.name}`,
        bgColour: colors[Math.floor(Math.random() * colors.length)],
        image: SAMPLE_IMAGE,
        artist: artist._id
      });
      await album.save();
      albums.push(album);
    }
    console.log(`Created ${albums.length} albums.`);

    console.log("Creating movie albums...");
    const movieAlbums = [];
    for (let i = 1; i <= 10; i++) {
      const movie = new MovieAlbum({
        title: `Blockbuster Soundtrack ${i}`,
        director: "Christopher Nolan",
        name: `Blockbuster Soundtrack ${i}`,
        desc: `Original motion picture soundtrack for Blockbuster ${i}`,
        bgColour: colors[Math.floor(Math.random() * colors.length)],
        image: SAMPLE_IMAGE
      });
      await movie.save();
      movieAlbums.push(movie);
    }
    console.log(`Created ${movieAlbums.length} movie albums.`);

    console.log("Creating songs...");
    const songs = [];
    for (let i = 1; i <= 150; i++) {
      const artist = artists[Math.floor(Math.random() * artists.length)];
      const album = Math.random() > 0.5 ? albums[Math.floor(Math.random() * albums.length)] : null;
      
      const song = new SongModel({
        name: `Hit Song ${i}`,
        desc: `A beautiful track by ${artist.name}`,
        album: album ? album.name : "Single",
        image: SAMPLE_IMAGE,
        file: SAMPLE_AUDIO,
        duration: "3:45",
        artist: artist._id,
        lyrics: "[00:00.00] Intro\n[00:10.00] Verse 1\n[00:30.00] Chorus\n[01:00.00] Outro"
      });
      await song.save();
      songs.push(song);
    }
    console.log(`Created ${songs.length} songs.`);

    console.log("Seeding complete! Added ~210 records to populate the UI.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
