const Year = require('../models/Year');

exports.getAllYears = async (req, res) => {
  try {
    const years = await Year.findAll();
    res.json(years);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getYearById = async (req, res) => {
  try {
    const year = await Year.findById(req.params.id);
    if (!year) return res.status(404).json({ message: 'Année non trouvée' });
    res.json(year);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCurrentYear = async (req, res) => {
  try {
    const year = await Year.getCurrent();
    if (!year) return res.status(404).json({ message: 'Aucune année courante définie' });
    res.json(year);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createYear = async (req, res) => {
  try {
    const year = await Year.create(req.body);
    res.status(201).json(year);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateYear = async (req, res) => {
  try {
    const year = await Year.update(req.params.id, req.body);
    if (!year) return res.status(404).json({ message: 'Année non trouvée' });
    res.json(year);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteYear = async (req, res) => {
  try {
    await Year.delete(req.params.id);
    res.json({ message: 'Année supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};