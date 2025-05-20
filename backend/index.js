require('dotenv').config();
const express = require('express');
const connectToDatabase = require('../backend/Models/db');
const authRouter = require('./Routes/AuthRouter');
const routesMatiere = require('./Routes/RoutesMatiere');
const cors = require('cors');
const path = require('path');

const app = express();

// Autoriser toutes les origines
app.use(cors());

// Middleware
app.use(express.json());
// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connexion à MongoDB
connectToDatabase();

// Routes
app.use('/api/auth', authRouter);
app.use('/api/matieres', routesMatiere);

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur le port ${PORT}`);
});
