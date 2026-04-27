// models/Subject.js
const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  coefficient: { type: Number, default: 1 },
  class_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true } 
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);