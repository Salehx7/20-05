const Chapitre = require('../Models/Chapitre');

// Create chapitre for a matiere
exports.createChapitre = async (req, res) => {
  try {
    const { titre, contenu, youtubeUrl, sessionUrl } = req.body;
    const matiere = req.params.matiereId;
    
    let pdfUrl = '';
    if (req.file) {
      pdfUrl = `/uploads/${req.file.filename}`;
    }
    
    const chapitre = new Chapitre({
      titre,
      contenu,
      matiere,
      pdfUrl,
      youtubeUrl,
      sessionUrl
    });
    
    await chapitre.save();
    res.status(201).json({ success: true, chapitre });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get chapitres by matiere
exports.getChapitresByMatiere = async (req, res) => {
  try {
    const chapitres = await Chapitre.find({ matiere: req.params.matiereId });
    res.json({ success: true, chapitres });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update chapitre
exports.updateChapitre = async (req, res) => {
  try {
    const { titre, contenu, youtubeUrl, sessionUrl } = req.body;
    const chapitreId = req.params.id;
    
    let updateData = { titre, contenu, youtubeUrl, sessionUrl };
    
    if (req.file) {
      updateData.pdfUrl = `/uploads/${req.file.filename}`;
    }
    
    const chapitre = await Chapitre.findByIdAndUpdate(
      chapitreId,
      updateData,
      { new: true }
    );
    
    if (!chapitre) {
      return res.status(404).json({ success: false, message: 'Chapitre not found' });
    }
    
    res.json({ success: true, chapitre });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete chapitre
exports.deleteChapitre = async (req, res) => {
  try {
    const chapitre = await Chapitre.findByIdAndDelete(req.params.id);
    if (!chapitre) return res.status(404).json({ success: false, message: 'Chapitre non trouvé' });
    res.json({ success: true, message: 'Chapitre supprimé' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Add this function definition before the export
exports.getChapitreById = async (req, res) => {
  try {
    const chapitre = await Chapitre.findById(req.params.id);
    if (!chapitre) {
      return res.status(404).json({ success: false, message: 'Chapitre not found' });
    }
    res.json({ success: true, chapitre });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};