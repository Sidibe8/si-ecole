// models/Period.js
const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({
  year_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Year', required: true },
  name: { type: String, required: true },
  start_date: Date,
  end_date: Date
}, { timestamps: true });

module.exports = mongoose.model('Period', periodSchema);