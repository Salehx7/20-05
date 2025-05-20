const Session = require('../Models/Session');
const Enseignant = require('../Models/Enseignant');
const Eleve = require('../Models/Eleve');
const Resource = require('../Models/Resource');
const Attendance = require('../Models/Attendance');
const Feedback = require('../Models/Feedback');

exports.getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate('enseignantId')
      .populate('eleveIds')
      .sort({ date: 1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFormData = async (req, res) => {
  try {
    const [enseignants, eleves] = await Promise.all([
      Enseignant.find().sort({ nom: 1 }),
      Eleve.find().sort({ nom: 1 })
    ]);
    res.json({ enseignants, eleves });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add these imports at the top
const NotificationController = require('./NotificationController');

// Update the createSession method
exports.createSession = async (req, res) => {
  try {
    const newSession = new Session(req.body);
    await newSession.save();
    
    const populatedSession = await Session.findById(newSession._id)
      .populate('enseignantId')
      .populate('eleveIds');
    
    // Send notifications
    await NotificationController.notifyTeacherAboutSession(newSession);
    await NotificationController.notifyStudentsAboutSession(newSession);
      
    res.status(201).json(populatedSession);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update the updateSession method
exports.updateSession = async (req, res) => {
  try {
    const oldSession = await Session.findById(req.params.id);
    const updatedSession = await Session.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    ).populate('enseignantId').populate('eleveIds');
    
    if (!updatedSession) {
      return res.status(404).json({ message: 'Session non trouvée' });
    }

    // Check if teacher was changed
    if (oldSession && oldSession.enseignantId.toString() !== updatedSession.enseignantId.toString()) {
      await NotificationController.notifyTeacherAboutSession(updatedSession);
    }

    // Check if students were added
    if (oldSession) {
      const oldEleveIds = oldSession.eleveIds.map(id => id.toString());
      const newEleveIds = updatedSession.eleveIds.map(id => id.toString());
      
      // Find new students that weren't in the old session
      const newStudents = newEleveIds.filter(id => !oldEleveIds.includes(id));
      
      if (newStudents.length > 0) {
        // Create a copy of the session with only the new students
        const sessionForNewStudents = {
          ...updatedSession.toObject(),
          eleveIds: newStudents
        };
        await NotificationController.notifyStudentsAboutSession(sessionForNewStudents);
      }
    }
    
    res.json(updatedSession);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    const deletedSession = await Session.findByIdAndDelete(req.params.id);
    if (!deletedSession) {
      return res.status(404).json({ message: 'Session non trouvée' });
    }
    res.json({ message: 'Session supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUpcomingSessionsForEleve = async (req, res) => {
  try {
    const eleveId = req.params.eleveId;
    const now = new Date();

    // Find sessions where the student is enrolled and the session is in the future
    const sessions = await Session.find({
      eleves: eleveId,
      date: { $gte: now }
    }).sort({ date: 1 });

    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add these methods to your existing SessionController.js file

// Get resources for a session
exports.getSessionResources = async (req, res) => {
  try {
    const { id } = req.params;
    const resources = await Resource.find({ sessionId: id }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      resources
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Add a resource to a session
exports.addSessionResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, url, type } = req.body;
    
    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ 
        success: false,
        message: 'Session non trouvée' 
      });
    }
    
    const resource = new Resource({
      sessionId: id,
      name,
      url,
      type,
      uploadedBy: req.user.id
    });
    
    await resource.save();
    
    res.status(201).json({
      success: true,
      resource
    });
  } catch (err) {
    res.status(400).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Delete a resource
exports.deleteSessionResource = async (req, res) => {
  try {
    const { id, resourceId } = req.params;
    
    const resource = await Resource.findOne({ 
      _id: resourceId,
      sessionId: id
    });
    
    if (!resource) {
      return res.status(404).json({ 
        success: false,
        message: 'Ressource non trouvée' 
      });
    }
    
    await Resource.findByIdAndDelete(resourceId);
    
    res.status(200).json({
      success: true,
      message: 'Ressource supprimée avec succès'
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Get attendance for a session
exports.getSessionAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First check if session exists
    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ 
        success: false,
        message: 'Session non trouvée' 
      });
    }
    
    // Get all students in this session
    const students = await Eleve.find({ _id: { $in: session.eleveIds } });
    
    // Get existing attendance records
    const attendanceRecords = await Attendance.find({ sessionId: id });
    
    // Map students to attendance data
    const attendanceData = students.map(student => {
      const record = attendanceRecords.find(
        record => record.eleveId.toString() === student._id.toString()
      );
      
      return {
        eleveId: student._id,
        nom: student.nom,
        prenom: student.prenom,
        email: student.email,
        present: record ? record.present : null,
        joinTime: record ? record.joinTime : null,
        leaveTime: record ? record.leaveTime : null
      };
    });
    
    res.status(200).json({
      success: true,
      attendance: attendanceData
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Update attendance for a student in a session
exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { eleveId, present, notes } = req.body;
    
    // Check if session exists
    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ 
        success: false,
        message: 'Session non trouvée' 
      });
    }
    
    // Check if student is part of this session
    if (!session.eleveIds.includes(eleveId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Cet élève n\'est pas inscrit à cette session' 
      });
    }
    
    // Update or create attendance record
    const attendance = await Attendance.findOneAndUpdate(
      { sessionId: id, eleveId },
      { 
        present,
        notes,
        joinTime: present ? new Date() : null
      },
      { new: true, upsert: true }
    );
    
    res.status(200).json({
      success: true,
      attendance
    });
  } catch (err) {
    res.status(400).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Get feedback for a session
exports.getSessionFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    
    const feedback = await Feedback.find({ sessionId: id })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      feedback
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Add feedback to a session
exports.addSessionFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    
    // Check if session exists
    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ 
        success: false,
        message: 'Session non trouvée' 
      });
    }
    
    const feedback = new Feedback({
      sessionId: id,
      userId: req.user.id,
      message
    });
    
    await feedback.save();
    
    res.status(201).json({
      success: true,
      feedback
    });
  } catch (err) {
    res.status(400).json({ 
      success: false,
      message: err.message 
    });
  }
};