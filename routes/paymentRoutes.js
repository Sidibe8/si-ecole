const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Échéanciers (admin + comptable)
router.get('/schedules', authMiddleware, paymentController.getAllSchedules);
router.post('/schedules', authMiddleware, roleMiddleware('admin', 'comptable'), paymentController.createSchedule);
router.put('/schedules/:id', authMiddleware, roleMiddleware('admin', 'comptable'), paymentController.updateSchedule);
router.delete('/schedules/:id', authMiddleware, roleMiddleware('admin'), paymentController.deleteSchedule);

// Paiements (admin + comptable)
router.get('/', authMiddleware, paymentController.getAllPayments);
router.get('/enrollment/:enrollmentId', authMiddleware, paymentController.getPaymentsByEnrollment);
router.post('/', authMiddleware, roleMiddleware('admin', 'comptable'), paymentController.createPayment);
router.put('/:id', authMiddleware, roleMiddleware('admin', 'comptable'), paymentController.updatePayment);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), paymentController.deletePayment);

// Relances (admin + comptable)
router.get('/overdue', authMiddleware, paymentController.getOverdue);

module.exports = router;