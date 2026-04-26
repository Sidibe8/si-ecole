const Subject = require('../models/Subject');

exports.getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.findAll();
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Matière non trouvée' });
    res.json(subject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSubjectsByClass = async (req, res) => {
  try {
    const subjects = await Subject.findByClass(req.params.classId);
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createSubject = async (req, res) => {
  try {
    const { name, coefficient, class_id } = req.body;
    if (!name || coefficient === undefined || !class_id) return res.status(400).json({ message: 'Nom, coefficient et classe requis' });
    const newSubject = await Subject.create({ name, coefficient, class_id });
    res.status(201).json(newSubject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSubject = async (req, res) => {
  try {
    const updated = await Subject.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Matière non trouvée' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    await Subject.delete(req.params.id);
    res.json({ message: 'Matière supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};