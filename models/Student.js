const { query } = require('../config/db');

class Student {
    static async findAll() {
        const sql = `SELECT * FROM students ORDER BY last_name, first_name`;
        const { rows } = await query(sql);
        return rows;
    }

    static async findById(id) {
        const sql = `SELECT * FROM students WHERE id = ?`;
        const { rows } = await query(sql, [id]);
        return rows[0];
    }

    static async create({ first_name, last_name, birth_date, photo_url, parent_phone, parent_email, address }) {
        const sql = `
            INSERT INTO students (first_name, last_name, birth_date, photo_url, parent_phone, parent_email, address)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [first_name, last_name, birth_date, photo_url, parent_phone, parent_email, address];
        const result = await query(sql, params);
        const { rows } = await query('SELECT * FROM students WHERE id = ?', [result.lastId]);
        return rows[0];
    }

    static async update(id, { first_name, last_name, birth_date, photo_url, parent_phone, parent_email, address }) {
        const sql = `
            UPDATE students
            SET first_name = COALESCE(?, first_name),
                last_name = COALESCE(?, last_name),
                birth_date = COALESCE(?, birth_date),
                photo_url = COALESCE(?, photo_url),
                parent_phone = COALESCE(?, parent_phone),
                parent_email = COALESCE(?, parent_email),
                address = COALESCE(?, address),
                updated_at = datetime('now')
            WHERE id = ?
        `;
        const params = [first_name, last_name, birth_date, photo_url, parent_phone, parent_email, address, id];
        await query(sql, params);
        const { rows } = await query('SELECT * FROM students WHERE id = ?', [id]);
        return rows[0];
    }

    static async delete(id) {
        const sql = `DELETE FROM students WHERE id = ?`;
        await query(sql, [id]);
        return { id };
    }
}

module.exports = Student;