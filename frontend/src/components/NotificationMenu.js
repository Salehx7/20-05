import React, { useState, useEffect } from 'react';
import {
  Badge, IconButton, Menu, MenuItem, Typography, Box, Divider,
  ListItemText, ListItemIcon, Button, CircularProgress
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  School as SchoolIcon,
  AttachFile as AttachFileIcon,
  Chat as ChatIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { styled } from '@mui/material/styles';

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 8,
    minWidth: 320,
    maxWidth: 400,
    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
    '& .MuiMenu-list': {
      padding: '8px 0',
    },
  },
}));

const NotificationItem = styled(MenuItem)(({ theme, read }) => ({
  padding: theme.spacing(1.5, 2),
  borderLeft: read ? 'none' : `4px solid ${theme.palette.primary.main}`,
  backgroundColor: read ? 'transparent' : theme.palette.primary.light + '20',
  '&:hover': {
    backgroundColor: read ? theme.palette.action.hover : theme.palette.primary.light + '30',
  },
}));

const NotificationHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const EmptyNotification = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.secondary,
}));

const NotificationMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
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
      setUnreadCount(response.data.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Impossible de charger les notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch notifications on component mount
    fetchNotifications();

    // Set up polling for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications(); // Refresh notifications when menu is opened
  };

  const handleClose = () => {
    setAnchorEl(null);
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

      // Navigate to the link if provided
      if (notification.link) {
        navigate(notification.link);
      }

      handleClose();
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
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'session':
        return <EventIcon color="primary" />;
      case 'resource':
        return <AttachFileIcon color="secondary" />;
      case 'feedback':
        return <ChatIcon color="info" />;
      case 'attendance':
        return <SchoolIcon color="success" />;
      default:
        return <NotificationsIcon color="action" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays < 7) return `Il y a ${diffDays} j`;
    
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-label="notifications"
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <StyledMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <NotificationHeader>
          <Typography variant="subtitle1" fontWeight={600}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button 
              size="small" 
              onClick={handleMarkAllAsRead}
              startIcon={<CheckCircleIcon fontSize="small" />}
            >
              Tout marquer comme lu
            </Button>
          )}
        </NotificationHeader>

        {loading && !notifications.length ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <EmptyNotification>
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          </EmptyNotification>
        ) : notifications.length === 0 ? (
          <EmptyNotification>
            <NotificationsIcon sx={{ fontSize: 40, opacity: 0.5, mb: 1 }} />
            <Typography variant="body2">
              Aucune notification pour le moment
            </Typography>
          </EmptyNotification>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              read={notification.read}
              onClick={() => handleNotificationClick(notification)}
            >
              <ListItemIcon>
                {getNotificationIcon(notification.type)}
              </ListItemIcon>
              <ListItemText
                primary={notification.title}
                secondary={
                  <React.Fragment>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                      sx={{ display: 'block' }}
                    >
                      {notification.message}
                    </Typography>
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.secondary"
                    >
                      {formatDate(notification.createdAt)}
                    </Typography>
                  </React.Fragment>
                }
              />
            </NotificationItem>
          ))
        )}

        {notifications.length > 0 && (
          <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
            <Button size="small" onClick={handleClose}>
              Fermer
            </Button>
          </Box>
        )}
      </StyledMenu>
    </>
  );
};

export default NotificationMenu;