const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Administrateur = require('./Administrateur');
const Enseignant = require('./Enseignant');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'eleve', 'enseignant'],
        default: 'eleve'
    },
    specialite: { // Facultatif sauf pour enseignants
        type: String
    }
}, {
    timestamps: true
});

// 🔐 Hash du mot de passe avant sauvegarde
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// 🔍 Comparaison de mot de passe
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// 📌 Création automatique d'enseignant ou d'administrateur après sauvegarde
userSchema.post('save', async function (doc) {
    try {
        if (doc.role === 'admin') {
            const existingAdmin = await Administrateur.findOne({ userId: doc._id });

            if (!existingAdmin) {
                const [prenom, nom] = doc.name.split(' ');

                const administrateur = new Administrateur({
                    nom: nom || '',
                    prenom: prenom || '',
                    email: doc.email,
                    fonction: 'Administrateur',
                    userId: doc._id
                });

                await administrateur.save();
            }
        }
        // Modifier le hook post-save pour éviter la double création
        userSchema.post('save', async function (doc) {
            try {
                if (doc.role === 'admin') {
                    const existingAdmin = await Administrateur.findOne({ userId: doc._id });

                    if (!existingAdmin) {
                        const [prenom, nom] = doc.name.split(' ');

                        const administrateur = new Administrateur({
                            nom: nom || '',
                            prenom: prenom || '',
                            email: doc.email,
                            fonction: 'Administrateur',
                            userId: doc._id
                        });

                        await administrateur.save();
                    }
                }
                // Suppression de la partie enseignant car elle est gérée par EnseignantController
            } catch (error) {
                console.error('Erreur lors de la création liée au rôle utilisateur :', error);
            }
        });
    } catch (error) {
        console.error('Erreur lors de la création liée au rôle utilisateur :', error);
    }
});

module.exports = mongoose.model('User', userSchema);
