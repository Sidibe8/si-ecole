// controllers/enrollmentController.js
const Enrollment = require('../models/Enrollment');
const Student = require('../models/Student');
const Class = require('../models/Class');
const Year = require('../models/Year');

exports.getAllEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate('student_id', 'first_name last_name')
      .populate('class_id', 'name')
      .populate('year_id', 'label');
    
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEnrollmentById = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('student_id', 'first_name last_name')
      .populate('class_id', 'name')
      .populate('year_id', 'label');
      
    if (!enrollment) {
      return res.status(404).json({ message: 'Inscription non trouvée' });
    }
    res.json(enrollment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEnrollmentsByStudent = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student_id: req.params.studentId })
      .populate('class_id', 'name')
      .populate('year_id', 'label')
      .sort({ 'year_id.start_date': -1 });
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEnrollmentsByClassAndYear = async (req, res) => {
  try {
    const { classId, yearId } = req.query;
    if (!classId || !yearId) {
      return res.status(400).json({ message: 'classId et yearId requis' });
    }
    
    const enrollments = await Enrollment.find({ class_id: classId, year_id: yearId })
      .populate('student_id', 'first_name last_name')
      .sort({ 'student_id.last_name': 1 });
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createEnrollment = async (req, res) => {
  try {
    const { student_id, class_id, year_id, enrollment_date, status } = req.body;
    if (!student_id || !class_id || !year_id) {
      return res.status(400).json({ message: 'student_id, class_id, year_id requis' });
    }
    
    const enrollment = new Enrollment({
      student_id,
      class_id,
      year_id,
      enrollment_date,
      status
    });
    
    await enrollment.save();
    
    const populated = await Enrollment.findById(enrollment._id)
      .populate('student_id', 'first_name last_name')
      .populate('class_id', 'name')
      .populate('year_id', 'label');
      
    res.status(201).json(populated);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Cet élève est déjà inscrit pour cette année' });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.updateEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!enrollment) {
      return res.status(404).json({ message: 'Inscription non trouvée' });
    }
    res.json(enrollment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteEnrollment = async (req, res) => {
  try {
    await Enrollment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Inscription supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.bulkPromote = async (req, res) => {
  try {
    const { fromYearId, toYearId } = req.body;
    if (!fromYearId || !toYearId) {
      return res.status(400).json({ message: 'fromYearId et toYearId requis' });
    }
    
    // Récupérer toutes les inscriptions actives de l'année source
    const enrollments = await Enrollment.find({
      year_id: fromYearId,
      status: 'actif'
    }).populate('class_id');
    
    let promotedCount = 0;
    
    for (const enrollment of enrollments) {
      // Trouver la classe supérieure
      const nextClass = await Class.findOne({
        level_order: enrollment.class_id.level_order + 1
      });
      
      if (!nextClass) continue;
      
      // Vérifier si l'élève n'est pas déjà inscrit pour l'année cible
      const existingEnrollment = await Enrollment.findOne({
        student_id: enrollment.student_id,
        year_id: toYearId
      });
      
      if (!existingEnrollment) {
        const newEnrollment = new Enrollment({
          student_id: enrollment.student_id,
          class_id: nextClass._id,
          year_id: toYearId,
          enrollment_date: new Date(),
          status: 'actif'
        });
        
        await newEnrollment.save();
        promotedCount++;
      }
    }
    
    res.json({ 
      message: 'Réinscription massive effectuée',
      promotedCount
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};