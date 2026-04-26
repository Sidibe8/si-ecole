const { query } = require('../config/db');

class Period {
    static async findAll() {
        const { rows } = await query(`
            SELECT p.*, y.label as year_label
            FROM periods p
            JOIN years y ON p.year_id = y.id
            ORDER BY y.start_date, p.start_date
        `);
        return rows;
    }

    static async findById(id) {
        const { rows } = await query(`
            SELECT p.*, y.label as year_label
            FROM periods p
            JOIN years y ON p.year_id = y.id
            WHERE p.id = ?
        `, [id]);
        return rows[0];
    }

    static async findByYear(yearId) {
        const { rows } = await query(
            `SELECT * FROM periods WHERE year_id = ? ORDER BY start_date`,
            [yearId]
        );
        return rows;
    }

    static async create({ year_id, name, start_date, end_date }) {
        const sql = `INSERT INTO periods (year_id, name, start_date, end_date) VALUES (?, ?, ?, ?)`;
        const result = await query(sql, [year_id, name, start_date, end_date]);
        const { rows } = await query('SELECT * FROM periods WHERE id = ?', [result.lastId]);
        return rows[0];
    }

    static async update(id, { name, start_date, end_date }) {
        const sql = `
            UPDATE periods
            SET name = COALESCE(?, name),
                start_date = COALESCE(?, start_date),
                end_date = COALESCE(?, end_date)
            WHERE id = ?
        `;
        await query(sql, [name, start_date, end_date, id]);
        const { rows } = await query('SELECT * FROM periods WHERE id = ?', [id]);
        return rows[0];
    }

    static async delete(id) {
        await query(`DELETE FROM periods WHERE id = ?`, [id]);
        return { id };
    }
}

module.exports = Period;