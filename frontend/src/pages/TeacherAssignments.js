import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Tabs, Tab, Paper, Button, Divider,
  List, ListItem, ListItemText, ListItemAvatar, Avatar,
  Grid, Card, CardContent, IconButton, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Alert, Chip, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function TeacherAssignments() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classId: '',
    dueDate: '',
    totalPoints: 100,
    type: 'homework' // homework, quiz, exam
  });
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const teacherId = localStorage.getItem('userId');
        
        // Fetch classes
        const classesResponse = await axios.get(`/api/enseignants/${teacherId}/classes`);
        setClasses(classesResponse.data);
        
        // Fetch assignments
        const assignmentsResponse = await axios.get(`/api/enseignants/${teacherId}/assignments`);
        setAssignments(assignmentsResponse.data);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Impossible de charger les données. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (assignment = null) => {
    if (assignment) {
      setFormData({
        title: assignment.title,
        description: assignment.description,
        classId: assignment.classId,
        dueDate: assignment.dueDate.split('T')[0], // Format date for input
        totalPoints: assignment.totalPoints,
        type: assignment.type
      });
      setSelectedAssignment(assignment);
    } else {
      setFormData({
        title: '',
        description: '',
        classId: '',
        dueDate: '',
        totalPoints: 100,
        type: 'homework'
      });
      setSelectedAssignment(null);
    }
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
      setLoading(true);
      
      if (selectedAssignment) {
        // Update existing assignment
        await axios.put(`/api/assignments/${selectedAssignment._id}`, formData);
      } else {
        // Create new assignment
        await axios.post('/api/assignments', formData);
      }
      
      // Refresh assignments
      const teacherId = localStorage.getItem('userId');
      const response = await axios.get(`/api/enseignants/${teacherId}/assignments`);
      setAssignments(response.data);
      
      handleCloseDialog();
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (assignment) => {
    setAssignmentToDelete(assignment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/assignments/${assignmentToDelete._id}`);
      
      // Refresh assignments
      const teacherId = localStorage.getItem('userId');
      const response = await axios.get(`/api/enseignants/${teacherId}/assignments`);
      setAssignments(response.data);
      
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error('Error deleting assignment:', err);
      setError('Une erreur est survenue lors de la suppression. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setAssignmentToDelete(null);
  };

  const handleViewSubmissions = (assignmentId) => {
    navigate(`/teacher-assignment-submissions/${assignmentId}`);
  };

  if (loading && assignments.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  // Filter assignments based on tab
  const filteredAssignments = assignments.filter(assignment => {
    if (tabValue === 0) return true; // All
    if (tabValue === 1) return assignment.type === 'homework';
    if (tabValue === 2) return assignment.type === 'quiz';
    if (tabValue === 3) return assignment.type === 'exam';
    return false;
  });

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">Devoirs & Évaluations</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nouveau Devoir
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="fullWidth"
        >
          <Tab label="Tous" />
          <Tab label="Devoirs" />
          <Tab label="Quiz" />
          <Tab label="Examens" />
        </Tabs>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {filteredAssignments.length === 0 ? (
        <Box textAlign="center" p={5} bgcolor="background.paper" borderRadius={2}>
          <AssignmentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6">Aucun devoir trouvé</Typography>
          <Typography color="text.secondary" mb={3}>
            Créez un nouveau devoir en cliquant sur le bouton ci-dessus
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredAssignments.map((assignment) => {
            const dueDate = new Date(assignment.dueDate);
            const isPastDue = dueDate < new Date();
            const className = classes.find(c => c._id === assignment.classId)?.nom || 'Classe inconnue';
            
            return (
              <Grid item xs={12} md={6} lg={4} key={assignment._id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                          <AssignmentIcon />
                        </Avatar>
                        <Typography variant="h6">{assignment.title}</Typography>
                      </Box>
                      <Chip 
                        label={
                          assignment.type === 'homework' ? 'Devoir' : 
                          assignment.type === 'quiz' ? 'Quiz' : 'Examen'
                        }
                        color={
                          assignment.type === 'homework' ? 'primary' : 
                          assignment.type === 'quiz' ? 'success' : 'error'
                        }
                        size="small"
                      />
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {assignment.description}
                    </Typography>
                    
                    <Box display="flex" alignItems="center" mb={1}>
                      <SchoolIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {className}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Chip 
                        icon={isPastDue ? <CloseIcon /> : <CheckIcon />}
                        label={`Échéance: ${dueDate.toLocaleDateString()}`}
                        color={isPastDue ? 'error' : 'success'}
                        size="small"
                        variant="outlined"
                      />
                      <Typography variant="body2">
                        {assignment.totalPoints} points
                      </Typography>
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between" mt={2}>
                      <Button 
                        size="small" 
                        onClick={() => handleViewSubmissions(assignment._id)}
                      >
                        Voir les soumissions
                      </Button>
                      <Box>
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenDialog(assignment)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteClick(assignment)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Create/Edit Assignment Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedAssignment ? 'Modifier le devoir' : 'Nouveau devoir'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Titre"
              name="title"
              value={formData.title}
              onChange={handleFormChange}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              margin="normal"
              multiline
              rows={3}
            />
            
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Classe</InputLabel>
              <Select
                name="classId"
                value={formData.classId}
                onChange={handleFormChange}
                label="Classe"
              >
                {classes.map((cls) => (
                  <MenuItem key={cls._id} value={cls._id}>
                    {cls.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleFormChange}
                label="Type"
              >
                <MenuItem value="homework">Devoir</MenuItem>
                <MenuItem value="quiz">Quiz</MenuItem>
                <MenuItem value="exam">Examen</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Date limite"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleFormChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            
            <TextField
              fullWidth
              label="Points totaux"
              name="totalPoints"
              type="number"
              value={formData.totalPoints}
              onChange={handleFormChange}
              margin="normal"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button 
            onClick={handleFormSubmit} 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer ce devoir ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Annuler</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TeacherAssignments;