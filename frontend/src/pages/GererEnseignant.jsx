import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Grid, Typography, Paper, TextField, Button, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, InputLabel, Select, MenuItem, InputAdornment,
  CircularProgress, Tooltip, Chip, Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarMonth as CalendarIcon,
  Book as BookIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

axios.defaults.baseURL = 'http://localhost:5000/api';

const GererEnseignant = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    dateNaissance: '',
    specialite: '',
    email: '',
    password: ''
  });
  const [enseignants, setEnseignants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Renommer matieres en specialites
  const specialites = [
    'Mathématiques', 'Physique', 'Chimie', 'Biologie', 'Informatique',
    'Français', 'Anglais', 'Histoire', 'Géographie', 'Philosophie',
    'Éducation Physique', 'Arts Plastiques', 'Musique', 'Sciences Économiques'
  ];

  const token = localStorage.getItem('token');

  const fetchEnseignants = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/enseignants?search=${searchTerm}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEnseignants(response.data.enseignants || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des enseignants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnseignants();
  }, [searchTerm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenDialog = (enseignant = null) => {
    if (enseignant) {
      setFormData({
        nom: enseignant.nom,
        prenom: enseignant.prenom,
        dateNaissance: enseignant.dateNaissance?.split('T')[0] || '',
        specialite: enseignant.specialite || '',
        email: enseignant.email,
        password: ''
      });
      setEditMode(true);
      setCurrentId(enseignant._id);
    } else {
      setFormData({
        nom: '',
        prenom: '',
        dateNaissance: '',
        specialite: '',
        email: '',
        password: ''
      });
      setEditMode(false);
      setCurrentId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      nom: '',
      prenom: '',
      dateNaissance: '',
      specialite: '',
      email: '',
      password: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nom || !formData.prenom || !formData.specialite || !formData.email || (!editMode && !formData.password)) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setLoading(true);
    try {
      if (editMode) {
        const response = await axios.put(
          `/enseignants/${currentId}`,
          {
            nom: formData.nom,
            prenom: formData.prenom,
            specialite: formData.specialite,
            email: formData.email,
            dateNaissance: formData.dateNaissance
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        toast.success('Teacher updated successfully');
      } else {
        const response = await axios.post(
          '/enseignants/create-with-user',
          {
            nom: formData.nom,
            prenom: formData.prenom,
            specialite: formData.specialite,
            email: formData.email,
            password: formData.password,
            dateNaissance: formData.dateNaissance
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        toast.success('Teacher created successfully');
      }
      handleCloseDialog();
      fetchEnseignants();
    } catch (err) {
      console.error('Error:', err.response?.data || err.message);
      
      if (err.response?.status === 409) {
        toast.error('This email is already in use. Please choose another one.');
        setFormData(prev => ({ ...prev, email: '' }));
      } else {
        toast.error(err.response?.data?.message || 'Error submitting form');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setLoading(true);
    try {
      await axios.delete(`/enseignants/${confirmDelete}`, { // <-- removed /api
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Enseignant supprimé');
      fetchEnseignants();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setLoading(false);
      setConfirmDelete(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, mt: 8 }}>
      <Typography variant="h4" gutterBottom>Gestion des Enseignants</Typography>

      {/* Search + Add */}
      <Grid container spacing={2} alignItems="center" mb={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item xs={12} md={6} textAlign="right">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Ajouter un enseignant
          </Button>
        </Grid>
      </Grid>

      {/* Table */}
      <Paper elevation={2}>
        {loading ? (
          <Box p={5} textAlign="center">
            <CircularProgress />
          </Box>
        ) : enseignants.length === 0 ? (
          <Box p={4} textAlign="center">
            <Typography>Aucun enseignant trouvé.</Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Prénom</TableCell>
                <TableCell>Spécialité</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Date de naissance</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {enseignants.map((e) => (
                <TableRow key={e._id}>
                  <TableCell>{e.nom}</TableCell>
                  <TableCell>{e.prenom}</TableCell>
                  <TableCell>{e.specialite}</TableCell>
                  <TableCell>{e.email}</TableCell>
                  <TableCell>{formatDate(e.dateNaissance)}</TableCell>
                  <TableCell align="center">
                    <IconButton color="primary" onClick={() => handleOpenDialog(e)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => setConfirmDelete(e._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Dialog Create/Update */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editMode ? 'Modifier Enseignant' : 'Ajouter Enseignant'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={6}>
              <TextField
                name="nom"
                label="Nom"
                value={formData.nom}
                onChange={handleChange}
                fullWidth
                required
                error={!!formData.nom === false}
                helperText={formData.nom === '' ? 'Ce champ est requis' : ''}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="prenom"
                label="Prénom"
                value={formData.prenom}
                onChange={handleChange}
                fullWidth
                required
                error={!!formData.prenom === false}
                helperText={formData.prenom === '' ? 'Ce champ est requis' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Spécialité</InputLabel>
                <Select
                  name="specialite"
                  value={formData.specialite}
                  onChange={handleChange}
                  error={!!formData.specialite === false}
                >
                  {specialites.map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                required
                error={!!formData.email === false}
                helperText={formData.email === '' ? 'Ce champ est requis' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="dateNaissance"
                label="Date de naissance"
                type="date"
                value={formData.dateNaissance}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            {!editMode && (
              <Grid item xs={12}>
                <TextField
                  name="password"
                  label="Mot de passe"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!formData.password === false}
                  helperText={formData.password === '' ? 'Ce champ est requis' : ''}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : editMode ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>Voulez-vous vraiment supprimer cet enseignant ?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Annuler</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            {loading ? <CircularProgress size={24} /> : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GererEnseignant;