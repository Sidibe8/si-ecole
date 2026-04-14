// models/Student.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  birth_date: Date,
  photo_url: String,
  parent_phone: String,
  parent_email: String,
  address: String
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);