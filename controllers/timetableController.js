const Timetable = require('../models/Timetable');

exports.getAllTimetables = async (req, res) => {
  try {
    const timetables = await Timetable.findAll();
    res.json(timetables);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTimetableById = async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id);
    if (!timetable) return res.status(404).json({ message: 'Emploi du temps non trouvé' });
    res.json(timetable);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTimetablesByClass = async (req, res) => {
  try {
    const timetables = await Timetable.findByClass(req.params.classId);
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
    const timetable = await Timetable.create({ class_id, subject_id, teacher_id, day_of_week, start_time, end_time });
    res.status(201).json(timetable);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTimetable = async (req, res) => {
  try {
    const updated = await Timetable.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Emploi du temps non trouvé' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTimetable = async (req, res) => {
  try {
    await Timetable.delete(req.params.id);
    res.json({ message: 'Emploi du temps supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};