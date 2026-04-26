// routes/classRoutes.js
const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Lecture pour tous les utilisateurs connectés
router.get('/', authMiddleware, classController.getAllClasses);
router.get('/:id', authMiddleware, classController.getClassById);

// Écriture réservée à l'admin
router.post('/', authMiddleware, roleMiddleware('admin'), classController.createClass);
router.put('/:id', authMiddleware, roleMiddleware('admin'), classController.updateClass);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), classController.deleteClass);

module.exports = router;