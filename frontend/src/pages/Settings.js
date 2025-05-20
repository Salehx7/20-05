import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Box, Typography, Tabs, Tab, Card, TextField, Switch, Select,
  MenuItem, FormControl, InputLabel, Button, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Tooltip, IconButton, AppBar, Toolbar, Grid,
  Divider, Stack
} from "@mui/material";
import {
  Save as SaveIcon, 
  Refresh as RefreshIcon, 
  Settings as SettingsIcon,
  Lock as AuthIcon,
  School as AcademicIcon,
  Notifications as NotificationsIcon,
  Storage as StorageIcon
} from "@mui/icons-material";

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const useSettingsForm = (initialSettings) => {
  const [form, setForm] = useState(initialSettings);
  const [errors, setErrors] = useState({});

  const validate = useCallback(() => {
    const newErrors = {};
    
    if (!form.general?.siteName?.trim()) {
      newErrors["general.siteName"] = "Le nom du site est requis";
    }
    
    if (form.authSecurity?.passwordMinLength < 6) {
      newErrors["authSecurity.passwordMinLength"] = "Minimum 6 caractères requis";
    }
    
    if (form.authSecurity?.maxLoginAttempts < 1) {
      newErrors["authSecurity.maxLoginAttempts"] = "Doit être supérieur ou égal à 1";
    }
    
    const start = new Date(form.academic?.schoolYearStartDate);
    const end = new Date(form.academic?.schoolYearEndDate);
    if (isNaN(start.getTime())) {
      newErrors["academic.schoolYearStartDate"] = "Date de début invalide";
    }
    if (isNaN(end.getTime())) {
      newErrors["academic.schoolYearEndDate"] = "Date de fin invalide";
    }
    if (!newErrors["academic.schoolYearStartDate"] && !newErrors["academic.schoolYearEndDate"] && start >= end) {
      newErrors["academic.schoolYearEndDate"] = "La date de fin doit être postérieure à la date de début";
    }
    
    if (form.notifications?.smtp?.port < 1 || form.notifications?.smtp?.port > 65535) {
      newErrors["notifications.smtp.port"] = "Le port doit être compris entre 1 et 65535";
    }
    
    if (form.storage?.maxUploadSizeMB < 1) {
      newErrors["storage.maxUploadSizeMB"] = "La taille doit être d'au moins 1 Mo";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleChange = useCallback((section, field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  }, []);

  const reset = useCallback(() => {
    setForm(initialSettings);
    setErrors({});
  }, [initialSettings]);

  return { form, setForm, errors, validate, handleChange, reset };
};

function Settings() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [initialSettings, setInitialSettings] = useState({
    general: {
      siteName: "",
      siteLogoUrl: "",
      defaultLanguage: "fr",
      theme: "light",
      maintenanceMode: false
    },
    authSecurity: {
      passwordMinLength: 8,
      maxLoginAttempts: 5,
      enable2FA: false
    },
    academic: {
      schoolYearStartDate: "",
      schoolYearEndDate: ""
    },
    notifications: {
      enabled: false,
      smtp: {
        host: "",
        port: 587
      }
    },
    storage: {
      maxUploadSizeMB: 10,
      cloudStorageEnabled: false
    }
  });

  const { form, setForm, errors, validate, handleChange, reset } = useSettingsForm(initialSettings);

  const fetchSettings = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await axios.get("/api/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fetchedSettings = response.data || initialSettings;
      setInitialSettings(fetchedSettings);
      setForm(fetchedSettings);
    } catch (error) {
      toast.error("Erreur lors du chargement des paramètres");
      console.error("Erreur de chargement:", error);
    } finally {
      setLoading(false);
    }
  }, [token, initialSettings, setForm]);

  useEffect(() => {
    if (!token) {
      toast.error("Veuillez vous connecter");
      navigate("/login");
      return;
    }
    fetchSettings();
  }, [token, navigate, fetchSettings]);

  const handleSave = async () => {
    if (!validate()) {
      toast.error("Veuillez corriger les erreurs avant de sauvegarder");
      return;
    }
    
    setLoading(true);
    try {
      await axios.put("/api/settings", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Paramètres sauvegardés avec succès");
      setSaveDialogOpen(false);
      setInitialSettings(form);
    } catch (error) {
      toast.error("Échec de la sauvegarde des paramètres");
      console.error("Erreur de sauvegarde:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading && !form.general?.siteName) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="fixed" color="primary" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Paramètres</Typography>
          <Button 
            color="inherit" 
            onClick={() => navigate("/dashboard")}
            disabled={loading}
          >
            Retour
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ pt: 10, px: 2, pb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="bold">Configuration du système</Typography>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Réinitialiser les modifications">
              <IconButton 
                onClick={reset} 
                disabled={loading}
                color="primary"
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Sauvegarder les modifications">
              <IconButton 
                onClick={() => setSaveDialogOpen(true)} 
                disabled={loading}
                color="primary"
              >
                <SaveIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Paramètres"
          >
            <Tab icon={<SettingsIcon />} label="Général" />
            <Tab icon={<AuthIcon />} label="Authentification" />
            <Tab icon={<AcademicIcon />} label="Scolarité" />
            <Tab icon={<NotificationsIcon />} label="Notifications" />
            <Tab icon={<StorageIcon />} label="Stockage" />
          </Tabs>

          <Divider />

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nom du site"
                  value={form.general?.siteName || ""}
                  onChange={handleChange("general", "siteName")}
                  error={!!errors["general.siteName"]}
                  helperText={errors["general.siteName"]}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="URL du logo"
                  value={form.general?.siteLogoUrl || ""}
                  onChange={handleChange("general", "siteLogoUrl")}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Langue par défaut</InputLabel>
                  <Select
                    value={form.general?.defaultLanguage || "fr"}
                    label="Langue par défaut"
                    onChange={handleChange("general", "defaultLanguage")}
                  >
                    <MenuItem value="fr">Français</MenuItem>
                    <MenuItem value="en">English</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Thème par défaut</InputLabel>
                  <Select
                    value={form.general?.theme || "light"}
                    label="Thème par défaut"
                    onChange={handleChange("general", "theme")}
                  >
                    <MenuItem value="light">Clair</MenuItem>
                    <MenuItem value="dark">Sombre</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Longueur minimale du mot de passe"
                  value={form.authSecurity?.passwordMinLength || 8}
                  onChange={handleChange("authSecurity", "passwordMinLength")}
                  error={!!errors["authSecurity.passwordMinLength"]}
                  helperText={errors["authSecurity.passwordMinLength"]}
                  margin="normal"
                  inputProps={{ min: 6 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Tentatives de connexion max"
                  value={form.authSecurity?.maxLoginAttempts || 5}
                  onChange={handleChange("authSecurity", "maxLoginAttempts")}
                  error={!!errors["authSecurity.maxLoginAttempts"]}
                  helperText={errors["authSecurity.maxLoginAttempts"]}
                  margin="normal"
                  inputProps={{ min: 1 }}
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Début de l'année scolaire"
                  InputLabelProps={{ shrink: true }}
                  value={form.academic?.schoolYearStartDate || ""}
                  onChange={handleChange("academic", "schoolYearStartDate")}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fin de l'année scolaire"
                  InputLabelProps={{ shrink: true }}
                  value={form.academic?.schoolYearEndDate || ""}
                  onChange={handleChange("academic", "schoolYearEndDate")}
                  error={!!errors["academic.schoolYearEndDate"]}
                  helperText={errors["academic.schoolYearEndDate"]}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Serveur SMTP"
                  value={form.notifications?.smtp?.host || ""}
                  onChange={handleChange("notifications.smtp", "host")}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Port SMTP"
                  value={form.notifications?.smtp?.port || 587}
                  onChange={handleChange("notifications.smtp", "port")}
                  error={!!errors["notifications.smtp.port"]}
                  helperText={errors["notifications.smtp.port"]}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Taille max d'upload (Mo)"
                  value={form.storage?.maxUploadSizeMB || 10}
                  onChange={handleChange("storage", "maxUploadSizeMB")}
                  error={!!errors["storage.maxUploadSizeMB"]}
                  helperText={errors["storage.maxUploadSizeMB"]}
                  margin="normal"
                  inputProps={{ min: 1 }}
                />
              </Grid>
            </Grid>
          </TabPanel>
        </Card>
      </Box>

      <Dialog 
        open={saveDialogOpen} 
        onClose={() => setSaveDialogOpen(false)}
      >
        <DialogTitle>Confirmer la sauvegarde</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir sauvegarder les modifications ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setSaveDialogOpen(false)} 
            disabled={loading}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={loading} 
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            color="primary"
          >
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Settings;