// controllers/subjectController.js
const Subject = require('../models/Subject');

exports.getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find()
      .populate('class_id', 'name')
      .sort({ 'class_id.name': 1, name: 1 });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('class_id', 'name');
      
    if (!subject) {
      return res.status(404).json({ message: 'Matière non trouvée' });
    }
    res.json(subject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSubjectsByClass = async (req, res) => {
  try {
    const subjects = await Subject.find({ class_id: req.params.classId })
      .sort({ name: 1 });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createSubject = async (req, res) => {
  try {
    const { name, coefficient, class_id } = req.body;
    
    if (!name || coefficient === undefined || !class_id) {
      return res.status(400).json({ message: 'Nom, coefficient et classe requis' });
    }
    
    const subject = new Subject({ name, coefficient, class_id });
    await subject.save();
    
    const populatedSubject = await Subject.findById(subject._id)
      .populate('class_id', 'name');
      
    res.status(201).json(populatedSubject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('class_id', 'name');
    
    if (!subject) {
      return res.status(404).json({ message: 'Matière non trouvée' });
    }
    res.json(subject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.json({ message: 'Matière supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};