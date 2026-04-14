// controllers/teacherPayrollController.js
const TeacherContract = require('../models/TeacherContract');
const TeacherPayroll = require('../models/TeacherPayroll');
const PayrollPeriod = require('../models/PayrollPeriod');

// ==================== CONTRATS ====================

exports.getAllContracts = async (req, res) => {
  try {
    const contracts = await TeacherContract.find()
      .populate('teacher_id', 'first_name last_name email')
      .populate('year_id', 'label')
      .sort({ 'year_id.start_date': -1, 'teacher_id.last_name': 1 });
    res.json(contracts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getContractById = async (req, res) => {
  try {
    const contract = await TeacherContract.findById(req.params.id)
      .populate('teacher_id', 'first_name last_name email')
      .populate('year_id', 'label');
      
    if (!contract) {
      return res.status(404).json({ message: 'Contrat non trouvé' });
    }
    res.json(contract);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getContractsByTeacher = async (req, res) => {
  try {
    const contracts = await TeacherContract.find({ 
      teacher_id: req.params.teacherId 
    })
      .populate('year_id', 'label')
      .sort({ 'year_id.start_date': -1 });
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
    
    const contract = new TeacherContract({
      teacher_id,
      year_id,
      base_salary,
      contract_type,
      hours_per_month,
      hourly_rate,
      start_date,
      end_date
    });
    
    await contract.save();
    
    const populatedContract = await TeacherContract.findById(contract._id)
      .populate('teacher_id', 'first_name last_name email')
      .populate('year_id', 'label');
      
    res.status(201).json(populatedContract);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateContract = async (req, res) => {
  try {
    const contract = await TeacherContract.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!contract) {
      return res.status(404).json({ message: 'Contrat non trouvé' });
    }
    res.json(contract);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteContract = async (req, res) => {
  try {
    await TeacherContract.findByIdAndDelete(req.params.id);
    res.json({ message: 'Contrat supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==================== PÉRIODES DE PAIE ====================

exports.getAllPeriods = async (req, res) => {
  try {
    const periods = await PayrollPeriod.find()
      .populate('year_id', 'label')
      .sort({ 'year_id.start_date': -1, month: 1 });
    res.json(periods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPeriodsByYear = async (req, res) => {
  try {
    const periods = await PayrollPeriod.find({ 
      year_id: req.params.yearId 
    }).sort({ month: 1 });
    res.json(periods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.generatePeriods = async (req, res) => {
  try {
    const { year_id } = req.body;
    if (!year_id) {
      return res.status(400).json({ message: 'year_id requis' });
    }
    
    const Year = require('../models/Year');
    const year = await Year.findById(year_id);
    if (!year) {
      return res.status(404).json({ message: 'Année non trouvée' });
    }
    
    const periods = [];
    
    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(year.start_date);
      startDate.setMonth(startDate.getMonth() + month - 1);
      
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
      
      // Vérifier si la période existe déjà
      const existingPeriod = await PayrollPeriod.findOne({
        year_id,
        month
      });
      
      if (!existingPeriod) {
        const period = new PayrollPeriod({
          year_id,
          month,
          start_date: startDate,
          end_date: endDate
        });
        
        await period.save();
        periods.push(period);
      }
    }
    
    res.status(201).json({ 
      message: `${periods.length} périodes créées`, 
      periods 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==================== BULLETINS DE PAIE ====================

exports.getAllPayrolls = async (req, res) => {
  try {
    const payrolls = await TeacherPayroll.find()
      .populate('teacher_id', 'first_name last_name email')
      .populate({
        path: 'payroll_period_id',
        populate: { path: 'year_id', select: 'label' }
      })
      .sort({ 'payroll_period_id.year_id.start_date': -1, 'payroll_period_id.month': 1 });
    res.json(payrolls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPayrollById = async (req, res) => {
  try {
    const payroll = await TeacherPayroll.findById(req.params.id)
      .populate('teacher_id', 'first_name last_name email bank_account bank_name')
      .populate({
        path: 'payroll_period_id',
        populate: { path: 'year_id', select: 'label' }
      });
      
    if (!payroll) {
      return res.status(404).json({ message: 'Bulletin non trouvé' });
    }
    res.json(payroll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPayrollsByTeacher = async (req, res) => {
  try {
    const payrolls = await TeacherPayroll.find({ 
      teacher_id: req.params.teacherId 
    })
      .populate({
        path: 'payroll_period_id',
        populate: { path: 'year_id', select: 'label' }
      })
      .sort({ 'payroll_period_id.year_id.start_date': -1, 'payroll_period_id.month': 1 });
    res.json(payrolls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPayrollsByPeriod = async (req, res) => {
  try {
    const payrolls = await TeacherPayroll.find({ 
      payroll_period_id: req.params.periodId 
    })
      .populate('teacher_id', 'first_name last_name email')
      .sort({ 'teacher_id.last_name': 1 });
    res.json(payrolls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.generatePayroll = async (req, res) => {
  try {
    const { period_id } = req.body;
    if (!period_id) {
      return res.status(400).json({ message: 'period_id requis' });
    }
    
    const period = await PayrollPeriod.findById(period_id)
      .populate('year_id');
      
    if (!period) {
      return res.status(404).json({ message: 'Période non trouvée' });
    }
    
    // Trouver tous les contrats actifs pour cette année
    const contracts = await TeacherContract.find({
      year_id: period.year_id._id,
      status: 'actif'
    });
    
    const payrolls = [];
    
    for (const contract of contracts) {
      // Vérifier si un bulletin existe déjà
      const existingPayroll = await TeacherPayroll.findOne({
        teacher_id: contract.teacher_id,
        payroll_period_id: period_id
      });
      
      if (existingPayroll) continue;
      
      let grossSalary = contract.base_salary || 0;
      if (contract.contract_type === 'horaire') {
        grossSalary = (contract.hourly_rate || 0) * (contract.hours_per_month || 0);
      }
      
      const netSalary = grossSalary; // Ajouter la logique de déductions si nécessaire
      
      const payroll = new TeacherPayroll({
        teacher_id: contract.teacher_id,
        contract_id: contract._id,
        payroll_period_id: period_id,
        gross_salary: grossSalary,
        net_salary: netSalary,
        status: 'en_attente'
      });
      
      await payroll.save();
      payrolls.push(payroll);
    }
    
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
    
    const payroll = await TeacherPayroll.findByIdAndUpdate(
      req.params.id,
      {
        status: 'payé',
        payment_date: payment_date || new Date()
      },
      { new: true }
    );
    
    if (!payroll) {
      return res.status(404).json({ message: 'Bulletin non trouvé' });
    }
    res.json(payroll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePayroll = async (req, res) => {
  try {
    const payroll = await TeacherPayroll.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!payroll) {
      return res.status(404).json({ message: 'Bulletin non trouvé' });
    }
    res.json(payroll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePayroll = async (req, res) => {
  try {
    await TeacherPayroll.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bulletin supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==================== STATISTIQUES ====================

exports.getPayrollStats = async (req, res) => {
  try {
    const { year_id } = req.query;
    
    const matchStage = {};
    if (year_id) {
      const period = await PayrollPeriod.findOne({ year_id });
      if (period) {
        matchStage.payroll_period_id = period._id;
      }
    }
    
    const stats = await TeacherPayroll.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$payroll_period_id',
          total_bulletins: { $sum: 1 },
          total_brut: { $sum: '$gross_salary' },
          total_deductions: { $sum: '$deductions' },
          total_bonus: { $sum: '$bonuses' },
          total_net: { $sum: '$net_salary' },
          payes: {
            $sum: { $cond: [{ $eq: ['$status', 'payé'] }, 1, 0] }
          },
          en_attente: {
            $sum: { $cond: [{ $eq: ['$status', 'en_attente'] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'payrollperiods',
          localField: '_id',
          foreignField: '_id',
          as: 'period'
        }
      },
      { $unwind: '$period' },
      {
        $lookup: {
          from: 'years',
          localField: 'period.year_id',
          foreignField: '_id',
          as: 'year'
        }
      },
      { $unwind: '$year' },
      {
        $project: {
          month: '$period.month',
          year_label: '$year.label',
          total_bulletins: 1,
          total_brut: 1,
          total_deductions: 1,
          total_bonus: 1,
          total_net: 1,
          payes: 1,
          en_attente: 1
        }
      },
      { $sort: { year_label: -1, month: 1 } }
    ]);
    
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};