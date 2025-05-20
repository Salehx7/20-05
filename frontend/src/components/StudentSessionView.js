import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Paper, List, ListItem, ListItemText, 
  Divider, Chip, Button, CircularProgress, Alert,
  Badge, IconButton, Tooltip, Snackbar
} from '@mui/material';
import { AccessTime, VideoCall, School, Notifications, NotificationsActive } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function StudentSessionView() {
  const [sessions, setSessions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Vous n\'êtes pas authentifié');
          setLoading(false);
          return;
        }

        // Get user profile to get student ID
        const profileResponse = await axios.get('/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!profileResponse.data.success || !profileResponse.data.data.profile) {
          setError('Impossible de récupérer votre profil');
          setLoading(false);
          return;
        }

        const eleveId = profileResponse.data.data.profile._id;

        // Get upcoming sessions for this student
        const [sessionsResponse, notificationsResponse] = await Promise.all([
          axios.get(
            `/sessions/upcoming/eleve/${eleveId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get(
            '/notifications',
            { headers: { Authorization: `Bearer ${token}` } }
          )
        ]);

        setSessions(sessionsResponse.data || []);
        
        // Filter notifications related to sessions
        const sessionNotifications = notificationsResponse.data.notifications.filter(
          notification => notification.type === 'session'
        );
        setNotifications(sessionNotifications);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Erreur lors du chargement des données');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.put(
        `/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );

      setSnackbar({
        open: true,
        message: 'Notification marquée comme lue'
      });
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setSnackbar({
        open: true,
        message: 'Erreur lors du marquage de la notification'
      });
    }
  };

  // Get notifications for a specific session
  const getSessionNotifications = (sessionId) => {
    return notifications.filter(
      notification => notification.relatedId === sessionId
    );
  };

  // Format date and time for display
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
    
    return `${formattedDate}${timeRange}`;
  };

  // Get session status
  const getSessionStatus = (session) => {
    if (!session.date || !session.heureDebut || !session.heureFin) {
      return "Non programmée";
    }
    
    const now = new Date();
    const sessionDate = new Date(session.date);
    
    // Compare dates first (ignoring time)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sessionDay = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate());
    
    if (sessionDay > today) {
      return "À venir";
    }
    
    if (sessionDay < today) {
      return "Terminée";
    }
    
    // Same day - check times
    const [startHours, startMins] = session.heureDebut.split(':').map(Number);
    const [endHours, endMins] = session.heureFin.split(':').map(Number);
    
    const currentHours = now.getHours();
    const currentMins = now.getMinutes();
    
    // Convert to minutes for easier comparison
    const startTimeInMins = startHours * 60 + startMins;
    const endTimeInMins = endHours * 60 + endMins;
    const currentTimeInMins = currentHours * 60 + currentMins;
    
    if (currentTimeInMins < startTimeInMins) {
      return "À venir";
    }
    
    if (currentTimeInMins > endTimeInMins) {
      return "Terminée";
    }
    
    return "En cours";
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "En cours":
        return "success";
      case "À venir":
        return "primary";
      case "Terminée":
        return "default";
      default:
        return "default";
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (sessions.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Vous n'avez aucune session à venir</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Mes sessions
      </Typography>
      <List>
        {sessions.map((session) => {
          const status = getSessionStatus(session);
          const sessionNotifications = getSessionNotifications(session._id);
          const unreadCount = sessionNotifications.filter(n => !n.read).length;
          
          return (
            <Paper 
              key={session._id} 
              elevation={2} 
              sx={{ 
                mb: 2, 
                borderRadius: 2,
                border: status === "En cours" ? '1px solid #4caf50' : 'none',
                bgcolor: status === "En cours" ? '#e8f5e9' : 'white'
              }}
            >
              <ListItem 
                alignItems="flex-start"
                secondaryAction={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {unreadCount > 0 && (
                      <Tooltip title="Notifications non lues">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => {
                            // Mark all notifications for this session as read
                            sessionNotifications
                              .filter(n => !n.read)
                              .forEach(n => markNotificationAsRead(n._id));
                          }}
                        >
                          <Badge badgeContent={unreadCount} color="error">
                            <NotificationsActive />
                          </Badge>
                        </IconButton>
                      </Tooltip>
                    )}
                    <Chip 
                      label={status} 
                      color={getStatusColor(status)} 
                      size="small" 
                    />
                  </Box>
                }
              >
                <ListItemText
                  primary={
                    <Typography variant="h6" component="div">
                      {session.nom}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTime fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatSessionDateTime(session.date, session.heureDebut, session.heureFin)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <School fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Enseignant: {session.enseignantId ? 
                            `${session.enseignantId.nom} ${session.enseignantId.prenom}` : 
                            'Non assigné'}
                        </Typography>
                      </Box>
                      {sessionNotifications.length > 0 && (
                        <Box sx={{ mt: 1, mb: 1 }}>
                          <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                            <Notifications fontSize="small" sx={{ mr: 1 }} />
                            Dernière notification:
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                            {sessionNotifications[0].message}
                          </Typography>
                        </Box>
                      )}
                      {session.remarque && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {session.remarque}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
              <Divider />
              <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<VideoCall />}
                  disabled={!session.lienDirect || status === "Terminée"}
                  href={session.lienDirect}
                  target="_blank"
                  sx={{ flex: 1 }}
                >
                  Rejoindre
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate(`/sessions/${session._id}`)}
                  sx={{ flex: 1 }}
                >
                  Détails
                </Button>
              </Box>
            </Paper>
          );
        })}
      </List>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </Box>
  );
}

export default StudentSessionView;