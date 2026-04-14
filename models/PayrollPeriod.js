// models/PayrollPeriod.js
const mongoose = require('mongoose');

const payrollPeriodSchema = new mongoose.Schema({
  year_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Year', required: true },
  month: { type: Number, required: true, min: 1, max: 12 },
  start_date: Date,
  end_date: Date,
  status: { type: String, enum: ['en_attente', 'en_cours', 'terminé'], default: 'en_attente' }
}, { timestamps: true });

module.exports = mongoose.model('PayrollPeriod', payrollPeriodSchema);