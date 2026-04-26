const { query } = require('../config/db');

class Subject {
    static async findAll() {
        const { rows } = await query(`
            SELECT s.*, c.name as class_name
            FROM subjects s
            JOIN classes c ON s.class_id = c.id
            ORDER BY c.level_order, s.name
        `);
        return rows;
    }

    static async findById(id) {
        const { rows } = await query(`
            SELECT s.*, c.name as class_name
            FROM subjects s
            JOIN classes c ON s.class_id = c.id
            WHERE s.id = ?
        `, [id]);
        return rows[0];
    }

    static async findByClass(classId) {
        const { rows } = await query(
            `SELECT * FROM subjects WHERE class_id = ? ORDER BY name`,
            [classId]
        );
        return rows;
    }

    static async create({ name, coefficient, class_id }) {
        const sql = `INSERT INTO subjects (name, coefficient, class_id) VALUES (?, ?, ?)`;
        const result = await query(sql, [name, coefficient, class_id]);
        const { rows } = await query('SELECT * FROM subjects WHERE id = ?', [result.lastId]);
        return rows[0];
    }

    static async update(id, { name, coefficient, class_id }) {
        const sql = `
            UPDATE subjects
            SET name = COALESCE(?, name),
                coefficient = COALESCE(?, coefficient),
                class_id = COALESCE(?, class_id)
            WHERE id = ?
        `;
        await query(sql, [name, coefficient, class_id, id]);
        const { rows } = await query('SELECT * FROM subjects WHERE id = ?', [id]);
        return rows[0];
    }

    static async delete(id) {
        await query(`DELETE FROM subjects WHERE id = ?`, [id]);
        return { id };
    }
}

module.exports = Subject;