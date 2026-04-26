	const express = require('express');
const router = express.Router();
const absenceController = require('../controllers/absenceController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, roleMiddleware('admin', 'secretariat'), absenceController.getAllAbsences);
router.get('/:id', authMiddleware, roleMiddleware('admin', 'secretariat'), absenceController.getAbsenceById);
router.get('/enrollment/:enrollmentId', authMiddleware, roleMiddleware('admin', 'secretariat'), absenceController.getAbsencesByEnrollment);
router.post('/', authMiddleware, roleMiddleware('admin', 'secretariat'), absenceController.createAbsence);
router.put('/:id', authMiddleware, roleMiddleware('admin', 'secretariat'), absenceController.updateAbsence);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), absenceController.deleteAbsence);

module.exports = router;