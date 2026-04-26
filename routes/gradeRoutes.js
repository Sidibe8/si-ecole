const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// ⚠️ Les routes fixes DOIVENT être avant les routes avec paramètres
router.get('/by-class-period', authMiddleware, gradeController.getGradesByClassPeriod);
router.get('/student/:studentId', authMiddleware, gradeController.getGradesByStudent);

router.get('/', authMiddleware, gradeController.getAllGrades);
router.get('/:id', authMiddleware, gradeController.getGradeById);
router.post('/', authMiddleware, roleMiddleware('admin', 'secretariat'), gradeController.createGrade);
router.put('/:id', authMiddleware, roleMiddleware('admin', 'secretariat'), gradeController.updateGrade);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), gradeController.deleteGrade);

module.exports = router;