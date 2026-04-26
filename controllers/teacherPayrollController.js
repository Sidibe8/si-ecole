// controllers/teacherPayrollController.js
const TeacherContract = require('../models/TeacherContract');
const TeacherPayroll = require('../models/TeacherPayroll');
const PayrollPeriod = require('../models/PayrollPeriod');
const pool = require('../config/db');

// ==================== CONTRATS ====================

exports.getAllContracts = async (req, res) => {
  try {
    const contracts = await TeacherContract.findAll();
    res.json(contracts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getContractById = async (req, res) => {
  try {
    const contract = await TeacherContract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: 'Contrat non trouvé' });
    res.json(contract);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getContractsByTeacher = async (req, res) => {
  try {
    const contracts = await TeacherContract.findByTeacher(req.params.teacherId);
    res.json(contracts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createContract = async (req, res) => {
  try {
    const { teacher_id, year_id, base_salary, contract_type, hours_per_month, hourly_rate, start_date, end_date } = req.body;
    if (!teacher_id || !year_id || base_salary === undefined) {
      return res.status(400).json({ message: 'teacher_id, year_id et base_salary requis' });
    }
    const contract = await TeacherContract.create({ 
      teacher_id, year_id, base_salary, contract_type, hours_per_month, hourly_rate, start_date, end_date 
    });
    res.status(201).json(contract);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateContract = async (req, res) => {
  try {
    const updated = await TeacherContract.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Contrat non trouvé' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteContract = async (req, res) => {
  try {
    const deleted = await TeacherContract.delete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Contrat non trouvé' });
    res.json({ message: 'Contrat supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==================== PÉRIODES DE PAIE ====================

exports.getAllPeriods = async (req, res) => {
  try {
    const periods = await PayrollPeriod.findAll();
    res.json(periods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPeriodsByYear = async (req, res) => {
  try {
    const periods = await PayrollPeriod.findByYear(req.params.yearId);
    res.json(periods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.generatePeriods = async (req, res) => {
  try {
    const { year_id } = req.body;
    if (!year_id) return res.status(400).json({ message: 'year_id requis' });
    const periods = await PayrollPeriod.generateForYear(year_id);
    res.status(201).json({ message: `${periods.length} périodes créées`, periods });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==================== BULLETINS DE PAIE ====================

exports.getAllPayrolls = async (req, res) => {
  try {
    const payrolls = await TeacherPayroll.findAll();
    res.json(payrolls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPayrollById = async (req, res) => {
  try {
    const payroll = await TeacherPayroll.findById(req.params.id);
    if (!payroll) return res.status(404).json({ message: 'Bulletin non trouvé' });
    res.json(payroll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPayrollsByTeacher = async (req, res) => {
  try {
    const payrolls = await TeacherPayroll.findByTeacher(req.params.teacherId);
    res.json(payrolls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPayrollsByPeriod = async (req, res) => {
  try {
    const payrolls = await TeacherPayroll.findByPeriod(req.params.periodId);
    res.json(payrolls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.generatePayroll = async (req, res) => {
  try {
    const { period_id } = req.body;
    if (!period_id) return res.status(400).json({ message: 'period_id requis' });
    const payrolls = await TeacherPayroll.generateForPeriod(period_id);
    res.status(201).json({ 
      message: `${payrolls.length} bulletins générés`, 
      payrolls 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markAsPaid = async (req, res) => {
  try {
    const { payment_date } = req.body;
    const payroll = await TeacherPayroll.markPaid(req.params.id, payment_date);
    if (!payroll) return res.status(404).json({ message: 'Bulletin non trouvé' });
    res.json(payroll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePayroll = async (req, res) => {
  try {
    const updated = await TeacherPayroll.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Bulletin non trouvé' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePayroll = async (req, res) => {
  try {
    const deleted = await TeacherPayroll.delete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Bulletin non trouvé' });
    res.json({ message: 'Bulletin supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==================== STATISTIQUES ====================

exports.getPayrollStats = async (req, res) => {
  try {
    const { year_id } = req.query;
    const { rows } = await pool.query(`
      SELECT 
        pp.month,
        y.label as year_label,
        COUNT(tp.id) as total_bulletins,
        SUM(tp.gross_salary) as total_brut,
        SUM(tp.deductions) as total_deductions,
        SUM(tp.bonuses) as total_bonus,
        SUM(tp.net_salary) as total_net,
        COUNT(CASE WHEN tp.status = 'payé' THEN 1 END) as payes,
        COUNT(CASE WHEN tp.status = 'en_attente' THEN 1 END) as en_attente
      FROM teacher_payroll tp
      JOIN payroll_periods pp ON tp.payroll_period_id = pp.id
      JOIN years y ON pp.year_id = y.id
      WHERE ($1::int IS NULL OR pp.year_id = $1)
      GROUP BY pp.month, y.label
      ORDER BY y.label DESC, pp.month
    `, [year_id || null]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};