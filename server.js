const app = require('./app');
const connectDB = require('./config/db');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 5001;

async function start() {
  try {
    // Connexion à MongoDB Atlas
    console.log('🔄 Connexion à MongoDB Atlas...');
    await connectDB();
    console.log('✅ Base de données MongoDB connectée');
    
    // Vérifier la connexion
    if (mongoose.connection.readyState === 1) {
      console.log(`📦 Base de données: ${mongoose.connection.db.databaseName}`);
      console.log(`🔗 Host: ${mongoose.connection.host}`);
    }
    
    // Démarrage du serveur
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
      console.log(`📚 API disponible sur http://localhost:${PORT}/api`);
      console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
    });
    
  } catch (err) {
    console.error('❌ Erreur au démarrage:', err.message);
    process.exit(1);
  }
}

// Gestion propre de l'arrêt
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du serveur...');
  await mongoose.connection.close();
  console.log('MongoDB déconnecté');
  process.exit(0);
});

process.on('unhandledRejection', (err) => {
  console.error('Erreur non gérée:', err);
  process.exit(1);
});

start();