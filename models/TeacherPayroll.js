// models/TeacherPayroll.js
const mongoose = require('mongoose');

const teacherPayrollSchema = new mongoose.Schema({
  teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  contract_id: { type: mongoose.Schema.Types.ObjectId, ref: 'TeacherContract', required: true },
  payroll_period_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PayrollPeriod', required: true },
  gross_salary: { type: Number, default: 0 },
  overtime_hours: { type: Number, default: 0 },
  overtime_amount: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  bonuses: { type: Number, default: 0 },
  net_salary: { type: Number, default: 0 },
  status: { type: String, enum: ['en_attente', 'payé', 'annulé'], default: 'en_attente' },
  payment_date: Date
}, { timestamps: true });

module.exports = mongoose.model('TeacherPayroll', teacherPayrollSchema);