const { query } = require('../config/db');

class Enrollment {
    static async findAll() {
        const sql = `
            SELECT e.*, s.first_name, s.last_name, c.name as class_name, y.label as year_label
            FROM enrollments e
            JOIN students s ON e.student_id = s.id
            JOIN classes c ON e.class_id = c.id
            JOIN years y ON e.year_id = y.id
            ORDER BY y.start_date DESC, s.last_name
        `;
        const { rows } = await query(sql);
        return rows;
    }

    static async findById(id) {
        const sql = `
            SELECT e.*, s.first_name, s.last_name, c.name as class_name, y.label as year_label
            FROM enrollments e
            JOIN students s ON e.student_id = s.id
            JOIN classes c ON e.class_id = c.id
            JOIN years y ON e.year_id = y.id
            WHERE e.id = ?
        `;
        const { rows } = await query(sql, [id]);
        return rows[0];
    }

    static async findByStudent(studentId) {
        const sql = `
            SELECT e.*, c.name as class_name, y.label as year_label
            FROM enrollments e
            JOIN classes c ON e.class_id = c.id
            JOIN years y ON e.year_id = y.id
            WHERE e.student_id = ?
            ORDER BY y.start_date DESC
        `;
        const { rows } = await query(sql, [studentId]);
        return rows;
    }

    static async findByClassAndYear(classId, yearId) {
        const sql = `
            SELECT e.*, s.first_name, s.last_name
            FROM enrollments e
            JOIN students s ON e.student_id = s.id
            WHERE e.class_id = ? AND e.year_id = ?
            ORDER BY s.last_name
        `;
        const { rows } = await query(sql, [classId, yearId]);
        return rows;
    }

    static async create({ student_id, class_id, year_id, enrollment_date, status }) {
        const sql = `
            INSERT INTO enrollments (student_id, class_id, year_id, enrollment_date, status)
            VALUES (?, ?, ?, ?, ?)
        `;
        const params = [student_id, class_id, year_id, enrollment_date || new Date().toISOString().split('T')[0], status || 'actif'];
        const result = await query(sql, params);
        const { rows } = await query('SELECT * FROM enrollments WHERE id = ?', [result.lastId]);
        return rows[0];
    }

    static async update(id, { status }) {
        const sql = `UPDATE enrollments SET status = ? WHERE id = ?`;
        await query(sql, [status, id]);
        const { rows } = await query('SELECT * FROM enrollments WHERE id = ?', [id]);
        return rows[0];
    }

    static async delete(id) {
        const sql = `DELETE FROM enrollments WHERE id = ?`;
        await query(sql, [id]);
        return { id };
    }
}

module.exports = Enrollment;