const { query } = require('../config/db');

class Class {
    static async findAll() {
        const sql = `SELECT * FROM classes ORDER BY level_order`;
        const { rows } = await query(sql);
        return rows;
    }

    static async findById(id) {
        const sql = `SELECT * FROM classes WHERE id = ?`;
        const { rows } = await query(sql, [id]);
        return rows[0];
    }

    static async create({ name, level_order, fees }) {
        const sql = `INSERT INTO classes (name, level_order, fees) VALUES (?, ?, ?)`;
        const params = [name, level_order, fees || 0];
        const result = await query(sql, params);
        const { rows } = await query('SELECT * FROM classes WHERE id = ?', [result.lastId]);
        return rows[0];
    }

    static async update(id, { name, level_order, fees }) {
        const sql = `
            UPDATE classes
            SET name = COALESCE(?, name),
                level_order = COALESCE(?, level_order),
                fees = COALESCE(?, fees)
            WHERE id = ?
        `;
        const params = [name, level_order, fees, id];
        await query(sql, params);
        const { rows } = await query('SELECT * FROM classes WHERE id = ?', [id]);
        return rows[0];
    }

    static async delete(id) {
        const sql = `DELETE FROM classes WHERE id = ?`;
        await query(sql, [id]);
        return { id };
    }
}

module.exports = Class;