import { v2 as cloudinary } from "cloudinary";
import songModel from "../models/songModel.js";
import fs from "fs";
// Note: cloudinary is configured by connectCloudinary() in server.js
// Do NOT call cloudinary.config() here — env vars aren't loaded yet at module import time

const addSong = async (req, res) => {
  try {
    const name = req.body.name;
    const desc = req.body.desc;
    const album = req.body.album;
    const artist = req.body.artist; // Add artist field
    const lyrics = req.body.lyrics; // Add lyrics field

    // Check for audio file (required)
    if (!req.files || !req.files.audio || !req.files.audio[0]) {
      return res.status(400).json({ success: false, message: "Audio file missing" });
    }

    const audioFile = req.files.audio[0];
    // Image is optional
    const imageFile = req.files?.image?.[0] || null;

    // Log file info
    console.log('Audio file info:', {
      originalname: audioFile.originalname,
      mimetype: audioFile.mimetype,
      size: audioFile.size,
      path: audioFile.path
    });
    if (imageFile) {
      console.log('Image file info:', {
        originalname: imageFile.originalname,
        mimetype: imageFile.mimetype,
        size: imageFile.size,
        path: imageFile.path
      });
      // Validate image MIME type only if image is provided
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedImageTypes.includes(imageFile.mimetype)) {
        return res.status(400).json({ success: false, message: `Invalid image MIME type: ${imageFile.mimetype}` });
      }
    }

    // Check for Cloudinary configuration
    const isCloudinaryConfigured = process.env.CLOUDINARY_NAME && 
                                  process.env.CLOUDINARY_API_KEY && 
                                  process.env.CLOUDINARY_SECRET_KEY;
    if (!isCloudinaryConfigured) {
      return res.status(500).json({ success: false, message: "Cloudinary is not configured properly." });
    }

    try {
      // Upload audio to Cloudinary (required)
      const audioUpload = await cloudinary.uploader.upload(audioFile.path, {
        resource_type: "video",
        folder: "soundlink/audio",
      });

      // Upload image to Cloudinary only if provided
      let imageUrl = "";
      if (imageFile) {
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
          resource_type: "image",
          folder: "soundlink/images",
        });
        imageUrl = imageUpload.secure_url;
      }

      // Safe duration calculation
      const rawDuration = audioUpload.duration || 0;
      const duration = `${Math.floor(rawDuration / 60)}:${Math.floor(rawDuration % 60).toString().padStart(2, '0')}`;

      const songData = {
        name,
        desc: desc || "",
        album: album || "none",
        image: imageUrl,
        file: audioUpload.secure_url,
        duration,
        createdBy: req.user.id,
      };
      if (artist) songData.artist = artist;
      if (lyrics) songData.lyrics = lyrics;

      const song = songModel(songData);
      await song.save();

      // Clean up temp files from disk after successful upload
      try {
        fs.unlinkSync(audioFile.path);
        if (imageFile) fs.unlinkSync(imageFile.path);
      } catch (cleanupErr) {
        console.warn("Temp file cleanup warning:", cleanupErr.message);
      }

      res.json({ success: true, message: "Song Added", song });
    } catch (cloudinaryError) {
      console.error("Cloudinary upload error (full):", cloudinaryError);
      // Clean up temp files on error too
      try {
        fs.unlinkSync(audioFile.path);
        if (imageFile) fs.unlinkSync(imageFile.path);
      } catch (_) { /* ignore */ }
      return res.status(500).json({ 
        success: false, 
        error: "Cloudinary upload failed",
        details: cloudinaryError.message,
      });
    }
  } catch (error) {
    console.error("Song upload error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Something went wrong",
      details: error.message 
    });
  }
};

const listSong = async (req, res) => {
  try {
    // Check if 'all' parameter is set to true to skip pagination
    if (req.query.all === 'true') {
      // Return all songs without pagination
      const songs = await songModel.find({}).populate('artist');
      return res.json({ success: true, songs, total: songs.length });
    }
    
    // Otherwise, use pagination as before
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const [songs, total] = await Promise.all([
      songModel.find({}).populate('artist').skip(skip).limit(limit),
      songModel.countDocuments()
    ]);
    res.json({ success: true, songs, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Error listing songs:', error);
    res.json({ success: false, message: error.message });
  }
};

const removeSong = async (req, res) => {
  try {
    await songModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Song removed" }); // ✅ fixed typo: semicolon inside res.json
  } catch (error) {
    res.json({ success: false }); // ✅ fixed syntax: replaced `{success:"False"}` with valid object
  }
};

// Edit a song
const editSong = async (req, res) => {
  try {
    const { id, name, desc, album, artist, lyrics } = req.body;
    let updateData = { name, desc, album };
    
    // Include artist in update if provided
    if (artist) {
      updateData.artist = artist;
    }
    
    // Include lyrics in update if provided
    if (lyrics !== undefined) {
      updateData.lyrics = lyrics;
    }
    
    if (req.files && req.files.image) {
      const imageUpload = await cloudinary.uploader.upload(req.files.image[0].path, {
        resource_type: "image",
      });
      updateData.image = imageUpload.secure_url;
    }
    if (req.files && req.files.audio) {
      const audioUpload = await cloudinary.uploader.upload(req.files.audio[0].path, {
        resource_type: "video",
      });
      updateData.file = audioUpload.secure_url;
      updateData.duration = `${Math.floor(audioUpload.duration / 60)}:${Math.floor(audioUpload.duration % 60)}`;
    }
    const updated = await songModel.findByIdAndUpdate(id, updateData, { new: true }).populate('artist');
    if (!updated) return res.status(404).json({ success: false, message: "Song not found" });
    res.json({ success: true, song: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to edit song" });
  }
};

// Bulk add songs
const bulkAddSongs = async (req, res) => {
  try {
    const songs = req.body.songs; // Array of song objects
    if (!Array.isArray(songs) || songs.length === 0) {
      return res.status(400).json({ success: false, message: "No songs provided" });
    }
    const created = await songModel.insertMany(songs.map(s => ({
      ...s,
      createdBy: req.user.id
    })));
    res.json({ success: true, songs: created });
  } catch (error) {
    res.status(500).json({ success: false, message: "Bulk add failed" });
  }
};

export { addSong, listSong, removeSong, editSong, bulkAddSongs };
