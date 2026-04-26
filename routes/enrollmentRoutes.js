const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Lecture (tous les utilisateurs connectés)
router.get('/', authMiddleware, enrollmentController.getAllEnrollments);
router.get('/:id', authMiddleware, enrollmentController.getEnrollmentById);
router.get('/student/:studentId', authMiddleware, enrollmentController.getEnrollmentsByStudent);
router.get('/by-class-year', authMiddleware, enrollmentController.getEnrollmentsByClassAndYear);

// Écriture (admin + secrétariat)
router.post('/', authMiddleware, roleMiddleware('admin', 'secretariat'), enrollmentController.createEnrollment);
router.put('/:id', authMiddleware, roleMiddleware('admin', 'secretariat'), enrollmentController.updateEnrollment);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), enrollmentController.deleteEnrollment);

// Réinscription massive (admin seulement)
router.post('/bulk-promote', authMiddleware, roleMiddleware('admin'), enrollmentController.bulkPromote);

module.exports = router;