// models/Teacher.js
const { query } = require('../config/db');

class Teacher {
  static async findAll() {
    const sql = `SELECT * FROM teachers ORDER BY last_name, first_name`;
    const { rows } = await query(sql);
    return rows;
  }

  static async findById(id) {
    const sql = `SELECT * FROM teachers WHERE id = ?`;
    const { rows } = await query(sql, [id]);
    return rows[0];
  }

  static async create({ first_name, last_name, birth_date, phone, email, address, hire_date, status, photo_url, category, bank_account, bank_name, tax_id, social_security_number }) {
    const sql = `
      INSERT INTO teachers (first_name, last_name, birth_date, phone, email, address, hire_date, status, photo_url, category, bank_account, bank_name, tax_id, social_security_number)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [first_name, last_name, birth_date, phone, email, address, hire_date, status || 'actif', photo_url, category || 'teacher', bank_account, bank_name, tax_id, social_security_number];
    
    const result = await query(sql, params);
    
    // Récupérer l'enregistrement créé
    const { rows } = await query('SELECT * FROM teachers WHERE id = ?', [result.lastId]);
    return rows[0];
  }

  static async update(id, fields) {
    const allowedFields = ['first_name', 'last_name', 'birth_date', 'phone', 'email', 'address', 'hire_date', 'status', 'photo_url', 'category', 'bank_account', 'bank_name', 'tax_id', 'social_security_number'];
    
    const setClauses = [];
    const params = [];

    for (const key of allowedFields) {
      if (fields[key] !== undefined) {
        setClauses.push(`${key} = ?`);
        params.push(fields[key]);
      }
    }

    if (setClauses.length === 0) return null;

    setClauses.push(`updated_at = datetime('now')`);
    params.push(id);

    const sql = `UPDATE teachers SET ${setClauses.join(', ')} WHERE id = ?`;
    await query(sql, params);

    const { rows } = await query('SELECT * FROM teachers WHERE id = ?', [id]);
    return rows[0];
  }

  static async delete(id) {
    const sql = `DELETE FROM teachers WHERE id = ?`;
    await query(sql, [id]);
    return { id };
  }
}

module.exports = Teacher;