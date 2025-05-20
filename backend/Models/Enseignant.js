const mongoose = require('mongoose');

const enseignantSchema = new mongoose.Schema({
    nom: { 
        type: String, 
        required: true,
        trim: true
    },
    prenom: { 
        type: String, 
        required: true,
        trim: true
    },
    specialite: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    dateNaissance: { 
        type: Date 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        unique: true
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Enseignant', enseignantSchema);