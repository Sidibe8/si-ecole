// models/AdminContract.js
const mongoose = require('mongoose');

const adminContractSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  year_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Year', required: true },
  base_salary: { type: Number, required: true },
  contract_type: { type: String, enum: ['cdi', 'cdd', 'stage'], default: 'cdi' },
  position: String,
  start_date: Date,
  end_date: Date,
  status: { type: String, enum: ['actif', 'inactif'], default: 'actif' }
}, { timestamps: true });

module.exports = mongoose.model('AdminContract', adminContractSchema);