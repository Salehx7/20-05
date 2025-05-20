const User = require('../Models/User');
const Enseignant = require('../Models/Enseignant');
const Eleve = require('../Models/Eleve');
const Administrateur = require('../Models/Administrateur');

// Get user profile based on role
exports.getProfile = async (req, res) => {
  try {
    // Get user ID from the authenticated request
    const userId = req.user.id;
    
    // Find the user
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }
    
    // Get role-specific profile data
    let profile = null;
    
    if (user.role === 'enseignant') {
      profile = await Enseignant.findOne({ userId: userId }).lean();
      // Optionally merge user info into profile
      if (profile) {
        profile.email = user.email;
        profile.role = user.role;
        // Add any other user fields you want to expose
      }
    } else if (user.role === 'eleve') {
      profile = await Eleve.findOne({ userId: userId });
    } else if (user.role === 'admin') {
      profile = await Administrateur.findOne({ userId: userId });
    }
    
    // Return user and profile data
    return res.status(200).json({
      success: true,
      data: {
        user,
        profile
      }
    });
    
  } catch (error) {
    console.error('Error in getProfile:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération du profil',
      error: error.message
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }
    
    // Update user email if provided
    if (req.body.email) {
      user.email = req.body.email;
    }
    
    // Handle password change if both current and new passwords are provided
    if (req.body.currentPassword && req.body.newPassword) {
      // Verify current password
      const isMatch = await user.comparePassword(req.body.currentPassword);
      if (!isMatch) {
        return res.status(400).json({ 
          success: false, 
          message: 'Mot de passe actuel incorrect' 
        });
      }
      
      // Set new password
      user.password = req.body.newPassword;
    }
    
    // Save user changes
    await user.save();
    
    // Update role-specific profile
    let profile = null;
    
    if (user.role === 'enseignant') {
      profile = await Enseignant.findOneAndUpdate(
        { userId: userId },
        { 
          nom: req.body.nom,
          prenom: req.body.prenom,
          matiere: req.body.matiere, // Using matiere as in frontend
          dateNaissance: req.body.dateNaissance
        },
        { new: true }
      );
    } else if (user.role === 'eleve') {
      profile = await Eleve.findOneAndUpdate(
        { userId: userId },
        { 
          nom: req.body.nom,
          prenom: req.body.prenom,
          classe: req.body.classe,
          ville: req.body.location, // Map location to ville
          dateNaissance: req.body.dateNaissance
        },
        { new: true }
      );
    } else if (user.role === 'admin') {
      profile = await Administrateur.findOneAndUpdate(
        { userId: userId },
        { 
          nom: req.body.nom,
          prenom: req.body.prenom,
          fonction: req.body.fonction,
          dateNaissance: req.body.dateNaissance
        },
        { new: true }
      );
    }
    
    return res.status(200).json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: {
        user: user.toObject({ getters: true, virtuals: true, versionKey: false }),
        profile
      }
    });
    
  } catch (error) {
    console.error('Error in updateProfile:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la mise à jour du profil',
      error: error.message
    });
  }
};