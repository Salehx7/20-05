const User = require('../Models/User');
const jwt = require('jsonwebtoken');
const { registerValidation, loginValidation } = require('../Middlewares/AuthValidation');
const VerificationCode = require('../Models/VerificationCode');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const ResetToken = require('../Models/ResetToken');

// Configure nodemailer for password reset
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Enregistrer un utilisateur
const registerUser = async (req, res) => {
    try {
        const { error } = registerValidation(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        // Verify the code for non-admin registrations
        if (req.body.role === 'eleve') {
            const verificationCode = await VerificationCode.findOne({ 
                email: req.body.email,
                code: req.body.code
            });

            if (!verificationCode || verificationCode.expiresAt < new Date()) {
                return res.status(400).json({
                    success: false,
                    message: 'Code de vérification invalide ou expiré'
                });
            }
        }

        // Check if user exists
        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists) {
            return res.status(400).json({
                success: false,
                message: 'Email déjà utilisé'
            });
        }

        // Create new user
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            role: req.body.role || 'eleve'
        });

        const savedUser = await user.save();

        // Create and return token
        const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET);
        
        res.status(201).json({
            success: true,
            message: 'Utilisateur créé avec succès',
            token,
            user: {
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                role: savedUser.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Connecter un utilisateur
const loginUser = async (req, res) => {
    try {
        const { error } = loginValidation(req.body);
        if (error) {
            return res.status(400).json({ 
                success: false,
                message: error.details[0].message 
            });
        }

        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'Utilisateur non trouvé' 
            });
        }

        const validPassword = await user.comparePassword(req.body.password);
        if (!validPassword) {
            return res.status(401).json({ 
                success: false,
                message: 'Mot de passe incorrect' 
            });
        }

        // Generate token with user role
        const token = jwt.sign(
            { 
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            success: true,
            message: 'Connexion réussie',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erreur serveur',
            error: error.message 
        });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Aucun compte associé à cet email'
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        await ResetToken.create({
            email: user.email,
            token: resetToken,
            expiresAt: new Date(Date.now() + 3600000)
        });

        const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Réinitialisation de mot de passe',
            html: `
                <h1>Réinitialisation de votre mot de passe</h1>
                <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
                <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
                <a href="${resetUrl}">Réinitialiser mon mot de passe</a>
                <p>Ce lien expire dans 1 heure.</p>
                <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: 'Email de réinitialisation envoyé'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'envoi de l\'email'
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        const resetToken = await ResetToken.findOne({
            token,
            expiresAt: { $gt: new Date() }
        });

        if (!resetToken) {
            return res.status(400).json({
                success: false,
                message: 'Token invalide ou expiré'
            });
        }

        const user = await User.findOne({ email: resetToken.email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        // Update password
        user.password = password;
        await user.save();

        // Delete used token
        await ResetToken.deleteOne({ _id: resetToken._id });

        res.json({
            success: true,
            message: 'Mot de passe réinitialisé avec succès'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la réinitialisation du mot de passe'
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword
};
