const { query } = require('../config/db');

class Absence {
    static async findAll() {
        const { rows } = await query(`
            SELECT a.*, s.first_name, s.last_name, c.name as class_name, y.label as year_label
            FROM absences a
            JOIN enrollments e ON a.enrollment_id = e.id
            JOIN students s ON e.student_id = s.id
            JOIN classes c ON e.class_id = c.id
            JOIN years y ON e.year_id = y.id
            ORDER BY a.absence_date DESC
        `);
        return rows;
    }

    static async findById(id) {
        const { rows } = await query(`SELECT * FROM absences WHERE id = ?`, [id]);
        return rows[0];
    }

    static async findByEnrollment(enrollmentId) {
        const { rows } = await query(
            `SELECT * FROM absences WHERE enrollment_id = ? ORDER BY absence_date DESC`,
            [enrollmentId]
        );
        return rows;
    }

    static async create({ enrollment_id, absence_date, is_justified, justification }) {
        const sql = `
            INSERT INTO absences (enrollment_id, absence_date, is_justified, justification)
            VALUES (?, ?, ?, ?)
        `;
        const result = await query(sql, [enrollment_id, absence_date, is_justified ? 1 : 0, justification]);
        const { rows } = await query('SELECT * FROM absences WHERE id = ?', [result.lastId]);
        return rows[0];
    }

    static async update(id, { absence_date, is_justified, justification }) {
        const sql = `
            UPDATE absences
            SET absence_date = COALESCE(?, absence_date),
                is_justified = COALESCE(?, is_justified),
                justification = COALESCE(?, justification)
            WHERE id = ?
        `;
        const isJustified = is_justified !== undefined ? (is_justified ? 1 : 0) : undefined;
        await query(sql, [absence_date, isJustified, justification, id]);
        const { rows } = await query('SELECT * FROM absences WHERE id = ?', [id]);
        return rows[0];
    }

    static async delete(id) {
        await query(`DELETE FROM absences WHERE id = ?`, [id]);
        return { id };
    }
}

module.exports = Absence;