const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, timetableController.getAllTimetables);
router.get('/:id', authMiddleware, timetableController.getTimetableById);
router.get('/class/:classId', authMiddleware, timetableController.getTimetablesByClass);
router.post('/', authMiddleware, roleMiddleware('admin', 'secretariat'), timetableController.createTimetable);
router.put('/:id', authMiddleware, roleMiddleware('admin', 'secretariat'), timetableController.updateTimetable);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), timetableController.deleteTimetable);

module.exports = router;