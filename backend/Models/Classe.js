const mongoose = require('mongoose');

const classeSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    trim: true
  },
  niveau: {
    type: String,
    required: true,
    trim: true
  },
  annee: {
    type: String,
    required: true,
    trim: true
  },
  enseignant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enseignant'
  },
  eleves: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Eleve'
  }],
  matiere: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Matiere'
  }
}, { timestamps: true });

module.exports = mongoose.model('Classe', classeSchema);