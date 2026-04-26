// models/TeacherContract.js
const { query } = require('../config/db');

class TeacherContract {
  static async findAll() {
    const { rows } = await query(`
      SELECT tc.*, t.first_name, t.last_name, t.email, y.label as year_label
      FROM teacher_contracts tc
      JOIN teachers t ON tc.teacher_id = t.id
      JOIN years y ON tc.year_id = y.id
      ORDER BY y.start_date DESC, t.last_name
    `);
    return rows;
  }

  static async findById(id) {
    const { rows } = await query(`
      SELECT tc.*, t.first_name, t.last_name, t.email, y.label as year_label
      FROM teacher_contracts tc
      JOIN teachers t ON tc.teacher_id = t.id
      JOIN years y ON tc.year_id = y.id
      WHERE tc.id = ?
    `, [id]);
    return rows[0];
  }

  static async findByTeacher(teacherId) {
    const { rows } = await query(`
      SELECT tc.*, y.label as year_label
      FROM teacher_contracts tc
      JOIN years y ON tc.year_id = y.id
      WHERE tc.teacher_id = ?
      ORDER BY y.start_date DESC
    `, [teacherId]);
    return rows;
  }

  static async create({ teacher_id, year_id, base_salary, contract_type, hours_per_month, hourly_rate, start_date, end_date }) {
    const sql = `
      INSERT INTO teacher_contracts (teacher_id, year_id, base_salary, contract_type, hours_per_month, hourly_rate, start_date, end_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      teacher_id, year_id, base_salary,
      contract_type || 'mensuel',
      hours_per_month || 0,
      hourly_rate || 0,
      start_date, end_date
    ];
    const result = await query(sql, params);
    const { rows } = await query('SELECT * FROM teacher_contracts WHERE id = ?', [result.lastId]);
    return rows[0];
  }

  static async update(id, fields) {
    const allowedFields = ['base_salary', 'contract_type', 'hours_per_month', 'hourly_rate', 'start_date', 'end_date', 'status'];
    const setClauses = [];
    const values = [];

    for (const key of allowedFields) {
      if (fields[key] !== undefined) {
        setClauses.push(`${key} = ?`);
        values.push(fields[key]);
      }
    }

    if (setClauses.length === 0) return null;

    setClauses.push(`updated_at = datetime('now')`);
    values.push(id);

    await query(`UPDATE teacher_contracts SET ${setClauses.join(', ')} WHERE id = ?`, values);
    const { rows } = await query('SELECT * FROM teacher_contracts WHERE id = ?', [id]);
    return rows[0];
  }

  static async delete(id) {
    await query(`DELETE FROM teacher_contracts WHERE id = ?`, [id]);
    return { id };
  }
}

module.exports = TeacherContract;