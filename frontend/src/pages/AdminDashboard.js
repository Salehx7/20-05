import { alpha } from '@mui/material/styles';
import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Grid, 
  Box, 
  Button, 
  Divider,
  CircularProgress,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton
} from '@mui/material';
import { 
  Group as GroupIcon,
  Person as PersonIcon,
  Event as EventIcon,
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
  Timeline as TimelineIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  DashboardContainer, 
  StatCard, 
  ActivityCard, 
  WelcomeSection,
  ActivityItem
} from '../components/DashboardComponents';

function AdminDashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalSessions: 0,
    totalCourses: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
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

        // Fetch real statistics from the backend
        const statsResponse = await axios.get(
          'http://localhost:5000/api/statistics/dashboard',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (statsResponse.data.success) {
          setStats({
            totalStudents: statsResponse.data.stats.totalStudents,
            totalTeachers: statsResponse.data.stats.totalTeachers,
            totalSessions: statsResponse.data.stats.totalSessions,
            totalCourses: statsResponse.data.stats.totalCourses
          });
        }

        // Fetch recent sessions with proper error handling
        const sessionsResponse = await axios.get(
          'http://localhost:5000/api/sessions/recent',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (sessionsResponse.data.success) {
          setRecentSessions(sessionsResponse.data.sessions.map(session => ({
            ...session,
            date: new Date(session.date)
          })));
        }

        // Fetch notifications
        const notificationsResponse = await axios.get(
          'http://localhost:5000/api/notifications',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setRecentActivities(notificationsResponse.data.notifications || []);
        
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

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'En cours':
        return 'success';
      case 'À venir':
        return 'primary';
      case 'Terminée':
        return 'default';
      default:
        return 'default';
    }
  };

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
            trend="up"
            subtitle="Augmentation de 12%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Enseignants" 
            value={stats.totalTeachers} 
            icon={<PersonIcon />} 
            color={theme.palette.secondary.main}
            trend="up"
            subtitle="Augmentation de 5%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Sessions" 
            value={stats.totalSessions} 
            icon={<EventIcon />} 
            color={theme.palette.info.main}
            trend="up"
            subtitle="Augmentation de 18%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Matières" 
            value={stats.totalCourses} 
            icon={<MenuBookIcon />} 
            color={theme.palette.success.main}
          />
        </Grid>
      </Grid>
      
      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Recent Sessions */}
        <Grid item xs={12}>
          <ActivityCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Sessions Récentes
              </Typography>
              <Button 
                variant="contained" 
                size="small"
                startIcon={<AddIcon />}
                onClick={() => navigate('/gerer-session')}
              >
                Nouvelle Session
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 400 }}>
              <Table stickyHeader aria-label="sessions table">
                <TableHead>
                  <TableRow>
                    <TableCell>Nom de la Session</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Enseignant</TableCell>
                    <TableCell>Élèves</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentSessions.map((session) => (
                    <TableRow 
                      key={session.id}
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        backgroundColor: session.status === 'En cours' ? alpha(theme.palette.success.light, 0.3) : 'inherit',
                        '&:hover': {
                          backgroundColor: session.status === 'En cours' 
                            ? alpha(theme.palette.success.light, 0.5) 
                            : theme.palette.action.hover
                        }
                      }}
                    >
                      <TableCell component="th" scope="row">
                        <Typography variant="body1" fontWeight="medium">
                          {session.nom}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {session.date.toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>{session.enseignant}</TableCell>
                      <TableCell>{session.eleves}</TableCell>
                      <TableCell>
                        <Chip 
                          label={session.status} 
                          color={getStatusColor(session.status)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          size="small"
                          onClick={() => navigate(`/sessions/${session.id}`)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button 
                variant="text"
                onClick={() => navigate('/gerer-session')}
              >
                Voir toutes les sessions
              </Button>
            </Box>
          </ActivityCard>
        </Grid>
        
        {/* User Management and Recent Activities */}
        <Grid item xs={12} md={6}>
          <ActivityCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Gestion des Utilisateurs
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box 
                  sx={{ 
                    p: 3, 
                    borderRadius: 2, 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
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
                  onClick={() => navigate('/gerer-eleves')}
                >
                  <GroupIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Gérer les Étudiants
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Ajouter, modifier ou supprimer des étudiants
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box 
                  sx={{ 
                    p: 3, 
                    borderRadius: 2, 
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
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
                  onClick={() => navigate('/gerer-enseignants')}
                >
                  <PersonIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Gérer les Enseignants
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Ajouter, modifier ou supprimer des enseignants
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box 
                  sx={{ 
                    p: 3, 
                    borderRadius: 2, 
                    bgcolor: alpha(theme.palette.success.main, 0.1),
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
                  onClick={() => navigate('/gerer-cours')}
                >
                  <MenuBookIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Gérer les Matières
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Ajouter, modifier ou supprimer des matières
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box 
                  sx={{ 
                    p: 3, 
                    borderRadius: 2, 
                    bgcolor: alpha(theme.palette.info.main, 0.1),
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
                  onClick={() => navigate('/gerer-session')}
                >
                  <EventIcon sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Gérer les Sessions
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Ajouter, modifier ou supprimer des sessions
                  </Typography>
                </Box>
              </Grid>
            </Grid>
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
      </Grid>
    </DashboardContainer>
  );
}

export default AdminDashboard;