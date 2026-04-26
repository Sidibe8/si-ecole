const { query } = require('../config/db');

class Grade {
    static async findAll() {
    const { rows } = await query(`
        SELECT g.*, s.first_name, s.last_name, sub.name as subject_name,
               e.class_id, c.name as class_name
        FROM grades g
        JOIN students s ON g.student_id = s.id
        JOIN subjects sub ON g.subject_id = sub.id
        LEFT JOIN enrollments e ON e.student_id = s.id AND e.status = 'actif'
        LEFT JOIN classes c ON e.class_id = c.id
        ORDER BY g.id DESC
    `);
    return rows;
}

    static async findById(id) {
        const { rows } = await query(`SELECT * FROM grades WHERE id = ?`, [id]);
        return rows[0];
    }

    static async findByStudent(studentId) {
        const { rows } = await query(
            `SELECT * FROM grades WHERE student_id = ? ORDER BY period_id, subject_id`,
            [studentId]
        );
        return rows;
    }

   static async findByClassAndPeriod(classId, periodId) {
    const { rows } = await query(
        `SELECT g.*, s.first_name, s.last_name, sub.name as subject_name,
                e.class_id, c.name as class_name
         FROM grades g
         JOIN students s ON g.student_id = s.id
         JOIN subjects sub ON g.subject_id = sub.id
         JOIN enrollments e ON e.student_id = s.id AND e.class_id = ?
         JOIN classes c ON e.class_id = c.id
         WHERE g.period_id = ? AND e.status = 'actif'
         ORDER BY s.last_name, s.first_name, sub.name`,
        [classId, periodId]
    );
    return rows;
}

    static async create({ student_id, subject_id, period_id, evaluation_name, evaluation_date, value, evaluation_coefficient }) {
        const sql = `
            INSERT INTO grades (student_id, subject_id, period_id, evaluation_name, evaluation_date, value, evaluation_coefficient)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [student_id, subject_id, period_id, evaluation_name, evaluation_date, value, evaluation_coefficient || 1];
        const result = await query(sql, params);
        const { rows } = await query('SELECT * FROM grades WHERE id = ?', [result.lastId]);
        return rows[0];
    }

    static async update(id, { evaluation_name, evaluation_date, value, evaluation_coefficient }) {
        const sql = `
            UPDATE grades
            SET evaluation_name = COALESCE(?, evaluation_name),
                evaluation_date = COALESCE(?, evaluation_date),
                value = COALESCE(?, value),
                evaluation_coefficient = COALESCE(?, evaluation_coefficient),
                updated_at = datetime('now')
            WHERE id = ?
        `;
        const params = [evaluation_name, evaluation_date, value, evaluation_coefficient, id];
        await query(sql, params);
        const { rows } = await query('SELECT * FROM grades WHERE id = ?', [id]);
        return rows[0];
    }

    static async delete(id) {
        await query(`DELETE FROM grades WHERE id = ?`, [id]);
        return { id };
    }
}

module.exports = Grade;