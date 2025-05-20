require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./Routes/AuthRouter');
const enseignantRoutes = require('./Routes/RoutesEnseignant');
const eleveRoutes = require('./Routes/RoutesEleve');
const matiereRoutes = require('./Routes/RoutesMatiere');
const adminRoutes = require('./Routes/RoutesAdministrateur');
const profileRoutes = require('./Routes/ProfileRouter');
const sessionRoutes = require('./Routes/SessionRoutes');
const notificationRoutes = require('./Routes/NotificationRoutes');
const feedbackRoutes = require('./Routes/FeedbackRoutes'); // Add this line
// Change this line
const statisticsRoutes = require('./Routes/StatisticsRoutes');

// Import the cron job
const scheduleSessionReminders = require('./cron/sessionReminders');

const app = express();

// Middlewares with enhanced security
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (for uploads, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection with better error handling
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/school-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 15000
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// API Routes
// Route registrations
app.use('/api/auth', authRoutes);
app.use('/api/enseignants', enseignantRoutes);
app.use('/api/eleves', eleveRoutes);
app.use('/api/matieres', matiereRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/notifications', notificationRoutes); // Add this line
app.use('/api/feedback', feedbackRoutes); // Add this line
// The route registration remains the same
app.use('/api/statistics', statisticsRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);

  const errorResponse = {
    success: false,
    timestamp: new Date().toISOString(),
    path: req.path,
    message: 'Une erreur est survenue sur le serveur'
  };

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      ...errorResponse,
      message: 'Erreur de validation',
      details: err.message
    });
  }

  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    return res.status(500).json({
      ...errorResponse,
      message: 'Erreur de base de données',
      details: err.message
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      ...errorResponse,
      message: 'Non autorisé',
      details: 'Token invalide ou expiré'
    });
  }

  res.status(500).json(errorResponse);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
    path: req.path
  });
});

// Start the cron job for session reminders
scheduleSessionReminders();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}`);
});