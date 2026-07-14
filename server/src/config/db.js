const mongoose = require("mongoose");

const connectDB = async (retries = 5, delay = 5000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      console.log(`MongoDB connected: ${conn.connection.host}`);

      mongoose.connection.on("error", (err) => {
        console.error("MongoDB connection error:", err);
      });

      mongoose.connection.on("disconnected", () => {
        console.warn("MongoDB disconnected. Attempting to reconnect...");
      });

      mongoose.connection.on("reconnected", () => {
        console.log("MongoDB reconnected");
      });

      process.on("SIGINT", async () => {
        await mongoose.connection.close();
        console.log("MongoDB connection closed due to app termination");
        process.exit(0);
      });

      return conn;
    } catch (err) {
      console.error(
        `MongoDB connection attempt ${attempt}/${retries} failed: ${err.message}`
      );
      if (attempt === retries) {
        console.error("All MongoDB connection attempts exhausted. Exiting.");
        process.exit(1);
      }
      console.log(`Retrying in ${delay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

module.exports = connectDB;
