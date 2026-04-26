const bcrypt = require('bcryptjs');
const { getDb } = require('./config/db');
const path = require('path');
const fs = require('fs');

async function createAdmin() {
  // Supprimer l'ancienne base
  const dbPath = path.join(__dirname, 'database', 'gestion_ecole.sqlite');
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('Ancienne base supprimée');
  }

  const db = await getDb();
  await db.run('PRAGMA foreign_keys = ON');

  // Lire le script init.sql depuis le dossier sql/
  const initScript = path.join(__dirname, 'sql', 'init.sql');
  if (fs.existsSync(initScript)) {
    let sql = fs.readFileSync(initScript, 'utf8');
    
    // Supprimer les lignes INSERT INTO users du script
    sql = sql.replace(/INSERT OR IGNORE INTO users.*;/gi, '');
    
    await db.exec(sql);
    console.log('Tables créées depuis sql/init.sql');
  } else {
    console.log('init.sql non trouvé');
  }

  // Créer admin avec bcrypt
  const hash = await bcrypt.hash('admin123', 10);
  await db.run(
    `INSERT INTO users (email, password, role, nom_complet) VALUES (?, ?, ?, ?)`,
    ['admin@ecole.com', hash, 'admin', 'Administrateur']
  );
  console.log('✅ Admin créé : admin@ecole.com / admin123');

  // Créer secrétaire
  const hash2 = await bcrypt.hash('admin123', 10);
  await db.run(
    `INSERT INTO users (email, password, role, nom_complet) VALUES (?, ?, ?, ?)`,
    ['secretaire@ecole.com', hash2, 'secretariat', 'Fatoumata Traoré']
  );
  console.log('✅ Secrétaire créé : secretaire@ecole.com / admin123');

  // Créer comptable
  const hash3 = await bcrypt.hash('admin123', 10);
  await db.run(
    `INSERT INTO users (email, password, role, nom_complet, bank_account, bank_name) VALUES (?, ?, ?, ?, ?, ?)`,
    ['comptable@ecole.com', hash3, 'comptable', 'Ibrahim Koné', 'ML987654321', 'BIM']
  );
  console.log('✅ Comptable créé : comptable@ecole.com / admin123');

  console.log('\n🎉 Base initialisée avec succès !');
  await db.close();
  process.exit(0);
}

createAdmin().catch(err => {
  console.error('Erreur:', err);
  process.exit(1);
});