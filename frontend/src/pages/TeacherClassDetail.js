import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box, Typography, Tabs, Tab, Paper, Button, Divider,
  List, ListItem, ListItemText, ListItemAvatar, Avatar,
  Grid, Card, CardContent, IconButton, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Alert
} from '@mui/material';
import {
  Person as PersonIcon,
  MenuBook as MenuBookIcon,
  Assignment as AssignmentIcon,
  VideoCall as VideoCallIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon
} from '@mui/icons-material';

function TeacherClassDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/classes/${id}`);
        setClassData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching class data:', err);
        setError('Impossible de charger les données de la classe. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchClassData();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (type, initialData = {}) => {
    setDialogType(type);
    setFormData(initialData);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async () => {
    try {
      // Handle different form submissions based on dialogType
      switch (dialogType) {
        case 'addContent':
          await axios.post('/api/content', { ...formData, classId: id });
          break;
        case 'addAssignment':
          await axios.post('/api/assignments', { ...formData, classId: id });
          break;
        case 'createSession':
          navigate('/gerer-session', { state: { classId: id } });
          break;
        default:
          break;
      }
      
      // Refresh data
      const { data } = await axios.get(`/api/classes/${id}`);
      setClassData(data);
      handleCloseDialog();
    } catch (err) {
      console.error('Error submitting form:', err);
      // Handle error
    }
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
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
          Réessayer
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {classData && (
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography variant="h4" fontWeight="bold">{classData.nom}</Typography>
            <Button 
              variant="contained" 
              startIcon={<VideoCallIcon />}
              onClick={() => handleOpenDialog('createSession')}
            >
              Nouvelle Session
            </Button>
          </Box>

          <Paper sx={{ mb: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant="fullWidth"
            >
              <Tab label="Élèves" icon={<PersonIcon />} />
              <Tab label="Contenu" icon={<MenuBookIcon />} />
              <Tab label="Devoirs" icon={<AssignmentIcon />} />
              <Tab label="Sessions" icon={<VideoCallIcon />} />
            </Tabs>
          </Paper>

          {/* Students Tab */}
          {tabValue === 0 && (
            <List>
              {classData.eleves?.map((eleve) => (
                <ListItem key={eleve._id}>
                  <ListItemAvatar>
                    <Avatar src={eleve.photo}>
                      {eleve.prenom?.[0]}{eleve.nom?.[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={`${eleve.prenom} ${eleve.nom}`} 
                    secondary={eleve.email} 
                  />
                </ListItem>
              ))}
            </List>
          )}

          {/* Content Tab */}
          {tabValue === 1 && (
            <>
              <Box display="flex" justifyContent="flex-end" mb={2}>
                <Button 
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('addContent')}
                >
                  Ajouter du contenu
                </Button>
              </Box>
              <Grid container spacing={3}>
                {classData.content?.map((item) => (
                  <Grid item xs={12} md={6} lg={4} key={item._id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">{item.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.description}
                        </Typography>
                        <Box mt={2} display="flex" justifyContent="flex-end">
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {/* Assignments Tab */}
          {tabValue === 2 && (
            <>
              <Box display="flex" justifyContent="flex-end" mb={2}>
                <Button 
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('addAssignment')}
                >
                  Ajouter un devoir
                </Button>
              </Box>
              <List>
                {classData.assignments?.map((assignment) => (
                  <ListItem key={assignment._id}>
                    <ListItemAvatar>
                      <Avatar>
                        <AssignmentIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={assignment.title} 
                      secondary={`Date limite: ${new Date(assignment.dueDate).toLocaleDateString()}`} 
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}

          {/* Sessions Tab */}
          {tabValue === 3 && (
            <List>
              {classData.sessions?.map((session) => (
                <ListItem key={session._id}>
                  <ListItemAvatar>
                    <Avatar>
                      <VideoCallIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={session.nom} 
                    secondary={`${new Date(session.date).toLocaleDateString()} - ${session.heureDebut} à ${session.heureFin}`} 
                  />
                </ListItem>
              ))}
            </List>
          )}
        </>
      )}

      {/* Dialog for adding content/assignments */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'addContent' && 'Ajouter du contenu'}
          {dialogType === 'addAssignment' && 'Ajouter un devoir'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'addContent' && (
            <Box component="form" sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Titre"
                name="title"
                value={formData.title || ''}
                onChange={handleFormChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description || ''}
                onChange={handleFormChange}
                margin="normal"
                multiline
                rows={3}
              />
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                sx={{ mt: 2 }}
              >
                Télécharger un fichier
                <input
                  type="file"
                  hidden
                />
              </Button>
            </Box>
          )}
          
          {dialogType === 'addAssignment' && (
            <Box component="form" sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Titre"
                name="title"
                value={formData.title || ''}
                onChange={handleFormChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description || ''}
                onChange={handleFormChange}
                margin="normal"
                multiline
                rows={3}
              />
              <TextField
                fullWidth
                label="Date limite"
                name="dueDate"
                type="date"
                value={formData.dueDate || ''}
                onChange={handleFormChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                required
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleFormSubmit} variant="contained">Enregistrer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TeacherClassDetail;