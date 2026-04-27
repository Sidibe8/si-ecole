// controllers/adminPayrollController.js
const AdminContract = require('../models/AdminContract');
const AdminPayroll = require('../models/AdminPayroll');
const PayrollPeriod = require('../models/PayrollPeriod');
const User = require('../models/User');
const mongoose = require('mongoose');

// ==================== CONTRATS ADMIN ====================

exports.getAllContracts = async (req, res) => {
  try {
   const contracts = await AdminContract.find()
      .populate('user_id', 'nom_complet role email')
      .populate('year_id', 'label');
    res.json(contracts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getContractById = async (req, res) => {
  try {
    const contract = await AdminContract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: 'Contrat non trouvé' });
    res.json(contract);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getContractsByUser = async (req, res) => {
  try {
    const contracts = await AdminContract.find({ user_id: req.params.userId })
      .populate('year_id', 'label');
    res.json(contracts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createContract = async (req, res) => {
  try {
    const { user_id, year_id, base_salary, contract_type, position, start_date, end_date } = req.body;
    if (!user_id || !year_id || base_salary === undefined) {
      return res.status(400).json({ message: 'user_id, year_id et base_salary requis' });
    }

    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const contract = new AdminContract({
      user_id, year_id, base_salary, contract_type, position, start_date, end_date
    });
    await contract.save();
    
    res.status(201).json(contract);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateContract = async (req, res) => {
  try {
    const contract = await AdminContract.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!contract) return res.status(404).json({ message: 'Contrat non trouvé' });
    res.json(contract);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteContract = async (req, res) => {
  try {
    const contract = await AdminContract.findByIdAndDelete(req.params.id);
    if (!contract) return res.status(404).json({ message: 'Contrat non trouvé' });
    res.json({ message: 'Contrat supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==================== PÉRIODES DE PAIE ====================

exports.getAllPeriods = async (req, res) => {
  try {
    const periods = await PayrollPeriod.find().populate('year_id', 'label');
    res.json(periods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.generatePeriods = async (req, res) => {
  try {
    const { year_id } = req.body;
    if (!year_id) return res.status(400).json({ message: 'year_id requis' });
    
    const Year = require('../models/Year');
    const year = await Year.findById(year_id);
    if (!year) return res.status(404).json({ message: 'Année non trouvée' });
    
    const periods = [];
    for (let month = 1; month <= 12; month++) {
      const existing = await PayrollPeriod.findOne({ year_id, month });
      if (!existing) {
        const period = new PayrollPeriod({ year_id, month });
        await period.save();
        periods.push(period);
      }
    }
    
    res.status(201).json({ message: `${periods.length} périodes créées`, periods });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==================== BULLETINS DE PAIE ADMIN ====================

exports.getAllPayrolls = async (req, res) => {
  try {
    const payrolls = await AdminPayroll.find()
      .populate('user_id', 'email nom_complet')
      .populate({ path: 'payroll_period_id', populate: { path: 'year_id', select: 'label' } });
    res.json(payrolls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPayrollById = async (req, res) => {
  try {
    const payroll = await AdminPayroll.findById(req.params.id);
    if (!payroll) return res.status(404).json({ message: 'Bulletin non trouvé' });
    res.json(payroll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPayrollsByUser = async (req, res) => {
  try {
    const payrolls = await AdminPayroll.find({ user_id: req.params.userId });
    res.json(payrolls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPayrollsByPeriod = async (req, res) => {
  try {
    const payrolls = await AdminPayroll.find({ payroll_period_id: req.params.periodId });
    res.json(payrolls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.generatePayroll = async (req, res) => {
  try {
    const { period_id } = req.body;
    if (!period_id) return res.status(400).json({ message: 'period_id requis' });
    
    const period = await PayrollPeriod.findById(period_id);
    if (!period) return res.status(404).json({ message: 'Période non trouvée' });
    
    const contracts = await AdminContract.find({ year_id: period.year_id, status: 'actif' });
    const payrolls = [];
    
    for (const contract of contracts) {
      const existing = await AdminPayroll.findOne({ user_id: contract.user_id, payroll_period_id: period_id });
      if (existing) continue;
      
      const payroll = new AdminPayroll({
        user_id: contract.user_id,
        contract_id: contract._id,
        payroll_period_id: period_id,
        gross_salary: contract.base_salary,
        net_salary: contract.base_salary,
        status: 'en_attente'
      });
      await payroll.save();
      payrolls.push(payroll);
    }
    
    res.status(201).json({ message: `${payrolls.length} bulletins générés`, payrolls });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markAsPaid = async (req, res) => {
  try {
    const payroll = await AdminPayroll.findByIdAndUpdate(
      req.params.id,
      { status: 'payé', payment_date: req.body.payment_date || new Date() },
      { new: true }
    );
    if (!payroll) return res.status(404).json({ message: 'Bulletin non trouvé' });
    res.json(payroll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePayroll = async (req, res) => {
  try {
    const payroll = await AdminPayroll.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!payroll) return res.status(404).json({ message: 'Bulletin non trouvé' });
    res.json(payroll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePayroll = async (req, res) => {
  try {
    const payroll = await AdminPayroll.findByIdAndDelete(req.params.id);
    if (!payroll) return res.status(404).json({ message: 'Bulletin non trouvé' });
    res.json({ message: 'Bulletin supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==================== STATISTIQUES ====================

exports.getMyPayrolls = async (req, res) => {
  try {
    const payrolls = await AdminPayroll.find({ user_id: req.user.id });
    res.json(payrolls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyCurrentContract = async (req, res) => {
  try {
    const contract = await AdminContract.findOne({ user_id: req.user.id, status: 'actif' })
      .populate('year_id', 'label');
    res.json(contract || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};