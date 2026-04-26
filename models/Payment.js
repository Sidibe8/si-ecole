const { query } = require('../config/db');

class Payment {
    static async findAll() {
        const sql = `
            SELECT p.*, s.first_name, s.last_name, y.label as year_label
            FROM payments p
            JOIN enrollments e ON p.enrollment_id = e.id
            JOIN students s ON e.student_id = s.id
            JOIN years y ON e.year_id = y.id
            ORDER BY p.payment_date DESC
        `;
        const { rows } = await query(sql);
        return rows;
    }

    static async findByEnrollment(enrollmentId) {
        const sql = `
            SELECT p.*, ps.description as schedule_description
            FROM payments p
            LEFT JOIN payment_schedules ps ON p.schedule_id = ps.id
            WHERE p.enrollment_id = ?
            ORDER BY p.payment_date DESC
        `;
        const { rows } = await query(sql, [enrollmentId]);
        return rows;
    }

    static async create({ enrollment_id, schedule_id, amount, payment_date, payment_method, receipt_number, notes }) {
        const sql = `
            INSERT INTO payments (enrollment_id, schedule_id, amount, payment_date, payment_method, receipt_number, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [enrollment_id, schedule_id, amount, payment_date, payment_method, receipt_number, notes];
        const result = await query(sql, params);
        const { rows } = await query('SELECT * FROM payments WHERE id = ?', [result.lastId]);
        return rows[0];
    }

    static async update(id, { amount, payment_date, payment_method, receipt_number, notes }) {
        const sql = `
            UPDATE payments
            SET amount = COALESCE(?, amount),
                payment_date = COALESCE(?, payment_date),
                payment_method = COALESCE(?, payment_method),
                receipt_number = COALESCE(?, receipt_number),
                notes = COALESCE(?, notes)
            WHERE id = ?
        `;
        const params = [amount, payment_date, payment_method, receipt_number, notes, id];
        await query(sql, params);
        const { rows } = await query('SELECT * FROM payments WHERE id = ?', [id]);
        return rows[0];
    }

    static async delete(id) {
        const sql = `DELETE FROM payments WHERE id = ?`;
        await query(sql, [id]);
        return { id };
    }
}

module.exports = Payment;