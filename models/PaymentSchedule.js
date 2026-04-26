const { query } = require('../config/db');

class PaymentSchedule {
    static async findAll() {
        const { rows } = await query(`
            SELECT ps.*, c.name as class_name, y.label as year_label
            FROM payment_schedules ps
            LEFT JOIN classes c ON ps.class_id = c.id
            LEFT JOIN years y ON ps.year_id = y.id
            ORDER BY ps.due_date
        `);
        return rows;
    }

    static async findById(id) {
        const { rows } = await query(`SELECT * FROM payment_schedules WHERE id = ?`, [id]);
        return rows[0];
    }

    static async create({ class_id, year_id, description, amount, due_date }) {
        const sql = `
            INSERT INTO payment_schedules (class_id, year_id, description, amount, due_date)
            VALUES (?, ?, ?, ?, ?)
        `;
        const result = await query(sql, [class_id || null, year_id || null, description, amount, due_date]);
        const { rows } = await query('SELECT * FROM payment_schedules WHERE id = ?', [result.lastId]);
        return rows[0];
    }

    static async update(id, { class_id, year_id, description, amount, due_date }) {
        const sql = `
            UPDATE payment_schedules
            SET class_id = COALESCE(?, class_id),
                year_id = COALESCE(?, year_id),
                description = COALESCE(?, description),
                amount = COALESCE(?, amount),
                due_date = COALESCE(?, due_date)
            WHERE id = ?
        `;
        await query(sql, [class_id, year_id, description, amount, due_date, id]);
        const { rows } = await query('SELECT * FROM payment_schedules WHERE id = ?', [id]);
        return rows[0];
    }

    static async delete(id) {
        await query(`DELETE FROM payment_schedules WHERE id = ?`, [id]);
        return { id };
    }

    static async getOverduePayments() {
        const { rows } = await query(`
            SELECT ps.*, s.first_name, s.last_name, e.id as enrollment_id
            FROM payment_schedules ps
            JOIN enrollments e ON (ps.class_id IS NULL OR e.class_id = ps.class_id) 
                               AND (ps.year_id IS NULL OR e.year_id = ps.year_id)
            JOIN students s ON e.student_id = s.id
            WHERE ps.due_date < date('now')
              AND NOT EXISTS (
                  SELECT 1 FROM payments p WHERE p.schedule_id = ps.id AND p.enrollment_id = e.id
              )
              AND e.status = 'actif'
            ORDER BY ps.due_date
        `);
        return rows;
    }
}

module.exports = PaymentSchedule;