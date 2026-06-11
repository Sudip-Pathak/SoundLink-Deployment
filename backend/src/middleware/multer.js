import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "/../../uploads");

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`Created uploads directory: ${uploadsDir}`);
}

// Save file to local 'uploads' folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Filter for files based on field name
const fileFilter = (req, file, cb) => {
  // Check file type based on field name
  if (file.fieldname === "image" || file.fieldname === "coverImage") {
    // Accept images only: jpg, jpeg, png, gif, webp
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return cb(
        new Error("Only image files (jpg, jpeg, png, gif, webp) are allowed for image uploads!"),
        false,
      );
    }
  } else if (file.fieldname === "audio") {
    // Accept audio AND video files for audio fields (mp3, wav, ogg, m4a, flac, aac, mp4)
    if (!file.originalname.match(/\.(mp3|wav|ogg|m4a|flac|aac|mp4)$/i)) {
      return cb(
        new Error("Only audio/video files (mp3, wav, ogg, m4a, flac, aac, mp4) are allowed for audio uploads!"),
        false,
      );
    }
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit (supports mp4 video files)
  },
});

export default upload;
