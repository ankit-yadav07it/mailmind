const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/email-dashboard';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn('');
    console.warn('⚠️  MongoDB connection failed:', error.message);
    console.warn('');
    console.warn('  To run this app, you need MongoDB. Options:');
    console.warn('  1. Free cloud (recommended): https://mongodb.com/atlas');
    console.warn('     → Create a free cluster → Get connection string → paste in .env as MONGODB_URI=');
    console.warn('  2. Local: Install MongoDB Community from https://mongodb.com/try/download/community');
    console.warn('     → Run: mongod');
    console.warn('');
    console.warn('  The server is still running but API calls will fail until MongoDB is available.');
    console.warn('');
    return null;
  }
};

module.exports = connectDB;
