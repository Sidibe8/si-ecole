// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Routes publiques
router.post('/login', authController.login);

// Routes protégées (admin uniquement pour register, getAllUsers, deleteUser)
router.post('/register', authMiddleware, roleMiddleware('admin'), authController.register);
router.get('/users', authMiddleware, roleMiddleware('admin'), authController.getAllUsers);
router.delete('/users/:id', authMiddleware, roleMiddleware('admin'), authController.deleteUser);
router.get('/users/:id', authMiddleware, roleMiddleware('admin'), authController.getUserById);

// Route protégée (tout utilisateur connecté)
router.get('/me', authMiddleware, authController.getMe);
router.get('/me/full', authMiddleware, authController.getMyFullProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.put('/change-password', authMiddleware, authController.changePassword);	

module.exports = router;