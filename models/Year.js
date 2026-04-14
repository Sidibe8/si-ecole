// models/Year.js
const mongoose = require('mongoose');

const yearSchema = new mongoose.Schema({
  label: { type: String, required: true },
  start_date: Date,
  end_date: Date,
  is_current: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Year', yearSchema);