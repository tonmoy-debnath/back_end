import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 50, // connection pool, adjust based on load
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds
    });

    // MongoDB runtime error listener
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB error:", err); // production এ সাধারণভাবে লগ
    });
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1); // connection fail হলে server বন্ধ
  }
};

export default connectDB;
