const mongoose = require('mongoose');

const chapitreSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  contenu: String,
  youtubeUrl: String,
  sessionUrl: String
});

const coursSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  description: String,
  section: { 
    type: String, 
    required: true,
    enum: ['Scientifique', 'Littéraire', 'Technique', 'Informatique']
  },
  classe: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'At least one class must be selected'
    }
  },
  chapitres: [chapitreSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Cours', coursSchema);