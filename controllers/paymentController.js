const Payment = require('../models/Payment');
const PaymentSchedule = require('../models/PaymentSchedule');

// ----- Échéanciers -----
exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await PaymentSchedule.findAll();
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createSchedule = async (req, res) => {
  try {
    const { class_id, year_id, description, amount, due_date } = req.body;
    if (!description || !amount || !due_date) return res.status(400).json({ message: 'Description, montant et date requis' });
    const schedule = await PaymentSchedule.create({ class_id, year_id, description, amount, due_date });
    res.status(201).json(schedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const updated = await PaymentSchedule.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Échéancier non trouvé' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    await PaymentSchedule.delete(req.params.id);
    res.json({ message: 'Échéancier supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----- Paiements -----
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPaymentsByEnrollment = async (req, res) => {
  try {
    const payments = await Payment.findByEnrollment(req.params.enrollmentId);
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createPayment = async (req, res) => {
  try {
    const { enrollment_id, schedule_id, amount, payment_date, payment_method, receipt_number, notes } = req.body;
    if (!enrollment_id || !amount || !payment_date) {
      return res.status(400).json({ message: 'Enrollment, montant et date requis' });
    }
    
    const payment = await Payment.create({
      enrollment_id: parseInt(enrollment_id),
      schedule_id: schedule_id ? parseInt(schedule_id) : null,  // ← convertir en null si vide
      amount: parseFloat(amount),
      payment_date,
      payment_method,
      receipt_number: receipt_number || null,
      notes: notes || null,
    });
    
    res.status(201).json(payment);
  } catch (err) {
    console.error('Erreur paiement:', err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const updated = await Payment.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Paiement non trouvé' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    await Payment.delete(req.params.id);
    res.json({ message: 'Paiement supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----- Impayés -----
exports.getOverdue = async (req, res) => {
  try {
    const overdue = await PaymentSchedule.getOverduePayments();
    res.json(overdue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};