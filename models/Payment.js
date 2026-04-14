// models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  enrollment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment', required: true },
  schedule_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentSchedule' },
  amount: { type: Number, required: true },
  payment_date: { type: Date, required: true },
  payment_method: { type: String, enum: ['espèces', 'chèque', 'virement', 'mobile_money'] },
  receipt_number: String,
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);