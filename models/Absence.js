// models/Absence.js
const mongoose = require('mongoose');

const absenceSchema = new mongoose.Schema({
  enrollment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment', required: true },
  absence_date: { type: Date, required: true },
  is_justified: { type: Boolean, default: false },
  justification: String
}, { timestamps: true });

module.exports = mongoose.model('Absence', absenceSchema);