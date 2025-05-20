import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Grid, 
  Box, 
  Button, 
  Divider,
  CircularProgress,
  useTheme,
  Avatar,
  AvatarGroup,
  Chip
} from '@mui/material';
import { 
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Timeline as TimelineIcon,
  MenuBook as MenuBookIcon,
  Person as PersonIcon
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

function TeacherDashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSessions: 0,
    completedSessions: 0,
    upcomingSessions: 0
  });
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [students, setStudents] = useState([]);
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
          `http://localhost:5000/api/sessions/enseignant/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const sessions = sessionsResponse.data || [];
        setUpcomingSessions(sessions.filter(s => new Date(s.date) >= new Date()));
        
        // Fetch notifications for recent activities
        const notificationsResponse = await axios.get(
          'http://localhost:5000/api/notifications',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setRecentActivities(notificationsResponse.data.notifications || []);
        
        // Set mock stats for now - in a real app, you'd fetch these from the backend
        setStats({
          totalStudents: 24, // Mock data
          totalSessions: sessions.length || 0,
          completedSessions: sessions.filter(s => new Date(s.date) < new Date()).length || 0,
          upcomingSessions: sessions.filter(s => new Date(s.date) >= new Date()).length || 0
        });
        
        // Mock student data
        setStudents([
          { id: 1, nom: 'Martin', prenom: 'Sophie', avatar: '' },
          { id: 2, nom: 'Dubois', prenom: 'Thomas', avatar: '' },
          { id: 3, nom: 'Bernard', prenom: 'Emma', avatar: '' },
          { id: 4, nom: 'Petit', prenom: 'Lucas', avatar: '' },
          { id: 5, nom: 'Robert', prenom: 'Chloé', avatar: '' },
          { id: 6, nom: 'Richard', prenom: 'Noah', avatar: '' }
        ]);
        
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
            title="Étudiants" 
            value={stats.totalStudents} 
            icon={<GroupIcon />} 
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Sessions Totales" 
            value={stats.totalSessions} 
            icon={<EventIcon />} 
            color={theme.palette.secondary.main}
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
                onClick={() => navigate('/gerer-session')}
              >
                Gérer les sessions
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
                <Button 
                  variant="contained" 
                  sx={{ mt: 2 }}
                  onClick={() => navigate('/gerer-session')}
                >
                  Créer une session
                </Button>
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
        
        {/* My Students */}
        <Grid item xs={12} md={6}>
          <ActivityCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Mes Étudiants
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => navigate('/gerer-eleves')}
              >
                Gérer les étudiants
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {students.length > 0 ? (
              <>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                  <AvatarGroup max={5} sx={{ '& .MuiAvatar-root': { width: 40, height: 40 } }}>
                    {students.slice(0, 5).map((student) => (
                      <Avatar 
                        key={student.id} 
                        alt={`${student.prenom} ${student.nom}`}
                        src={student.avatar}
                      >
                        {student.prenom.charAt(0)}
                      </Avatar>
                    ))}
                  </AvatarGroup>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {students.length} étudiants au total
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {students.filter((_, i) => i % 3 === 0).length} actifs cette semaine
                    </Typography>
                  </Box>
                </Box>
                
                <Grid container spacing={1}>
                  {students.slice(0, 6).map((student) => (
                    <Grid item xs={12} sm={6} key={student.id}>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          p: 1, 
                          borderRadius: 1,
                          '&:hover': { bgcolor: 'action.hover' },
                          cursor: 'pointer'
                        }}
                        onClick={() => navigate(`/eleve/${student.id}`)}
                      >
                        <Avatar 
                          alt={`${student.prenom} ${student.nom}`}
                          src={student.avatar}
                          sx={{ mr: 2 }}
                        >
                          {student.prenom.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1">
                            {student.prenom} {student.nom}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {['Mathématiques', 'Physique', 'Chimie', 'Biologie', 'Français', 'Anglais'][student.id % 6]}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                
                {students.length > 6 && (
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Button 
                      variant="text" 
                      size="small"
                      onClick={() => navigate('/gerer-eleves')}
                    >
                      Voir tous les étudiants
                    </Button>
                  </Box>
                )}
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  Aucun étudiant assigné
                </Typography>
                <Button 
                  variant="contained" 
                  sx={{ mt: 2 }}
                  onClick={() => navigate('/gerer-eleves')}
                >
                  Ajouter des étudiants
                </Button>
              </Box>
            )}
          </ActivityCard>
        </Grid>
        
        {/* My Courses */}
        <Grid item xs={12} md={6}>
          <ActivityCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Mes Matières
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => navigate('/gerer-cours')}
              >
                Gérer les matières
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              {[1, 2, 3, 4].map((item) => (
                <Grid item xs={12} sm={6} key={item}>
                  <Box 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        transform: 'translateY(-5px)'
                      }
                    }}
                    onClick={() => navigate('/gerer-cours')}
                  >
                    <Box 
                      sx={{ 
                        width: 50, 
                        height: 50, 
                        borderRadius: '50%', 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                        background: `${theme.palette.primary.light}`,
                        color: theme.palette.primary.main
                      }}
                    >
                      <MenuBookIcon />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {['Mathématiques', 'Physique', 'Chimie', 'Biologie'][item - 1]}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {[12, 8, 5, 10][item - 1]} étudiants
                      </Typography>
                    </Box>
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

export default TeacherDashboard;