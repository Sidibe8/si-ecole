// models/PaymentSchedule.js
const mongoose = require('mongoose');

const paymentScheduleSchema = new mongoose.Schema({
  class_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  year_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Year' },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  due_date: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('PaymentSchedule', paymentScheduleSchema);