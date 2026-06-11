import mongoose from "mongoose";

const songSchema = new mongoose.Schema({
  name: { type: String, required: true },
  desc: { type: String, default: "" },
  album: { type: String, default: "none" },
  image: { type: String, default: "" },
  file: { type: String, required: true },
  duration: { type: String, default: "0:00" },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'artist' },
  lyrics: { type: String, default: "" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
}, {
  timestamps: true
});

const SongModel = mongoose.model('song', songSchema);
export default SongModel;

// ❌ Fix: `model1`