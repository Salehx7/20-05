const Administrateur = require('../Models/Administrateur');
const User = require('../Models/User');

const createAdministrateurWithUser = async (req, res) => {
    try {
        const { nom, prenom, dateNaissance, fonction, email, password } = req.body;

        // Create user first
        const user = new User({
            name: `${prenom} ${nom}`,
            email,
            password,
            role: 'admin'
        });

        const savedUser = await user.save();

        // Create administrator
        const administrateur = new Administrateur({
            nom,
            prenom,
            dateNaissance,
            fonction,
            email,
            userId: savedUser._id
        });

        await administrateur.save();

        res.status(201).json({
            success: true,
            message: 'Administrateur créé avec succès',
            administrateur
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createAdministrateurWithUser
};