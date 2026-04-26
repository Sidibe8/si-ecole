const { query } = require('../config/db');

exports.getAllAbsences = async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT a.*, s.first_name, s.last_name, c.name as class_name, y.label as year_label
      FROM absences a
      JOIN enrollments e ON a.enrollment_id = e.id
      JOIN students s ON e.student_id = s.id
      JOIN classes c ON e.class_id = c.id
      JOIN years y ON e.year_id = y.id
      ORDER BY a.absence_date DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAbsenceById = async (req, res) => {
  try {
    const { rows } = await query(`SELECT * FROM absences WHERE id = ?`, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Absence non trouvée' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAbsencesByEnrollment = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT * FROM absences WHERE enrollment_id = ? ORDER BY absence_date DESC`,
      [req.params.enrollmentId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createAbsence = async (req, res) => {
  try {
    const { enrollment_id, absence_date, is_justified, justification } = req.body;
    if (!enrollment_id || !absence_date) {
      return res.status(400).json({ message: 'enrollment_id et absence_date requis' });
    }
    const sql = `INSERT INTO absences (enrollment_id, absence_date, is_justified, justification) VALUES (?, ?, ?, ?)`;
    const result = await query(sql, [enrollment_id, absence_date, is_justified ? 1 : 0, justification || null]);
    const { rows } = await query('SELECT * FROM absences WHERE id = ?', [result.lastId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateAbsence = async (req, res) => {
  try {
    const { absence_date, is_justified, justification } = req.body;
    const sql = `
      UPDATE absences
      SET absence_date = COALESCE(?, absence_date),
          is_justified = COALESCE(?, is_justified),
          justification = COALESCE(?, justification)
      WHERE id = ?
    `;
    const isJustified = is_justified !== undefined ? (is_justified ? 1 : 0) : undefined;
    await query(sql, [absence_date, isJustified, justification, req.params.id]);
    const { rows } = await query('SELECT * FROM absences WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Absence non trouvée' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteAbsence = async (req, res) => {
  try {
    await query(`DELETE FROM absences WHERE id = ?`, [req.params.id]);
    res.json({ message: 'Absence supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};