// controllers/periodController.js
const Period = require('../models/Period');

exports.getAllPeriods = async (req, res) => {
  try {
    const periods = await Period.find()
      .populate('year_id', 'label')
      .sort({ 'year_id.start_date': 1, start_date: 1 });
    res.json(periods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPeriodById = async (req, res) => {
  try {
    const period = await Period.findById(req.params.id)
      .populate('year_id', 'label');
      
    if (!period) {
      return res.status(404).json({ message: 'Période non trouvée' });
    }
    res.json(period);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPeriodsByYear = async (req, res) => {
  try {
    const periods = await Period.find({ year_id: req.params.yearId })
      .sort({ start_date: 1 });
    res.json(periods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createPeriod = async (req, res) => {
  try {
    const { year_id, name, start_date, end_date } = req.body;
    
    if (!year_id || !name) {
      return res.status(400).json({ message: 'Année et nom requis' });
    }
    
    const period = new Period({ year_id, name, start_date, end_date });
    await period.save();
    
    const populatedPeriod = await Period.findById(period._id)
      .populate('year_id', 'label');
      
    res.status(201).json(populatedPeriod);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePeriod = async (req, res) => {
  try {
    const period = await Period.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('year_id', 'label');
    
    if (!period) {
      return res.status(404).json({ message: 'Période non trouvée' });
    }
    res.json(period);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePeriod = async (req, res) => {
  try {
    await Period.findByIdAndDelete(req.params.id);
    res.json({ message: 'Période supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};