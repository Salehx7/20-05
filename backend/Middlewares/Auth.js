const jwt = require('jsonwebtoken');
const User = require('../Models/User');

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).json({ 
                success: false,
                message: 'Accès refusé, token manquant' 
            });
        }
        
        const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'Accès refusé, token manquant' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if user still exists and is active
        const user = await User.findById(decoded.id).select('+role +email');
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'Utilisateur non trouvé' 
            });
        }

        // Add user info to request
        req.user = {
            id: user._id,
            email: user.email,
            role: user.role
        };
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token expiré, veuillez vous reconnecter' 
            });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token invalide' 
            });
        }
        res.status(500).json({ 
            success: false,
            message: 'Erreur de vérification du token' 
        });
    }
};

module.exports = verifyToken;