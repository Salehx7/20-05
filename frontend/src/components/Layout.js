import React, { useState, useEffect } from 'react';
import { Box, Toolbar, useTheme, CssBaseline } from '@mui/material';
import Navbar from './Navbar';
import Sidenav from './Sidenav';

const Layout = ({ children, user, handleLogout }) => {
  const theme = useTheme();
  const drawerWidth = 240;
  
  const [open, setOpen] = useState(() => {
    const savedState = localStorage.getItem('sidenavState');
    return savedState ? savedState === 'open' : true;
  });

  useEffect(() => {
    localStorage.setItem('sidenavState', open ? 'open' : 'closed');
  }, [open]);

  const handleToggle = () => setOpen(!open);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Navbar 
        user={user} 
        open={open} 
        onToggleSidenav={handleToggle} 
        handleLogout={handleLogout} 
      />
      <Sidenav 
        user={user} 
        open={open} 
        onToggle={handleToggle} 
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: `calc(100% - ${open ? drawerWidth : 56}px)`,
          minHeight: '100vh',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar />
        <Box
          sx={{
            maxWidth: 1440,
            mx: 'auto',
            px: { xs: 2, sm: 3, md: 4 },
            py: 3,
            bgcolor: 'background.paper',
            borderRadius: 4,
            boxShadow: 1
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;