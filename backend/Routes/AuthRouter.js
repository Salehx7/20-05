const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../Models/User');
const { registerUser, loginUser, forgotPassword, resetPassword } = require('../Controllers/AuthController');
const VerificationCode = require('../Models/VerificationCode');
const nodemailer = require('nodemailer');
const ResetToken = require('../Models/ResetToken');

// Configure nodemailer
const transporterVerification = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Route for registration
router.post('/register', registerUser);

// Route for login
router.post('/login', loginUser);

// Route pour envoyer un code de vérification
router.post('/send-verification-code', async (req, res) => {
    console.log('Requête reçue pour /send-verification-code avec :', req.body);
    const { email } = req.body;

    if (!email) {
        console.log('Email manquant dans la requête');
        return res.status(400).json({ success: false, message: 'Email requis' });
    }

    // Vérifier si l’utilisateur existe déjà
    console.log('Vérification si l’utilisateur existe pour email :', email);
    const userExists = await User.findOne({ email });
    if (userExists) {
        console.log('Utilisateur déjà existant pour email :', email);
        return res.status(400).json({ success: false, message: 'Cet email est déjà utilisé' });
    }

    // Générer un code de vérification (6 chiffres)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expire dans 10 minutes
    console.log('Code généré :', verificationCode, 'expire à :', expiresAt);

    // Stocker le code dans la base de données
    try {
        console.log('Sauvegarde du code de vérification dans la base de données...');
        await VerificationCode.findOneAndUpdate(
            { email },
            { email, code: verificationCode, expiresAt },
            { upsert: true, new: true }
        );
        console.log('Code de vérification sauvegardé avec succès');
    } catch (error) {
        console.error('Erreur lors de la sauvegarde du code de vérification :', error);
        return res.status(500).json({ success: false, message: 'Erreur lors de la génération du code' });
    }

    // Envoyer l’email avec le code
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Code de vérification pour votre inscription',
        text: `Votre code de vérification est : ${verificationCode}. Ce code expire dans 10 minutes.`,
    };

    try {
        console.log('Envoi de l’email à :', email, 'via :', process.env.EMAIL_USER);
        const info = await transporterVerification.sendMail(mailOptions);
        console.log('Email envoyé avec succès. Message ID :', info.messageId);
        console.log(`Code de vérification envoyé à : ${email}`);
        res.status(200).json({ success: true, message: 'Code de vérification envoyé à votre email' });
    } catch (error) {
        console.error('Erreur lors de l’envoi de l’email :', error);
        return res.status(500).json({ success: false, message: 'Erreur lors de l’envoi de l’email', error: error.message });
    }
});

// Route pour vérifier le code
router.post('/verify-code', async (req, res) => {
    console.log('Requête reçue pour /verify-code avec :', req.body);
    const { email, code } = req.body;

    if (!email || !code) {
        console.log('Email ou code manquant dans la requête');
        return res.status(400).json({ success: false, message: 'Email et code requis' });
    }

    // Vérifier le code
    console.log('Vérification du code pour email :', email);
    const codeDoc = await VerificationCode.findOne({ email });
    if (!codeDoc || codeDoc.expiresAt < new Date()) {
        console.log('Code invalide ou expiré pour email :', email);
        return res.status(400).json({ success: false, message: 'Code invalide ou expiré' });
    }

    if (codeDoc.code !== code) {
        console.log('Code incorrect pour email :', email, 'Code attendu :', codeDoc.code, 'Code reçu :', code);
        return res.status(400).json({ success: false, message: 'Code incorrect' });
    }

    console.log('Code vérifié avec succès pour email :', email);
    res.status(200).json({ success: true, message: 'Code vérifié avec succès' });
});

// Route pour demander la réinitialisation du mot de passe
router.post('/forgot-password', forgotPassword);

// Route pour réinitialiser le mot de passe
router.post('/reset-password', resetPassword);

// Route pour récupérer le profil de l'utilisateur
router.get('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Token manquant' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        res.status(200).json({ success: true, email: user.email, role: user.role });
    } catch (error) {
        console.error('Erreur lors de la récupération du profil :', error);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
});

// Route pour mettre à jour le profil de l'utilisateur
router.put('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Token manquant' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        const { email, password } = req.body;

        // Mettre à jour les champs
        if (email) user.email = email;
        if (password) {
            user.password = password; // Will be hashed by pre-save hook
        }

        await user.save();
        res.status(200).json({ success: true, message: 'Profil mis à jour avec succès' });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du profil :', error);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
});

// Route pour rafraîchir le token (disabled since refreshToken field doesn't exist)
router.post('/refresh-token', async (req, res) => {
    res.status(501).json({ success: false, message: 'Rafraîchissement de token non implémenté.' });
});

// Route pour supprimer un utilisateur
router.delete('/user/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Utilisateur supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;