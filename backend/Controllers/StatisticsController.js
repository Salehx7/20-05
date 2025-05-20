const User = require('../Models/User');
const Eleve = require('../Models/Eleve');
const Enseignant = require('../Models/Enseignant');
const Session = require('../Models/Session');
const Matiere = require('../Models/Matiere');

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalStudents,
      totalTeachers,
      totalSessions,
      totalCourses
    ] = await Promise.all([
      Eleve.countDocuments(),
      Enseignant.countDocuments(),
      Session.countDocuments(),
      Matiere.countDocuments()
    ]);

    // Calculate growth percentages (comparing with last month)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const [
      lastMonthStudents,
      lastMonthTeachers,
      lastMonthSessions
    ] = await Promise.all([
      Eleve.countDocuments({ createdAt: { $lt: lastMonth } }),
      Enseignant.countDocuments({ createdAt: { $lt: lastMonth } }),
      Session.countDocuments({ createdAt: { $lt: lastMonth } })
    ]);

    const stats = {
      totalStudents,
      totalTeachers,
      totalSessions,
      totalCourses,
      growth: {
        students: lastMonthStudents ? ((totalStudents - lastMonthStudents) / lastMonthStudents * 100).toFixed(1) : 0,
        teachers: lastMonthTeachers ? ((totalTeachers - lastMonthTeachers) / lastMonthTeachers * 100).toFixed(1) : 0,
        sessions: lastMonthSessions ? ((totalSessions - lastMonthSessions) / lastMonthSessions * 100).toFixed(1) : 0
      }
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats
};