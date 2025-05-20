import React, { useState } from 'react';
import axios from 'axios';
import {
  Box, Typography, Paper, Stepper, Step, StepLabel, Button,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Grid, Card, CardContent, IconButton, CircularProgress,
  Divider, Alert
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  YouTube as YouTubeIcon,
  PictureAsPdf as PdfIcon,
  Link as LinkIcon,
  Delete as DeleteIcon,
  Save as SaveIcon
} from '@mui/icons-material';

const steps = ['Sélectionner la classe', 'Informations du contenu', 'Téléchargement', 'Finalisation'];

function TeacherContentUpload() {
  const [activeStep, setActiveStep] = useState(0);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    classId: '',
    title: '',
    description: '',
    type: 'pdf',
    chapter: '',
    contentUrl: '',
    file: null
  });

  React.useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const teacherId = localStorage.getItem('userId');
        const { data } = await axios.get(`/api/enseignants/${teacherId}/classes`);
        setClasses(data);
      } catch (err) {
        setError('Impossible de charger les classes. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setFormData({
      classId: '',
      title: '',
      description: '',
      type: 'pdf',
      chapter: '',
      contentUrl: '',
      file: null
    });
    setSuccess(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, file: e.target.files[0] }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'file' && formData[key]) {
          formDataToSend.append('file', formData[key]);
        } else if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      await axios.post('/api/content/upload', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess(true);
      handleNext();
    } catch (err) {
      setError('Une erreur est survenue lors du téléchargement. Veuillez réessayer.');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <FormControl fullWidth sx={{ mt: 2 }}>
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
        );
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
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
            <TextField
              fullWidth
              label="Chapitre"
              name="chapter"
              value={formData.chapter}
              onChange={handleFormChange}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Type de contenu</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleFormChange}
                label="Type de contenu"
              >
                <MenuItem value="pdf">Document PDF</MenuItem>
                <MenuItem value="video">Vidéo</MenuItem>
                <MenuItem value="link">Lien externe</MenuItem>
                <MenuItem value="youtube">YouTube</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            {formData.type === 'pdf' && (
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                fullWidth
                sx={{ height: 100 }}
              >
                Télécharger un PDF
                <input
                  type="file"
                  accept=".pdf"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>
            )}
            {(formData.type === 'video' || formData.type === 'youtube' || formData.type === 'link') && (
              <TextField
                fullWidth
                label={formData.type === 'youtube' ? 'URL YouTube' : formData.type === 'video' ? 'URL Vidéo' : 'URL'}
                name="contentUrl"
                value={formData.contentUrl}
                onChange={handleFormChange}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    formData.type === 'youtube' ? <YouTubeIcon sx={{ mr: 1 }} /> :
                    formData.type === 'link' ? <LinkIcon sx={{ mr: 1 }} /> : null
                  )
                }}
              />
            )}
            {formData.file && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Fichier sélectionné: {formData.file.name}
              </Alert>
            )}
          </Box>
        );
      case 3:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Résumé
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Classe:</Typography>
                <Typography variant="body1">
                  {classes.find(c => c._id === formData.classId)?.nom || ''}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Type:</Typography>
                <Typography variant="body1">
                  {formData.type === 'pdf' ? 'Document PDF' : 
                   formData.type === 'video' ? 'Vidéo' :
                   formData.type === 'youtube' ? 'YouTube' : 'Lien externe'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Titre:</Typography>
                <Typography variant="body1">{formData.title}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Description:</Typography>
                <Typography variant="body1">{formData.description}</Typography>
              </Grid>
              {formData.chapter && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Chapitre:</Typography>
                  <Typography variant="body1">{formData.chapter}</Typography>
                </Grid>
              )}
              {formData.file && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Fichier:</Typography>
                  <Typography variant="body1">{formData.file.name}</Typography>
                </Grid>
              )}
              {formData.contentUrl && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1">URL:</Typography>
                  <Typography variant="body1">{formData.contentUrl}</Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight="bold" mb={4}>
        Téléchargement de contenu
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box mt={4}>
          {activeStep === steps.length ? (
            <Box textAlign="center">
              <Typography variant="h6" gutterBottom>
                Contenu téléchargé avec succès!
              </Typography>
              <Button onClick={handleReset} sx={{ mt: 2 }}>
                Télécharger un autre contenu
              </Button>
            </Box>
          ) : (
            <>
              {getStepContent(activeStep)}
              
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                  disabled={activeStep === 0 || loading}
                  onClick={handleBack}
                >
                  Retour
                </Button>
                <Box>
                  {activeStep === steps.length - 1 ? (
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                    >
                      {loading ? 'Téléchargement...' : 'Télécharger'}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={
                        (activeStep === 0 && !formData.classId) ||
                        (activeStep === 1 && !formData.title) ||
                        (activeStep === 2 && (
                          (formData.type === 'pdf' && !formData.file) ||
                          ((formData.type === 'video' || formData.type === 'youtube' || formData.type === 'link') && !formData.contentUrl)
                        ))
                      }
                    >
                      Suivant
                    </Button>
                  )}
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

export default TeacherContentUpload;