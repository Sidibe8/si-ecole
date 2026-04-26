-- =====================================================
-- Script d'initialisation complet pour SQLite
-- Base de données : gestion_ecole
-- Auteur : Généré pour le projet Mali
-- Date : 2026-04-08 (mis à jour)
-- =====================================================

PRAGMA foreign_keys = ON;

-- -----------------------------------------------------
-- 1. Années scolaires
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS years (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT NOT NULL UNIQUE,
    start_date TEXT,
    end_date TEXT,
    is_current INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

-- -----------------------------------------------------
-- 2. Classes (niveaux)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    level_order INTEGER NOT NULL,
    fees REAL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

-- -----------------------------------------------------
-- 3. Élèves
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    birth_date TEXT,
    photo_url TEXT,
    parent_phone TEXT,
    parent_email TEXT,
    address TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- -----------------------------------------------------
-- 4. Inscriptions annuelles
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_id INTEGER NOT NULL REFERENCES classes(id),
    year_id INTEGER NOT NULL REFERENCES years(id),
    enrollment_date TEXT DEFAULT (date('now')),
    status TEXT DEFAULT 'actif',
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(student_id, year_id)
);

-- -----------------------------------------------------
-- 5. Matières
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    coefficient REAL NOT NULL DEFAULT 1.0,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    created_at TEXT DEFAULT (datetime('now'))
);

-- -----------------------------------------------------
-- 6. Périodes d'évaluation
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS periods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year_id INTEGER NOT NULL REFERENCES years(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_date TEXT,
    end_date TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- -----------------------------------------------------
-- 7. Notes
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS grades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    period_id INTEGER NOT NULL REFERENCES periods(id) ON DELETE CASCADE,
    evaluation_name TEXT NOT NULL,
    evaluation_date TEXT,
    value REAL NOT NULL,
    evaluation_coefficient REAL DEFAULT 1.0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- -----------------------------------------------------
-- 8. Échéanciers de paiement
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS payment_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    year_id INTEGER REFERENCES years(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    due_date TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

-- -----------------------------------------------------
-- 9. Paiements effectués
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    enrollment_id INTEGER NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    schedule_id INTEGER REFERENCES payment_schedules(id) ON DELETE SET NULL,
    amount REAL NOT NULL,
    payment_date TEXT NOT NULL,
    payment_method TEXT,
    receipt_number TEXT UNIQUE,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- -----------------------------------------------------
-- 10. Professeurs
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS teachers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    birth_date TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    hire_date TEXT,
    status TEXT DEFAULT 'actif',
    photo_url TEXT,
    category TEXT DEFAULT 'teacher',
    bank_account TEXT,
    bank_name TEXT,
    tax_id TEXT,
    social_security_number TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- -----------------------------------------------------
-- 11. Contrats des professeurs
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS teacher_contracts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    year_id INTEGER NOT NULL REFERENCES years(id) ON DELETE CASCADE,
    base_salary REAL NOT NULL,
    contract_type TEXT DEFAULT 'mensuel',
    hours_per_month REAL DEFAULT 0,
    hourly_rate REAL DEFAULT 0,
    start_date TEXT,
    end_date TEXT,
    status TEXT DEFAULT 'actif',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(teacher_id, year_id)
);

-- -----------------------------------------------------
-- 12. Composants du salaire
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS salary_components (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    is_percentage INTEGER DEFAULT 0,
    value REAL NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

-- -----------------------------------------------------
-- 13. Périodes de paie (partagées profs + admin)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS payroll_periods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year_id INTEGER NOT NULL REFERENCES years(id) ON DELETE CASCADE,
    month INTEGER NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    status TEXT DEFAULT 'en_attente',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(year_id, month)
);

-- -----------------------------------------------------
-- 14. Bulletins de paie des professeurs
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS teacher_payroll (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    contract_id INTEGER REFERENCES teacher_contracts(id),
    payroll_period_id INTEGER NOT NULL REFERENCES payroll_periods(id) ON DELETE CASCADE,
    gross_salary REAL NOT NULL DEFAULT 0,
    deductions REAL DEFAULT 0,
    bonuses REAL DEFAULT 0,
    net_salary REAL NOT NULL DEFAULT 0,
    payment_date TEXT,
    status TEXT DEFAULT 'en_attente',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(teacher_id, payroll_period_id)
);

-- -----------------------------------------------------
-- 15. Détail des composants par bulletin prof
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS payroll_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_payroll_id INTEGER NOT NULL REFERENCES teacher_payroll(id) ON DELETE CASCADE,
    component_id INTEGER NOT NULL REFERENCES salary_components(id),
    amount REAL NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

-- -----------------------------------------------------
-- 16. Utilisateurs (personnel admin qui se connecte)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    nom_complet TEXT,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    teacher_id INTEGER REFERENCES teachers(id) ON DELETE CASCADE,
    bank_account TEXT,
    bank_name TEXT,
    tax_id TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- -----------------------------------------------------
-- 17. Contrats du personnel admin
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_contracts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    year_id INTEGER NOT NULL REFERENCES years(id) ON DELETE CASCADE,
    base_salary REAL NOT NULL,
    contract_type TEXT DEFAULT 'cdi',
    position TEXT,
    start_date TEXT,
    end_date TEXT,
    status TEXT DEFAULT 'actif',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, year_id)
);

-- -----------------------------------------------------
-- 18. Bulletins de paie du personnel admin
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_payroll (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contract_id INTEGER REFERENCES admin_contracts(id),
    payroll_period_id INTEGER NOT NULL REFERENCES payroll_periods(id) ON DELETE CASCADE,
    gross_salary REAL NOT NULL DEFAULT 0,
    overtime_hours REAL DEFAULT 0,
    overtime_amount REAL DEFAULT 0,
    deductions REAL DEFAULT 0,
    bonuses REAL DEFAULT 0,
    net_salary REAL NOT NULL DEFAULT 0,
    payment_date TEXT,
    status TEXT DEFAULT 'en_attente',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, payroll_period_id)
);

-- -----------------------------------------------------
-- 19. Cartes étudiantes
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS student_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    enrollment_id INTEGER NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    qr_code TEXT,
    pdf_url TEXT,
    generated_at TEXT DEFAULT (datetime('now'))
);

-- -----------------------------------------------------
-- 20. Absences
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS absences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    enrollment_id INTEGER NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    absence_date TEXT NOT NULL,
    is_justified INTEGER DEFAULT 0,
    justification TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- -----------------------------------------------------
-- 21. Emplois du temps
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS timetables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

-- -----------------------------------------------------
-- Index pour optimiser les requêtes
-- -----------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_class ON enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_year ON enrollments(year_id);
CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_subject ON grades(subject_id);
CREATE INDEX IF NOT EXISTS idx_grades_period ON grades(period_id);
CREATE INDEX IF NOT EXISTS idx_payments_enrollment ON payments(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_teacher_payroll_teacher ON teacher_payroll(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_payroll_period ON teacher_payroll(payroll_period_id);
CREATE INDEX IF NOT EXISTS idx_admin_payroll_user ON admin_payroll(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_payroll_period ON admin_payroll(payroll_period_id);
CREATE INDEX IF NOT EXISTS idx_absences_enrollment ON absences(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_timetables_class ON timetables(class_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_teachers_email ON teachers(email);

-- -----------------------------------------------------
-- Données de base
-- -----------------------------------------------------

-- Admin par défaut (mot de passe: admin123 EN CLAIR)
-- INSERT OR IGNORE INTO users (email, password, role, nom_complet)
-- VALUES ('admin@ecole.com', 'admin123', 'admin', 'Administrateur');

-- Secrétaire par défaut
INSERT OR IGNORE INTO users (email, password, role, nom_complet)
VALUES ('secretaire@ecole.com', 'admin123', 'secretariat', 'Fatoumata Traoré');

-- Comptable par défaut
-- INSERT OR IGNORE INTO users (email, password, role, nom_complet, bank_account, bank_name)
-- VALUES ('comptable@ecole.com', 'admin123', 'comptable', 'Ibrahim Koné', 'ML987654321', 'BIM');
-- -- Année scolaire courante
-- INSERT OR IGNORE INTO years (id, label, start_date, end_date, is_current)
-- VALUES (1, '2025-2026', '2025-09-01', '2026-06-30', 1);

-- Classes
INSERT OR IGNORE INTO classes (id, name, level_order, fees) VALUES (1, '6ème', 1, 50000);
INSERT OR IGNORE INTO classes (id, name, level_order, fees) VALUES (2, '5ème', 2, 55000);
INSERT OR IGNORE INTO classes (id, name, level_order, fees) VALUES (3, '4ème', 3, 55000);
INSERT OR IGNORE INTO classes (id, name, level_order, fees) VALUES (4, '3ème', 4, 60000);

-- Matières
INSERT OR IGNORE INTO subjects (id, name, coefficient, class_id) VALUES (1, 'Mathématiques', 4, 1);
INSERT OR IGNORE INTO subjects (id, name, coefficient, class_id) VALUES (2, 'Français', 4, 1);
INSERT OR IGNORE INTO subjects (id, name, coefficient, class_id) VALUES (3, 'Physique-Chimie', 3, 1);

-- Prof exemple
INSERT OR IGNORE INTO teachers (id, first_name, last_name, email, phone, bank_account, bank_name)
VALUES (1, 'Mamadou', 'Diallo', 'mamadou.diallo@ecole.ml', '76123456', 'ML123456789', 'BNDA');

-- Composants de salaire par défaut
INSERT OR IGNORE INTO salary_components (id, name, type, is_percentage, value)
VALUES (1, 'Salaire de base', 'base', 0, 0);
INSERT OR IGNORE INTO salary_components (id, name, type, is_percentage, value)
VALUES (2, 'Prime de transport', 'prime', 0, 20000);
INSERT OR IGNORE INTO salary_components (id, name, type, is_percentage, value)
VALUES (3, 'CNSS (6%)', 'deduction', 1, 6);
INSERT OR IGNORE INTO salary_components (id, name, type, is_percentage, value)
VALUES (4, 'Heures supplémentaires', 'prime', 0, 0);

-- -----------------------------------------------------
-- Fin du script
-- -----------------------------------------------------