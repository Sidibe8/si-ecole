// controllers/classController.js
const Class = require('../models/Class');

exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find().sort({ level_order: 1 });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getClassById = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);
    if (!classItem) {
      return res.status(404).json({ message: 'Classe non trouvée' });
    }
    res.json(classItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createClass = async (req, res) => {
  try {
    const { name, level_order, fees } = req.body;
    
    if (!name || level_order === undefined) {
      return res.status(400).json({ message: 'Nom et ordre requis' });
    }
    
    const classItem = new Class({ name, level_order, fees });
    await classItem.save();
    res.status(201).json(classItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateClass = async (req, res) => {
  try {
    const classItem = await Class.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!classItem) {
      return res.status(404).json({ message: 'Classe non trouvée' });
    }
    res.json(classItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    await Class.findByIdAndDelete(req.params.id);
    res.json({ message: 'Classe supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};