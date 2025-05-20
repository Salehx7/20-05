import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Paper, Button, Chip, Divider,
  List, ListItem, ListItemText, ListItemAvatar, Avatar,
  CircularProgress, Alert, Grid
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  VideoCall as VideoCallIcon,
  Description as DescriptionIcon,
  Person as PersonIcon
} from '@mui/icons-material';

function SessionDetail() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/sessions/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSession(response.data.session);
      } catch (err) {
        console.error('Error fetching session:', err);
        setError('Impossible de charger les détails de la session');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [id]);

  // Improved function to get session status that considers the actual date
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

  // Format date and time in a user-friendly way
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

  const getStatusColor = (status) => {
    switch (status) {
      case "À venir": return "info";
      case "En cours": return "success";
      case "Terminée": return "error";
      case "Non programmée": return "default";
      default: return "default";
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
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

  if (!session) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Session non trouvée</Alert>
      </Box>
    );
  }

  const status = getSessionStatus(session);
  const formattedDateTime = formatSessionDateTime(session.date, session.heureDebut, session.heureFin);

  return (
    <Box sx={{ 
      p: 3, 
      maxWidth: 1000, 
      mx: 'auto',
      pl: { xs: 2, md: 30 },
      pt: { xs: 10, md: 12 },
    }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            {session.nom}
          </Typography>
          <Chip 
            label={status} 
            color={getStatusColor(status)} 
            sx={{ fontWeight: 'bold' }} 
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Display formatted date and time */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <AccessTimeIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body1">
            {formattedDateTime}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Enseignant
              </Typography>
              <Typography variant="body1">
                {session.enseignant?.nom} {session.enseignant?.prenom}
              </Typography>
            </Box>

            {session.remarque && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>Remarque</Typography>
                <Typography variant="body1">{session.remarque}</Typography>
              </Box>
            )}

            {session.heureDebut && session.heureFin && (
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon sx={{ mr: 1 }} />
                <Typography variant="body1">
                  <strong>Horaire:</strong> {session.heureDebut} - {session.heureFin}
                </Typography>
              </Box>
            )}

            {session.lienDirect && (
              <Box sx={{ mb: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<VideoCallIcon />}
                  href={session.lienDirect}
                  target="_blank"
                  disabled={status !== "En cours"}
                  sx={{ mr: 2 }}
                >
                  Rejoindre la session
                </Button>
                {status !== "En cours" && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Le lien sera actif pendant la session
                  </Typography>
                )}
              </Box>
            )}

            {session.lienSupport && (
              <Box sx={{ mb: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<DescriptionIcon />}
                  href={session.lienSupport}
                  target="_blank"
                >
                  Accéder au support de cours
                </Button>
              </Box>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Participants ({session.eleves?.length || 0})
            </Typography>
            <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto', p: 1 }}>
              <List dense>
                {session.eleves?.map(eleve => (
                  <ListItem key={eleve._id}>
                    <ListItemAvatar>
                      <Avatar>{eleve.nom?.charAt(0)}{eleve.prenom?.charAt(0)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={`${eleve.nom || ''} ${eleve.prenom || ''}`} 
                      secondary={eleve.email} 
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

export default SessionDetail;