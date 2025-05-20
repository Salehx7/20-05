const express = require('express');
const router = express.Router();
const MatiereController = require('../Controllers/MatiereController');
const ChapitreController = require('../Controllers/ChapitreController');
const verifyToken = require('../Middlewares/Auth');
const matiereController = require('../Controllers/MatiereController');

// Matiere routes
router.get('/with-chapitres', MatiereController.getMatieresWithChapitres); // <-- Add this line
router.get('/', MatiereController.getMatieres);
router.get('/:id', MatiereController.getMatiereById);
router.post('/', verifyToken, MatiereController.createMatiere);
router.put('/:id', verifyToken, MatiereController.updateMatiere);
router.delete('/:id', verifyToken, MatiereController.deleteMatiere);

// Chapitre routes
router.get('/:matiereId/chapitres', ChapitreController.getChapitresByMatiere);
router.post('/:matiereId/chapitres', verifyToken, ChapitreController.createChapitre);
router.put('/chapitres/:id', verifyToken, ChapitreController.updateChapitre);
router.delete('/chapitres/:id', verifyToken, ChapitreController.deleteChapitre);
router.get('/level/:level', matiereController.getMatieresByLevel);

module.exports = router;