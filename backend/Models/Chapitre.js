const mongoose = require('mongoose');

const chapitreSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  contenu: { type: String },
  youtubeUrl: { type: String },
  sessionUrl: { type: String },
  matiere: { type: mongoose.Schema.Types.ObjectId, ref: 'Matiere', required: true },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Enseignant',
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Chapitre', chapitreSchema);