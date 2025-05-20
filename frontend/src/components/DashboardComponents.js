import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Avatar, 
  Divider,
  LinearProgress,
  styled,
  useTheme
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown,
  AccessTime,
  CheckCircle,
  School,
  Assignment,
  Event,
  Person
} from '@mui/icons-material';

// Styled components for dashboard elements
export const DashboardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  minHeight: 'calc(100vh - 64px)',
  backgroundColor: '#f8f9fa',
}));

export const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  borderRadius: 16,
  boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  overflow: 'hidden',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 25px 0 rgba(0, 0, 0, 0.1)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '4px',
    backgroundColor: theme.palette.primary.main,
  }
}));

export const ActivityCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  borderRadius: 16,
  boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 25px 0 rgba(0, 0, 0, 0.1)',
  }
}));

export const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 5,
  backgroundColor: theme.palette.grey[200],
  '& .MuiLinearProgress-bar': {
    borderRadius: 5,
  }
}));

export const StatValue = styled(Typography)(({ theme, trend }) => ({
  fontSize: '1.75rem',
  fontWeight: 700,
  color: trend === 'up' ? theme.palette.success.main : 
         trend === 'down' ? theme.palette.error.main : 
         theme.palette.text.primary,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1)
}));

export const StatLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
  fontWeight: 500
}));

export const StatIcon = styled(Box)(({ theme, color }) => ({
  width: 48,
  height: 48,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: color ? `${color}20` : theme.palette.primary.light,
  color: color || theme.palette.primary.main,
}));

export const SessionItem = styled(Box)(({ theme, active }) => ({
  padding: theme.spacing(1.5),
  borderRadius: 8,
  marginBottom: theme.spacing(1),
  backgroundColor: active ? theme.palette.success.light : theme.palette.background.paper,
  border: `1px solid ${active ? theme.palette.success.main : theme.palette.divider}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: active ? theme.palette.success.light : theme.palette.action.hover,
  }
}));

// Dashboard stat card component
export const StatCard = ({ title, value, icon, color, trend, subtitle }) => {
  const theme = useTheme();
  
  return (
    <StatsCard>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <StatLabel variant="subtitle2">{title}</StatLabel>
          <StatValue variant="h4" trend={trend}>
            {value}
            {trend === 'up' && <TrendingUp fontSize="small" color="success" />}
            {trend === 'down' && <TrendingDown fontSize="small" color="error" />}
          </StatValue>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <StatIcon color={color}>
          {icon}
        </StatIcon>
      </Box>
    </StatsCard>
  );
};

// Dashboard welcome section
export const WelcomeSection = ({ user }) => {
  const theme = useTheme();
  const currentHour = new Date().getHours();
  
  let greeting;
  if (currentHour < 12) {
    greeting = "Bonjour";
  } else if (currentHour < 18) {
    greeting = "Bon après-midi";
  } else {
    greeting = "Bonsoir";
  }
  
  return (
    <Paper 
      sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 4,
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ position: 'absolute', top: 0, right: 0, p: 2, opacity: 0.2 }}>
        {user?.role === 'eleve' && <School sx={{ fontSize: 100 }} />}
        {user?.role === 'enseignant' && <Person sx={{ fontSize: 100 }} />}
        {user?.role === 'admin' && <Assignment sx={{ fontSize: 100 }} />}
      </Box>
      
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {greeting}, {user?.prenom || ''} {user?.nom || ''}
        </Typography>
        <Typography variant="body1">
          Bienvenue sur votre tableau de bord {
            user?.role === 'eleve' ? "d'étudiant" : 
            user?.role === 'enseignant' ? "d'enseignant" : 
            "d'administrateur"
          }
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            {new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

// Upcoming session component
export const UpcomingSession = ({ session, onClick }) => {
  const theme = useTheme();
  const sessionDate = new Date(session.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const isToday = sessionDate.toDateString() === today.toDateString();
  
  // Check if session is active (current time is between start and end)
  const now = new Date();
  const [startHours, startMins] = session.heureDebut.split(':').map(Number);
  const [endHours, endMins] = session.heureFin.split(':').map(Number);
  
  const sessionStart = new Date(sessionDate);
  sessionStart.setHours(startHours, startMins, 0);
  
  const sessionEnd = new Date(sessionDate);
  sessionEnd.setHours(endHours, endMins, 0);
  
  const isActive = isToday && now >= sessionStart && now <= sessionEnd;
  
  return (
    <SessionItem active={isActive} onClick={onClick} sx={{ cursor: 'pointer' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" fontWeight="medium">
          {session.nom}
        </Typography>
        {isActive && (
          <Box 
            sx={{ 
              px: 1, 
              py: 0.5, 
              bgcolor: 'success.main', 
              color: 'white', 
              borderRadius: 1,
              fontSize: '0.75rem',
              fontWeight: 'bold'
            }}
          >
            En cours
          </Box>
        )}
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: 'text.secondary' }}>
        <AccessTime fontSize="small" sx={{ mr: 1 }} />
        <Typography variant="body2">
          {isToday ? "Aujourd'hui" : sessionDate.toLocaleDateString('fr-FR')} • {session.heureDebut} - {session.heureFin}
        </Typography>
      </Box>
      
      {session.enseignantId && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: 'text.secondary' }}>
          <Person fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2">
            {session.enseignantId.nom} {session.enseignantId.prenom}
          </Typography>
        </Box>
      )}
    </SessionItem>
  );
};

// Recent activity item
export const ActivityItem = ({ title, description, time, icon, color }) => {
  return (
    <Box sx={{ display: 'flex', mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main`, mr: 2 }}>
        {icon}
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2">{title}</Typography>
        <Typography variant="body2" color="text.secondary">{description}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {time}
        </Typography>
      </Box>
    </Box>
  );
};

export default {
  DashboardContainer,
  StatsCard,
  ActivityCard,
  ProgressBar,
  StatCard,
  WelcomeSection,
  UpcomingSession,
  ActivityItem
};