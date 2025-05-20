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
  Computer as ComputerIcon, Book as BookIcon, Mosque as IslamicIcon, Gavel as CivicIcon,
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

const tunisianLevels = [
  // Primaire
  '1ère année primaire',
  '2ème année primaire',
  '3ème année primaire',
  '4ème année primaire',
  '5ème année primaire',
  '6ème année primaire',
  // Collège
  '7ème année (1ère année collège)',
  '8ème année (2ème année collège)',
  '9ème année (3ème année collège)',
  // Lycée - Tronc commun
  '1ère année secondaire',
  // Lycée - 2ème année
  '2ème année - Sciences',
  '2ème année - Lettres',
  '2ème année - Economie et Services',
  '2ème année - Technologies de l\'informatique',
  '2ème année - Sciences techniques',
  // Lycée - 3ème année
  '3ème année - Sciences expérimentales',
  '3ème année - Mathématiques',
  '3ème année - Lettres',
  '3ème année - Economie et Gestion',
  '3ème année - Sciences techniques',
  '3ème année - Sciences informatiques',
  // Lycée - Bac
  '4ème année - Sciences expérimentales',
  '4ème année - Mathématiques',
  '4ème année - Lettres',
  '4ème année - Economie et Gestion',
  '4ème année - Sciences techniques',
  '4ème année - Sciences informatiques'
];

// Modernized CATEGORY_ICONS with consistent styling
const CATEGORY_ICONS = {
  "Sciences": (
    <Box sx={{ display: 'flex', alignItems: 'center', transition: 'transform 0.2s ease' }}>
      <ScienceIcon sx={{ color: "#4caf50", fontSize: 28, '&:hover': { transform: 'scale(1.2)' } }} aria-label="Icône Sciences" />
    </Box>
  ),
  "Mathématiques": (
    <Box sx={{ display: 'flex', alignItems: 'center', transition: 'transform 0.2s ease' }}>
      <MathIcon sx={{ color: "#2196f3", fontSize: 28, '&:hover': { transform: 'scale(1.2)' } }} aria-label="Icône Mathématiques" />
    </Box>
  ),
  "Technologie": (
    <Box sx={{ display: 'flex', alignItems: 'center', transition: 'transform 0.2s ease' }}>
      <TechIcon sx={{ color: "#ff9800", fontSize: 28, '&:hover': { transform: 'scale(1.2)' } }} aria-label="Icône Technologie" />
    </Box>
  ),
  "Informatique": (
    <Box sx={{ display: 'flex', alignItems: 'center', transition: 'transform 0.2s ease' }}>
      <ComputerIcon sx={{ color: "#9c27b0", fontSize: 28, '&:hover': { transform: 'scale(1.2)' } }} aria-label="Icône Informatique" />
    </Box>
  ),
  "Langue Arabe": (
    <Box sx={{ display: 'flex', alignItems: 'center', transition: 'transform 0.2s ease' }}>
      <LanguageIcon sx={{ color: "#f44336", fontSize: 28, '&:hover': { transform: 'scale(1.2)' } }} aria-label="Icône Langue Arabe" />
    </Box>
  ),
  "Langue Française": (
    <Box sx={{ display: 'flex', alignItems: 'center', transition: 'transform 0.2s ease' }}>
      <LanguageIcon sx={{ color: "#3f51b5", fontSize: 28, '&:hover': { transform: 'scale(1.2)' } }} aria-label="Icône Langue Française" />
    </Box>
  ),
  "Langue Anglaise": (
    <Box sx={{ display: 'flex', alignItems: 'center', transition: 'transform 0.2s ease' }}>
      <LanguageIcon sx={{ color: "#e91e63", fontSize: 28, '&:hover': { transform: 'scale(1.2)' } }} aria-label="Icône Langue Anglaise" />
    </Box>
  ),
  "Philosophie": (
    <Box sx={{ display: 'flex', alignItems: 'center', transition: 'transform 0.2s ease' }}>
      <PhilosophyIcon sx={{ color: "#795548", fontSize: 28, '&:hover': { transform: 'scale(1.2)' } }} aria-label="Icône Philosophie" />
    </Box>
  ),
  "Éducation Islamique": (
    <Box sx={{ display: 'flex', alignItems: 'center', transition: 'transform 0.2s ease' }}>
      <IslamicIcon sx={{ color: "#009688", fontSize: 28, '&:hover': { transform: 'scale(1.2)' } }} aria-label="Icône Éducation Islamique" />
    </Box>
  ),
  "Éducation Civique": (
    <Box sx={{ display: 'flex', alignItems: 'center', transition: 'transform 0.2s ease' }}>
      <CivicIcon sx={{ color: "#607d8b", fontSize: 28, '&:hover': { transform: 'scale(1.2)' } }} aria-label="Icône Éducation Civique" />
    </Box>
  ),
  "Éducation Artistique": (
    <Box sx={{ display: 'flex', alignItems: 'center', transition: 'transform 0.2s ease' }}>
      <ArtIcon sx={{ color: "#ffeb3b", fontSize: 28, '&:hover': { transform: 'scale(1.2)' } }} aria-label="Icône Éducation Artistique" />
    </Box>
  ),
  "Éducation Physique": (
    <Box sx={{ display: 'flex', alignItems: 'center', transition: 'transform 0.2s ease' }}>
      <SportsIcon sx={{ color: "#8bc34a", fontSize: 28, '&:hover': { transform: 'scale(1.2)' } }} aria-label="Icône Éducation Physique" />
    </Box>
  ),
  "Économie et Gestion": (
    <Box sx={{ display: 'flex', alignItems: 'center', transition: 'transform 0.2s ease' }}>
      <EconIcon sx={{ color: "#673ab7", fontSize: 28, '&:hover': { transform: 'scale(1.2)' } }} aria-label="Icône Économie et Gestion" />
    </Box>
  ),
  "Histoire-Géographie": (
    <Box sx={{ display: 'flex', alignItems: 'center', transition: 'transform 0.2s ease' }}>
      <HistoryIcon sx={{ color: "#ff5722", fontSize: 28, '&:hover': { transform: 'scale(1.2)' } }} aria-label="Icône Histoire-Géographie" />
    </Box>
  ),
  "Physique": (
    <Box sx={{ display: 'flex', alignItems: 'center', transition: 'transform 0.2s ease' }}>
      <ScienceIcon sx={{ color: "#03a9f4", fontSize: 28, '&:hover': { transform: 'scale(1.2)' } }} aria-label="Icône Physique" />
    </Box>
  ),
  "Chimie": (
    <Box sx={{ display: 'flex', alignItems: 'center', transition: 'transform 0.2s ease' }}>
      <ScienceIcon sx={{ color: "#00bcd4", fontSize: 28, '&:hover': { transform: 'scale(1.2)' } }} aria-label="Icône Chimie" />
    </Box>
  ),
  "SVT": (
    <Box sx={{ display: 'flex', alignItems: 'center', transition: 'transform 0.2s ease' }}>
      <ScienceIcon sx={{ color: "#cddc39", fontSize: 28, '&:hover': { transform: 'scale(1.2)' } }} aria-label="Icône SVT" />
    </Box>
  ),
  "Autre": (
    <Box sx={{ display: 'flex', alignItems: 'center', transition: 'transform 0.2s ease' }}>
      <OtherIcon sx={{ color: "#757575", fontSize: 28, '&:hover': { transform: 'scale(1.2)' } }} aria-label="Icône Autre" />
    </Box>
  )
};

const CATEGORY_COLORS = {
  "Sciences": '#4caf50', "Mathématiques": '#2196f3', "Technologie": '#ff9800', "Informatique": '#9c27b0',
  "Langue Arabe": '#f44336', "Langue Française": '#3f51b5', "Langue Anglaise": '#e91e63', "Philosophie": '#795548',
  "Éducation Islamique": '#009688', "Éducation Civique": '#607d8b', "Éducation Artistique": '#ffeb3b',
  "Éducation Physique": '#8bc34a', "Économie et Gestion": '#673ab7', "Histoire-Géographie": '#ff5722',
  "Physique": '#03a9f4', "Chimie": '#00bcd4', "SVT": '#cddc39', "Autre": '#757575'
};

// Styled Components for consistent design
const StyledBox = styled(Box)(({ theme }) => ({
  background: "linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(240, 240, 245, 0.85))",
  backdropFilter: "blur(8px)",
  borderRadius: theme.spacing(2),
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  padding: theme.spacing(3),
  border: "1px solid rgba(255, 255, 255, 0.2)",
  transition: theme.transitions.create(["transform", "box-shadow"], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.standard
  }),
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 48px rgba(0, 0, 0, 0.15)"
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1.5)
  }
}));

const StyledCard = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  borderRadius: theme.spacing(2),
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
  transition: theme.transitions.create(["box-shadow", "transform"], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.short
  }),
  "&:hover": {
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
    transform: "scale(1.03)",
    backgroundColor: "rgba(163, 124, 255, 0.07)"
  },
  [theme.breakpoints.down("sm")]: {
    borderRadius: theme.spacing(1.5)
  }
}));

const GererMatiere = ({ sidenavOpen }) => {
  const [matieres, setMatieres] = useState([]);
  const [form, setForm] = useState({ nom: '', description: '', categorie: '', classe: [] });
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
        // Ensure classe is always an array, default to empty array if undefined
        const sanitizedMatieres = (response.data.matieres || []).map(matiere => ({
          ...matiere,
          classe: Array.isArray(matiere.classe) ? matiere.classe : []
        }));
        setMatieres(sanitizedMatieres);
      } catch (error) {
        console.error('Error fetching matières:', error);
        setSnackbar({ open: true, message: error.message || 'Erreur lors du chargement des matières', severity: 'error' });
      }
    };
    fetchMatieres();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle classe selection (multi-select)
  const handleClasseChange = (e) => {
    const value = e.target.value;
    setForm(prev => ({ ...prev, classe: typeof value === 'string' ? value.split(',') : value }));
  };

  // Submit new matière or edit existing
  const handleSubmit = async (e, isEdit = false) => {
    e.preventDefault();
    if (!form.categorie) {
      setSnackbar({ open: true, message: 'Veuillez sélectionner une catégorie', severity: 'warning' });
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

      setForm({ nom: '', description: '', categorie: '', classe: [] });
      setSelectedMatiere(null);
    } catch (error) {
      console.error('Error saving matière:', error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'Erreur lors de l\'opération', severity: 'error' });
    }
  };

  // Open edit dialog for matière
  const handleEditMatiere = (matiere) => {
    setSelectedMatiere(matiere);
    setForm({
      nom: matiere.nom,
      description: matiere.description || '',
      categorie: matiere.categorie,
      classe: matiere.classe || []
    });
    setEditMatiereDialog(true);
  };

  // Open delete confirmation for matière
  const handleDeleteMatiere = (matiere) => {
    setDeleteMatiereDialog({ open: true, matiere });
  };

  // Confirm matière deletion
  const handleConfirmDeleteMatiere = async () => {
    const matiere = deleteMatiereDialog.matiere;
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      await axios.delete(`${API_URL}/api/matieres/${matiere._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMatieres(matieres.filter(m => m._id !== matiere._id));
      setSnackbar({ open: true, message: 'Matière supprimée avec succès', severity: 'success' });
    } catch (error) {
      console.error('Error deleting matière:', error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'Erreur lors de la suppression', severity: 'error' });
    } finally {
      setDeleteMatiereDialog({ open: false, matiere: null });
    }
  };

  // Open chapitres dialog and fetch chapitres
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

  // Submit chapitre (add or edit)
  const handleChapitreSubmit = async (e) => {
    e.preventDefault();
    if (!chapForm.titre) {
      setSnackbar({ open: true, message: 'Veuillez entrer un titre pour le chapitre', severity: 'warning' });
      return;
    }
    setChapSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      if (editChapitre) {
        const response = await axios.put(`${API_URL}/api/matieres/chapitres/${editChapitre._id}`, chapForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setChapitres(chapitres.map((c) => (c._id === editChapitre._id ? response.data : c)));
        setSnackbar({ open: true, message: 'Chapitre modifié avec succès', severity: 'success' });
      } else {
        const response = await axios.post(`${API_URL}/api/matieres/${selectedMatiere._id}/chapitres`, chapForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setChapitres([...chapitres, response.data]);
        setSnackbar({ open: true, message: 'Chapitre ajouté avec succès', severity: 'success' });
      }
      setChapForm({ titre: '', contenu: '', youtubeUrl: '', driveUrl: '' });
      setEditChapitre(null);
    } catch (error) {
      console.error('Error saving chapitre:', error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'Erreur lors de la sauvegarde du chapitre', severity: 'error' });
    } finally {
      setChapSubmitting(false);
    }
  };

  // Edit chapitre
  const handleEditChapitre = (chap) => {
    setEditChapitre(chap);
    setChapForm({
      titre: chap.titre,
      contenu: chap.contenu,
      youtubeUrl: chap.youtubeUrl || '',
      driveUrl: chap.driveUrl || ''
    });
  };

  // Open delete confirmation dialog for chapitre
  const handleOpenDeleteDialog = (chap) => {
    setDeleteDialog({ open: true, chapitre: chap });
  };

  // Confirm chapitre deletion
  const handleDeleteChapitre = async () => {
    const chap = deleteDialog.chapitre;
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      await axios.delete(`${API_URL}/api/matieres/chapitres/${chap._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChapitres(chapitres.filter((c) => c._id !== chap._id));
      setSnackbar({ open: true, message: 'Chapitre supprimé avec succès', severity: 'success' });
    } catch (error) {
      console.error('Error deleting chapitre:', error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'Erreur lors de la suppression du chapitre', severity: 'error' });
    } finally {
      setDeleteDialog({ open: false, chapitre: null });
    }
  };

  // Memoize filtered matières for performance
  const filteredMatieres = useMemo(() => {
    return matieres.filter(
      (m) =>
        m.nom.toLowerCase().includes(search.toLowerCase()) ||
        (m.categorie && m.categorie.toLowerCase().includes(search.toLowerCase())) ||
        (m.classe && m.classe.some(cls => cls.toLowerCase().includes(search.toLowerCase())))
    );
  }, [matieres, search]);

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        maxWidth: 1200,
        mx: "auto",
        width: "100%",
        ml: sidenavOpen ? "240px" : "60px",
        transition: "margin-left 0.3s ease"
      }}
    >
      {/* Header and Controls */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          flexDirection: { xs: "column", sm: "row" },
          gap: 2
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: "#1976d2",
            fontWeight: 700,
            fontSize: { xs: "1.75rem", md: "2.125rem" }
          }}
        >
          Gestion des Matières
        </Typography>
        <Box sx={{ display: "flex", gap: 2, width: { xs: "100%", sm: "auto" } }}>
          <TextField
            placeholder="Rechercher une matière..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: "action.active", mr: 1 }} />,
              sx: {
                backgroundColor: "white",
                borderRadius: 2,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                "& .MuiInputBase-input": {
                  padding: "8px 12px"
                }
              }
            }}
            sx={{ flexGrow: { xs: 1, sm: 0 }, width: { xs: "100%", sm: "auto" } }}
            inputProps={{ "aria-label": "Rechercher une matière par nom, catégorie ou classe" }}
          />
        </Box>
      </Box>

      {/* Add Matiere Section */}
      <StyledBox sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main", mb: 2 }}>
          Ajouter une Matière
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom"
                name="nom"
                value={form.nom}
                onChange={handleChange}
                required
                inputProps={{ 'aria-label': 'Nom de la matière' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="categorie-label">Catégorie</InputLabel>
                <Select
                  labelId="categorie-label"
                  name="categorie"
                  value={form.categorie}
                  label="Catégorie"
                  onChange={handleChange}
                  startAdornment={
                    form.categorie && CATEGORY_ICONS[form.categorie] ? (
                      <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                        {CATEGORY_ICONS[form.categorie]}
                      </Box>
                    ) : null
                  }
                >
                  {CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {CATEGORY_ICONS[cat]}
                        <span style={{ marginLeft: 8 }}>{cat}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="classe-label">Classe(s)</InputLabel>
                <Select
                  labelId="classe-label"
                  name="classe"
                  multiple
                  value={form.classe}
                  onChange={handleClasseChange}
                  label="Classe(s)"
                  renderValue={(selected) => selected.join(', ')}
                >
                  {tunisianLevels.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                name="description"
                value={form.description}
                onChange={handleChange}
                inputProps={{ 'aria-label': 'Description de la matière' }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                type="submit"
                startIcon={<AddIcon />}
                sx={{
                  backgroundColor: "#1976d2",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": {
                    backgroundColor: "#1565c0",
                    transform: "scale(1.02)",
                    transition: "all 0.2s ease"
                  }
                }}
                aria-label="Ajouter une matière"
              >
                Ajouter
              </Button>
            </Grid>
          </Grid>
        </Box>
      </StyledBox>

      {/* List of Matieres */}
      <StyledBox>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main", mr: 1 }}>
            Liste des Matières
          </Typography>
          <Box
            component="span"
            role="img"
            aria-label="Icône matière"
            sx={{ fontSize: "1.5rem", color: "primary.main" }}
          >
            📖
          </Box>
        </Box>
        <Grid container spacing={3}>
          {filteredMatieres.length === 0 ? (
            <Box sx={{ width: '100%', textAlign: 'center', py: 4, color: 'text.secondary' }}>
              <Typography fontStyle="italic">Aucune matière trouvée.</Typography>
            </Box>
          ) : (
            filteredMatieres.map((m) => (
              <Grid item xs={12} sm={6} md={4} key={m._id}>
                <StyledCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" fontWeight={700}>
                        {m.nom}
                      </Typography>
                      <Box>
                        <Tooltip title="Modifier">
                          <IconButton
                            onClick={(e) => { e.stopPropagation(); handleEditMatiere(m); }}
                            sx={{
                              color: "primary.main",
                              "&:hover": {
                                color: "primary.dark",
                                transform: "scale(1.1)",
                                transition: "all 0.2s ease"
                              }
                            }}
                            aria-label={`Modifier la matière ${m.nom}`}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton
                            onClick={(e) => { e.stopPropagation(); handleDeleteMatiere(m); }}
                            sx={{
                              color: "error.main",
                              "&:hover": {
                                color: "error.dark",
                                transform: "scale(1.1)",
                                transition: "all 0.2s ease"
                              }
                            }}
                            aria-label={`Supprimer la matière ${m.nom}`}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    <Tooltip title={m.categorie}>
                      <Chip
                        icon={CATEGORY_ICONS[m.categorie]}
                        label={m.categorie}
                        sx={{
                          bgcolor: CATEGORY_COLORS[m.categorie] || '#757575',
                          color: 'white',
                          fontWeight: 700,
                          mb: 1
                        }}
                        aria-label={`Catégorie: ${m.categorie}`}
                      />
                    </Tooltip>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {m.description || 'Aucune description disponible.'}
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      Classes: {(m.classe || []).join(', ') || 'Aucune classe associée'}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleOpenChapitres(m)}
                      sx={{ mt: 2, borderRadius: 2 }}
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

      {/* Edit Matiere Dialog */}
      <Dialog
        open={editMatiereDialog}
        onClose={() => setEditMatiereDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            padding: '16px'
          }
        }}
      >
        <DialogTitle sx={{ fontSize: '1.5rem', fontWeight: 600, color: '#1976d2' }}>
          Modifier la Matière
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="nom"
            label="Nom"
            type="text"
            fullWidth
            variant="outlined"
            value={form.nom}
            onChange={handleChange}
            sx={{ mb: 2, mt: 2 }}
            required
            inputProps={{ "aria-label": "Nom de la matière" }}
          />
          <FormControl fullWidth required sx={{ mb: 2 }}>
            <InputLabel id="edit-categorie-label">Catégorie</InputLabel>
            <Select
              labelId="edit-categorie-label"
              name="categorie"
              value={form.categorie}
              label="Catégorie"
              onChange={handleChange}
              startAdornment={
                form.categorie && CATEGORY_ICONS[form.categorie] ? (
                  <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                    {CATEGORY_ICONS[form.categorie]}
                  </Box>
                ) : null
              }
            >
              {CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {CATEGORY_ICONS[cat]}
                    <span style={{ marginLeft: 8 }}>{cat}</span>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth required sx={{ mb: 2 }}>
            <InputLabel id="edit-classe-label">Classe(s)</InputLabel>
            <Select
              labelId="edit-classe-label"
              name="classe"
              multiple
              value={form.classe}
              onChange={handleClasseChange}
              label="Classe(s)"
              renderValue={(selected) => selected.join(', ')}
            >
              {tunisianLevels.map((level) => (
                <MenuItem key={level} value={level}>
                  {level}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={form.description}
            onChange={handleChange}
            sx={{ mb: 2 }}
            inputProps={{ "aria-label": "Description de la matière" }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setEditMatiereDialog(false)}
            sx={{
              color: '#6b7280',
              '&:hover': { backgroundColor: '#f1f5f9' }
            }}
            aria-label="Annuler la modification"
          >
            Annuler
          </Button>
          <Button
            onClick={(e) => handleSubmit(e, true)}
            variant="contained"
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0'
              }
            }}
            aria-label="Modifier la matière"
          >
            Modifier
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Matiere Confirmation Dialog */}
      <Dialog
        open={deleteMatiereDialog.open}
        onClose={() => setDeleteMatiereDialog({ open: false, matiere: null })}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            padding: '16px'
          }
        }}
      >
        <DialogTitle sx={{ color: '#1976d2', fontWeight: 600 }}>
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#334155' }}>
            Êtes-vous sûr de vouloir supprimer la matière "{deleteMatiereDialog.matiere?.nom}" ?
            Cette action est irréversible et supprimera également tous les chapitres associés.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteMatiereDialog({ open: false, matiere: null })}
            sx={{
              color: '#6b7280',
              '&:hover': { backgroundColor: '#f1f5f9' }
            }}
            aria-label="Annuler la suppression"
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirmDeleteMatiere}
            variant="contained"
            sx={{
              backgroundColor: '#ef4444',
              '&:hover': {
                backgroundColor: '#dc2626'
              }
            }}
            aria-label="Confirmer la suppression"
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for Chapitres */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>
          {selectedMatiere?.nom}
          <IconButton
            onClick={() => setModalOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
            aria-label="Fermer la fenêtre des chapitres"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" fontWeight={700} color="primary.main" mb={2}>
              Gestion des Chapitres
            </Typography>
            <Box component="form" onSubmit={handleChapitreSubmit} sx={{ mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Titre du chapitre"
                    name="titre"
                    value={chapForm.titre}
                    onChange={(e) => setChapForm({ ...chapForm, titre: e.target.value })}
                    required
                    inputProps={{ 'aria-label': 'Titre du chapitre' }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Contenu"
                    name="contenu"
                    value={chapForm.contenu}
                    onChange={(e) => setChapForm({ ...chapForm, contenu: e.target.value })}
                    inputProps={{ 'aria-label': 'Contenu du chapitre' }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Lien YouTube"
                    name="youtubeUrl"
                    value={chapForm.youtubeUrl}
                    onChange={(e) => setChapForm({ ...chapForm, youtubeUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    inputProps={{ 'aria-label': 'Lien YouTube du chapitre' }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Lien Google Drive"
                    name="driveUrl"
                    value={chapForm.driveUrl}
                    onChange={(e) => setChapForm({ ...chapForm, driveUrl: e.target.value })}
                    placeholder="https://drive.google.com/..."
                    inputProps={{ 'aria-label': 'Lien Google Drive du chapitre' }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={chapSubmitting}
                    startIcon={editChapitre ? <EditIcon /> : <AddIcon />}
                    sx={{
                      backgroundColor: "#1976d2",
                      "&:hover": {
                        backgroundColor: "#1565c0",
                        transform: "scale(1.02)",
                        transition: "all 0.2s ease"
                      }
                    }}
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
                      aria-label="Annuler la modification du chapitre"
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
                  chapitres.map((chap) => (
                    <React.Fragment key={chap._id}>
                      <ListItem
                        secondaryAction={
                          <Box>
                            <Tooltip title="Modifier">
                              <IconButton
                                edge="end"
                                onClick={() => handleEditChapitre(chap)}
                                sx={{
                                  color: "primary.main",
                                  "&:hover": {
                                    color: "primary.dark",
                                    transform: "scale(1.1)",
                                    transition: "all 0.2s ease"
                                  }
                                }}
                                aria-label={`Modifier le chapitre ${chap.titre}`}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                              <IconButton
                                edge="end"
                                onClick={() => handleOpenDeleteDialog(chap)}
                                disabled={deleteDialog.chapitre?._id === chap._id}
                                sx={{
                                  color: "error.main",
                                  "&:hover": {
                                    color: "error.dark",
                                    transform: "scale(1.1)",
                                    transition: "all 0.2s ease"
                                  }
                                }}
                                aria-label={`Supprimer le chapitre ${chap.titre}`}
                              >
                                {deleteDialog.chapitre?._id === chap._id ? (
                                  <CircularProgress size={24} />
                                ) : (
                                  <DeleteIcon fontSize="small" />
                                )}
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
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, chapitre: null })}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            padding: '16px'
          }
        }}
      >
        <DialogTitle sx={{ color: '#1976d2', fontWeight: 600 }}>
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#334155' }}>
            Voulez-vous vraiment supprimer le chapitre "{deleteDialog.chapitre?.titre}" ?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteDialog({ open: false, chapitre: null })}
            sx={{
              color: '#6b7280',
              '&:hover': { backgroundColor: '#f1f5f9' }
            }}
            aria-label="Annuler la suppression"
          >
            Annuler
          </Button>
          <Button
            onClick={handleDeleteChapitre}
            variant="contained"
            sx={{
              backgroundColor: '#ef4444',
              '&:hover': {
                backgroundColor: '#dc2626'
              }
            }}
            aria-label="Confirmer la suppression"
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
          sx={{
            width: '100%',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GererMatiere;