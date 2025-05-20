import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, List, ListItem, ListItemText,
  ListItemIcon, Divider, Paper, CircularProgress, Button,
  Chip, IconButton, Tooltip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Event as EventIcon,
  AttachFile as AttachFileIcon,
  Chat as ChatIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';

const NotificationItem = styled(ListItem)(({ theme, read }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: read ? theme.palette.background.paper : theme.palette.primary.light + '20',
  border: `1px solid ${read ? theme.palette.divider : theme.palette.primary.light}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: read ? theme.palette.action.hover : theme.palette.primary.light + '30',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
  }
}));

const EmptyState = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(6),
  color: theme.palette.text.secondary
}));

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Vous devez être connecté');

      const response = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifications(response.data.notifications || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Impossible de charger les notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

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
      }

      // Navigate to the link if provided
      if (notification.link) {
        navigate(notification.link);
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:5000/api/notifications/read-all',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleDeleteNotification = async (notificationId, event) => {
    event.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'session':
        return <EventIcon />;
      case 'resource':
        return <AttachFileIcon />;
      case 'feedback':
        return <ChatIcon />;
      case 'attendance':
        return <SchoolIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Notifications
        </Typography>
        {notifications.length > 0 && (
          <Button 
            variant="outlined" 
            startIcon={<CheckCircleIcon />}
            onClick={handleMarkAllAsRead}
          >
            Marquer tout comme lu
          </Button>
        )}
      </Box>

      <Paper elevation={2} sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : notifications.length === 0 ? (
          <EmptyState>
            <NotificationsIcon sx={{ fontSize: 60, opacity: 0.3, mb: 2 }} />
            <Typography variant="h6">Aucune notification</Typography>
            <Typography variant="body2" color="textSecondary">
              Vous n'avez pas de notifications pour le moment
            </Typography>
          </EmptyState>
        ) : (
          <List>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification._id}>
                {index > 0 && <Divider component="li" />}
                <NotificationItem 
                  button 
                  read={notification.read ? 1 : 0}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle1" component="span" fontWeight={notification.read ? 400 : 600}>
                          {notification.title}
                        </Typography>
                        {!notification.read && (
                          <Chip 
                            size="small" 
                            label="Nouveau" 
                            color="primary" 
                            variant="outlined"
                            sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                          sx={{ display: 'block', mt: 0.5 }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', mt: 1 }}
                        >
                          {formatDate(notification.createdAt)}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                  <Tooltip title="Supprimer">
                    <IconButton 
                      edge="end" 
                      size="small"
                      onClick={(e) => handleDeleteNotification(notification._id, e)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </NotificationItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
      
      {!loading && !error && notifications.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button 
            variant="outlined" 
            color="primary"
            onClick={fetchNotifications}
            startIcon={<NotificationsIcon />}
          >
            Actualiser
          </Button>
        </Box>
      )}
    </Container>
  );
}

export default Notifications;