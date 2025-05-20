const Notification = require('../Models/Notification');
const User = require('../Models/User');
const Enseignant = require('../Models/Enseignant');
const Eleve = require('../Models/Eleve');
const Session = require('../Models/Session');

// Get notifications for a user
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);
    
    const unreadCount = await Notification.countDocuments({ 
      userId, 
      read: false 
    });
    
    res.status(200).json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
    }
    
    // Check if notification belongs to user
    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }
    
    notification.read = true;
    await notification.save();
    
    res.status(200).json({
      success: true,
      notification
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Toutes les notifications ont été marquées comme lues'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    
    const notification = await Notification.findOne({
      _id: notificationId,
      userId
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
    }
    
    await Notification.deleteOne({ _id: notificationId });
    
    res.status(200).json({
      success: true,
      message: 'Notification supprimée avec succès'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const count = await Notification.countDocuments({
      userId,
      read: false
    });
    
    res.status(200).json({
      success: true,
      count
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Create notification helper function (for internal use)
exports.createNotification = async (userId, title, message, options = {}) => {
  try {
    const notification = new Notification({
      userId,
      title,
      message,
      type: options.type || 'general',
      relatedId: options.relatedId,
      onModel: options.onModel,
      link: options.link
    });
    
    await notification.save();
    return notification;
  } catch (err) {
    console.error('Error creating notification:', err);
    return null;
  }
};

// Create notification for multiple users
exports.createNotificationForUsers = async (userIds, title, message, options = {}) => {
  try {
    const notifications = [];
    
    for (const userId of userIds) {
      const notification = await this.createNotification(
        userId,
        title,
        message,
        options
      );
      
      if (notification) {
        notifications.push(notification);
      }
    }
    
    return notifications;
  } catch (err) {
    console.error('Error creating notifications for users:', err);
    return [];
  }
};

// Helper function to format session date and time in a logical way
const formatSessionDateTime = (date, startTime, endTime) => {
  if (!date) return '';
  
  // Format the date
  const sessionDate = new Date(date);
  const formattedDate = sessionDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  // Format the time range
  let timeRange = '';
  if (startTime && endTime) {
    timeRange = ` de ${startTime} à ${endTime}`;
  } else if (startTime) {
    timeRange = ` à ${startTime}`;
  }
  
  return `le ${formattedDate}${timeRange}`;
};

// Send notifications to all students in a session
exports.notifyStudentsAboutSession = async (req, res) => {
  try {
    const { sessionId, notificationType } = req.body;
    
    // Verify user role is admin or enseignant
    if (req.user.role !== 'admin' && req.user.role !== 'enseignant') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }
    
    // Get session details
    const session = await Session.findById(sessionId)
      .populate('eleveIds');
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session non trouvée'
      });
    }
    
    // Format date and time for notification
    const formattedDateTime = formatSessionDateTime(session.date, session.heureDebut, session.heureFin);
    
    // Determine message based on notification type
    let title, message;
    if (notificationType === 'upcoming') {
      title = `Session à venir: ${session.nom}`;
      message = `Rappel: Vous avez une session ${session.nom} ${formattedDateTime}.`;
    } else if (notificationType === 'ongoing') {
      title = `Session en cours: ${session.nom}`;
      message = `La session ${session.nom} a commencé ${formattedDateTime}.`;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Type de notification invalide'
      });
    }
    
    // Send notifications to all students in the session
    let notificationCount = 0;
    for (const eleve of session.eleveIds) {
      if (eleve.userId) {
        await this.createNotification(
          eleve.userId,
          title,
          message,
          {
            type: 'session',
            relatedId: session._id,
            onModel: 'Session',
            link: `/sessions/${session._id}`
          }
        );
        notificationCount++;
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Notifications envoyées à ${notificationCount} élèves`
    });
  } catch (err) {
    console.error('Error sending notifications to students:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Create notification for multiple users
exports.createNotificationForUsers = async (userIds, title, message, metadata = {}) => {
  try {
    const notifications = userIds.map(userId => ({
      userId,
      title,
      message,
      type: metadata.type || 'general',
      relatedId: metadata.relatedId,
      onModel: metadata.onModel,
      link: metadata.link,
      read: false
    }));
    
    await Notification.insertMany(notifications);
    return true;
  } catch (err) {
    console.error('Error creating notifications for users:', err);
    return false;
  }
};

// Helper function to format time consistently
const formatTime = (timeString) => {
  // If the time is already in HH:MM format, return it
  if (/^\d{1,2}:\d{2}$/.test(timeString)) {
    return timeString;
  }
  
  // If the time is in HH:MM:SS format, remove seconds
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(timeString)) {
    return timeString.substring(0, 5);
  }
  
  // If it's just a number (hour), add minutes
  if (/^\d{1,2}$/.test(timeString)) {
    return `${timeString}:00`;
  }
  
  // Default case, return as is
  return timeString;
};

// Notify teacher about session assignment
exports.notifyTeacherAboutSession = async (session) => {
  try {
    if (!session.enseignantId) {
      return;
    }

    const enseignant = await Enseignant.findById(session.enseignantId);
    if (!enseignant || !enseignant.userId) {
      return;
    }

    // Format date and time in a more logical way
    const formattedDateTime = formatSessionDateTime(session.date, session.heureDebut, session.heureFin);

    await this.createNotification(
      enseignant.userId,
      `Vous avez été assigné à une session: ${session.nom}`,
      `Vous avez été assigné à la session ${session.nom} ${formattedDateTime}.`,
      {
        type: 'session',
        relatedId: session._id,
        onModel: 'Session',
        link: `/sessions/${session._id}`
      }
    );
  } catch (err) {
    console.error('Error notifying teacher about session:', err);
  }
};

// Send reminders for upcoming sessions
exports.sendSessionReminders = async () => {
  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // Find sessions happening tomorrow
    const upcomingSessions = await Session.find({
      date: {
        $gte: tomorrow,
        $lt: dayAfterTomorrow
      }
    }).populate('enseignantId').populate('eleveIds');

    for (const session of upcomingSessions) {
      // Format date and time in a more logical way
      const formattedDateTime = formatSessionDateTime(session.date, session.heureDebut, session.heureFin);
      
      // Notify teacher
      if (session.enseignantId && session.enseignantId.userId) {
        await this.createNotification(
          session.enseignantId.userId,
          `Rappel: Session demain - ${session.nom}`,
          `Rappel: Vous avez une session ${session.nom} demain ${formattedDateTime.replace('le ', '')}.`,
          {
            type: 'session',
            relatedId: session._id,
            onModel: 'Session',
            link: `/sessions/${session._id}`
          }
        );
      }

      // Notify students
      if (session.eleveIds && session.eleveIds.length > 0) {
        for (const eleve of session.eleveIds) {
          if (eleve && eleve.userId) {
            await this.createNotification(
              eleve.userId,
              `Rappel: Session demain - ${session.nom}`,
              `Rappel: Vous avez une session ${session.nom} demain ${formattedDateTime.replace('le ', '')}.`,
              {
                type: 'session',
                relatedId: session._id,
                onModel: 'Session',
                link: `/sessions/${session._id}`
              }
            );
          }
        }
      }
    }
  } catch (err) {
    console.error('Error sending session reminders:', err);
  }
};