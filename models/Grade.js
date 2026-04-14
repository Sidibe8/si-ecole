// models/Grade.js
const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subject_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  period_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Period', required: true },
  evaluation_name: { type: String, required: true },
  evaluation_date: Date,
  value: { type: Number, required: true },
  evaluation_coefficient: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('Grade', gradeSchema);