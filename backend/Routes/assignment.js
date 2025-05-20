const express = require('express');
const router = express.Router();
const AssignmentController = require('../Controllers/AssignmentController');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all assignments
router.get('/', AssignmentController.getAllAssignments);

// Get assignments by teacher
router.get('/teacher/:teacherId', AssignmentController.getAssignmentsByTeacher);

// Get assignments by class
router.get('/class/:classId', AssignmentController.getAssignmentsByClass);

// Get assignment by ID
router.get('/:id', AssignmentController.getAssignmentById);

// Create assignment
router.post('/', AssignmentController.createAssignment);

// Update assignment
router.put('/:id', AssignmentController.updateAssignment);

// Delete assignment
router.delete('/:id', AssignmentController.deleteAssignment);

// Get submissions for an assignment
router.get('/:id/submissions', AssignmentController.getSubmissions);

// Grade a submission
router.put('/submissions/:submissionId/grade', AssignmentController.gradeSubmission);

module.exports = router;