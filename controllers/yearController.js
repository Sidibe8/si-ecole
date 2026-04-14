// controllers/yearController.js
const Year = require('../models/Year');

exports.getAllYears = async (req, res) => {
  try {
    const years = await Year.find().sort({ start_date: -1 });
    res.json(years);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getYearById = async (req, res) => {
  try {
    const year = await Year.findById(req.params.id);
    if (!year) {
      return res.status(404).json({ message: 'Année non trouvée' });
    }
    res.json(year);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCurrentYear = async (req, res) => {
  try {
    const year = await Year.findOne({ is_current: true });
    if (!year) {
      return res.status(404).json({ message: 'Aucune année courante définie' });
    }
    res.json(year);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createYear = async (req, res) => {
  try {
    if (req.body.is_current) {
      await Year.updateMany({}, { is_current: false });
    }
    
    const year = new Year(req.body);
    await year.save();
    res.status(201).json(year);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateYear = async (req, res) => {
  try {
    if (req.body.is_current) {
      await Year.updateMany({}, { is_current: false });
    }
    
    const year = await Year.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!year) {
      return res.status(404).json({ message: 'Année non trouvée' });
    }
    res.json(year);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteYear = async (req, res) => {
  try {
    await Year.findByIdAndDelete(req.params.id);
    res.json({ message: 'Année supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};