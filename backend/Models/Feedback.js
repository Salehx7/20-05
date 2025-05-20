const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  senderId: { 
    type: String, // Changed from ObjectId to String
    required: true 
  },
  senderRole: { type: String, required: true },
  message: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);