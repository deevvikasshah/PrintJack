const mongoose = require("mongoose");

let cached = null;

const connectDB = async () => {
  if (cached) {
    return cached;
  }

  const connection = mongoose
    .connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    .then((conn) => {
      console.log(`MongoDB connected: ${conn.connection.host}`);
      mongoose.connection.on("error", (err) => {
        console.error("MongoDB connection error:", err);
      });
      return conn;
    })
    .catch((err) => {
      console.error(`MongoDB connection attempt failed: ${err.message}`);
      cached = null;
      throw err;
    });

  cached = connection;
  return connection;
};

module.exports = connectDB;