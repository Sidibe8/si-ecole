// models/AdminPayroll.js
const mongoose = require('mongoose');

const adminPayrollSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contract_id: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminContract', required: true },
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

module.exports = mongoose.model('AdminPayroll', adminPayrollSchema);