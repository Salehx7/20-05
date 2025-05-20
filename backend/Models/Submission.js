const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  eleveId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Eleve',
    required: true
  },
  content: {
    type: String
  },
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  submittedAt: {
    type: Date,
    default: Date.now
  },
  grade: {
    type: Number
  },
  feedback: {
    type: String
  },
  gradedAt: {
    type: Date
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enseignant'
  }
});

module.exports = mongoose.model('Submission', submissionSchema);