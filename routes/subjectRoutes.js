const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Lecture (tous connectés)
router.get('/', authMiddleware, subjectController.getAllSubjects);
router.get('/:id', authMiddleware, subjectController.getSubjectById);
router.get('/class/:classId', authMiddleware, subjectController.getSubjectsByClass);

// Écriture (admin + secrétariat)
router.post('/', authMiddleware, roleMiddleware('admin', 'secretariat'), subjectController.createSubject);
router.put('/:id', authMiddleware, roleMiddleware('admin', 'secretariat'), subjectController.updateSubject);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), subjectController.deleteSubject);

module.exports = router;