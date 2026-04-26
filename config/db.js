const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

// Détecter si on est sur Render (dossier persistant)
const isRender = fs.existsSync('/opt/render/project/src/data');
const dataDir = isRender 
  ? '/opt/render/project/src/data' 
  : path.join(__dirname, '..', 'database');

const dbPath = path.join(dataDir, 'gestion_ecole.sqlite');

let db;

async function getDb() {
  if (!db) {
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    await db.run('PRAGMA foreign_keys = ON');
    await db.run('PRAGMA journal_mode = WAL');

    console.log(`📁 Base de données connectée : ${dbPath}`);
  }
  return db;
}

async function query(sql, params = []) {
  const database = await getDb();

  if (sql.trim().toUpperCase().startsWith('SELECT')) {
    const rows = await database.all(sql, params);
    return { rows };
  }

  const result = await database.run(sql, params);
  return {
    rows: [],
    rowCount: result.changes,
    lastId: result.lastID
  };
}

async function initDatabase() {
  const database = await getDb();

  // Vérifier si la table users existe déjà
  const tableExists = await database.get(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='users'`
  );

  if (!tableExists) {
    console.log('🔧 Initialisation de la base de données...');
    
    // Chercher init.sql dans le dossier sql/ (pas database/)
    const initScript = path.join(__dirname, '..', 'sql', 'init.sql');
    
    if (fs.existsSync(initScript)) {
      const sql = fs.readFileSync(initScript, 'utf8');
      
      // Supprimer les lignes INSERT INTO users existantes (on va les créer avec bcrypt)
      const cleanedSql = sql.replace(/INSERT OR IGNORE INTO users.*;/gi, '');
      
      await database.exec(cleanedSql);
      console.log('✅ Tables créées');
      
      // Créer les utilisateurs avec bcrypt
      const bcrypt = require('bcryptjs');
      const adminHash = await bcrypt.hash('admin123', 10);
      const comptableHash = await bcrypt.hash('admin123', 10);
      const secretaireHash = await bcrypt.hash('admin123', 10);
      
      await database.run(
        'INSERT INTO users (email, password, role, nom_complet) VALUES (?, ?, ?, ?)',
        ['admin@ecole.com', adminHash, 'admin', 'Administrateur']
      );
      await database.run(
        'INSERT INTO users (email, password, role, nom_complet) VALUES (?, ?, ?, ?)',
        ['comptable@ecole.com', comptableHash, 'comptable', 'Comptable']
      );
      await database.run(
        'INSERT INTO users (email, password, role, nom_complet, bank_account, bank_name) VALUES (?, ?, ?, ?, ?, ?)',
        ['secretaire@ecole.com', secretaireHash, 'secretariat', 'Secrétaire', '', '']
      );
      
      console.log('✅ Utilisateurs créés (admin@ecole.com / admin123)');
    } else {
      console.warn('⚠️ Fichier init.sql non trouvé dans sql/');
      await createMinimalTables(database);
    }
  } else {
    console.log('✅ Base de données déjà initialisée');
  }
}

async function createMinimalTables(database) {
  const bcrypt = require('bcryptjs');
  const hash = await bcrypt.hash('admin123', 10);
  
  await database.exec(`
    CREATE TABLE IF NOT EXISTS years (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL UNIQUE,
      start_date TEXT,
      end_date TEXT,
      is_current INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      nom_complet TEXT,
      student_id INTEGER,
      teacher_id INTEGER,
      bank_account TEXT,
      bank_name TEXT,
      tax_id TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    INSERT OR IGNORE INTO users (email, password, role, nom_complet)
    VALUES ('admin@ecole.com', ?, 'admin', 'Administrateur');
  `, [hash]);
  
  console.log('✅ Tables minimales créées');
}

module.exports = { query, getDb, initDatabase };