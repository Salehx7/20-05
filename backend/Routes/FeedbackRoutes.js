const express = require('express');
const router = express.Router();
const FeedbackController = require('../Controllers/FeedbackController');
const verifyToken = require('../Middlewares/Auth');

router.post('/', verifyToken, FeedbackController.createFeedback);
router.get('/', verifyToken, FeedbackController.getAllFeedback);

module.exports = router;