const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: process.env.NODE_ENV === "production" ? 30000 : 5000,
    });
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    const fallbackUri = process.env.MONGODB_FALLBACK_URI || "mongodb://127.0.0.1:27017/kirana-mart";
    if (process.env.NODE_ENV !== "production" && fallbackUri !== process.env.MONGODB_URI) {
      console.warn("MongoDB Atlas unavailable; using the local development database.");
      await mongoose.connect(fallbackUri, { serverSelectionTimeoutMS: 5000 });
      console.log("Local MongoDB Connected Successfully");
      return;
    }
    throw error;
  }
};

module.exports = connectDB;
