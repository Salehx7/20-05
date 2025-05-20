const Eleve = require('../Models/Eleve');
const User = require('../Models/User');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

// Create student with user account
const createEleveWithUser = async (req, res) => {
  try {
    const { nom, prenom, dateNaissance, classe, email, password, ville } = req.body;

    // Vérification des champs requis
    if (!nom || !prenom || !classe || !email || !password || !ville) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont obligatoires'
      });
    }

    // Vérification si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    // Création de l'utilisateur
    const user = new User({
      name: `${prenom} ${nom}`,
      firstName: prenom,
      lastName: nom,
      email,
      password,
      role: 'eleve'
    });
    await user.save();

    // Création de l'élève
    const eleve = new Eleve({
      nom,
      prenom,
      dateNaissance,
      classe,
      email,
      ville,
      userId: user._id
    });
    await eleve.save();

    res.status(201).json({
      success: true,
      message: 'Élève créé avec succès',
      data: { eleve }
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la création de l\'élève'
    });
  }
};

// Get all students
// Update getAllEleves function
const getAllEleves = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {
            query = {
                $or: [
                    { nom: { $regex: search, $options: 'i' } },
                    { prenom: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { classe: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const eleves = await Eleve.find(query).populate('userId', 'email role');
        res.json({ 
            success: true,
            eleves 
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get student by ID
const getEleveById = async (req, res) => {
    try {
        const eleve = await Eleve.findById(req.params.id).populate('userId', 'email role');
        if (!eleve) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        res.json({ success: true, eleve });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update student
const updateEleve = async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, prenom, dateNaissance, classe, email, ville } = req.body;

        // Update student with ville field
        const updatedEleve = await Eleve.findByIdAndUpdate(
            id,
            { nom, prenom, dateNaissance, classe, email, ville },
            { new: true }
        );

        if (!updatedEleve) {
            return res.status(404).json({
                success: false,
                message: 'Élève non trouvé'
            });
        }

        // Update corresponding user
        await User.findByIdAndUpdate(
            updatedEleve.userId,
            { 
                name: `${prenom} ${nom}`,
                email: email,
                firstName: prenom,
                lastName: nom
            }
        );

        res.json({
            success: true,
            message: 'Élève mis à jour avec succès',
            eleve: updatedEleve
        });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de l\'élève',
            error: error.message
        });
    }
};

// Delete student
const deleteEleve = async (req, res) => {
    try {
        const { id } = req.params;

        // First find the student to get their userId
        const eleve = await Eleve.findById(id);
        if (!eleve) {
            return res.status(404).json({
                success: false,
                message: 'Élève non trouvé'
            });
        }

        // Delete the student record
        await Eleve.findByIdAndDelete(id);
        
        // Also delete the associated user account
        if (eleve.userId) {
            await User.findByIdAndDelete(eleve.userId);
        }

        res.json({
            success: true,
            message: 'Élève supprimé avec succès'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateEleveProfile = async (req, res) => {
    try {
        const { nom, prenom, dateNaissance, classe, ville } = req.body;
        const userId = req.user.id;

        // Find eleve by userId
        const eleve = await Eleve.findOne({ userId });
        if (!eleve) {
            return res.status(404).json({
                success: false,
                message: 'Profil élève non trouvé'
            });
        }

        // Update both eleve and user
        const [updatedEleve, updatedUser] = await Promise.all([
            Eleve.findByIdAndUpdate(
                eleve._id,
                { 
                    nom, 
                    prenom, 
                    dateNaissance, 
                    classe, 
                    ville 
                },
                { new: true }
            ).lean(),
            User.findByIdAndUpdate(
                userId,
                {
                    firstName: prenom,
                    lastName: nom,
                    name: `${prenom} ${nom}`
                },
                { new: true }
            ).lean()
        ]);

        res.json({
            success: true,
            message: 'Profil mis à jour avec succès',
            data: { 
                user: updatedUser,
                profile: updatedEleve
            }
        });
    } catch (error) {
        console.error('Error updating student profile:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du profil'
        });
    }
};

// Add to exports
module.exports = {
    createEleveWithUser,
    getAllEleves,
    getEleveById,
    updateEleve,
    deleteEleve,
    updateEleveProfile
};