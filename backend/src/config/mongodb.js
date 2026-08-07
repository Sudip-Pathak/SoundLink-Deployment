import mongoose from "mongoose";

const connectDB = async () => {
  mongoose.connection.on('connected', () => {
    console.log("MongoDB connection established");
  });

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: "SoundLive",
    family: 4 // Force IPv4 to prevent querySrv ECONNREFUSED on Windows
  });
};

export default connectDB;
