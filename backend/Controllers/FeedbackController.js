const Feedback = require('../Models/Feedback');
const mongoose = require('mongoose');
const User = require('../Models/User'); // Add User model import

exports.createFeedback = async (req, res) => {
  try {
    const { senderRole, message } = req.body;
    // Get email from the authenticated user
    const userEmail = req.user.email; // Access from auth middleware
    
    // Log the received data for debugging
    console.log('Received feedback data:', { userEmail, senderRole, message });
    
    if (!userEmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'User email is required' 
      });
    }
    
    // Create feedback with email as senderId
    const feedback = new Feedback({ 
      senderId: userEmail, // Use email instead of ObjectId
      senderRole: senderRole || 'user',
      message 
    });
    
    await feedback.save();
    res.status(201).json({ success: true, feedback });
  } catch (error) {
    console.error('Feedback creation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json({ success: true, feedbacks });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};