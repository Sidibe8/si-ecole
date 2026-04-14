// controllers/gradeController.js
const Grade = require('../models/Grade');
const Enrollment = require('../models/Enrollment');

exports.getAllGrades = async (req, res) => {
  try {
    const grades = await Grade.find()
      .populate('student_id', 'first_name last_name')
      .populate('subject_id', 'name')
      .sort({ createdAt: -1 });
    res.json(grades);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getGradeById = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id)
      .populate('student_id', 'first_name last_name')
      .populate('subject_id', 'name')
      .populate('period_id', 'name');
      
    if (!grade) {
      return res.status(404).json({ message: 'Note non trouvée' });
    }
    res.json(grade);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getGradesByStudent = async (req, res) => {
  try {
    const grades = await Grade.find({ student_id: req.params.studentId })
      .populate('subject_id', 'name')
      .populate('period_id', 'name')
      .sort({ period_id: 1, subject_id: 1 });
    res.json(grades);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getGradesByClassPeriod = async (req, res) => {
  try {
    const { classId, periodId } = req.query;
    if (!classId || !periodId) {
      return res.status(400).json({ message: 'classId et periodId requis' });
    }
    
    // Trouver tous les élèves de cette classe
    const enrollments = await Enrollment.find({
      class_id: classId,
      status: 'actif'
    });
    
    const studentIds = enrollments.map(e => e.student_id);
    
    const grades = await Grade.find({
      student_id: { $in: studentIds },
      period_id: periodId
    })
      .populate('student_id', 'first_name last_name')
      .populate('subject_id', 'name')
      .sort({ 'student_id.last_name': 1, 'student_id.first_name': 1, 'subject_id.name': 1 });
      
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
    
    const grade = new Grade({
      student_id,
      subject_id,
      period_id,
      evaluation_name,
      evaluation_date,
      value,
      evaluation_coefficient
    });
    
    await grade.save();
    
    const populatedGrade = await Grade.findById(grade._id)
      .populate('student_id', 'first_name last_name')
      .populate('subject_id', 'name');
      
    res.status(201).json(populatedGrade);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateGrade = async (req, res) => {
  try {
    const grade = await Grade.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!grade) {
      return res.status(404).json({ message: 'Note non trouvée' });
    }
    res.json(grade);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteGrade = async (req, res) => {
  try {
    await Grade.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};