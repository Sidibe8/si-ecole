// scripts/resetAdminPassword.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function resetAdminPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB\n');
    
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Trouver l'admin
    const admin = await usersCollection.findOne({ role: 'admin' });
    
    if (!admin) {
      console.log('❌ Aucun admin trouvé');
    } else {
      console.log('Admin trouvé:', admin.email);
      console.log('Ancien hash:', admin.password.substring(0, 20) + '...');
      
      // Créer un nouveau hash
      const newPassword = 'Admin123!';
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Mettre à jour
      await usersCollection.updateOne(
        { _id: admin._id },
        { 
          $set: { 
            password: hashedPassword,
            updatedAt: new Date()
          } 
        }
      );
      
      console.log('✅ Mot de passe réinitialisé !');
      console.log('📧 Email:', admin.email);
      console.log('🔑 Nouveau mot de passe:', newPassword);
      console.log('Nouveau hash:', hashedPassword.substring(0, 20) + '...');
    }
    
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
}

resetAdminPassword();