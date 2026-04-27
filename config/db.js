// config/db.js
const mongoose = require('mongoose');

async function connectDB() {
  try {
    // Chercher MONGO_URI ou MONGOD_URI (faute de frappe fréquente)
    const uri = process.env.MONGO_URI || process.env.MONGO_URI;
    
    if (!uri) {
      throw new Error('❌ MONGO_URI non défini dans les variables d\'environnement');
    }
    
    console.log('Tentative de connexion à MongoDB Atlas...');
    
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB Atlas connecté avec succès');
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ Erreur MongoDB:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('🔌 Mongoose déconnecté');
    });
    
    return mongoose.connection;
    
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    throw error;
  }
}

module.exports = { connectDB };