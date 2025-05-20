const express = require('express');
const router = express.Router();
const ProfileController = require('../Controllers/ProfileController');
const verifyToken = require('../Middlewares/Auth');

// Ensure these routes match what your frontend is expecting
router.get('/', verifyToken, ProfileController.getProfile);
router.put('/', verifyToken, ProfileController.updateProfile);

module.exports = router;