// controllers/timetableController.js
const Timetable = require('../models/Timetable');

exports.getAllTimetables = async (req, res) => {
  try {
    const timetables = await Timetable.find()
      .populate('class_id', 'name')
      .populate('subject_id', 'name')
      .populate('teacher_id', 'first_name last_name')
      .sort({ 'class_id.name': 1, day_of_week: 1, start_time: 1 });
    res.json(timetables);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTimetableById = async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id)
      .populate('class_id', 'name')
      .populate('subject_id', 'name')
      .populate('teacher_id', 'first_name last_name');
      
    if (!timetable) {
      return res.status(404).json({ message: 'Emploi du temps non trouvé' });
    }
    res.json(timetable);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTimetablesByClass = async (req, res) => {
  try {
    const timetables = await Timetable.find({ class_id: req.params.classId })
      .populate('subject_id', 'name')
      .populate('teacher_id', 'first_name last_name')
      .sort({ day_of_week: 1, start_time: 1 });
    res.json(timetables);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createTimetable = async (req, res) => {
  try {
    const { class_id, subject_id, teacher_id, day_of_week, start_time, end_time } = req.body;
    
    if (!class_id || !subject_id || !teacher_id || !day_of_week || !start_time || !end_time) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }
    
    const timetable = new Timetable({
      class_id,
      subject_id,
      teacher_id,
      day_of_week,
      start_time,
      end_time
    });
    
    await timetable.save();
    
    const populatedTimetable = await Timetable.findById(timetable._id)
      .populate('class_id', 'name')
      .populate('subject_id', 'name')
      .populate('teacher_id', 'first_name last_name');
      
    res.status(201).json(populatedTimetable);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate('class_id', 'name')
      .populate('subject_id', 'name')
      .populate('teacher_id', 'first_name last_name');
    
    if (!timetable) {
      return res.status(404).json({ message: 'Emploi du temps non trouvé' });
    }
    res.json(timetable);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTimetable = async (req, res) => {
  try {
    await Timetable.findByIdAndDelete(req.params.id);
    res.json({ message: 'Emploi du temps supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};