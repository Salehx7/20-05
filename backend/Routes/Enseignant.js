const mongoose = require('mongoose');

const enseignantSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  specialite: { type: String, required: true },
  email: { type: String, required: true },
  dateNaissance: { type: Date },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Enseignant', enseignantSchema);