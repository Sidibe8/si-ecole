const Enrollment = require('../models/Enrollment');

exports.getAllEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll();
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEnrollmentById = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) return res.status(404).json({ message: 'Inscription non trouvée' });
    res.json(enrollment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEnrollmentsByStudent = async (req, res) => {
  try {
    const enrollments = await Enrollment.findByStudent(req.params.studentId);
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEnrollmentsByClassAndYear = async (req, res) => {
  try {
    const { classId, yearId } = req.query;
    if (!classId || !yearId) return res.status(400).json({ message: 'classId et yearId requis' });
    const enrollments = await Enrollment.findByClassAndYear(classId, yearId);
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createEnrollment = async (req, res) => {
  try {
    const { student_id, class_id, year_id, enrollment_date, status } = req.body;
    if (!student_id || !class_id || !year_id) return res.status(400).json({ message: 'student_id, class_id, year_id requis' });
    const newEnrollment = await Enrollment.create({ student_id, class_id, year_id, enrollment_date, status });
    res.status(201).json(newEnrollment);
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      return res.status(409).json({ message: 'Cet élève est déjà inscrit pour cette année' });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.updateEnrollment = async (req, res) => {
  try {
    const updated = await Enrollment.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Inscription non trouvée' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteEnrollment = async (req, res) => {
  try {
    await Enrollment.delete(req.params.id);
    res.json({ message: 'Inscription supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.bulkPromote = async (req, res) => {
  try {
    const { fromYearId, toYearId } = req.body;
    if (!fromYearId || !toYearId) return res.status(400).json({ message: 'fromYearId et toYearId requis' });
    
    const { query } = require('../config/db');
    
    // Réinscrire les élèves actifs dans la classe supérieure pour la nouvelle année
    const sql = `
      INSERT INTO enrollments (student_id, class_id, year_id, enrollment_date, status)
      SELECT e.student_id, c2.id, ?, date('now'), 'actif'
      FROM enrollments e
      JOIN classes c1 ON e.class_id = c1.id
      JOIN classes c2 ON c2.level_order = c1.level_order + 1
      WHERE e.year_id = ? AND e.status = 'actif'
        AND NOT EXISTS (
          SELECT 1 FROM enrollments e2 
          WHERE e2.student_id = e.student_id AND e2.year_id = ?
        )
    `;
    await query(sql, [toYearId, fromYearId, toYearId]);
    
    res.json({ message: 'Réinscription massive effectuée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};