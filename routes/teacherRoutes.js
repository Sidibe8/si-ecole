const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Route fixe AVANT les routes avec :id
router.get('/:id/full-data', authMiddleware, teacherController.getFullTeacherData);

router.get('/', authMiddleware, teacherController.getAllTeachers);
router.get('/:id', authMiddleware, teacherController.getTeacherById);
router.post('/', authMiddleware, roleMiddleware('admin'), teacherController.createTeacher);
router.put('/:id', authMiddleware, roleMiddleware('admin'), teacherController.updateTeacher);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), teacherController.deleteTeacher);

module.exports = router;