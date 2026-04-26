// models/User.js
const { query } = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
    static async create({ email, password, role, nom_complet, student_id = null, teacher_id = null, bank_account = null, bank_name = null, tax_id = null }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = `
            INSERT INTO users (email, password, role, nom_complet, student_id, teacher_id, bank_account, bank_name, tax_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [email, hashedPassword, role, nom_complet, student_id, teacher_id, bank_account, bank_name, tax_id];
        const result = await query(sql, params);

        // SQLite : pas de RETURNING
        const { rows } = await query(
            `SELECT id, email, role, nom_complet, student_id, teacher_id, bank_account, bank_name, tax_id, created_at 
             FROM users WHERE id = ?`,
            [result.lastId]
        );
        return rows[0];
    }

    static async findByEmail(email) {
        const sql = `SELECT * FROM users WHERE email = ?`;
        const { rows } = await query(sql, [email]);
        return rows[0];
    }

    static async findById(id) {
        const sql = `
            SELECT id, email, role, nom_complet, student_id, teacher_id, 
                   bank_account, bank_name, tax_id, created_at 
            FROM users WHERE id = ?
        `;
        const { rows } = await query(sql, [id]);
        return rows[0];
    }

    static async comparePassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    static async findAll() {
        const sql = `
            SELECT id, email, role, nom_complet, student_id, teacher_id, 
                   bank_account, bank_name, tax_id, created_at 
            FROM users ORDER BY created_at DESC
        `;
        const { rows } = await query(sql);
        return rows;
    }

    static async delete(id) {
        const sql = `DELETE FROM users WHERE id = ?`;
        await query(sql, [id]);
        return { id };
    }
}

module.exports = User;