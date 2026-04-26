const express = require('express');
const router = express.Router();
const yearController = require('../controllers/yearController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, yearController.getAllYears);
router.get('/current', authMiddleware, yearController.getCurrentYear);
router.get('/:id', authMiddleware, yearController.getYearById);
router.post('/', authMiddleware, roleMiddleware('admin'), yearController.createYear);
router.put('/:id', authMiddleware, roleMiddleware('admin'), yearController.updateYear);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), yearController.deleteYear);

module.exports = router;