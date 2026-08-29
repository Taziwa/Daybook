const mongoose = require('mongoose');

// Connects to MongoDB using the connection string in MONGO_URI.
// If this fails, the whole server refuses to start — that's intentional,
// since an API with no database isn't useful anyway.
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
