import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Grid, 
  Box, 
  Button, 
  Divider,
  CircularProgress,
  useTheme
} from '@mui/material';
import { 
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Timeline as TimelineIcon,
  MenuBook as MenuBookIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  DashboardContainer, 
  StatCard, 
  ActivityCard, 
  WelcomeSection,
  UpcomingSession,
  ActivityItem
} from '../components/DashboardComponents';

function StudentDashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    upcomingSessions: 0,
    averageScore: 0
  });
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (!token || !userId) {
          navigate('/login');
          return;
        }
        
        // Get user data
        setUser({
          _id: userId,
          nom: localStorage.getItem('userName'),
          prenom: localStorage.getItem('userPrenom'),
          role: localStorage.getItem('role')
        });
        
        // Fetch upcoming sessions
        const sessionsResponse = await axios.get(
          `http://localhost:5000/api/sessions/upcoming/eleve/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setUpcomingSessions(sessionsResponse.data || []);
        
        // Fetch notifications for recent activities
        const notificationsResponse = await axios.get(
          'http://localhost:5000/api/notifications',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setRecentActivities(notificationsResponse.data.notifications || []);
        
        // Set mock stats for now - in a real app, you'd fetch these from the backend
        setStats({
          totalSessions: sessionsResponse.data.length || 0,
          completedSessions: sessionsResponse.data.filter(s => new Date(s.date) < new Date()).length || 0,
          upcomingSessions: sessionsResponse.data.filter(s => new Date(s.date) >= new Date()).length || 0,
          averageScore: 85 // Mock data
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <DashboardContainer>
      <WelcomeSection user={user} />
      
      {/* Stats Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Sessions Totales" 
            value={stats.totalSessions} 
            icon={<EventIcon />} 
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Sessions Complétées" 
            value={stats.completedSessions} 
            icon={<CheckCircleIcon />} 
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Sessions à Venir" 
            value={stats.upcomingSessions} 
            icon={<AccessTimeIcon />} 
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Score Moyen" 
            value={`${stats.averageScore}%`} 
            icon={<TimelineIcon />} 
            color={theme.palette.warning.main}
            trend="up"
            subtitle="Progression +5%"
          />
        </Grid>
      </Grid>
      
      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Upcoming Sessions */}
        <Grid item xs={12} md={6}>
          <ActivityCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Sessions à Venir
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => navigate('/sessions')}
              >
                Voir tout
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {upcomingSessions.length > 0 ? (
              upcomingSessions.slice(0, 5).map((session) => (
                <UpcomingSession 
                  key={session._id} 
                  session={session} 
                  onClick={() => navigate(`/sessions/${session._id}`)}
                />
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  Aucune session à venir
                </Typography>
              </Box>
            )}
          </ActivityCard>
        </Grid>
        
        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <ActivityCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Activités Récentes
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => navigate('/notifications')}
              >
                Voir tout
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {recentActivities.length > 0 ? (
              recentActivities.slice(0, 5).map((activity) => (
                <ActivityItem 
                  key={activity._id}
                  title={activity.title}
                  description={activity.message}
                  time={new Date(activity.createdAt).toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  icon={activity.type === 'session' ? <EventIcon /> : <MenuBookIcon />}
                  color={activity.type === 'session' ? 'primary' : 'secondary'}
                />
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  Aucune activité récente
                </Typography>
              </Box>
            )}
          </ActivityCard>
        </Grid>
        
        {/* My Courses */}
        <Grid item xs={12}>
          <ActivityCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Mes Matières
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => navigate('/mes-matieres')}
              >
                Voir tout
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              {[1, 2, 3, 4].map((item) => (
                <Grid item xs={12} sm={6} md={3} key={item}>
                  <Box 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        transform: 'translateY(-5px)'
                      }
                    }}
                    onClick={() => navigate('/mes-matieres')}
                  >
                    <Box 
                      sx={{ 
                        width: 60, 
                        height: 60, 
                        borderRadius: '50%', 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                        background: `${theme.palette.primary.light}`,
                        color: theme.palette.primary.main
                      }}
                    >
                      <SchoolIcon fontSize="large" />
                    </Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {['Mathématiques', 'Physique', 'Chimie', 'Biologie'][item - 1]}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {['Algèbre et Géométrie', 'Mécanique', 'Chimie organique', 'Anatomie'][item - 1]}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </ActivityCard>
        </Grid>
      </Grid>
    </DashboardContainer>
  );
}

export default StudentDashboard;