import React, { useState } from 'react';
import { 
  AppBar as MuiAppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
  styled
} from '@mui/material';
import {
  Menu as MenuIcon,
  Mail as MailIcon,
  Notifications as NotificationsIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SessionNotifications from './SessionNotifications';
import FeedbackModal from './FeedbackModal';
import FeedbackIcon from '@mui/icons-material/Feedback';
// Import SessionNotificationBadge
import SessionNotificationBadge from './SessionNotificationBadge';

const AppBar = styled(MuiAppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  background: 'linear-gradient(135deg, #2c1f3c 0%, #1a1326 100%)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

const Navbar = ({ user, open, onToggleSidenav, handleLogout }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const navigate = useNavigate();

  const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuClose = () => setMobileMoreAnchorEl(null);

  const handleLogoutClick = () => {
    handleMenuClose();
    localStorage.removeItem('token'); // Clear the token
    navigate('/login'); // Redirect to login page
    if (handleLogout) {
      handleLogout(); // Call the parent's logout handler if provided
    }
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id="primary-search-account-menu-mobile"
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={Boolean(mobileMoreAnchorEl)}
      onClose={handleMobileMenuClose}
    >
      <MenuItem onClick={() => setFeedbackOpen(true)}>
        <IconButton color="inherit">
          <Badge badgeContent={0} color="error">
            <MailIcon />
          </Badge>
        </IconButton>
        <Typography>Feedback</Typography>
      </MenuItem>
      <MenuItem>
        <SessionNotificationBadge />
        <Typography>Notifications</Typography>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton color="inherit">
          <Avatar 
            alt={user?.nom || 'User'} 
            src={user?.avatar || ''} 
            sx={{ width: 32, height: 32 }}
          >
            {user?.nom ? user.nom.charAt(0) : 'U'}
          </Avatar>
        </IconButton>
        <Typography>Profil</Typography>
      </MenuItem>
    </Menu>
  );

  return (
    <>
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={onToggleSidenav}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            Leader Learning
          </Typography>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            {/* Use SessionNotificationBadge for all users */}
            <SessionNotificationBadge />
            
            <Tooltip title="Envoyer un feedback">
              <IconButton 
                size="large" 
                color="inherit"
                onClick={() => setFeedbackOpen(true)}
              >
                <FeedbackIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Profil">
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-controls="primary-search-account-menu"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <Avatar 
                  alt={user?.nom || 'User'} 
                  src={user?.avatar || ''} 
                  sx={{ width: 32, height: 32 }}
                >
                  {user?.nom ? user.nom.charAt(0) : 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
          
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls="primary-search-account-menu-mobile"
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Menu profile */}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        id="primary-search-account-menu"
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>Mon profil</MenuItem>
        <MenuItem onClick={handleLogoutClick}>Se déconnecter</MenuItem>
      </Menu>
      
      {renderMobileMenu}
      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>
  );
};

export default Navbar;