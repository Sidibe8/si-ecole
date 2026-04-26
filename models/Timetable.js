const { query } = require('../config/db');

class Timetable {
    static async findAll() {
        const { rows } = await query(`
            SELECT t.*, c.name as class_name, sub.name as subject_name, tc.first_name, tc.last_name
            FROM timetables t
            JOIN classes c ON t.class_id = c.id
            JOIN subjects sub ON t.subject_id = sub.id
            JOIN teachers tc ON t.teacher_id = tc.id
            ORDER BY t.class_id, t.day_of_week, t.start_time
        `);
        return rows;
    }

    static async findById(id) {
        const { rows } = await query(`SELECT * FROM timetables WHERE id = ?`, [id]);
        return rows[0];
    }

    static async findByClass(classId) {
        const { rows } = await query(`
            SELECT t.*, sub.name as subject_name, tc.first_name, tc.last_name
            FROM timetables t
            JOIN subjects sub ON t.subject_id = sub.id
            JOIN teachers tc ON t.teacher_id = tc.id
            WHERE t.class_id = ?
            ORDER BY t.day_of_week, t.start_time
        `, [classId]);
        return rows;
    }

    static async create({ class_id, subject_id, teacher_id, day_of_week, start_time, end_time }) {
        const sql = `
            INSERT INTO timetables (class_id, subject_id, teacher_id, day_of_week, start_time, end_time)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const result = await query(sql, [class_id, subject_id, teacher_id, day_of_week, start_time, end_time]);
        const { rows } = await query('SELECT * FROM timetables WHERE id = ?', [result.lastId]);
        return rows[0];
    }

    static async update(id, { class_id, subject_id, teacher_id, day_of_week, start_time, end_time }) {
        const sql = `
            UPDATE timetables
            SET class_id = COALESCE(?, class_id),
                subject_id = COALESCE(?, subject_id),
                teacher_id = COALESCE(?, teacher_id),
                day_of_week = COALESCE(?, day_of_week),
                start_time = COALESCE(?, start_time),
                end_time = COALESCE(?, end_time)
            WHERE id = ?
        `;
        await query(sql, [class_id, subject_id, teacher_id, day_of_week, start_time, end_time, id]);
        const { rows } = await query('SELECT * FROM timetables WHERE id = ?', [id]);
        return rows[0];
    }

    static async delete(id) {
        await query(`DELETE FROM timetables WHERE id = ?`, [id]);
        return { id };
    }
}

module.exports = Timetable;