const express = require('express');
const router = express.Router();

// Import all route modules
const authRouter = require('./AuthRouter');
const matiereRouter = require('./RoutesMatiere');
const sessionRouter = require('./SessionRouter');
const notificationRouter = require('./NotificationRouter');
const profileRouter = require('./ProfileRouter');
const studentRouter = require('./StudentRouter');
const assignmentRouter = require('./AssignmentRouter');
const contentRouter = require('./ContentRouter');
const classRouter = require('./ClassRouter');

// Register all routes
router.use('/auth', authRouter);
router.use('/matieres', matiereRouter);
router.use('/sessions', sessionRouter);
router.use('/notifications', notificationRouter);
router.use('/profile', profileRouter);
router.use('/students', studentRouter);
router.use('/assignments', assignmentRouter);
router.use('/content', contentRouter);
router.use('/classes', classRouter);

module.exports = router;