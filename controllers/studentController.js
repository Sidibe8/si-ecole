// controllers/studentController.js
const Student = require('../models/Student');
const Enrollment = require('../models/Enrollment');
const Grade = require('../models/Grade');
const Absence = require('../models/Absence');
const Payment = require('../models/Payment');

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ last_name: 1, first_name: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Élève non trouvé' });
    }
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const { first_name, last_name, birth_date, photo_url, parent_phone, parent_email, address } = req.body;
    
    if (!first_name || !last_name) {
      return res.status(400).json({ message: 'Prénom et nom requis' });
    }
    
    const student = new Student({
      first_name,
      last_name,
      birth_date,
      photo_url,
      parent_phone,
      parent_email,
      address
    });
    
    await student.save();
    res.status(201).json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!student) {
      return res.status(404).json({ message: 'Élève non trouvé' });
    }
    
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Élève supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFullStudentData = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Élève non trouvé' });
    }

    const enrollments = await Enrollment.find({ student_id: student._id })
      .populate('class_id', 'name')
      .populate('year_id', 'label start_date')
      .sort({ 'year_id.start_date': -1 });

    const grades = await Grade.find({ student_id: student._id })
      .populate('subject_id', 'name')
      .populate({
        path: 'period_id',
        populate: { path: 'year_id', select: 'label start_date' }
      })
      .sort({ 'period_id.year_id.start_date': -1, 'period_id.start_date': 1, 'subject_id.name': 1 });

    const absences = await Absence.find()
      .populate({
        path: 'enrollment_id',
        match: { student_id: student._id },
        populate: [
          { path: 'year_id', select: 'label' },
          { path: 'class_id', select: 'name' }
        ]
      })
      .sort({ absence_date: -1 });

    const payments = await Payment.find()
      .populate({
        path: 'enrollment_id',
        match: { student_id: student._id },
        populate: { path: 'year_id', select: 'label' }
      })
      .populate('schedule_id', 'description')
      .sort({ payment_date: -1 });

    const yearsData = {};
    
    for (const enrollment of enrollments) {
      const yearLabel = enrollment.year_id.label;
      yearsData[yearLabel] = {
        year_label: yearLabel,
        class_name: enrollment.class_id.name,
        enrollment_id: enrollment._id,
        grades: grades.filter(g => g.period_id.year_id.label === yearLabel),
        absences: absences.filter(a => 
          a.enrollment_id && a.enrollment_id.year_id.label === yearLabel
        ),
        payments: payments.filter(p => 
          p.enrollment_id && p.enrollment_id.year_id.label === yearLabel
        )
      };
    }

    res.json({ student, yearsData: Object.values(yearsData) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};