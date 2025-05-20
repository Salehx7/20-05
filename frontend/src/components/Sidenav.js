import React from 'react';
import { 
  Drawer as MuiDrawer,
  List,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  styled
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  MoveToInbox as InboxIcon,
  Settings as SettingsIcon,
  Group as GroupIcon,
  School as SchoolIcon,
  Subject as SubjectIcon,
  Person as PersonIcon,
  EventNote as EventNoteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  background: '#35254a',
  borderBottom: '1px solid rgba(163, 124, 255, 0.15)',
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    '& .MuiDrawer-paper': {
      width: drawerWidth,
      background: '#2a1b3d',
      color: '#f0f0f0',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9),
        },
      }),
    },
  }),
);

const Sidenav = ({ user, open, onToggle }) => {
  const navigate = useNavigate();

  const getMenuItems = () => {
    switch(user?.role) {
      case 'admin':
        return [
          { text: "Dashboard", path: "/Admin-Dashboard", icon: <InboxIcon />, color: "#a37cff" },
          { text: "Élèves", path: "/gerer-eleve", icon: <GroupIcon />, color: "#4ecdc4" },
          { text: "Enseignants", path: "/gerer-enseignant", icon: <SchoolIcon />, color: "#f7b731" },
          { text: "Matières", path: "/gestion-matieres", icon: <SubjectIcon />, color: "#1dd1a1" }, // <-- updated
          { text: "Sessions", path: "/gerer-session", icon: <EventNoteIcon />, color: "#00cec9" },
          { text: "Paramètres", path: "/settings", icon: <SettingsIcon />, color: "#ff6b6b" }
        ];
      case 'eleve':
        return [
          { text: 'Mon Tableau de Bord', path: '/student-dashboard', icon: <InboxIcon />, color: "#a37cff" },
          { text: 'Mes Cours', path: '/mes-matieres', icon: <SubjectIcon />, color: "#1dd1a1" },
          { text: 'Mon Profil', path: '/profile', icon: <PersonIcon />, color: "#4ecdc4" },
          { text: 'Paramètres', path: '/settings', icon: <SettingsIcon />, color: "#ff6b6b" }
        ];
      case 'enseignant':
        return [
          { text: 'Mon Tableau de Bord', path: '/teacher-dashboard', icon: <InboxIcon />, color: "#a37cff" },
          { text: 'Matières', path: '/gestion-matieres', icon: <SubjectIcon />, color: "#1dd1a1" }, // <-- updated
          { text: 'Mes Cours', path: '/teacher-courses', icon: <SubjectIcon />, color: "#1dd1a1" },
          { text: 'Mon Profil', path: '/profile', icon: <PersonIcon />, color: "#f7b731" },
          { text: 'Paramètres', path: '/settings', icon: <SettingsIcon />, color: "#ff6b6b" }
        ];
      default:
        return [];
    }
  };

  return (
    <Drawer variant="permanent" open={open}>
      <DrawerHeader>
        {open && (
          <Typography variant="h6" noWrap sx={{ color: '#f0f0f0', ml: 1 }}>
            EduPlatform
          </Typography>
        )}
        <IconButton onClick={onToggle} sx={{ color: '#f0f0f0' }}>
          {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </DrawerHeader>
      <Divider sx={{ borderColor: 'rgba(163, 124, 255, 0.1)' }} />
      <List>
        {getMenuItems().map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <Tooltip title={!open ? item.text : ""} placement="right">
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  '&:hover': { backgroundColor: 'rgba(163, 124, 255, 0.1)' },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                    color: item.color,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ opacity: open ? 1 : 0, color: '#f0f0f0' }} 
                />
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidenav;