const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../Models/User');
const Enseignant = require('../Models/Enseignant');

const createEnseignantWithUser = async (req, res) => {
  try {
    const { nom, prenom, specialite, email, password, dateNaissance } = req.body;

    // Validate required fields
    if (!nom || !prenom || !specialite || !email || !password) {
      return res.status(400).json({
        message: 'Missing required fields',
        missing: {
          nom: !nom,
          prenom: !prenom,
          specialite: !specialite,
          email: !email,
          password: !password
        }
      });
    }

    // Check for existing user or teacher
    const existingUser = await User.findOne({ email });
    const existingTeacher = await Enseignant.findOne({ email });

    if (existingUser || existingTeacher) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    // Create user
    const user = new User({
      firstName: prenom,
      lastName: nom,
      name: `${prenom} ${nom}`,
      email,
      password,
      role: 'enseignant'
    });
    await user.save();

    // Create teacher
    const enseignant = new Enseignant({
      nom,
      prenom,
      specialite,
      email,
      dateNaissance: dateNaissance ? new Date(dateNaissance) : undefined,
      userId: user._id
    });
    await enseignant.save();

    res.status(201).json({
      message: 'Teacher created successfully',
      enseignant,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error creating teacher:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

const updateEnseignant = async (req, res) => {
  try {
    const { nom, prenom, specialite, dateNaissance, email } = req.body;
    
    // Find teacher and associated user
    const enseignant = await Enseignant.findById(req.params.id);
    if (!enseignant) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Update teacher
    const updatedEnseignant = await Enseignant.findByIdAndUpdate(
      req.params.id,
      { 
        nom, 
        prenom, 
        specialite, 
        email,
        dateNaissance: dateNaissance ? new Date(dateNaissance) : undefined 
      },
      { new: true, runValidators: true }
    );

    // Update associated user
    await User.findByIdAndUpdate(
      enseignant.userId,
      {
        firstName: prenom,
        lastName: nom,
        name: `${prenom} ${nom}`,
        email
      }
    );

    res.status(200).json({ 
      message: 'Teacher updated successfully',
      enseignant: updatedEnseignant 
    });
  } catch (error) {
    console.error('Error updating teacher:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteEnseignant = async (req, res) => {
  try {
    const enseignant = await Enseignant.findById(req.params.id);
    if (!enseignant) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Delete teacher and associated user
    await Promise.all([
      Enseignant.findByIdAndDelete(req.params.id),
      User.findByIdAndDelete(enseignant.userId)
    ]);

    res.status(200).json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllEnseignants = async (req, res) => {
  try {
    const { search, inactive } = req.query;
    let query = Enseignant.find();
    if (search) query = query.where('nom').regex(new RegExp(search, 'i'));
    if (inactive === 'true') query = query.where('active').equals(false);
    const enseignants = await query;
    res.status(200).json({ enseignants });
  } catch (error) {
    console.error('Error fetching teachers:', error.stack);
    res.status(500).json({ message: 'Server error' });
  }
};

const getEnseignantById = async (req, res) => {
  try {
    const enseignant = await Enseignant.findById(req.params.id);
    if (!enseignant) return res.status(404).json({ message: 'Teacher not found' });
    res.status(200).json({ enseignant });
  } catch (error) {
    console.error('Error fetching teacher:', error.stack);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createEnseignantWithUser,
  getAllEnseignants,
  getEnseignantById,
  updateEnseignant,
  deleteEnseignant
};