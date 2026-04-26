const { query } = require('../config/db');

class AdminContract {
    static async findAll() {
        const { rows } = await query(`
            SELECT ac.*, u.nom_complet, u.email, u.role, y.label as year_label
            FROM admin_contracts ac
            JOIN users u ON ac.user_id = u.id
            JOIN years y ON ac.year_id = y.id
            ORDER BY y.start_date DESC, u.nom_complet
        `);
        return rows;
    }

    static async findById(id) {
        const { rows } = await query(`SELECT * FROM admin_contracts WHERE id = ?`, [id]);
        return rows[0];
    }

    static async findByUser(userId) {
        const { rows } = await query(`
            SELECT ac.*, y.label as year_label
            FROM admin_contracts ac
            JOIN years y ON ac.year_id = y.id
            WHERE ac.user_id = ?
            ORDER BY y.start_date DESC
        `, [userId]);
        return rows;
    }

    static async create({ user_id, year_id, base_salary, contract_type, position, start_date, end_date }) {
        const sql = `
            INSERT OR REPLACE INTO admin_contracts (user_id, year_id, base_salary, contract_type, position, start_date, end_date)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const result = await query(sql, [user_id, year_id, base_salary, contract_type || 'cdi', position, start_date, end_date]);
        const { rows } = await query('SELECT * FROM admin_contracts WHERE id = ?', [result.lastId]);
        return rows[0];
    }

    static async update(id, { base_salary, contract_type, position, start_date, end_date, status }) {
        const sql = `
            UPDATE admin_contracts
            SET base_salary = COALESCE(?, base_salary),
                contract_type = COALESCE(?, contract_type),
                position = COALESCE(?, position),
                start_date = COALESCE(?, start_date),
                end_date = COALESCE(?, end_date),
                status = COALESCE(?, status),
                updated_at = datetime('now')
            WHERE id = ?
        `;
        await query(sql, [base_salary, contract_type, position, start_date, end_date, status, id]);
        const { rows } = await query('SELECT * FROM admin_contracts WHERE id = ?', [id]);
        return rows[0];
    }

    static async delete(id) {
        await query(`DELETE FROM admin_contracts WHERE id = ?`, [id]);
        return { id };
    }
}

module.exports = AdminContract;