import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Snackbar,
  Alert,
  Typography,
  IconButton
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';

const CATEGORIES = [
  "Sciences", "Mathématiques", "Technologie", "Informatique", "Langue Arabe",
  "Langue Française", "Langue Anglaise", "Philosophie", "Éducation Islamique",
  "Éducation Civique", "Éducation Artistique", "Éducation Physique", "Économie et Gestion",
  "Histoire-Géographie", "Physique", "Chimie", "SVT", "Autre"
];

const tunisianLevels = [
  '1ère année primaire', '2ème année primaire', '3ème année primaire',
  '4ème année primaire', '5ème année primaire', '6ème année primaire',
  '7ème année (1ère année collège)', '8ème année (2ème année collège)', '9ème année (3ème année collège)',
  '1ère année secondaire',
  '2ème année - Sciences', '2ème année - Lettres', '2ème année - Economie et Services',
  '2ème année - Technologies de l\'informatique', '2ème année - Sciences techniques',
  '3ème année - Sciences expérimentales', '3ème année - Mathématiques', '3ème année - Lettres',
  '3ème année - Economie et Gestion', '3ème année - Sciences techniques', '3ème année - Sciences informatiques',
  '4ème année - Sciences expérimentales', '4ème année - Mathématiques', '4ème année - Lettres',
  '4ème année - Economie et Gestion', '4ème année - Sciences techniques', '4ème année - Sciences informatiques'
];

const AjoutMatiere = ({ onMatiereAdded }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    nom: '',
    description: '',
    categories: [],
    classe: []
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setForm({
      nom: '',
      description: '',
      categories: [],
      classe: []
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoriesChange = (e) => {
    const value = e.target.value;
    setForm(prev => ({
      ...prev,
      categories: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const handleClasseChange = (e) => {
    const value = e.target.value;
    setForm(prev => ({
      ...prev,
      classe: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const handleSubmit = async () => {
    if (!form.nom) {
      setSnackbar({
        open: true,
        message: 'Le nom de la matière est requis',
        severity: 'error'
      });
      return;
    }

    if (form.categories.length === 0) {
      setSnackbar({
        open: true,
        message: 'Veuillez sélectionner au moins une catégorie',
        severity: 'error'
      });
      return;
    }

    if (form.classe.length === 0) {
      setSnackbar({
        open: true,
        message: 'Veuillez sélectionner au moins une classe',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/matieres`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSnackbar({
        open: true,
        message: 'Matière ajoutée avec succès',
        severity: 'success'
      });

      if (onMatiereAdded) {
        onMatiereAdded(response.data.matiere);
      }

      handleClose();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la matière:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Erreur lors de l\'ajout de la matière',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Bouton pour ouvrir le formulaire */}
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleOpen}
        sx={{
          backgroundColor: "#1976d2",
          "&:hover": { backgroundColor: "#1565c0" },
          borderRadius: 2,
          px: 3,
          textTransform: 'none',
          fontWeight: 600
        }}
      >
        Ajouter une Matière
      </Button>

      {/* Dialog (Formulaire) */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Ajouter une nouvelle matière</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Nom de la matière"
            name="nom"
            value={form.nom}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={3}
          />

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Catégories</InputLabel>
            <Select
              multiple
              value={form.categories}
              onChange={handleCategoriesChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              {CATEGORIES.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Classes</InputLabel>
            <Select
              multiple
              value={form.classe}
              onChange={handleClasseChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              {tunisianLevels.map((level) => (
                <MenuItem key={level} value={level}>
                  {level}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'En cours...' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AjoutMatiere;