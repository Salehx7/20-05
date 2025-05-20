const cron = require('node-cron');
const NotificationController = require('../Controllers/NotificationController');

// Schedule task to run at 8:00 AM every day
const scheduleSessionReminders = () => {
  cron.schedule('0 8 * * *', async () => {
    console.log('Running session reminder task...');
    await NotificationController.sendSessionReminders();
    console.log('Session reminder task completed');
  });
};

module.exports = scheduleSessionReminders;