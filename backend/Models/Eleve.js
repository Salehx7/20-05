const mongoose = require('mongoose');

const tunisianCities = [
  'Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte', 
  'Gabès', 'Ariana', 'Gafsa', 'Monastir', 'Ben Arous',
  'Kasserine', 'Médenine', 'Nabeul', 'Tataouine', 'Béja',
  'Kef', 'Mahdia', 'Sidi Bouzid', 'Jendouba', 'Tozeur',
  'Manouba', 'Siliana', 'Zaghouan', 'Kebili'
];

const tunisianLevels = [
  // Primaire
  '1ère année primaire',
  '2ème année primaire',
  '3ème année primaire',
  '4ème année primaire',
  '5ème année primaire',
  '6ème année primaire',
  // Collège
  '7ème année (1ère année collège)',
  '8ème année (2ème année collège)',
  '9ème année (3ème année collège)',
  // Lycée - Tronc commun
  '1ère année secondaire',
  // Lycée - 2ème année
  '2ème année - Sciences',
  '2ème année - Lettres',
  '2ème année - Economie et Services',
  '2ème année - Technologies de l\'informatique',
  '2ème année - Sciences techniques',
  // Lycée - 3ème année
  '3ème année - Sciences expérimentales',
  '3ème année - Mathématiques',
  '3ème année - Lettres',
  '3ème année - Economie et Gestion',
  '3ème année - Sciences techniques',
  '3ème année - Sciences informatiques',
  // Lycée - Bac
  '4ème année - Sciences expérimentales',
  '4ème année - Mathématiques',
  '4ème année - Lettres',
  '4ème année - Economie et Gestion',
  '4ème année - Sciences techniques',
  '4ème année - Sciences informatiques'
];

const eleveSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  dateNaissance: { type: Date },
  classe: { 
      type: String, 
      enum: tunisianLevels,
      required: true // Make it required instead of having a default value
  },
  email: { type: String, required: true, unique: true },
  ville: { type: String, enum: tunisianCities, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Eleve', eleveSchema);