const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  nom: { 
    type: String, 
    required: [true, 'Le nom de la session est requis'],
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  enseignantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Enseignant',
    required: [true, 'Un enseignant doit être associé']
  },
  eleveIds: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Eleve' 
  }],
  date: { 
    type: Date, 
    required: [true, 'La date est requise'],
    min: [new Date(), 'La date ne peut pas être dans le passé']
  },
  heureDebut: { 
    type: String, 
    required: [true, 'L\'heure de début est requise'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format heure invalide (HH:MM)']
  },
  heureFin: { 
    type: String, 
    required: [true, 'L\'heure de fin est requise'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format heure invalide (HH:MM)'],
    validate: {
      validator: function(v) {
        return this.heureDebut && v > this.heureDebut;
      },
      message: 'L\'heure de fin doit être après l\'heure de début'
    }
  },
  remarque: {
    type: String,
    maxlength: [500, 'La remarque ne peut pas dépasser 500 caractères']
  },
  lienDirect: {
    type: String,
    match: [/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, 'URL invalide']
  },
  lienSupport: {
    type: String,
    match: [/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, 'URL invalide']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Champ virtuel pour le statut
sessionSchema.virtual('statut').get(function() {
  const now = new Date();
  const sessionDate = new Date(this.date);
  
  // Comparaison des dates seulement (sans heures)
  const today = new Date(now.setHours(0, 0, 0, 0));
  const sessionDay = new Date(sessionDate.setHours(0, 0, 0, 0));

  if (sessionDay > today) return 'À venir';
  if (sessionDay < today) return 'Terminé';
  
  // Même jour - vérifier les heures
  const [startHours, startMins] = this.heureDebut.split(':');
  const startTime = new Date(sessionDate);
  startTime.setHours(parseInt(startHours), parseInt(startMins));
  
  const [endHours, endMins] = this.heureFin.split(':');
  const endTime = new Date(sessionDate);
  endTime.setHours(parseInt(endHours), parseInt(endMins));
  
  if (now < startTime) return 'À venir';
  if (now > endTime) return 'Terminé';
  return 'En cours';
});

module.exports = mongoose.model('Session', sessionSchema);