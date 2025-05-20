import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Badge, IconButton, Menu, MenuItem, Typography, Box, 
  Divider, Button, ListItemIcon, ListItemText, Snackbar, Alert
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { useNavigate } from 'react-router-dom';

const SessionNotifications = ({ userId, userType = 'eleve' }) => {
  const [sessions, setSessions] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [upcomingAlert, setUpcomingAlert] = useState(null);
  const [lastChecked, setLastChecked] = useState(() => {
    return localStorage.getItem('lastNotificationCheck') || new Date(0).toISOString();
  });
  
  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  // Fetch sessions for the current student
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/sessions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Filter sessions for this student if userType is 'eleve'
        let userSessions = response.data.sessions;
        if (userType === 'eleve') {
          userSessions = userSessions.filter(
            session => session.eleves.some(eleve => eleve._id === userId)
          );
        }
        
        setSessions(userSessions);
        
        // Count new sessions since last check
        const newSessionsCount = userSessions.filter(
          session => new Date(session.dateCreation) > new Date(lastChecked)
        ).length;
        
        setUnreadCount(newSessionsCount);
        
        // Check for upcoming sessions
        checkUpcomingSessions(userSessions);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    };

    if (userId) {
      fetchSessions();
      // Refresh every minute to check for upcoming sessions
      const interval = setInterval(fetchSessions, 60000);
      return () => clearInterval(interval);
    }
  }, [userId, userType, lastChecked]);

  // Check for sessions that are about to start
  const checkUpcomingSessions = (sessions) => {
    const now = new Date();
    const today = new Date().toISOString().split('T')[0];
    
    sessions.forEach(session => {
      if (!session.heureDebut) return;
      
      const startTime = new Date(`${today}T${session.heureDebut}`);
      const notificationTime = new Date(startTime);
      notificationTime.setMinutes(notificationTime.getMinutes() - (session.notificationAvant || 15));
      
      // If current time is within 1 minute of the notification time and session hasn't started yet
      const timeDiff = Math.abs(now - notificationTime);
      if (timeDiff <= 60000 && now < startTime) {
        // Check if we've already notified for this session
        const notifiedSessions = JSON.parse(localStorage.getItem('notifiedSessions') || '[]');
        if (!notifiedSessions.includes(session._id)) {
          setUpcomingAlert({
            session: session,
            message: `La session "${session.nom}" commence dans ${session.notificationAvant || 15} minutes!`
          });
          
          // Mark as notified
          notifiedSessions.push(session._id);
          localStorage.setItem('notifiedSessions', JSON.stringify(notifiedSessions));
          
          // Play notification sound if available
          try {
            const audio = new Audio('/notification-sound.mp3');
            audio.play().catch(e => console.log('Audio play failed:', e));
          } catch (error) {
            console.log('Audio not supported');
          }
        }
      }
    });
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    // Mark as read when opening notifications
    setUnreadCount(0);
    const now = new Date().toISOString();
    localStorage.setItem('lastNotificationCheck', now);
    setLastChecked(now);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleJoinSession = (lienDirect) => {
    window.open(lienDirect, '_blank');
    handleClose();
  };

  const handleViewSession = (sessionId) => {
    navigate(`/session/${sessionId}`);
    handleClose();
  };

  const handleCloseAlert = () => {
    setUpcomingAlert(null);
  };

  // Determine session status
  const getSessionStatus = (heureDebut, heureFin) => {
    if (!heureDebut || !heureFin) return "Non programmée";
    const now = new Date();
    const today = new Date().toISOString().split('T')[0];
    const startTime = new Date(`${today}T${heureDebut}`);
    const endTime = new Date(`${today}T${heureFin}`);
    if (now < startTime) return "À venir";
    if (now >= startTime && now <= endTime) return "En cours";
    return "Terminée";
  };

  // Sort sessions by status and date
  const sortedSessions = [...sessions].sort((a, b) => {
    const statusA = getSessionStatus(a.heureDebut, a.heureFin);
    const statusB = getSessionStatus(b.heureDebut, b.heureFin);
    
    // En cours sessions first
    if (statusA === "En cours" && statusB !== "En cours") return -1;
    if (statusA !== "En cours" && statusB === "En cours") return 1;
    
    // Then À venir sessions
    if (statusA === "À venir" && statusB !== "À venir") return -1;
    if (statusA !== "À venir" && statusB === "À venir") return 1;
    
    // Sort by start time for upcoming sessions
    if (statusA === "À venir" && statusB === "À venir") {
      return new Date(`2023-01-01T${a.heureDebut}`) - new Date(`2023-01-01T${b.heureDebut}`);
    }
    
    // Sort by creation date (newest first) for other sessions
    return new Date(b.dateCreation || 0) - new Date(a.dateCreation || 0);
  });

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-controls={open ? 'session-notifications-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Menu
        id="session-notifications-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 320,
            maxHeight: 400,
            overflow: 'auto',
            mt: 1.5
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Typography sx={{ p: 2, fontWeight: 'bold' }}>
          Notifications de sessions
        </Typography>
        <Divider />
        
        {sortedSessions.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              Aucune session disponible
            </Typography>
          </MenuItem>
        ) : (
          sortedSessions.map(session => {
            const status = getSessionStatus(session.heureDebut, session.heureFin);
            const isNew = new Date(session.dateCreation) > new Date(lastChecked);
            
            return (
              <MenuItem key={session._id} sx={{ py: 1.5, px: 2, display: 'block' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {session.nom}
                    {isNew && (
                      <FiberNewIcon color="error" fontSize="small" sx={{ ml: 1, verticalAlign: 'middle' }} />
                    )}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      bgcolor: status === "En cours" ? 'success.main' : 
                              status === "À venir" ? 'info.main' : 'text.disabled',
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontWeight: 'medium'
                    }}
                  >
                    {status}
                  </Typography>
                </Box>
                
                {session.heureDebut && session.heureFin && (
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                    {session.heureDebut} - {session.heureFin}
                  </Typography>
                )}
                
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  {session.lienDirect && status === "En cours" && (
                    <Button 
                      size="small" 
                      variant="contained" 
                      color="success"
                      startIcon={<VideoCallIcon />}
                      onClick={() => handleJoinSession(session.lienDirect)}
                      sx={{ flex: 1 }}
                    >
                      Rejoindre
                    </Button>
                  )}
                  <Button 
                    size="small" 
                    variant="outlined"
                    onClick={() => handleViewSession(session._id)}
                    sx={{ flex: 1 }}
                  >
                    Détails
                  </Button>
                </Box>
              </MenuItem>
            );
          })
        )}
      </Menu>

      {/* Alert for upcoming sessions */}
      <Snackbar 
        open={!!upcomingAlert} 
        autoHideDuration={10000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {upcomingAlert && (
          <Alert 
            onClose={handleCloseAlert} 
            severity="info" 
            sx={{ width: '100%' }}
            icon={<NotificationsActiveIcon />}
            action={
              upcomingAlert.session.lienDirect ? (
                <Button 
                  color="inherit" 
                  size="small"
                  onClick={() => handleJoinSession(upcomingAlert.session.lienDirect)}
                >
                  REJOINDRE
                </Button>
              ) : null
            }
          >
            {upcomingAlert.message}
          </Alert>
        )}
      </Snackbar>
    </>
  );
};


export default SessionNotifications;

