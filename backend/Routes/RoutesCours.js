const express = require('express');
const router = express.Router();
const coursController = require('../Controllers/CoursController');
const verifyToken = require('../Middlewares/Auth'); // Assuming you have an auth middleware

// Routes for managing courses (protected)
router.post('/', verifyToken, coursController.createCours);
router.get('/', verifyToken, coursController.getAllCours);
router.get('/:id', verifyToken, coursController.getCoursById);
router.put('/:id', verifyToken, coursController.updateCours);
router.delete('/:id', verifyToken, coursController.deleteCours);

// Route to get predefined lists (can be public or protected depending on need)
router.get('/lists/predefined', coursController.getPredefinedLists);


module.exports = router;