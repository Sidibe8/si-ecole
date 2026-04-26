// models/Year.js
const { query } = require('../config/db');

class Year {
    static async findAll() {
        const sql = `SELECT * FROM years ORDER BY start_date DESC`;
        const { rows } = await query(sql);
        return rows;
    }

    static async findById(id) {
        const sql = `SELECT * FROM years WHERE id = ?`;
        const { rows } = await query(sql, [id]);
        return rows[0];
    }

    static async getCurrent() {
        const sql = `SELECT * FROM years WHERE is_current = 1 LIMIT 1`;
        const { rows } = await query(sql);
        return rows[0];
    }

    static async create({ label, start_date, end_date, is_current }) {
        const isCurrent = is_current ? 1 : 0;

        // Si c'est l'année courante, désactiver les autres
        if (isCurrent) {
            await query(`UPDATE years SET is_current = 0`);
        }

        const sql = `
            INSERT INTO years (label, start_date, end_date, is_current)
            VALUES (?, ?, ?, ?)
        `;
        const params = [label, start_date, end_date, isCurrent];
        const result = await query(sql, params);

        // SQLite ne supporte pas RETURNING, on refait un SELECT
        const { rows } = await query('SELECT * FROM years WHERE id = ?', [result.lastId]);
        return rows[0];
    }

    static async update(id, { label, start_date, end_date, is_current }) {
        const isCurrent = is_current ? 1 : 0;

        // Si c'est l'année courante, désactiver les autres
        if (isCurrent) {
            await query(`UPDATE years SET is_current = 0`);
        }

        const sql = `
            UPDATE years
            SET label = ?, start_date = ?, end_date = ?, is_current = ?
            WHERE id = ?
        `;
        const params = [label, start_date, end_date, isCurrent, id];
        await query(sql, params);

        // Récupérer l'enregistrement modifié
        const { rows } = await query('SELECT * FROM years WHERE id = ?', [id]);
        return rows[0];
    }

    static async delete(id) {
        const sql = `DELETE FROM years WHERE id = ?`;
        await query(sql, [id]);
        return { id };
    }
}

module.exports = Year;