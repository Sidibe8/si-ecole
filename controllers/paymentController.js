// controllers/paymentController.js
const Payment = require('../models/Payment');
const PaymentSchedule = require('../models/PaymentSchedule');
const Enrollment = require('../models/Enrollment');

// ----- Échéanciers -----
exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await PaymentSchedule.find()
      .populate('class_id', 'name')
      .populate('year_id', 'label')
      .sort({ due_date: 1 });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createSchedule = async (req, res) => {
  try {
    const { class_id, year_id, description, amount, due_date } = req.body;
    
    if (!description || !amount || !due_date) {
      return res.status(400).json({ message: 'Description, montant et date requis' });
    }
    
    const schedule = new PaymentSchedule({
      class_id: class_id || null,
      year_id: year_id || null,
      description,
      amount,
      due_date
    });
    
    await schedule.save();
    res.status(201).json(schedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const schedule = await PaymentSchedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!schedule) {
      return res.status(404).json({ message: 'Échéancier non trouvé' });
    }
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    await PaymentSchedule.findByIdAndDelete(req.params.id);
    res.json({ message: 'Échéancier supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----- Paiements -----
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: 'enrollment_id',
        populate: [
          { path: 'student_id', select: 'first_name last_name' },
          { path: 'year_id', select: 'label' }
        ]
      })
      .sort({ payment_date: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPaymentsByEnrollment = async (req, res) => {
  try {
    const payments = await Payment.find({ 
      enrollment_id: req.params.enrollmentId 
    })
      .populate('schedule_id', 'description')
      .sort({ payment_date: -1 });
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
    
    const payment = new Payment({
      enrollment_id,
      schedule_id: schedule_id || null,
      amount,
      payment_date,
      payment_method,
      receipt_number,
      notes
    });
    
    await payment.save();
    res.status(201).json(payment);
  } catch (err) {
    console.error('Erreur paiement:', err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!payment) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Paiement supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----- Impayés -----
exports.getOverdue = async (req, res) => {
  try {
    const schedules = await PaymentSchedule.find({
      due_date: { $lt: new Date() }
    });
    
    const overduePayments = [];
    
    for (const schedule of schedules) {
      const query = { status: 'actif' };
      
      if (schedule.class_id) {
        query.class_id = schedule.class_id;
      }
      if (schedule.year_id) {
        query.year_id = schedule.year_id;
      }
      
      const enrollments = await Enrollment.find(query)
        .populate('student_id', 'first_name last_name');
      
      for (const enrollment of enrollments) {
        const payment = await Payment.findOne({
          schedule_id: schedule._id,
          enrollment_id: enrollment._id
        });
        
        if (!payment) {
          overduePayments.push({
            ...schedule.toObject(),
            first_name: enrollment.student_id.first_name,
            last_name: enrollment.student_id.last_name,
            enrollment_id: enrollment._id
          });
        }
      }
    }
    
    res.json(overduePayments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};