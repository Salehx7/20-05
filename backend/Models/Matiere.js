const mongoose = require('mongoose');

const matiereSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  description: { type: String },
  section: { type: String }, // Changed from categorie to section
  classe: { 
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'Au moins une classe doit être sélectionnée'
    }
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Enseignant',
    required: false // Changed from required: true to required: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Matiere', matiereSchema);