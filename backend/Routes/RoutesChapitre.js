const express = require('express');
const router = express.Router();
const ChapitreController = require('../Controllers/ChapitreController');
const verifyToken = require('../Middlewares/Auth');

// Get all chapitres for a specific matiere (optional, if you want a global list, add another route)
router.get('/matiere/:matiereId', ChapitreController.getChapitresByMatiere);

// Get chapitre by ID
router.get('/:id', ChapitreController.getChapitreById);

// Create chapitre (requires authentication)
router.post('/matiere/:matiereId', verifyToken, ChapitreController.createChapitre);

// Update chapitre (requires authentication)
router.put('/:id', verifyToken, ChapitreController.updateChapitre);

// Delete chapitre (requires authentication)
router.delete('/:id', verifyToken, ChapitreController.deleteChapitre);

module.exports = router;