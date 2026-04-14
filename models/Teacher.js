// models/Teacher.js
const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  birth_date: Date,
  phone: String,
  email: String,
  address: String,
  hire_date: Date,
  status: { type: String, enum: ['actif', 'inactif'], default: 'actif' },
  photo_url: String,
  category: { type: String, default: 'teacher' },
  bank_account: String,
  bank_name: String,
  tax_id: String,
  social_security_number: String
}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);