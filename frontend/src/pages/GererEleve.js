import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Dialog, DialogActions,
  DialogContent, DialogTitle, TextField, IconButton, Snackbar,
  Alert, MenuItem, CircularProgress, Tooltip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import {
  Search as SearchIcon, Add as AddIcon, Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

// Constants matching backend
const tunisianCities = [
  'Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte',
  'Gabès', 'Ariana', 'Gafsa', 'Monastir', 'Ben Arous',
  'Kasserine', 'Médenine', 'Nabeul', 'Tataouine', 'Béja',
  'Kef', 'Mahdia', 'Sidi Bouzid', 'Jendouba', 'Tozeur',
  'Manouba', 'Siliana', 'Zaghouan', 'Kebili'
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

// Reusable StyledBox component for consistent design
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

// Styled TableRow for hover effects
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:hover": {
    backgroundColor: "rgba(163, 124, 255, 0.05)",
    transform: "scale(1.01)",
    transition: theme.transitions.create(["background-color", "transform"], {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.short
    })
  },
  "&:not(:last-child)": {
    borderBottom: `1px solid ${theme.palette.divider}`
  }
}));

// Styled TableCell for consistent typography
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1.5),
  fontWeight: 500,
  color: theme.palette.text.primary,
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1),
    fontSize: "0.85rem"
  }
}));

function GererEleve({ sidenavOpen }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [eleves, setEleves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedEleve, setSelectedEleve] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    dateNaissance: null,
    classe: '',
    email: '',
    password: '',
    ville: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Fetch all students
  const fetchEleves = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Vous n\'êtes pas authentifié. Veuillez vous connecter.');
      }

      const response = await axios.get(`${API_URL}/api/eleves`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data && response.data.success) {
        setEleves(response.data.eleves || []);
      } else {
        throw new Error('Format de réponse invalide');
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des élèves');
      setEleves([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEleves();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle date change
  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, dateNaissance: date }));
  };

  // Open dialog for adding new student
  const handleAddEleve = () => {
    setSelectedEleve(null);
    setFormData({
      nom: '',
      prenom: '',
      dateNaissance: null,
      classe: '',
      email: '',
      password: '',
      ville: ''
    });
    setOpenDialog(true);
  };

  // Open dialog for editing student
  const handleEditEleve = (eleve) => {
    setSelectedEleve(eleve);
    setFormData({
      nom: eleve.nom,
      prenom: eleve.prenom,
      dateNaissance: new Date(eleve.dateNaissance),
      classe: eleve.classe,
      email: eleve.email,
      ville: eleve.ville || '',
      password: ''
    });
    setOpenDialog(true);
  };

  // Open dialog for deleting student
  const handleDeleteClick = (eleve) => {
    setSelectedEleve(eleve);
    setOpenDeleteDialog(true);
  };

  // Submit form for adding/editing student
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.nom || !formData.prenom || !formData.email || !formData.ville || 
          !formData.classe || !formData.dateNaissance) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Session expirée, veuillez vous reconnecter');
      }
      const headers = { 'Authorization': `Bearer ${token}` };

      if (selectedEleve) {
        // Update existing student
        await axios.put(`${API_URL}/api/eleves/${selectedEleve._id}`, {
          nom: formData.nom,
          prenom: formData.prenom,
          dateNaissance: formData.dateNaissance,
          classe: formData.classe,
          email: formData.email,
          ville: formData.ville
        }, { headers });

        setSnackbar({
          open: true,
          message: 'Élève modifié avec succès',
          severity: 'success'
        });
      } else {
        // Create new student with user
        const response = await axios.post(
          `${API_URL}/api/eleves/create-with-user`,
          {
            nom: formData.nom,
            prenom: formData.prenom,
            dateNaissance: formData.dateNaissance,
            classe: formData.classe,
            email: formData.email,
            password: formData.password,
            ville: formData.ville
          },
          { headers }
        );

        if (!response.data.success) {
          throw new Error(response.data.message || 'Erreur lors de la création');
        }

        setSnackbar({
          open: true,
          message: 'Élève ajouté avec succès',
          severity: 'success'
        });
      }

      setOpenDialog(false);
      fetchEleves();
    } catch (error) {
      console.error('Error submitting form:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || error.message || 'Erreur lors de l\'opération',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete student
  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Session expirée, veuillez vous reconnecter');
      }

      const response = await axios.delete(`${API_URL}/api/eleves/${selectedEleve._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Élève supprimé avec succès',
          severity: 'success'
        });
        setOpenDeleteDialog(false);
        await fetchEleves();
      } else {
        throw new Error(response.data.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Erreur lors de la suppression',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Search handler
  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  // Filtered students
  const filteredEleves = eleves.filter(eleve =>
    eleve.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    eleve.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    eleve.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    eleve.classe.toLowerCase().includes(searchQuery.toLowerCase()) ||
    eleve.ville.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          Gestion des Élèves
        </Typography>
        <Box sx={{ display: "flex", gap: 2, width: { xs: "100%", sm: "auto" } }}>
          <TextField
            placeholder="Rechercher un élève..."
            value={searchQuery}
            onChange={handleSearch}
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
            inputProps={{ "aria-label": "Rechercher un élève par nom, prénom, email, classe ou ville" }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddEleve}
            sx={{
              backgroundColor: "#1976d2",
              textTransform: "none",
              fontWeight: 600,
              padding: "8px 16px",
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "#1565c0",
                transform: "scale(1.02)",
                transition: "all 0.2s ease"
              }
            }}
            aria-label="Ajouter un nouvel élève"
          >
            Nouvel Élève
          </Button>
        </Box>
      </Box>

      {/* Student List in StyledBox */}
      <StyledBox>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main", mr: 1 }}>
            Liste des Élèves
          </Typography>
          <Box
            component="span"
            role="img"
            aria-label="Icône élève"
            sx={{ fontSize: "1.5rem", color: "primary.main" }}
          >
            📚
          </Box>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress sx={{ color: '#1976d2' }} aria-label="Chargement des élèves" />
          </Box>
        ) : error ? (
          <Alert
            severity="error"
            sx={{
              borderRadius: '12px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
            }}
          >
            {error}
          </Alert>
        ) : (
          <TableContainer>
            <Table aria-label="Liste des élèves">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Nom</StyledTableCell>
                  <StyledTableCell>Prénom</StyledTableCell>
                  <StyledTableCell>Date de naissance</StyledTableCell>
                  <StyledTableCell>Classe</StyledTableCell>
                  <StyledTableCell>Email</StyledTableCell>
                  <StyledTableCell>Ville</StyledTableCell>
                  <StyledTableCell align="right">Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEleves.length === 0 ? (
                  <TableRow>
                    <StyledTableCell colSpan={7} align="center">
                      <Typography color="text.secondary" fontStyle="italic">
                        Aucun élève trouvé.
                      </Typography>
                    </StyledTableCell>
                  </TableRow>
                ) : (
                  filteredEleves.map((eleve) => (
                    <StyledTableRow key={eleve._id}>
                      <StyledTableCell>{eleve.nom}</StyledTableCell>
                      <StyledTableCell>{eleve.prenom}</StyledTableCell>
                      <StyledTableCell>{new Date(eleve.dateNaissance).toLocaleDateString('fr-FR')}</StyledTableCell>
                      <StyledTableCell>{eleve.classe}</StyledTableCell>
                      <StyledTableCell>{eleve.email}</StyledTableCell>
                      <StyledTableCell>{eleve.ville}</StyledTableCell>
                      <StyledTableCell align="right">
                        <Tooltip title="Modifier">
                          <IconButton
                            onClick={() => handleEditEleve(eleve)}
                            sx={{
                              color: "primary.main",
                              "&:hover": {
                                color: "primary.dark",
                                transform: "scale(1.1)",
                                transition: "all 0.2s ease"
                              }
                            }}
                            aria-label={`Modifier l'élève ${eleve.nom} ${eleve.prenom}`}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton
                            onClick={() => handleDeleteClick(eleve)}
                            sx={{
                              color: "error.main",
                              "&:hover": {
                                color: "error.dark",
                                transform: "scale(1.1)",
                                transition: "all 0.2s ease"
                              }
                            }}
                            aria-label={`Supprimer l'élève ${eleve.nom} ${eleve.prenom}`}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </StyledTableCell>
                    </StyledTableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </StyledBox>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
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
          {selectedEleve ? 'Modifier un élève' : 'Ajouter un nouvel élève'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="nom"
            label="Nom"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.nom}
            onChange={handleChange}
            sx={{ mb: 2, mt: 2 }}
            required
            inputProps={{ "aria-label": "Nom de l'élève" }}
          />
          <TextField
            margin="dense"
            name="prenom"
            label="Prénom"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.prenom}
            onChange={handleChange}
            sx={{ mb: 2 }}
            required
            inputProps={{ "aria-label": "Prénom de l'élève" }}
          />
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            <DatePicker
              label="Date de naissance"
              value={formData.dateNaissance}
              onChange={handleDateChange}
              renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} required />}
              sx={{ width: '100%', mb: 2 }}
            />
          </LocalizationProvider>
          <TextField
            select
            margin="dense"
            name="classe"
            label="Classe"
            fullWidth
            variant="outlined"
            value={formData.classe}
            onChange={handleChange}
            sx={{ mb: 2 }}
            required
            inputProps={{ "aria-label": "Classe de l'élève" }}
          >
            <MenuItem value="">
              <em>Sélectionner une classe</em>
            </MenuItem>
            {tunisianLevels.map((level) => (
              <MenuItem key={level} value={level}>
                {level}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={handleChange}
            sx={{ mb: 2 }}
            required
            disabled={!!selectedEleve} // Disable email field when editing
            inputProps={{ "aria-label": "Email de l'élève" }}
          />
          {!selectedEleve && (
            <TextField
              margin="dense"
              name="password"
              label="Mot de passe"
              type="password"
              fullWidth
              variant="outlined"
              value={formData.password}
              onChange={handleChange}
              sx={{ mb: 2 }}
              required
              inputProps={{ "aria-label": "Mot de passe de l'élève" }}
            />
          )}
          <TextField
            select
            margin="dense"
            name="ville"
            label="Ville"
            fullWidth
            variant="outlined"
            value={formData.ville}
            onChange={handleChange}
            sx={{ mb: 2 }}
            required
            inputProps={{ "aria-label": "Ville de l'élève" }}
          >
            <MenuItem value="">
              <em>Sélectionner une ville</em>
            </MenuItem>
            {tunisianCities.map((city) => (
              <MenuItem key={city} value={city}>
                {city}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenDialog(false)}
            sx={{
              color: '#6b7280',
              '&:hover': { backgroundColor: '#f1f5f9' }
            }}
            aria-label="Annuler l'ajout ou la modification"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0'
              }
            }}
            aria-label={selectedEleve ? "Modifier l'élève" : "Ajouter l'élève"}
          >
            {selectedEleve ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
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
            Êtes-vous sûr de vouloir supprimer l'élève {selectedEleve?.prenom} {selectedEleve?.nom} ?
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            sx={{
              color: '#6b7280',
              '&:hover': { backgroundColor: '#f1f5f9' }
            }}
            aria-label="Annuler la suppression"
          >
            Annuler
          </Button>
          <Button
            onClick={handleDeleteConfirm}
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

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
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
}

export default GererEleve;