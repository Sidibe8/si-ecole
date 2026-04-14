// controllers/absenceController.js
const Absence = require('../models/Absence');
const Enrollment = require('../models/Enrollment');

exports.getAllAbsences = async (req, res) => {
  try {
    const absences = await Absence.find()
      .populate({
        path: 'enrollment_id',
        populate: [
          { path: 'student_id', select: 'first_name last_name' },
          { path: 'class_id', select: 'name' },
          { path: 'year_id', select: 'label' }
        ]
      })
      .sort({ absence_date: -1 });
      
    res.json(absences);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAbsenceById = async (req, res) => {
  try {
    const absence = await Absence.findById(req.params.id);
    if (!absence) {
      return res.status(404).json({ message: 'Absence non trouvée' });
    }
    res.json(absence);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAbsencesByEnrollment = async (req, res) => {
  try {
    const absences = await Absence.find({ 
      enrollment_id: req.params.enrollmentId 
    }).sort({ absence_date: -1 });
    res.json(absences);
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
    
    const absence = new Absence({
      enrollment_id,
      absence_date,
      is_justified: is_justified || false,
      justification
    });
    
    await absence.save();
    res.status(201).json(absence);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateAbsence = async (req, res) => {
  try {
    const absence = await Absence.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!absence) {
      return res.status(404).json({ message: 'Absence non trouvée' });
    }
    res.json(absence);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteAbsence = async (req, res) => {
  try {
    await Absence.findByIdAndDelete(req.params.id);
    res.json({ message: 'Absence supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};