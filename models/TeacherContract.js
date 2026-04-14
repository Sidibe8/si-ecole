// models/TeacherContract.js
const mongoose = require('mongoose');

const teacherContractSchema = new mongoose.Schema({
  teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  year_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Year', required: true },
  base_salary: { type: Number, required: true },
  contract_type: { type: String, enum: ['mensuel', 'horaire', 'cdd', 'cdi'], default: 'mensuel' },
  hours_per_month: { type: Number, default: 0 },
  hourly_rate: { type: Number, default: 0 },
  start_date: Date,
  end_date: Date,
  status: { type: String, enum: ['actif', 'inactif'], default: 'actif' }
}, { timestamps: true });

module.exports = mongoose.model('TeacherContract', teacherContractSchema);