const Assignment = require('../Models/Assignment');
const Submission = require('../Models/Submission');
const Enseignant = require('../Models/Enseignant');
const Eleve = require('../Models/Eleve');

// Get all assignments
exports.getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('classId')
      .populate('createdBy')
      .sort({ dueDate: 1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Get assignments by teacher
exports.getAssignmentsByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const assignments = await Assignment.find({ createdBy: teacherId })
      .populate('classId')
      .sort({ dueDate: 1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Get assignments by class
exports.getAssignmentsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const assignments = await Assignment.find({ classId })
      .populate('createdBy')
      .sort({ dueDate: 1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Get assignment by ID
exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('classId')
      .populate('createdBy');
    
    if (!assignment) {
      return res.status(404).json({ message: 'Devoir non trouvé' });
    }
    
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Create assignment
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, classId, dueDate, totalPoints, type } = req.body;
    const createdBy = req.user.id; // From auth middleware
    
    const assignment = new Assignment({
      title,
      description,
      classId,
      dueDate,
      totalPoints,
      type,
      createdBy
    });
    
    await assignment.save();
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Update assignment
exports.updateAssignment = async (req, res) => {
  try {
    const { title, description, classId, dueDate, totalPoints, type } = req.body;
    
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Devoir non trouvé' });
    }
    
    // Check if user is the creator
    if (assignment.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé' });
    }
    
    assignment.title = title;
    assignment.description = description;
    assignment.classId = classId;
    assignment.dueDate = dueDate;
    assignment.totalPoints = totalPoints;
    assignment.type = type;
    
    await assignment.save();
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Delete assignment
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Devoir non trouvé' });
    }
    
    // Check if user is the creator
    if (assignment.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé' });
    }
    
    // Delete all submissions for this assignment
    await Submission.deleteMany({ assignmentId: req.params.id });
    
    // Delete the assignment
    await Assignment.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Devoir supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Get submissions for an assignment
exports.getSubmissions = async (req, res) => {
  try {
    const { id } = req.params;
    const submissions = await Submission.find({ assignmentId: id })
      .populate('eleveId')
      .sort({ submittedAt: -1 });
    
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Grade a submission
exports.gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;
    
    const submission = await Submission.findById(submissionId);
    
    if (!submission) {
      return res.status(404).json({ message: 'Soumission non trouvée' });
    }
    
    submission.grade = grade;
    submission.feedback = feedback;
    submission.gradedAt = Date.now();
    submission.gradedBy = req.user.id;
    
    await submission.save();
    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};