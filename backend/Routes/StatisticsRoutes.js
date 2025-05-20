const express = require('express');
const router = express.Router();
const StatisticsController = require('../Controllers/StatisticsController');
const verifyToken = require('../Middlewares/Auth');

router.get('/dashboard', verifyToken, StatisticsController.getDashboardStats);

module.exports = router;