import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Grid, Card, CardContent, Divider, 
  CircularProgress, Chip, Button, Avatar, AvatarGroup, 
  List, ListItem, ListItemText, ListItemAvatar
} from '@mui/material';
import { 
  School as SchoolIcon, 
  Group as GroupIcon, 
  MenuBook as MenuBookIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function TeacherClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const teacherId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/enseignants/${teacherId}/classes`);
        setClasses(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching classes:', err);
        setError('Impossible de charger les classes. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    if (teacherId) {
      fetchClasses();
    }
  }, [teacherId]);

  const handleClassClick = (classId) => {
    navigate(`/teacher-class/${classId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" p={3}>
        <Typography color="error" variant="h6">{error}</Typography>
        <Button variant="contained" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
          Réessayer
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">Mes Classes</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/gerer-session')}
        >
          Nouvelle Session
        </Button>
      </Box>

      {classes.length === 0 ? (
        <Box textAlign="center" p={5} bgcolor="background.paper" borderRadius={2}>
          <SchoolIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6">Vous n'avez pas encore de classes assignées</Typography>
          <Typography color="text.secondary" mb={3}>
            Contactez l'administrateur pour être assigné à des classes
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {classes.map((cls) => (
            <Grid item xs={12} md={6} lg={4} key={cls._id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-5px)' }
                }}
                onClick={() => handleClassClick(cls._id)}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <GroupIcon />
                    </Avatar>
                    <Typography variant="h6">{cls.nom}</Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Chip 
                      icon={<MenuBookIcon />} 
                      label={`${cls.matieres?.length || 0} matières`} 
                      size="small"
                    />
                    <AvatarGroup max={5} sx={{ '& .MuiAvatar-root': { width: 30, height: 30 } }}>
                      {cls.eleves?.map((eleve) => (
                        <Avatar 
                          key={eleve._id} 
                          alt={`${eleve.prenom} ${eleve.nom}`}
                          src={eleve.photo}
                        />
                      ))}
                    </AvatarGroup>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" mt={2}>
                    {cls.eleves?.length || 0} élèves
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default TeacherClassesPage;