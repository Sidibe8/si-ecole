const Class = require('../models/Class');

exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.findAll();
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getClassById = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);
    if (!classItem) return res.status(404).json({ message: 'Classe non trouvée' });
    res.json(classItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createClass = async (req, res) => {
  try {
    const { name, level_order, fees } = req.body;
    if (!name || level_order === undefined) return res.status(400).json({ message: 'Nom et ordre requis' });
    const newClass = await Class.create({ name, level_order, fees });
    res.status(201).json(newClass);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateClass = async (req, res) => {
  try {
    const updated = await Class.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Classe non trouvée' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    await Class.delete(req.params.id);
    res.json({ message: 'Classe supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};