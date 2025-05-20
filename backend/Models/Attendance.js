const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  eleveId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Eleve',
    required: true
  },
  present: {
    type: Boolean,
    default: false
  },
  joinTime: {
    type: Date
  },
  leaveTime: {
    type: Date
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Compound index to ensure one attendance record per student per session
attendanceSchema.index({ sessionId: 1, eleveId: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);