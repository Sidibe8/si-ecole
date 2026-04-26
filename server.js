// server.js
const app = require('./app');
const { initDatabase } = require('./config/db');

const PORT = process.env.PORT || 5001;

async function start() {
  // Initialiser la base de données (créer les tables si elles n'existent pas)
  await initDatabase();
  console.log('Base de données prête');

  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
  });
}

start().catch(err => {
  console.error('Erreur au démarrage :', err);
  process.exit(1);
});