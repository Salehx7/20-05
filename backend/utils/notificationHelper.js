const Notification = require('../Models/Notification');

/**
 * Create a session notification for a student
 * @param {string} studentId - The ID of the student
 * @param {Object} session - The session object
 * @param {string} action - The action (created, updated, cancelled)
 */
const createSessionNotification = async (studentId, session, action) => {
  try {
    let title, message;
    
    switch (action) {
      case 'created':
        title = 'Nouvelle session programmée';
        message = `Une nouvelle session "${session.nom}" a été programmée pour vous le ${new Date(session.date).toLocaleDateString('fr-FR')}.`;
        break;
      case 'updated':
        title = 'Session mise à jour';
        message = `La session "${session.nom}" du ${new Date(session.date).toLocaleDateString('fr-FR')} a été mise à jour.`;
        break;
      case 'cancelled':
        title = 'Session annulée';
        message = `La session "${session.nom}" du ${new Date(session.date).toLocaleDateString('fr-FR')} a été annulée.`;
        break;
      default:
        title = 'Mise à jour de session';
        message = `Mise à jour concernant la session "${session.nom}" du ${new Date(session.date).toLocaleDateString('fr-FR')}.`;
    }
    
    await Notification.create({
      userId: studentId,
      title,
      message,
      type: 'session',
      relatedId: session._id
    });
    
  } catch (error) {
    console.error('Error creating session notification:', error);
  }
};

module.exports = {
  createSessionNotification
};