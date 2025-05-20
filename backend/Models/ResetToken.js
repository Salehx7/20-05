const mongoose = require('mongoose');

const resetTokenSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true,
        trim: true,
        lowercase: true
    },
    token: { 
        type: String, 
        required: true 
    },
    expiresAt: { 
        type: Date, 
        required: true,
        default: () => new Date(Date.now() + 3600000) // 1 hour from now
    }
}, { timestamps: true });

// Add index for automatic deletion after expiration
resetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('ResetToken', resetTokenSchema);