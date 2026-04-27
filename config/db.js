const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.log('⚠️ MONGO_URI non défini');
      return;
    }
    await mongoose.connect(uri);
    console.log('✅ MongoDB connecté');
  } catch (err) {
    console.error('❌ Erreur MongoDB:', err.message);
  }
};

module.exports = connectDB;