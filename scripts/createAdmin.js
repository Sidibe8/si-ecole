// scripts/createAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function createAdminUser() {
  try {
    // Connexion à MongoDB Atlas
    console.log('Connexion à MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB Atlas');
    
    // Vérifier si un admin existe déjà
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️  Un administrateur existe déjà :');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Nom: ${existingAdmin.nom_complet}`);
      console.log(`   Rôle: ${existingAdmin.role}`);
      
      // Demander si on veut créer un nouvel admin quand même
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      readline.question('Voulez-vous créer un nouvel administrateur ? (oui/non) ', async (answer) => {
        if (answer.toLowerCase() === 'oui') {
          await createNewAdmin();
        } else {
          console.log('Opération annulée.');
        }
        readline.close();
        await mongoose.connection.close();
        process.exit(0);
      });
      
    } else {
      await createNewAdmin();
      await mongoose.connection.close();
      process.exit(0);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

async function createNewAdmin() {
  // Créer le compte admin par défaut
  const adminData = {
    email: 'admin@ecole.com',
    password: 'Admin123!',  // Sera hashé automatiquement
    role: 'admin',
    nom_complet: 'Administrateur Système',
    bank_account: '',
    bank_name: '',
    tax_id: ''
  };
  
  const admin = new User(adminData);
  await admin.save();
  
  console.log('✅ Administrateur créé avec succès !');
  console.log('--------------------------------');
  console.log('📧 Email: admin@ecole.com');
  console.log('🔑 Mot de passe: Admin123!');
  console.log('👤 Rôle: admin');
  console.log('--------------------------------');
  console.log('⚠️  CHANGEZ LE MOT DE PASSE APRÈS LA PREMIÈRE CONNEXION !');
  
  return admin;
}

createAdminUser();