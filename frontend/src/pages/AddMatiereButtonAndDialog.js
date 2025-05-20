import React, { useState, useCallback, useReducer } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box, TextField, Button, Grid, FormControl, InputLabel, Select, MenuItem, Dialog,
  DialogTitle, DialogContent, DialogActions, Fab
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

// Constants
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

// Styled Components
const StyledFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  backgroundColor: "#1976d2",
  "&:hover": {
    backgroundColor: "#1565c0",
    transform: "scale(1.1)",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.2)"
  },
  transition: "all 0.3s ease",
  zIndex: 1000
}));

// Reducer for Form State
const formReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return { nom: '', description: '', categories: [], classe: [] };
    default:
      return state;
  }
};

// Component
const AddMatiereButtonAndDialog = ({ onSubmit }) => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [form, dispatchForm] = useReducer(formReducer, { nom: '', description: '', categories: [], classe: [] });

  // Handle form input changes
  const handleFormChange = useCallback((field) => (e) => {
    dispatchForm({ type: 'UPDATE_FIELD', field, value: e.target.value });
  }, []);

  const handleClasseChange = useCallback((e) => {
    const value = e.target.value;
    dispatchForm({ type: 'UPDATE_FIELD', field: 'classe', value: typeof value === 'string' ? value.split(',') : value });
  }, []);

  const handleCategoriesChange = useCallback((e) => {
    const value = e.target.value;
    dispatchForm({ type: 'UPDATE_FIELD', field: 'categories', value: typeof value === 'string' ? value.split(',') : value });
  }, []);

  // Handle form submission
  const handleFormSubmit = useCallback(() => {
    if (!form.nom) {
      alert('Le nom est requis');
      return;
    }
    if (!form.categories.length) {
      alert('Veuillez sélectionner au moins une catégorie');
      return;
    }
    if (!form.classe.length) {
      alert('Veuillez sélectionner au moins une classe');
      return;
    }
    onSubmit(form);
    setAddDialogOpen(false);
    dispatchForm({ type: 'RESET' });
  }, [form, onSubmit]);

  return (
    <>
      {/* Floating Action Button */}
      <StyledFab
        color="primary"
        aria-label="Ajouter une nouvelle matière"
        onClick={() => setAddDialogOpen(true)}
      >
        <AddIcon />
      </StyledFab>

      {/* Add Matiere Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={() => { setAddDialogOpen(false); dispatchForm({ type: 'RESET' }); }}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px', padding: '16px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' } }}
      >
        <DialogTitle sx={{ fontSize: '1.5rem', fontWeight: 600, color: '#1976d2' }}>
          Ajouter une Matière
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Nom"
                type="text"
                fullWidth
                variant="outlined"
                value={form.nom}
                onChange={handleFormChange('nom')}
                required
                inputProps={{ "aria-label": "Nom de la matière" }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="categories-label">Catégorie(s)</InputLabel>
                <Select
                  labelId="categories-label"
                  multiple
                  value={form.categories}
                  onChange={handleCategoriesChange}
                  label="Catégorie(s)"
                  renderValue={(selected) => selected.join(', ')}
                >
                  {CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
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
                margin="dense"
                label="Description"
                type="text"
                fullWidth
                variant="outlined"
                multiline
                rows={3}
                value={form.description}
                onChange={handleFormChange('description')}
                inputProps={{ "aria-label": "Description de la matière" }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => { setAddDialogOpen(false); dispatchForm({ type: 'RESET' }); }}
            sx={{ color: '#6b7280', '&:hover': { backgroundColor: '#f1f5f9' } }}
            aria-label="Annuler l'ajout"
          >
            Annuler
          </Button>
          <Button
            onClick={handleFormSubmit}
            variant="contained"
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': { backgroundColor: '#1565c0', transform: 'scale(1.02)' },
              transition: 'all 0.2s ease'
            }}
            aria-label="Ajouter la matière"
          >
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddMatiereButtonAndDialog;