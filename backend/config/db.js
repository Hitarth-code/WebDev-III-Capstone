const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri || mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost')) {
      if (process.env.VERCEL) {
        console.log('Running on Vercel without cloud MONGO_URI; enabling in-memory fallback mode');
        mongoose.set('bufferCommands', false);
        return;
      }
    }

    const conn = await mongoose.connect(mongoUri || 'mongodb://127.0.0.1:27017/stayeasy', {
      serverSelectionTimeoutMS: 4000
    });
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    mongoose.set('bufferCommands', false);
  }
};

module.exports = connectDB;
