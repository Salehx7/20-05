const express = require('express');
const router = express.Router();
const enseignantController = require('../Controllers/EnseignantController');
const verifyToken = require('../Middlewares/Auth');

// Public route for creating a teacher with user
router.post('/create-with-user', enseignantController.createEnseignantWithUser);

// Protected routes that require authentication
router.get('/', verifyToken, enseignantController.getAllEnseignants);
router.get('/:id', verifyToken, enseignantController.getEnseignantById);
router.put('/:id', verifyToken, enseignantController.updateEnseignant);
router.delete('/:id', verifyToken, enseignantController.deleteEnseignant);

module.exports = router;