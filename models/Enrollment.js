// models/Enrollment.js
const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  class_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  year_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Year', required: true },
  enrollment_date: { type: Date, default: Date.now },
  status: { type: String, enum: ['actif', 'inactif', 'transféré', 'diplômé'], default: 'actif' }
}, { timestamps: true });

enrollmentSchema.index({ student_id: 1, year_id: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);