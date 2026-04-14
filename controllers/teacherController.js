// controllers/teacherController.js
const Teacher = require('../models/Teacher');
const TeacherContract = require('../models/TeacherContract');
const TeacherPayroll = require('../models/TeacherPayroll');
const Timetable = require('../models/Timetable');

exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().sort({ last_name: 1, first_name: 1 });
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Professeur non trouvé' });
    }
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createTeacher = async (req, res) => {
  try {
    const { first_name, last_name } = req.body;
    if (!first_name || !last_name) {
      return res.status(400).json({ message: 'Prénom et nom requis' });
    }
    
    const teacher = new Teacher(req.body);
    await teacher.save();
    res.status(201).json(teacher);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!teacher) {
      return res.status(404).json({ message: 'Professeur non trouvé' });
    }
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTeacher = async (req, res) => {
  try {
    await Teacher.findByIdAndDelete(req.params.id);
    res.json({ message: 'Professeur supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFullTeacherData = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Enseignant non trouvé' });
    }

    const contracts = await TeacherContract.find({ teacher_id: teacher._id })
      .populate('year_id', 'label start_date')
      .sort({ 'year_id.start_date': -1 });

    const payrolls = await TeacherPayroll.find({ teacher_id: teacher._id })
      .populate({
        path: 'payroll_period_id',
        populate: { path: 'year_id', select: 'label start_date' }
      })
      .sort({ 'payroll_period_id.year_id.start_date': -1, 'payroll_period_id.month': 1 });

    const timetables = await Timetable.find({ teacher_id: teacher._id })
      .populate('class_id', 'name')
      .populate('subject_id', 'name')
      .sort({ day_of_week: 1, start_time: 1 });

    res.json({ teacher, contracts, payrolls, timetables });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};