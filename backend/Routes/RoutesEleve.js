const express = require('express');
const router = express.Router();
const { 
    createEleveWithUser, 
    getAllEleves, 
    getEleveById, 
    updateEleve, 
    deleteEleve 
} = require('../Controllers/elevecontroller');
const verifyToken = require('../Middlewares/Auth');

// Create new student profile (no token required for initial signup)
router.post('/create-with-user', createEleveWithUser);

// Protected routes that require authentication
router.get('/', verifyToken, getAllEleves);
router.get('/:id', verifyToken, getEleveById);
router.put('/:id', verifyToken, updateEleve);
router.delete('/:id', verifyToken, deleteEleve);

module.exports = router;