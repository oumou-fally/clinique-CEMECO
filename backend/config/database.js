const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/backend');
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.warn('⚠️  Database connection error:', error.message);
    console.warn('⚠️  Running in offline mode. API will work but data will not persist.');
  }
};

module.exports = connectDB;