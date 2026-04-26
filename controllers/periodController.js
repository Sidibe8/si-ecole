const Period = require('../models/Period');

exports.getAllPeriods = async (req, res) => {
  try {
    const periods = await Period.findAll();
    res.json(periods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPeriodById = async (req, res) => {
  try {
    const period = await Period.findById(req.params.id);
    if (!period) return res.status(404).json({ message: 'Période non trouvée' });
    res.json(period);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPeriodsByYear = async (req, res) => {
  try {
    const periods = await Period.findByYear(req.params.yearId);
    res.json(periods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createPeriod = async (req, res) => {
  try {
    const { year_id, name, start_date, end_date } = req.body;
    if (!year_id || !name) return res.status(400).json({ message: 'Année et nom requis' });
    const newPeriod = await Period.create({ year_id, name, start_date, end_date });
    res.status(201).json(newPeriod);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePeriod = async (req, res) => {
  try {
    const updated = await Period.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Période non trouvée' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePeriod = async (req, res) => {
  try {
    await Period.delete(req.params.id);
    res.json({ message: 'Période supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};