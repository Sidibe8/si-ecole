// routes/adminPayrollRoutes.js
const router = require('express').Router();
const ctrl = require('../controllers/adminPayrollController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Contrats
router.get('/contracts', authMiddleware, ctrl.getAllContracts);
router.get('/contracts/:id', authMiddleware, ctrl.getContractById);
router.get('/contracts/user/:userId', authMiddleware, ctrl.getContractsByUser);
router.post('/contracts', authMiddleware, roleMiddleware('admin', 'comptable'), ctrl.createContract);
router.put('/contracts/:id', authMiddleware, roleMiddleware('admin', 'comptable'), ctrl.updateContract);
router.delete('/contracts/:id', authMiddleware, roleMiddleware('admin'), ctrl.deleteContract);

// Périodes
router.get('/periods', authMiddleware, ctrl.getAllPeriods);
router.post('/periods/generate', authMiddleware, roleMiddleware('admin', 'comptable'), ctrl.generatePeriods);

// Bulletins
router.get('/payrolls', authMiddleware, ctrl.getAllPayrolls);
router.get('/payrolls/me', authMiddleware, ctrl.getMyPayrolls);
router.get('/payrolls/contract', authMiddleware, ctrl.getMyCurrentContract);
router.get('/payrolls/:id', authMiddleware, ctrl.getPayrollById);
router.get('/payrolls/user/:userId', authMiddleware, ctrl.getPayrollsByUser);
router.get('/payrolls/period/:periodId', authMiddleware, ctrl.getPayrollsByPeriod);
router.post('/payrolls/generate', authMiddleware, roleMiddleware('admin', 'comptable'), ctrl.generatePayroll);
router.put('/payrolls/:id/pay', authMiddleware, roleMiddleware('admin', 'comptable'), ctrl.markAsPaid);
router.put('/payrolls/:id', authMiddleware, roleMiddleware('admin', 'comptable'), ctrl.updatePayroll);
router.delete('/payrolls/:id', authMiddleware, roleMiddleware('admin'), ctrl.deletePayroll);

module.exports = router;