import React, { useState, useEffect } from 'react';
import {
  Badge, IconButton, Menu, MenuItem, Typography, Box,
  Divider, ListItemIcon, ListItemText, Tooltip,
  Paper, List, Chip, Button, styled
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  FiberNew as FiberNewIcon,
  CheckCircle as CheckCircleIcon,
  VideoCall as VideoCallIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { alpha } from '@mui/material/styles';

// Styled badge for notifications
const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 3,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

// Styled menu item for notifications
const NotificationMenuItem = styled(MenuItem)(({ theme, read }) => ({
  padding: theme.spacing(1.5),
  borderLeft: read ? 'none' : `4px solid ${theme.palette.primary.main}`,
  backgroundColor: read ? 'transparent' : alpha(theme.palette.primary.light, 0.1),
  '&:hover': {
    backgroundColor: read ? theme.palette.action.hover : alpha(theme.palette.primary.light, 0.2),
  },
}));

function SessionNotificationBadge() {
  const [notifications, setNotifications] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  
  const open = Boolean(anchorEl);
  
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      // Get user data to check if they're a student
      const user = {
        role: localStorage.getItem('role'),
        id: localStorage.getItem('userId')
      };
      
      const isStudent = user.role === 'eleve';
      
      // Fetch notifications
      const notificationsResponse = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(notificationsResponse.data.notifications || []);
      setUnreadCount(notificationsResponse.data.unreadCount || 0);
      
      // If user is a student, fetch their sessions
      if (isStudent && user.id) {
        // Get upcoming sessions for this student
        const sessionsResponse = await axios.get(
          `http://localhost:5000/api/sessions/upcoming/eleve/${user.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setSessions(sessionsResponse.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  
  useEffect(() => {
    fetchData();
    
    // Refresh data every minute
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  // Format date and time for display
  const formatSessionDateTime = (date, startTime, endTime) => {
    if (!date) return '';
    
    // Format the date
    const sessionDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let formattedDate;
    if (sessionDate.toDateString() === today.toDateString()) {
      formattedDate = "Aujourd'hui";
    } else if (sessionDate.toDateString() === tomorrow.toDateString()) {
      formattedDate = "Demain";
    } else {
      formattedDate = sessionDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    }
    
    // Format the time range
    let timeRange = '';
    if (startTime && endTime) {
      timeRange = ` ${startTime} - ${endTime}`;
    } else if (startTime) {
      timeRange = ` ${startTime}`;
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

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      if (!notification.read) {
        const token = localStorage.getItem('token');
        await axios.put(
          `http://localhost:5000/api/notifications/${notification._id}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Update local state
        setNotifications(prev => 
          prev.map(n => n._id === notification._id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      // Navigate based on notification type
      if (notification.type === 'session' && notification.relatedId) {
        navigate(`/sessions/${notification.relatedId}`);
      } else {
        navigate('/notifications');
      }
      
      handleClose();
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          size="large"
          color="inherit"
          onClick={handleClick}
          aria-label="show notifications"
        >
          <StyledBadge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </StyledBadge>
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        id="notifications-menu"
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            width: 360,
            maxHeight: 500,
            overflow: 'auto',
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div">
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Tooltip title="Marquer tout comme lu">
              <IconButton
                size="small"
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('token');
                    await axios.put(
                      'http://localhost:5000/api/notifications/mark-all-read',
                      {},
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    
                    // Update local state
                    setNotifications(prev => 
                      prev.map(n => ({ ...n, read: true }))
                    );
                    setUnreadCount(0);
                  } catch (error) {
                    console.error('Error marking all as read:', error);
                  }
                }}
              >
                <CheckCircleIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        
        <Divider />
        
        {/* Upcoming Sessions Section for Students */}
        {sessions.length > 0 && (
          <>
            <Box sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>
                Mes sessions à venir
              </Typography>
            </Box>
            
            <List sx={{ p: 0 }}>
              {sessions.slice(0, 3).map((session) => {
                const status = getSessionStatus(session);
                
                return (
                  <Paper 
                    key={session._id} 
                    elevation={0}
                    sx={{ 
                      mb: 1, 
                      mx: 1,
                      borderRadius: 1,
                      border: status === "En cours" ? '1px solid #4caf50' : '1px solid #e0e0e0',
                      bgcolor: status === "En cours" ? '#e8f5e9' : 'white'
                    }}
                  >
                    <MenuItem 
                      onClick={() => navigate(`/sessions/${session._id}`)}
                      sx={{ display: 'block', p: 1.5 }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>
                          {session.nom}
                        </Typography>
                        <Chip 
                          label={status} 
                          color={getStatusColor(status)} 
                          size="small" 
                          sx={{ ml: 1 }}
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatSessionDateTime(session.date, session.heureDebut, session.heureFin)}
                        </Typography>
                      </Box>
                      
                      {session.enseignantId && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <SchoolIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {`${session.enseignantId.nom} ${session.enseignantId.prenom}`}
                          </Typography>
                        </Box>
                      )}
                      
                      {session.lienDirect && status !== "Terminée" && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<VideoCallIcon />}
                          href={session.lienDirect}
                          target="_blank"
                          sx={{ mt: 1, width: '100%' }}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          Rejoindre
                        </Button>
                      )}
                    </MenuItem>
                  </Paper>
                );
              })}
              
              {sessions.length > 3 && (
                <Box sx={{ textAlign: 'center', p: 1 }}>
                  <Button 
                    size="small" 
                    onClick={() => {
                      navigate('/sessions');
                      handleClose();
                    }}
                  >
                    Voir toutes mes sessions
                  </Button>
                </Box>
              )}
            </List>
            
            <Divider />
          </>
        )}
        
        {/* Regular Notifications */}
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <MenuItem
              key={notification._id}
              sx={{
                padding: 1.5,
                borderLeft: notification.read ? 'none' : '4px solid #1976d2',
                backgroundColor: notification.read ? 'transparent' : 'rgba(25, 118, 210, 0.1)',
                '&:hover': {
                  backgroundColor: notification.read ? 'rgba(0, 0, 0, 0.04)' : 'rgba(25, 118, 210, 0.2)',
                },
              }}
              onClick={() => handleNotificationClick(notification)}
            >
              <ListItemIcon>
                {notification.type === 'session' ? (
                  <EventIcon color="primary" />
                ) : (
                  <FiberNewIcon color="secondary" />
                )}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body1" sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}>
                    {notification.title}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(notification.createdAt).toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </>
                }
              />
            </MenuItem>
          ))
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Aucune notification
            </Typography>
          </Box>
        )}
        
        <Divider />
        
        <MenuItem onClick={() => {
          navigate('/notifications');
          handleClose();
        }}>
          <Typography variant="body1" sx={{ width: '100%', textAlign: 'center' }}>
            Voir toutes les notifications
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
}

export default SessionNotificationBadge;