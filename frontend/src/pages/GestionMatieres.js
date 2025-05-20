import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import {
  Box, Typography, TextField, Button, Grid, FormControl, InputLabel, Select, MenuItem, Dialog,
  DialogTitle, DialogContent, DialogActions, CircularProgress, IconButton, List, ListItem,
  ListItemText, Divider, Snackbar, Alert, Tooltip, Chip, Card, CardContent
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon,
  Close as CloseIcon, Science as ScienceIcon, Calculate as MathIcon, Engineering as TechIcon,
  Computer as ComputerIcon, Mosque as IslamicIcon, Gavel as CivicIcon,
  Brush as ArtIcon, SportsSoccer as SportsIcon, AccountBalance as EconIcon,
  History as HistoryIcon, QuestionMark as OtherIcon, Language as LanguageIcon,
  Psychology as PhilosophyIcon
} from '@mui/icons-material';

// Constants
const CATEGORIES = [
  "Sciences", "Mathématiques", "Technologie", "Informatique", "Langue Arabe",
  "Langue Française", "Langue Anglaise", "Philosophie", "Éducation Islamique",
  "Éducation Civique", "Éducation Artistique", "Éducation Physique", "Économie et Gestion",
  "Histoire-Géographie", "Physique", "Chimie", "SVT", "Autre"
];

const TUNISIAN_LEVELS = [
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

// Icons for Categories
const CATEGORY_ICONS = {
  "Sciences": <ScienceIcon sx={{ color: "#4caf50", fontSize: 20 }} />,
  "Mathématiques": <MathIcon sx={{ color: "#2196f3", fontSize: 20 }} />,
  "Technologie": <TechIcon sx={{ color: "#ff9800", fontSize: 20 }} />,
  "Informatique": <ComputerIcon sx={{ color: "#9c27b0", fontSize: 20 }} />,
  "Langue Arabe": <LanguageIcon sx={{ color: "#f44336", fontSize: 20 }} />,
  "Langue Française": <LanguageIcon sx={{ color: "#3f51b5", fontSize: 20 }} />,
  "Langue Anglaise": <LanguageIcon sx={{ color: "#e91e63", fontSize: 20 }} />,
  "Philosophie": <PhilosophyIcon sx={{ color: "#795548", fontSize: 20 }} />,
  "Éducation Islamique": <IslamicIcon sx={{ color: "#009688", fontSize: 20 }} />,
  "Éducation Civique": <CivicIcon sx={{ color: "#607d8b", fontSize: 20 }} />,
  "Éducation Artistique": <ArtIcon sx={{ color: "#ffeb3b", fontSize: 20 }} />,
  "Éducation Physique": <SportsIcon sx={{ color: "#8bc34a", fontSize: 20 }} />,
  "Économie et Gestion": <EconIcon sx={{ color: "#673ab7", fontSize: 20 }} />,
  "Histoire-Géographie": <HistoryIcon sx={{ color: "#ff5722", fontSize: 20 }} />,
  "Physique": <ScienceIcon sx={{ color: "#03a9f4", fontSize: 20 }} />,
  "Chimie": <ScienceIcon sx={{ color: "#00bcd4", fontSize: 20 }} />,
  "SVT": <ScienceIcon sx={{ color: "#cddc39", fontSize: 20 }} />,
  "Autre": <OtherIcon sx={{ color: "#757575", fontSize: 20 }} />
};

const CATEGORY_COLORS = {
  "Sciences": '#4caf50', "Mathématiques": '#2196f3', "Technologie": '#ff9800', "Informatique": '#9c27b0',
  "Langue Arabe": '#f44336', "Langue Française": '#3f51b5', "Langue Anglaise": '#e91e63', "Philosophie": '#795548',
  "Éducation Islamique": '#009688', "Éducation Civique": '#607d8b', "Éducation Artistique": '#ffeb3b',
  "Éducation Physique": '#8bc34a', "Économie et Gestion": '#673ab7', "Histoire-Géographie": '#ff5722',
  "Physique": '#03a9f4', "Chimie": '#00bcd4', "SVT": '#cddc39', "Autre": '#757575'
};

// Styled Components
const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: "#f5f6fa",
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1),
  }
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
  transition: "transform 0.2s ease",
  "&:hover": {
    transform: "scale(1.02)",
  },
  [theme.breakpoints.down("sm")]: {
    borderRadius: theme.spacing(0.5),
  }
}));

const GestionMatiere = ({ sidenavOpen }) => {
  const [matieres, setMatieres] = useState([]);
  const [form, setForm] = useState({ nom: '', description: '', section: '', classe: [] });
  const [selectedMatiere, setSelectedMatiere] = useState(null);
  const [chapitres, setChapitres] = useState([]);
  const [chapLoading, setChapLoading] = useState(false);
  const [chapError, setChapError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editMatiereDialog, setEditMatiereDialog] = useState(false);
  const [deleteMatiereDialog, setDeleteMatiereDialog] = useState({ open: false, matiere: null });
  const [search, setSearch] = useState('');
  const [editChapitre, setEditChapitre] = useState(null);
  const [chapForm, setChapForm] = useState({ titre: '', contenu: '', youtubeUrl: '', driveUrl: '' });
  const [chapSubmitting, setChapSubmitting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, chapitre: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLevel, setFilterLevel] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Fetch matières on mount
  useEffect(() => {
    const fetchMatieres = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');
        const response = await axios.get(`${API_URL}/api/matieres`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const sanitizedMatieres = (response.data.matieres || []).map(matiere => ({
          ...matiere,
          section: matiere.section || 'Autre',
          classe: Array.isArray(matiere.classe) ? matiere.classe : []
        }));
        setMatieres(sanitizedMatieres);
      } catch (error) {
        console.error('Error fetching matières:', error);
        setSnackbar({ open: true, message: error.message || 'Erreur lors du chargement', severity: 'error' });
      }
    };
    fetchMatieres();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleClasseChange = (e) => {
    const value = e.target.value;
    setForm(prev => ({ ...prev, classe: typeof value === 'string' ? value.split(',') : value }));
  };

  const handleSubmit = async (e, isEdit = false) => {
    e.preventDefault();
    if (!form.section) {
      setSnackbar({ open: true, message: 'Veuillez sélectionner une section', severity: 'warning' });
      return;
    }
    if (!form.classe || form.classe.length === 0) {
      setSnackbar({ open: true, message: 'Veuillez sélectionner au moins une classe', severity: 'warning' });
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      if (isEdit && selectedMatiere) {
        const response = await axios.put(`${API_URL}/api/matieres/${selectedMatiere._id}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMatieres(matieres.map(m => (m._id === selectedMatiere._id ? { ...response.data.matiere, classe: response.data.matiere.classe || [] } : m)));
        setSnackbar({ open: true, message: 'Matière modifiée avec succès', severity: 'success' });
        setEditMatiereDialog(false);
      } else {
        const response = await axios.post(`${API_URL}/api/matieres`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMatieres([...matieres, { ...response.data.matiere, classe: response.data.matiere.classe || [] }]);
        setSnackbar({ open: true, message: 'Matière ajoutée avec succès', severity: 'success' });
      }
      setForm({ nom: '', description: '', section: '', classe: [] });
      setSelectedMatiere(null);
    } catch (error) {
      console.error('Error saving matière:', error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'Erreur lors de l\'opération', severity: 'error' });
    }
  };

  const handleEditMatiere = (matiere) => {
    setSelectedMatiere(matiere);
    setForm({
      nom: matiere.nom,
      description: matiere.description || '',
      section: matiere.section || '',
      classe: matiere.classe || []
    });
    setEditMatiereDialog(true);
  };

  const handleDeleteMatiere = (matiere) => {
    setDeleteMatiereDialog({ open: true, matiere });
  };

  const handleConfirmDeleteMatiere = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      await axios.delete(`${API_URL}/api/matieres/${deleteMatiereDialog.matiere._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMatieres(matieres.filter(m => m._id !== deleteMatiereDialog.matiere._id));
      setSnackbar({ open: true, message: 'Matière supprimée avec succès', severity: 'success' });
    } catch (error) {
      console.error('Error deleting matière:', error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'Erreur', severity: 'error' });
    } finally {
      setDeleteMatiereDialog({ open: false, matiere: null });
    }
  };

  const handleOpenChapitres = async (matiere) => {
    setSelectedMatiere(matiere);
    setChapLoading(true);
    setChapError('');
    setModalOpen(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      const response = await axios.get(`${API_URL}/api/matieres/${matiere._id}/chapitres`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChapitres(response.data.chapitres || []);
    } catch (error) {
      console.error('Error fetching chapitres:', error);
      setChapError(error.response?.data?.message || 'Erreur lors du chargement des chapitres');
    } finally {
      setChapLoading(false);
    }
  };

  const handleChapitreSubmit = async (e) => {
    e.preventDefault();
    if (!chapForm.titre) {
      setSnackbar({ open: true, message: 'Veuillez entrer un titre', severity: 'warning' });
      return;
    }
    setChapSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      const url = editChapitre
        ? `${API_URL}/api/matieres/chapitres/${editChapitre._id}`
        : `${API_URL}/api/matieres/${selectedMatiere._id}/chapitres`;
      const method = editChapitre ? 'put' : 'post';
      const response = await axios[method](url, chapForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChapitres(editChapitre
        ? chapitres.map(c => c._id === editChapitre._id ? response.data : c)
        : [...chapitres, response.data]
      );
      setSnackbar({ open: true, message: `Chapitre ${editChapitre ? 'modifié' : 'ajouté'} avec succès`, severity: 'success' });
      setChapForm({ titre: '', contenu: '', youtubeUrl: '', driveUrl: '' });
      setEditChapitre(null);
    } catch (error) {
      console.error('Error saving chapitre:', error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'Erreur', severity: 'error' });
    } finally {
      setChapSubmitting(false);
    }
  };

  const handleEditChapitre = (chap) => {
    setEditChapitre(chap);
    setChapForm({
      titre: chap.titre,
      contenu: chap.contenu,
      youtubeUrl: chap.youtubeUrl || '',
      driveUrl: chap.driveUrl || ''
    });
  };

  const handleOpenDeleteDialog = (chap) => {
    setDeleteDialog({ open: true, chapitre: chap });
  };

  const handleDeleteChapitre = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      await axios.delete(`${API_URL}/api/matieres/chapitres/${deleteDialog.chapitre._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChapitres(chapitres.filter(c => c._id !== deleteDialog.chapitre._id));
      setSnackbar({ open: true, message: 'Chapitre supprimé avec succès', severity: 'success' });
    } catch (error) {
      console.error('Error deleting chapitre:', error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'Erreur', severity: 'error' });
    } finally {
      setDeleteDialog({ open: false, chapitre: null });
    }
  };

  const filteredMatieres = useMemo(() => {
    return matieres.filter(m => {
      const matchesSearch = m.nom.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !filterCategory || (m.section && m.section === filterCategory);
      const matchesLevel = !filterLevel || m.classe.includes(filterLevel);
      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [matieres, search, filterCategory, filterLevel]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto', width: '100%', ml: sidenavOpen ? '240px' : '60px', transition: 'margin-left 0.3s ease' }}>
      {/* Breadcrumb Navigation */}
      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
        <Typography sx={{ mr: 1 }}>Toutes les Catégories</Typography>
        {filterCategory && (
          <>
            <Typography sx={{ mx: 0.5 }}>&gt;</Typography>
            <Typography sx={{ mr: 1, color: '#1976d2' }}>{filterCategory}</Typography>
          </>
        )}
        {filterLevel && (
          <>
            <Typography sx={{ mx: 0.5 }}>&gt;</Typography>
            <Typography sx={{ color: '#1976d2' }}>{filterLevel}</Typography>
          </>
        )}
      </Box>

      {/* Header */}
      <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 700, mb: 2, fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
        Gestion des Matières
      </Typography>

      {/* Search and Add Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <TextField
          placeholder="Rechercher une matière..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
            sx: { backgroundColor: 'white', borderRadius: 1, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }
          }}
          sx={{ flexGrow: 1, maxWidth: 300 }}
          inputProps={{ "aria-label": "Rechercher une matière" }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setEditMatiereDialog(true)}
          sx={{
            backgroundColor: '#1976d2',
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: 1,
            '&:hover': { backgroundColor: '#1565c0' }
          }}
          aria-label="Ajouter une matière"
        >
          Ajouter une Matière
        </Button>
      </Box>

      {/* Filters */}
      <StyledBox sx={{ mb: 2, overflowX: 'auto', whiteSpace: 'nowrap', padding: '8px 16px' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {CATEGORIES.map(cat => (
            <Chip
              key={cat}
              icon={CATEGORY_ICONS[cat]}
              label={cat}
              onClick={() => setFilterCategory(filterCategory === cat ? '' : cat)}
              sx={{
                bgcolor: filterCategory === cat ? CATEGORY_COLORS[cat] : '#e0e0e0',
                color: filterCategory === cat ? 'white' : 'text.primary',
                fontWeight: 500,
                '& .MuiChip-icon': { color: filterCategory === cat ? 'white' : CATEGORY_COLORS[cat] }
              }}
              aria-label={`Filtrer par ${cat}`}
            />
          ))}
        </Box>
      </StyledBox>

      {/* Level Selection */}
      <StyledBox sx={{ mb: 2, padding: '8px 16px' }}>
        <Typography sx={{ fontWeight: 500, mb: 1, color: 'text.primary' }}>Sélectionner un niveau</Typography>
        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', whiteSpace: 'nowrap' }}>
          {TUNISIAN_LEVELS.map(level => (
            <Chip
              key={level}
              label={level}
              onClick={() => setFilterLevel(filterLevel === level ? '' : level)}
              sx={{
                bgcolor: filterLevel === level ? '#e0e7ff' : '#f5f5f5',
                color: filterLevel === level ? '#1976d2' : 'text.primary',
                fontWeight: 500,
                border: '1px solid #e0e0e0',
                borderRadius: '16px'
              }}
              aria-label={`Sélectionner ${level}`}
            />
          ))}
        </Box>
      </StyledBox>

      {/* List of Matières */}
      <StyledBox>
        <Grid container spacing={2}>
          {filteredMatieres.length === 0 ? (
            <Box sx={{ width: '100%', textAlign: 'center', py: 4, color: 'text.secondary' }}>
              <Typography fontStyle="italic">Aucune matière trouvée.</Typography>
            </Box>
          ) : (
            filteredMatieres.map(m => (
              <Grid item xs={12} sm={6} md={4} key={m._id}>
                <StyledCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" fontWeight={600}>{m.nom}</Typography>
                      <Box>
                        <Tooltip title="Modifier">
                          <IconButton
                            onClick={() => handleEditMatiere(m)}
                            sx={{ color: '#1976d2', '&:hover': { color: '#1565c0' } }}
                            aria-label={`Modifier ${m.nom}`}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton
                            onClick={() => handleDeleteMatiere(m)}
                            sx={{ color: '#ef4444', '&:hover': { color: '#dc2626' } }}
                            aria-label={`Supprimer ${m.nom}`}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    <Chip
                      icon={CATEGORY_ICONS[m.section]}
                      label={m.section}
                      sx={{
                        bgcolor: CATEGORY_COLORS[m.section],
                        color: 'white',
                        fontWeight: 500,
                        mb: 1,
                        '& .MuiChip-icon': { color: 'white' }
                      }}
                      aria-label={`Section: ${m.section}`}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {m.description || 'Aucune description disponible.'}
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      Classes: {m.classe.join(', ') || 'Aucune classe associée'}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleOpenChapitres(m)}
                      sx={{ mt: 2, borderRadius: 1 }}
                      aria-label={`Voir les chapitres de ${m.nom}`}
                    >
                      Voir les chapitres
                    </Button>
                  </CardContent>
                </StyledCard>
              </Grid>
            ))
          )}
        </Grid>
      </StyledBox>

      {/* Edit/Add Matière Dialog */}
      <Dialog open={editMatiereDialog} onClose={() => setEditMatiereDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: '1.25rem', fontWeight: 600, color: '#1976d2' }}>
          {selectedMatiere ? 'Modifier la Matière' : 'Ajouter une Matière'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="nom"
            label="Nom"
            fullWidth
            value={form.nom}
            onChange={handleChange}
            required
            sx={{ mb: 2, mt: 1 }}
            inputProps={{ "aria-label": "Nom de la matière" }}
          />
          <FormControl fullWidth required sx={{ mb: 2 }}>
            <InputLabel>Section</InputLabel>
            <Select
              name="section"
              value={form.section}
              onChange={handleChange}
              label="Section"
            >
              {CATEGORIES.map(cat => (
                <MenuItem key={cat} value={cat}>
                  {CATEGORY_ICONS[cat] && React.cloneElement(CATEGORY_ICONS[cat], { sx: { ...CATEGORY_ICONS[cat].props.sx, mr: 1, fontSize: 20 }})}
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth required sx={{ mb: 2 }}>
            <InputLabel>Classe(s)</InputLabel>
            <Select
              multiple
              name="classe"
              value={form.classe}
              onChange={handleClasseChange}
              label="Classe(s)"
              renderValue={(selected) => selected.join(', ')}
            >
              {TUNISIAN_LEVELS.map(level => (
                <MenuItem key={level} value={level}>{level}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="description"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={form.description}
            onChange={handleChange}
            sx={{ mb: 2 }}
            inputProps={{ "aria-label": "Description de la matière" }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setEditMatiereDialog(false);
              setForm({ nom: '', description: '', section: '', classe: [] });
              setSelectedMatiere(null);
            }}
            sx={{ color: '#6b7280', '&:hover': { backgroundColor: '#f1f5f9' } }}
            aria-label="Annuler"
          >
            Annuler
          </Button>
          <Button
            onClick={(e) => handleSubmit(e, !!selectedMatiere)}
            variant="contained"
            sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}
            aria-label={selectedMatiere ? 'Modifier la matière' : 'Ajouter une matière'}
          >
            {selectedMatiere ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Matière Confirmation Dialog */}
      <Dialog open={deleteMatiereDialog.open} onClose={() => setDeleteMatiereDialog({ open: false, matiere: null })}>
        <DialogTitle sx={{ color: '#1976d2', fontWeight: 600 }}>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer la matière "{deleteMatiereDialog.matiere?.nom}" ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteMatiereDialog({ open: false, matiere: null })}
            sx={{ color: '#6b7280', '&:hover': { backgroundColor: '#f1f5f9' } }}
            aria-label="Annuler"
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirmDeleteMatiere}
            variant="contained"
            sx={{ backgroundColor: '#ef4444', '&:hover': { backgroundColor: '#dc2626' } }}
            aria-label="Supprimer"
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Chapitres Dialog */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>
          {selectedMatiere?.nom}
          <IconButton
            onClick={() => setModalOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
            aria-label="Fermer"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" fontWeight={600} color="#1976d2" mb={2}>
              Gestion des Chapitres
            </Typography>
            <Box component="form" onSubmit={handleChapitreSubmit} sx={{ mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Titre du chapitre"
                    value={chapForm.titre}
                    onChange={(e) => setChapForm({ ...chapForm, titre: e.target.value })}
                    required
                    inputProps={{ "aria-label": "Titre du chapitre" }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Contenu"
                    value={chapForm.contenu}
                    onChange={(e) => setChapForm({ ...chapForm, contenu: e.target.value })}
                    inputProps={{ "aria-label": "Contenu du chapitre" }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Lien YouTube"
                    value={chapForm.youtubeUrl}
                    onChange={(e) => setChapForm({ ...chapForm, youtubeUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    inputProps={{ "aria-label": "Lien YouTube" }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Lien Google Drive"
                    value={chapForm.driveUrl}
                    onChange={(e) => setChapForm({ ...chapForm, driveUrl: e.target.value })}
                    placeholder="https://drive.google.com/..."
                    inputProps={{ "aria-label": "Lien Google Drive" }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={chapSubmitting}
                    startIcon={editChapitre ? <EditIcon /> : <AddIcon />}
                    sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}
                    aria-label={editChapitre ? 'Modifier le chapitre' : 'Ajouter un chapitre'}
                  >
                    {editChapitre ? 'Modifier' : 'Ajouter'} Chapitre
                  </Button>
                  {editChapitre && (
                    <Button
                      sx={{ ml: 2, color: '#6b7280', '&:hover': { backgroundColor: '#f1f5f9' } }}
                      onClick={() => {
                        setEditChapitre(null);
                        setChapForm({ titre: '', contenu: '', youtubeUrl: '', driveUrl: '' });
                      }}
                      aria-label="Annuler"
                    >
                      Annuler
                    </Button>
                  )}
                </Grid>
              </Grid>
            </Box>
            {chapLoading ? (
              <CircularProgress aria-label="Chargement des chapitres" />
            ) : chapError ? (
              <Typography color="error">{chapError}</Typography>
            ) : (
              <List>
                {chapitres.length === 0 ? (
                  <Typography color="text.secondary" fontStyle="italic">
                    Aucun chapitre pour cette matière.
                  </Typography>
                ) : (
                  chapitres.map(chap => (
                    <React.Fragment key={chap._id}>
                      <ListItem
                        secondaryAction={
                          <Box>
                            <Tooltip title="Modifier">
                              <IconButton
                                onClick={() => handleEditChapitre(chap)}
                                sx={{ color: '#1976d2', '&:hover': { color: '#1565c0' } }}
                                aria-label={`Modifier ${chap.titre}`}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                              <IconButton
                                onClick={() => handleOpenDeleteDialog(chap)}
                                sx={{ color: '#ef4444', '&:hover': { color: '#dc2626' } }}
                                aria-label={`Supprimer ${chap.titre}`}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        }
                      >
                        <ListItemText
                          primary={chap.titre}
                          secondary={
                            <Box component="span">
                              <Typography component="span" variant="body2" color="text.primary">
                                {chap.contenu.substring(0, 100)}...
                              </Typography>
                              {chap.youtubeUrl && (
                                <Typography component="div" variant="caption" display="block">
                                  YouTube: <a href={chap.youtubeUrl} target="_blank" rel="noopener noreferrer">{chap.youtubeUrl}</a>
                                </Typography>
                              )}
                              {chap.driveUrl && (
                                <Typography component="div" variant="caption" display="block">
                                  Drive: <a href={chap.driveUrl} target="_blank" rel="noopener noreferrer">{chap.driveUrl}</a>
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))
                )}
              </List>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Delete Chapitre Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, chapitre: null })}>
        <DialogTitle sx={{ color: '#1976d2', fontWeight: 600 }}>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Voulez-vous vraiment supprimer le chapitre "{deleteDialog.chapitre?.titre}" ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, chapitre: null })}
            sx={{ color: '#6b7280', '&:hover': { backgroundColor: '#f1f5f9' } }}
            aria-label="Annuler"
          >
            Annuler
          </Button>
          <Button
            onClick={handleDeleteChapitre}
            variant="contained"
            sx={{ backgroundColor: '#ef4444', '&:hover': { backgroundColor: '#dc2626' } }}
            aria-label="Supprimer"
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: '100%', borderRadius: '8px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GestionMatiere;