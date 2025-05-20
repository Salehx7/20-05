const express = require('express');
const router = express.Router();
const NotificationController = require('../Controllers/NotificationController');
const verifyToken = require('../Middlewares/Auth');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Get user notifications
router.get('/', verifyToken, NotificationController.getUserNotifications);

// Mark notification as read
router.put('/:notificationId/read', verifyToken, NotificationController.markAsRead);

// Mark all notifications as read
router.put('/mark-all-read', verifyToken, NotificationController.markAllAsRead);

// New route to send notifications to students in a session
router.post('/notify-students', verifyToken, NotificationController.notifyStudentsAboutSession);

module.exports = router;