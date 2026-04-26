// routes/teacherPayroll.js
const router = require('express').Router();
const ctrl = require('../controllers/teacherPayrollController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Contrats
router.get('/contracts', authMiddleware, ctrl.getAllContracts);
router.get('/contracts/:id', authMiddleware, ctrl.getContractById);
router.get('/contracts/teacher/:teacherId', authMiddleware, ctrl.getContractsByTeacher);
router.post('/contracts', authMiddleware, roleMiddleware('admin', 'comptable'), ctrl.createContract);
router.put('/contracts/:id', authMiddleware, roleMiddleware('admin', 'comptable'), ctrl.updateContract);
router.delete('/contracts/:id', authMiddleware, roleMiddleware('admin'), ctrl.deleteContract);

// Périodes
router.get('/periods', authMiddleware, ctrl.getAllPeriods);
router.get('/periods/year/:yearId', authMiddleware, ctrl.getPeriodsByYear);
router.post('/periods/generate', authMiddleware, roleMiddleware('admin', 'comptable'), ctrl.generatePeriods);

// Bulletins
router.get('/payrolls', authMiddleware, ctrl.getAllPayrolls);
router.get('/payrolls/:id', authMiddleware, ctrl.getPayrollById);
router.get('/payrolls/teacher/:teacherId', authMiddleware, ctrl.getPayrollsByTeacher);
router.get('/payrolls/period/:periodId', authMiddleware, ctrl.getPayrollsByPeriod);
router.post('/payrolls/generate', authMiddleware, roleMiddleware('admin', 'comptable'), ctrl.generatePayroll);
router.put('/payrolls/:id/pay', authMiddleware, roleMiddleware('admin', 'comptable'), ctrl.markAsPaid);
router.put('/payrolls/:id', authMiddleware, roleMiddleware('admin', 'comptable'), ctrl.updatePayroll);
router.delete('/payrolls/:id', authMiddleware, roleMiddleware('admin'), ctrl.deletePayroll);

// Stats
router.get('/stats', authMiddleware, ctrl.getPayrollStats);

module.exports = router;