const express = require('express');
const router = express.Router();
const periodController = require('../controllers/periodController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, periodController.getAllPeriods);
router.get('/:id', authMiddleware, periodController.getPeriodById);
router.get('/year/:yearId', authMiddleware, periodController.getPeriodsByYear);
router.post('/', authMiddleware, roleMiddleware('admin', 'secretariat'), periodController.createPeriod);
router.put('/:id', authMiddleware, roleMiddleware('admin', 'secretariat'), periodController.updatePeriod);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), periodController.deletePeriod);

module.exports = router;