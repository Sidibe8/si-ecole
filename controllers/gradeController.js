const Grade = require('../models/Grade');

exports.getAllGrades = async (req, res) => {
  try {
    const grades = await Grade.findAll();
    res.json(grades);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getGradeById = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);
    if (!grade) return res.status(404).json({ message: 'Note non trouvée' });
    res.json(grade);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getGradesByStudent = async (req, res) => {
  try {
    const grades = await Grade.findByStudent(req.params.studentId);
    res.json(grades);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getGradesByClassPeriod = async (req, res) => {
  try {
    const { classId, periodId } = req.query;
    if (!classId || !periodId) return res.status(400).json({ message: 'classId et periodId requis' });
    const grades = await Grade.findByClassAndPeriod(classId, periodId);
    res.json(grades);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createGrade = async (req, res) => {
  try {
    const { student_id, subject_id, period_id, evaluation_name, evaluation_date, value, evaluation_coefficient } = req.body;
    if (!student_id || !subject_id || !period_id || !evaluation_name || value === undefined) {
      return res.status(400).json({ message: 'Champs requis manquants' });
    }
    const newGrade = await Grade.create({ student_id, subject_id, period_id, evaluation_name, evaluation_date, value, evaluation_coefficient });
    res.status(201).json(newGrade);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateGrade = async (req, res) => {
  try {
    const updated = await Grade.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Note non trouvée' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteGrade = async (req, res) => {
  try {
    await Grade.delete(req.params.id);
    res.json({ message: 'Note supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};