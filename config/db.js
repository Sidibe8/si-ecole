// config/db.js
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'database', 'gestion_ecole.sqlite');

let db;

async function getDb() {
  if (!db) {
    // Créer le dossier database s'il n'existe pas
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    await db.run('PRAGMA foreign_keys = ON');
    await db.run('PRAGMA journal_mode = WAL');

    console.log(`Base de données connectée : ${dbPath}`);
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
    console.log('Initialisation de la base de données...');
    
    const initScript = path.join(__dirname, '..', 'database', 'init.sql');
    
    if (fs.existsSync(initScript)) {
      const sql = fs.readFileSync(initScript, 'utf8');
      await database.exec(sql);
      console.log('Tables créées et données initiales insérées');
    } else {
      console.warn('Fichier init.sql non trouvé, création des tables minimale...');
      await createMinimalTables(database);
    }
  } else {
    console.log('Base de données déjà initialisée');
  }
}

async function createMinimalTables(database) {
  // Création rapide des tables essentielles si pas de init.sql
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
    VALUES ('admin@ecole.com', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf9Nq6Y0GJ5LfB7KqO1N1FqJy3Ee', 'admin', 'Administrateur');
  `);
}

module.exports = { query, getDb, initDatabase };