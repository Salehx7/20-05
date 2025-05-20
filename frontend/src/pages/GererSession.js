import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Box, Grid, Typography, Paper, TextField, Button, Select, MenuItem, InputLabel,
  FormControl, OutlinedInput, Chip, CircularProgress, IconButton, Divider, Alert,
  Tabs, Tab, Tooltip, Snackbar, FormHelperText, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Fab, Collapse, TablePagination, Skeleton,
  Dialog, DialogTitle, DialogContent, DialogActions, TableSortLabel
} from '@mui/material';
import {
  Add, Edit, Delete, School, Event, AccessTime, Link, AttachFile,
  Refresh, KeyboardArrowDown, KeyboardArrowUp, Circle
} from '@mui/icons-material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

// Custom theme
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2', dark: '#115293', light: '#e3f2fd' },
    secondary: { main: '#d81b60', light: '#f8bbd0' },
    error: { main: '#d32f2f' },
    background: { default: '#f5f7fa', paper: '#ffffff' },
    text: { primary: '#1a202c', secondary: '#4a5568' },
    status: {
      upcoming: '#0288d1',
      ongoing: '#388e3c',
      completed: '#757575'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '0.5px' },
    h6: { fontWeight: 600 },
    body2: { color: '#4a5568' }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          transition: 'box-shadow 0.3s ease',
          '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          padding: '10px 16px',
          fontWeight: 500,
          transition: 'all 0.2s ease'
        }
      }
    },
    MuiTable: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          overflow: 'hidden'
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          background: 'linear-gradient(90deg, #1976d2, #115293)',
          color: '#ffffff',
          fontWeight: 600
        },
        body: {
          transition: 'background-color 0.2s ease',
          '&:hover': { backgroundColor: '#f5f7fa' }
        }
      }
    },
    MuiFab: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
          color: '#ffffff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: '0 6px 16px rgba(0,0,0,0.3)'
          }
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: '12px', maxWidth: '600px' }
      }
    }
  }
});

// Styled components
const GradientHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
  padding: theme.spacing(3),
  borderRadius: '12px 12px 0 0',
  color: '#ffffff',
  marginBottom: theme.spacing(2)
}));

axios.defaults.baseURL = 'http://localhost:5000/api';

function GererSession() {
  const [state, setState] = useState({
    sessions: [],
    enseignants: [],
    eleves: [],
    loading: true,
    error: null,
    form: {
      nom: '',
      enseignantId: '',
      eleveIds: [],
      date: new Date().toISOString().split('T')[0],
      heureDebut: '09:00',
      heureFin: '12:00',
      remarque: '',
      lienDirect: '',
      lienSupport: ''
    },
    editId: null,
    tabValue: 'all',
    snackbarOpen: false,
    dialogOpen: false,
    order: 'asc',
    orderBy: 'date',
    page: 0,
    rowsPerPage: 5,
    expandedRows: {}
  });

  // Get current date and time
  const getCurrentDateTime = () => {
    const now = new Date();
    return {
      date: now,
      dateString: now.toISOString().split('T')[0],
      time: now.toTimeString().substring(0, 5)
    };
  };

  // Calculate session status
  const calculateSessionStatus = (session) => {
    if (!session.date || !session.heureDebut || !session.heureFin) {
      return 'not-scheduled';
    }
    
    const now = new Date();
    const sessionDate = new Date(session.date);
    
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sessionDay = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate());
    
    if (sessionDay > today) {
      return 'upcoming';
    }
    
    if (sessionDay < today) {
      return 'completed';
    }
    
    const [startHours, startMins] = session.heureDebut.split(':').map(Number);
    const [endHours, endMins] = session.heureFin.split(':').map(Number);
    
    const currentHours = now.getHours();
    const currentMins = now.getMinutes();
    
    const startTimeInMins = startHours * 60 + startMins;
    const endTimeInMins = endHours * 60 + endMins;
    const currentTimeInMins = currentHours * 60 + currentMins;
    
    if (currentTimeInMins < startTimeInMins) {
      return 'upcoming';
    }
    
    if (currentTimeInMins > endTimeInMins) {
      return 'completed';
    }
    
    return 'ongoing';
  };

  // Calculate session progress
  const calculateProgress = (session) => {
    if (!session.date || !session.heureDebut || !session.heureFin) {
      return 0;
    }
    
    const now = new Date();
    const sessionDate = new Date(session.date);
    
    const sessionDay = sessionDate.getDate();
    const sessionMonth = sessionDate.getMonth();
    const sessionYear = sessionDate.getFullYear();
    
    const [startHours, startMins] = session.heureDebut.split(':').map(Number);
    const [endHours, endMins] = session.heureFin.split(':').map(Number);
    
    const start = new Date(sessionYear, sessionMonth, sessionDay, startHours, startMins);
    const end = new Date(sessionYear, sessionMonth, sessionDay, endHours, endMins);
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Format session date and time
  const formatSessionDateTime = (date, startTime, endTime) => {
    if (!date) return 'N/A';
    
    const sessionDate = new Date(date);
    const formattedDate = sessionDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    let timeRange = '';
    if (startTime && endTime) {
      timeRange = ` de ${startTime} à ${endTime}`;
    } else if (startTime) {
      timeRange = ` à ${startTime}`;
    }
    
    return `${formattedDate}${timeRange}`;
  };

  // Translate session status to French
  const translateStatus = (status) => {
    switch (status) {
      case 'upcoming':
        return 'À venir';
      case 'ongoing':
        return 'En cours';
      case 'completed':
        return 'Terminé';
      case 'not-scheduled':
        return 'Non planifié';
      default:
        return 'Inconnu';
    }
  };

  // Get session progress
  const getProgress = (session) => {
    return calculateProgress(session);
  };

  // Validate form inputs
  const validateForm = () => {
    const errors = {};
    if (!state.form.nom.trim()) {
      errors.nom = 'Le nom de la session est requis';
    }
    if (!state.form.date) {
      errors.date = 'La date est requise';
    }
    if (!state.form.heureDebut) {
      errors.heureDebut = 'L\'heure de début est requise';
    }
    if (!state.form.heureFin) {
      errors.heureFin = 'L\'heure de fin est requise';
    } else if (state.form.heureDebut && state.form.heureFin <= state.form.heureDebut) {
      errors.heureFin = 'L\'heure de fin doit être après l\'heure de début';
    }
    if (!state.form.enseignantId) {
      errors.enseignantId = 'Un enseignant doit être sélectionné';
    }
    if (state.form.lienDirect && !isValidUrl(state.form.lienDirect)) {
      errors.lienDirect = 'Lien de visio invalide';
    }
    if (state.form.lienSupport && !isValidUrl(state.form.lienSupport)) {
      errors.lienSupport = 'Lien de support invalide';
    }
    return errors;
  };

  // Helper function to validate URLs
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Notify students about a session
  const notifyStudentsAboutSession = async (session) => {
    try {
      // Prepare notification data
      const notificationData = {
        sessionId: session._id,
        studentIds: session.eleveIds,
        message: `Nouvelle session "${session.nom}" prévue le ${formatSessionDateTime(session.date, session.heureDebut, session.heureFin)}. Lien: ${session.lienDirect || 'N/A'}`,
        type: 'session_update'
      };

      // Send notification via API (replace with your actual notification endpoint)
      await axios.post('/notifications', notificationData);

      // Optional: Log success or show a secondary snackbar for notification success
      console.log('Notifications sent successfully to students:', session.eleveIds);
    } catch (err) {
      console.error('Error sending notifications:', err);
      // Optionally show a non-blocking error to the user
      setState(prev => ({
        ...prev,
        error: 'Session enregistrée, mais échec de l\'envoi des notifications',
        snackbarOpen: true
      }));
    }
  };

  // Handle form input changes
  const handleChange = (field) => (event) => {
    const value = field === 'eleveIds' ? event.target.value : event.target.value;
    setState(prev => ({
      ...prev,
      form: { ...prev.form, [field]: value }
    }));
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setState(prev => ({ ...prev, error: 'Veuillez corriger les erreurs dans le formulaire', snackbarOpen: true }));
      return;
    }

    try {
      const sessionData = { ...state.form };
      let response;
      if (state.editId) {
        response = await axios.put(`/sessions/${state.editId}`, sessionData);
      } else {
        response = await axios.post('/sessions', sessionData);
      }

      // Notify students about the new or updated session
      await notifyStudentsAboutSession(response.data);

      setState(prev => ({
        ...prev,
        sessions: state.editId
          ? prev.sessions.map(s => s._id === state.editId ? response.data : s)
          : [...prev.sessions, response.data],
        dialogOpen: false,
        form: {
          nom: '',
          enseignantId: '',
          eleveIds: [],
          date: new Date().toISOString().split('T')[0],
          heureDebut: '09:00',
          heureFin: '12:00',
          remarque: '',
          lienDirect: '',
          lienSupport: ''
        },
        editId: null,
        snackbarOpen: true,
        error: null
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err.response?.data?.message || 'Erreur lors de l\'enregistrement de la session',
        snackbarOpen: true
      }));
    }
  };

  // Clear form and open dialog for new session
  const handleClearForm = () => {
    setState(prev => ({
      ...prev,
      form: {
        nom: '',
        enseignantId: '',
        eleveIds: [],
        date: new Date().toISOString().split('T')[0],
        heureDebut: '09:00',
        heureFin: '12:00',
        remarque: '',
        lienDirect: '',
        lienSupport: ''
      },
      editId: null,
      dialogOpen: true
    }));
  };

  // Refresh sessions data
  const handleRefresh = async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const [sessionsRes, formDataRes] = await Promise.all([
        axios.get('/sessions'),
        axios.get('/sessions/form-data')
      ]);
      setState(prev => ({
        ...prev,
        sessions: sessionsRes.data,
        enseignants: formDataRes.data.enseignants,
        eleves: formDataRes.data.eleves,
        loading: false,
        error: null
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err.response?.status === 404 ? 'Ressource introuvable' : 'Erreur de chargement des données',
        loading: false,
        snackbarOpen: true
      }));
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setState(prev => ({ ...prev, tabValue: newValue, page: 0 }));
  };

  // Handle table sort
  const handleSort = (property) => () => {
    setState(prev => ({
      ...prev,
      order: prev.orderBy === property && prev.order === 'asc' ? 'desc' : 'asc',
      orderBy: property
    }));
  };

  // Toggle row expansion
  const toggleRowExpansion = (id) => {
    setState(prev => ({
      ...prev,
      expandedRows: {
        ...prev.expandedRows,
        [id]: !prev.expandedRows[id]
      }
    }));
  };

  // Edit session
  const handleEdit = (session) => {
    setState(prev => ({
      ...prev,
      form: {
        nom: session.nom || '',
        enseignantId: session.enseignantId?._id || '',
        eleveIds: session.eleveIds?.map(e => e._id) || [],
        date: session.date ? new Date(session.date).toISOString().split('T')[0] : '',
        heureDebut: session.heureDebut || '',
        heureFin: session.heureFin || '',
        remarque: session.remarque || '',
        lienDirect: session.lienDirect || '',
        lienSupport: session.lienSupport || ''
      },
      editId: session._id,
      dialogOpen: true
    }));
  };

  // Delete session
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/sessions/${id}`);
      setState(prev => ({
        ...prev,
        sessions: prev.sessions.filter(s => s._id !== id),
        snackbarOpen: true,
        error: null
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err.response?.data?.message || 'Erreur lors de la suppression de la session',
        snackbarOpen: true
      }));
    }
  };

  // Handle pagination page change
  const handleChangePage = (event, newPage) => {
    setState(prev => ({ ...prev, page: newPage }));
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setState(prev => ({
      ...prev,
      rowsPerPage: parseInt(event.target.value, 10),
      page: 0
    }));
  };

  // Toggle dialog
  const toggleDialog = () => {
    setState(prev => ({ ...prev, dialogOpen: !prev.dialogOpen }));
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessionsRes, formDataRes] = await Promise.all([
          axios.get('/sessions'),
          axios.get('/sessions/form-data')
        ]);
        setState(prev => ({
          ...prev,
          sessions: sessionsRes.data,
          enseignants: formDataRes.data.enseignants,
          eleves: formDataRes.data.eleves,
          loading: false
        }));
      } catch (err) {
        setState(prev => ({
          ...prev,
          error: err.response?.status === 404 ? 'Ressource introuvable' : 'Erreur de chargement des données',
          loading: false,
          snackbarOpen: true
        }));
      }
    };
    fetchData();
  }, []);

  const filteredSessions = state.sessions.filter(session => {
    if (state.tabValue === 'all') return true;
    return calculateSessionStatus(session) === state.tabValue;
  });

  const sortedSessions = useMemo(() => {
    const comparator = (a, b) => {
      let valueA, valueB;
      if (state.orderBy === 'date') {
        valueA = new Date(a.date);
        valueB = new Date(b.date);
      } else if (state.orderBy === 'enseignantId') {
        valueA = `${a.enseignantId?.nom || ''} ${a.enseignantId?.prenom || ''}`;
        valueB = `${b.enseignantId?.nom || ''} ${b.enseignantId?.prenom || ''}`;
      } else if (state.orderBy === 'eleveIds') {
        valueA = a.eleveIds?.length || 0;
        valueB = b.eleveIds?.length || 0;
      } else {
        valueA = a[state.orderBy] || '';
        valueB = b[state.orderBy] || '';
      }
      if (typeof valueA === 'number') {
        return state.order === 'asc' ? valueA - valueB : valueB - valueA;
      }
      return state.order === 'asc'
        ? valueA.toString().localeCompare(valueB.toString())
        : valueB.toString().localeCompare(valueA.toString());
    };
    return [...filteredSessions].sort(comparator);
  }, [filteredSessions, state.order, state.orderBy]);

  const formErrors = validateForm();

  if (state.loading) {
    return (
      <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto', bgcolor: 'background.default', minHeight: '100vh' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <TableContainer component={Paper}>
            <Table aria-label="Chargement des sessions">
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <Skeleton variant="rectangular" height={50} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </motion.div>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1400, mx: 'auto', bgcolor: 'background.default', minHeight: '100vh' }}>
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <GradientHeader>
            <Typography variant="h4" sx={{ fontSize: { xs: '1.8rem', md: '2.125rem' } }}>
              Gestion des Sessions
            </Typography>
          </GradientHeader>
        </motion.div>

        <Snackbar
          open={state.snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setState(prev => ({ ...prev, snackbarOpen: false }))}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setState(prev => ({ ...prev, snackbarOpen: false }))}
            severity={state.error ? 'error' : 'success'}
            sx={{ width: '100%', borderRadius: '8px' }}
          >
            {state.error || 'Opération réussie !'}
          </Alert>
        </Snackbar>

        <Fab
          aria-label="Créer une nouvelle session"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000
          }}
          onClick={handleClearForm}
          component={motion.div}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        >
          <Add />
        </Fab>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Paper sx={{ p: 3, borderRadius: '12px', bgcolor: 'background.paper' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" color="text.primary" gutterBottom>
                    Sessions
                  </Typography>
                  <Tooltip title="Rafraîchir">
                    <IconButton
                      onClick={handleRefresh}
                      sx={{ '&:hover': { bgcolor: 'primary.light' } }}
                      aria-label="Rafraîchir la liste"
                    >
                      <Refresh color="primary" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Tabs
                  value={state.tabValue}
                  onChange={handleTabChange}
                  sx={{ mb: 3 }}
                  variant="scrollable"
                  scrollButtons="auto"
                  aria-label="Filtrer par statut"
                >
                  <Tab label="Toutes" value="all" />
                  <Tab label="À venir" value="upcoming" />
                  <Tab label="En cours" value="ongoing" />
                  <Tab label="Terminées" value="completed" />
                </Tabs>
                <Divider sx={{ mb: 3, borderColor: 'grey.200' }} />

                {filteredSessions.length === 0 ? (
                  <Alert severity="info" sx={{ borderRadius: '8px', fontSize: '1rem' }}>
                    Aucune session dans cette catégorie
                  </Alert>
                ) : (
                  <TableContainer component={Paper}>
                    <Table aria-label="Tableau des sessions">
                      <TableHead>
                        <TableRow>
                          <TableCell />
                          <TableCell>
                            <TableSortLabel
                              active={state.orderBy === 'nom'}
                              direction={state.orderBy === 'nom' ? state.order : 'asc'}
                              onClick={handleSort('nom')}
                            >
                              Nom
                            </TableSortLabel>
                          </TableCell>
                          <TableCell>
                            <TableSortLabel
                              active={state.orderBy === 'date'}
                              direction={state.orderBy === 'date' ? state.order : 'asc'}
                              onClick={handleSort('date')}
                            >
                              Date & Heure
                            </TableSortLabel>
                          </TableCell>
                          <TableCell>Enseignant</TableCell>
                          <TableCell>Élèves</TableCell>
                          <TableCell>Statut</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sortedSessions
                          .slice(state.page * state.rowsPerPage, state.page * state.rowsPerPage + state.rowsPerPage)
                          .map((session) => {
                            const status = calculateSessionStatus(session);
                            const isExpanded = state.expandedRows[session._id];

                            return (
                              <React.Fragment key={session._id}>
                                <TableRow sx={{ bgcolor: status === 'ongoing' ? '#e8f5e9' : 'inherit' }}>
                                  <TableCell>
                                    <IconButton
                                      aria-label={isExpanded ? 'Réduire la ligne' : 'Étendre la ligne'}
                                      size="small"
                                      onClick={() => toggleRowExpansion(session._id)}
                                    >
                                      {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                    </IconButton>
                                  </TableCell>
                                  <TableCell>{session.nom || 'N/A'}</TableCell>
                                  <TableCell>
                                    {formatSessionDateTime(session.date, session.heureDebut, session.heureFin)}
                                  </TableCell>
                                  <TableCell>
                                    {session.enseignantId ? `${session.enseignantId.nom} ${session.enseignantId.prenom}` : 'N/A'}
                                  </TableCell>
                                  <TableCell>{session.eleveIds?.length || 0}</TableCell>
                                  <TableCell>
                                    <Box display="flex" alignItems="center">
                                      <Circle
                                        sx={{
                                          color: theme.palette.status[status],
                                          mr: 1,
                                          fontSize: '12px'
                                        }}
                                      />
                                      {translateStatus(status)}
                                      {status === 'ongoing' && (
                                        <CircularProgress
                                          size={20}
                                          variant="determinate"
                                          value={getProgress(session)}
                                          sx={{ ml: 1 }}
                                        />
                                      )}
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Tooltip title="Modifier">
                                      <IconButton
                                        onClick={() => handleEdit(session)}
                                        sx={{ '&:hover': { bgcolor: 'primary.light' } }}
                                        aria-label="Modifier la session"
                                      >
                                        <Edit color="primary" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Supprimer">
                                      <IconButton
                                        onClick={() => handleDelete(session._id)}
                                        sx={{ '&:hover': { bgcolor: 'error.light' } }}
                                        aria-label="Supprimer la session"
                                      >
                                        <Delete color="error" />
                                      </IconButton>
                                    </Tooltip>
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                      <Box sx={{ p: 2, bgcolor: '#fafafa' }}>
                                        <Typography variant="body2">
                                          <strong>Remarque :</strong> {session.remarque || 'Aucune'}
                                        </Typography>
                                        {session.lienDirect && (
                                          <Button
                                            size="small"
                                            startIcon={<Link />}
                                            href={session.lienDirect}
                                            target="_blank"
                                            variant="outlined"
                                            color="primary"
                                            sx={{ mt: 1, mr: 1 }}
                                            aria-label="Rejoindre la session"
                                          >
                                            Rejoindre
                                          </Button>
                                        )}
                                        {session.lienSupport && (
                                          <Button
                                            size="small"
                                            startIcon={<AttachFile />}
                                            href={session.lienSupport}
                                            target="_blank"
                                            variant="outlined"
                                            color="secondary"
                                            sx={{ mt: 1 }}
                                            aria-label="Accéder aux supports"
                                          >
                                            Supports
                                          </Button>
                                        )}
                                      </Box>
                                    </Collapse>
                                  </TableCell>
                                </TableRow>
                              </React.Fragment>
                            );
                          })}
                      </TableBody>
                    </Table>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      component="div"
                      count={sortedSessions.length}
                      rowsPerPage={state.rowsPerPage}
                      page={state.page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      labelRowsPerPage="Lignes par page :"
                      aria-label="Pagination des sessions"
                    />
                  </TableContainer>
                )}
              </Paper>
            </motion.div>
          </Grid>
        </Grid>

        <Dialog
          open={state.dialogOpen}
          onClose={toggleDialog}
          aria-labelledby="session-dialog-title"
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle id="session-dialog-title">
            {state.editId ? 'Modifier la Session' : 'Nouvelle Session'}
          </DialogTitle>
          <DialogContent>
            <form onSubmit={handleSubmit} aria-live="polite">
              <TextField
                label="Nom de la session"
                fullWidth
                margin="normal"
                value={state.form.nom}
                onChange={handleChange('nom')}
                required
                error={!!formErrors.nom}
                helperText={formErrors.nom}
                variant="outlined"
                InputProps={{
                  startAdornment: <School sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ mb: 2 }}
                aria-describedby="nom-error"
                inputProps={{ 'aria-required': true }}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Date"
                    type="date"
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    value={state.form.date}
                    onChange={handleChange('date')}
                    required
                    error={!!formErrors.date}
                    helperText={formErrors.date}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <Event sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                    aria-describedby="date-error"
                    inputProps={{ 'aria-required': true }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    label="Heure de début"
                    type="time"
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    value={state.form.heureDebut}
                    onChange={handleChange('heureDebut')}
                    required
                    error={!!formErrors.heureDebut}
                    helperText={formErrors.heureDebut}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                    aria-describedby="heureDebut-error"
                    inputProps={{ 'aria-required': true }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    label="Heure de fin"
                    type="time"
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    value={state.form.heureFin}
                    onChange={handleChange('heureFin')}
                    required
                    error={!!formErrors.heureFin}
                    helperText={formErrors.heureFin}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                    aria-describedby="heureFin-error"
                    inputProps={{ 'aria-required': true }}
                  />
                </Grid>
              </Grid>

              <FormControl fullWidth margin="normal" sx={{ mb: 2 }} error={!!formErrors.enseignantId}>
                <InputLabel>Enseignant</InputLabel>
                <Select
                  value={state.form.enseignantId}
                  onChange={handleChange('enseignantId')}
                  required
                  label="Enseignant"
                  sx={{ borderRadius: '8px', bgcolor: 'white' }}
                  aria-describedby="enseignant-error"
                  inputProps={{ 'aria-required': true }}
                >
                  {state.enseignants.map(e => (
                    <MenuItem key={e._id} value={e._id}>
                      {e.nom} {e.prenom} ({e.specialite})
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.enseignantId && <FormHelperText id="enseignant-error">{formErrors.enseignantId}</FormHelperText>}
              </FormControl>

              <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
                <InputLabel>Élèves</InputLabel>
                <Select
                  multiple
                  value={state.form.eleveIds}
                  onChange={handleChange('eleveIds')}
                  input={<OutlinedInput label="Élèves" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map(id => {
                        const e = state.eleves.find(el => el._id === id);
                        return (
                          <Chip
                            key={id}
                            label={e ? `${e.nom} ${e.prenom}` : id}
                            onDelete={() => {
                              setState(prev => ({
                                ...prev,
                                form: { ...prev.form, eleveIds: prev.form.eleveIds.filter(eId => eId !== id) }
                              }));
                            }}
                            sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: '16px' }}
                          />
                        );
                      })}
                    </Box>
                  )}
                  sx={{ borderRadius: '8px', bgcolor: 'white' }}
                  aria-describedby="eleves-error"
                >
                  {state.eleves.map(e => (
                    <MenuItem key={e._id} value={e._id}>
                      {e.nom} {e.prenom} ({e.niveau})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Lien de la visio"
                fullWidth
                margin="normal"
                value={state.form.lienDirect}
                onChange={handleChange('lienDirect')}
                error={!!formErrors.lienDirect}
                helperText={formErrors.lienDirect}
                variant="outlined"
                InputProps={{
                  startAdornment: <Link sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ mb: 2 }}
                aria-describedby="lienDirect-error"
              />

              <TextField
                label="Lien des supports"
                fullWidth
                margin="normal"
                value={state.form.lienSupport}
                onChange={handleChange('lienSupport')}
                error={!!formErrors.lienSupport}
                helperText={formErrors.lienSupport}
                variant="outlined"
                InputProps={{
                  startAdornment: <AttachFile sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ mb: 2 }}
                aria-describedby="lienSupport-error"
              />

              <TextField
                label="Remarque"
                fullWidth
                multiline
                rows={3}
                margin="normal"
                value={state.form.remarque}
                onChange={handleChange('remarque')}
                variant="outlined"
                sx={{ mb: 2 }}
                aria-describedby="remarque-error"
              />

              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ flex: 1, py: 1.5 }}
                  disabled={Object.keys(formErrors).length > 0}
                  aria-label={state.editId ? 'Mettre à jour la session' : 'Créer la session'}
                >
                  {state.editId ? 'Mettre à jour' : 'Créer'}
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  sx={{ flex: 1, py: 1.5 }}
                  onClick={toggleDialog}
                  aria-label="Annuler la saisie"
                >
                  Annuler
                </Button>
              </Box>
            </form>
          </DialogContent>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}

export default GererSession;