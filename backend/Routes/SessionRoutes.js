const express = require('express');
const router = express.Router();
const verifyToken = require('../Middlewares/Auth');
const SessionController = require('../Controllers/SessionController');

// Existing routes
router.get('/', SessionController.getAllSessions);
router.get('/form-data', SessionController.getFormData);
router.post('/', SessionController.createSession);
router.put('/:id', SessionController.updateSession);
router.delete('/:id', SessionController.deleteSession);
router.get('/upcoming/eleve/:eleveId', SessionController.getUpcomingSessionsForEleve);

// New routes for enhanced functionality
router.get('/:id/resources', SessionController.getSessionResources);
router.post('/:id/resources', SessionController.addSessionResource);
router.delete('/:id/resources/:resourceId', SessionController.deleteSessionResource);

router.get('/:id/attendance', SessionController.getSessionAttendance);
router.post('/:id/attendance', SessionController.updateAttendance);

router.get('/:id/feedback', SessionController.getSessionFeedback);
router.post('/:id/feedback', SessionController.addSessionFeedback);

module.exports = router;