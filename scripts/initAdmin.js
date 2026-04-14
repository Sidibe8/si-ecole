// scripts/initAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function initAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB');
    
    // Accéder directement à la collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Vérifier si admin existe
    const existingAdmin = await usersCollection.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin existe déjà:', existingAdmin.email);
    } else {
      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      
      // Créer l'admin
      const admin = {
        email: 'admin@ecole.com',
        password: hashedPassword,
        role: 'admin',
        nom_complet: 'Administrateur Système',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await usersCollection.insertOne(admin);
      console.log('✅ Admin créé avec succès !');
      console.log('📧 Email: admin@ecole.com');
      console.log('🔑 Mot de passe: Admin123!');
    }
    
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

initAdmin();