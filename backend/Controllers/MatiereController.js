const Matiere = require('../Models/Matiere');
const Chapitre = require('../Models/Chapitre');

// Create a new Matiere
const createMatiere = async (req, res) => {
  try {
    // Create matiere with section instead of categorie
    const matiere = new Matiere({
      ...req.body,
      createdBy: req.user?.enseignantId || req.body.createdBy || null
    });
    await matiere.save();
    res.status(201).json({ success: true, matiere });
  } catch (error) {
    console.error('Error creating matiere:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get all Matieres
const getMatieres = async (req, res) => {
  try {
    const matieres = await Matiere.find().populate('createdBy', 'nom prenom');
    res.json({ success: true, matieres });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Matiere by ID
const getMatiereById = async (req, res) => {
  try {
    const matiere = await Matiere.findById(req.params.id).populate('createdBy', 'nom prenom');
    if (!matiere) return res.status(404).json({ success: false, message: "Matière non trouvée" });
    res.json({ success: true, matiere });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update Matiere
const updateMatiere = async (req, res) => {
  try {
    const matiere = await Matiere.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!matiere) return res.status(404).json({ success: false, message: "Matière non trouvée" });
    res.json({ success: true, matiere });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete Matiere
const deleteMatiere = async (req, res) => {
  try {
    const matiere = await Matiere.findByIdAndDelete(req.params.id);
    if (!matiere) return res.status(404).json({ success: false, message: "Matière non trouvée" });
    res.json({ success: true, message: "Matière supprimée" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Chapitres by Matiere
const getChapitresByMatiere = async (req, res) => {
  try {
    const chapitres = await Chapitre.find({ matiere: req.params.id }).populate('createdBy', 'nom prenom');
    res.json({ success: true, chapitres });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add this function
const getMatieresWithChapitres = async (req, res) => {
  try {
    const matieres = await Matiere.find().populate('createdBy', 'nom prenom');
    const matieresWithChapitres = await Promise.all(
      matieres.map(async (matiere) => {
        const chapitres = await Chapitre.find({ matiere: matiere._id });
        return { ...matiere.toObject(), chapitres };
      })
    );
    res.json({ success: true, matieres: matieresWithChapitres });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
const getMatieresByLevel = async (req, res) => {
  try {
    const { level } = req.params;
    const matieres = await Matiere.find({ classe: level }).populate('createdBy', 'nom prenom');
    res.json({ success: true, matieres });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Export all functions
module.exports = {
  createMatiere,
  getMatieres,
  getMatieresByLevel, // <-- Ajoutez cette ligne
  getMatiereById,
  updateMatiere,
  deleteMatiere,
  getChapitresByMatiere,
  getMatieresWithChapitres
};