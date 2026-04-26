// controllers/adminPayrollController.js
const AdminContract = require('../models/AdminContract');
const AdminPayroll = require('../models/AdminPayroll');
const PayrollPeriod = require('../models/PayrollPeriod');
const pool = require('../config/db');

// ==================== CONTRATS ADMIN ====================

exports.getAllContracts = async (req, res) => {
  try {
    const contracts = await AdminContract.findAll();
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
    const contracts = await AdminContract.findByUser(req.params.userId);
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

    // Vérifier que le user existe et a un rôle admin
    const user = await pool.query('SELECT id, role FROM users WHERE id = $1', [user_id]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const contract = await AdminContract.create({
      user_id, year_id, base_salary, contract_type, position, start_date, end_date
    });
    res.status(201).json(contract);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateContract = async (req, res) => {
  try {
    const updated = await AdminContract.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Contrat non trouvé' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteContract = async (req, res) => {
  try {
    const deleted = await AdminContract.delete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Contrat non trouvé' });
    res.json({ message: 'Contrat supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==================== PÉRIODES DE PAIE ====================
// Utilise le même PayrollPeriod que les teachers
exports.getAllPeriods = async (req, res) => {
  try {
    const periods = await PayrollPeriod.findAll();
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

// ==================== BULLETINS DE PAIE ADMIN ====================

exports.getAllPayrolls = async (req, res) => {
  try {
    const payrolls = await AdminPayroll.findAll();
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
    const payrolls = await AdminPayroll.findByUser(req.params.userId);
    res.json(payrolls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPayrollsByPeriod = async (req, res) => {
  try {
    const payrolls = await AdminPayroll.findByPeriod(req.params.periodId);
    res.json(payrolls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.generatePayroll = async (req, res) => {
  try {
    const { period_id } = req.body;
    if (!period_id) return res.status(400).json({ message: 'period_id requis' });
    const payrolls = await AdminPayroll.generateForPeriod(period_id);
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
    const payroll = await AdminPayroll.markPaid(req.params.id, payment_date);
    if (!payroll) return res.status(404).json({ message: 'Bulletin non trouvé' });
    res.json(payroll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePayroll = async (req, res) => {
  try {
    const updated = await AdminPayroll.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Bulletin non trouvé' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePayroll = async (req, res) => {
  try {
    const deleted = await AdminPayroll.delete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Bulletin non trouvé' });
    res.json({ message: 'Bulletin supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==================== STATISTIQUES ====================

exports.getMyPayrolls = async (req, res) => {
  try {
    // req.user.id vient du middleware JWT
    const payrolls = await AdminPayroll.findByUser(req.user.id);
    res.json(payrolls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyCurrentContract = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT ac.*, y.label as year_label
      FROM admin_contracts ac
      JOIN years y ON ac.year_id = y.id
      WHERE ac.user_id = $1 AND ac.status = 'actif'
      ORDER BY y.start_date DESC
      LIMIT 1
    `, [req.user.id]);
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};