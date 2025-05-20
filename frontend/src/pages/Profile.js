import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Sidenav from '../components/Sidenav';
import Navbar from '../components/Navbar';

const tunisianLevels = [
    '1ère année primaire', '2ème année primaire', '3ème année primaire',
    '4ème année primaire', '5ème année primaire', '6ème année primaire',
    '7ème année', '8ème année', '9ème année',
    '1ère année secondaire', '2ème année - Sciences', '2ème année - Lettres',
    '2ème année - Economie', '2ème année - Informatique', '2ème année - Techniques',
    '3ème année - Sciences expérimentales', '3ème année - Mathématiques',
    '3ème année - Lettres', '3ème année - Economie', '3ème année - Informatique',
    '3ème année - Techniques', '4ème année - Sciences expérimentales',
    '4ème année - Mathématiques', '4ème année - Lettres',
    '4ème année - Economie', '4ème année - Informatique', '4ème année - Techniques'
];

// Remove this line
// import { tunisianCities } from '../../../backend/Models/Eleve';

// Add tunisianCities array after tunisianLevels
const tunisianCities = [
  'Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte',
  'Gabès', 'Ariana', 'Gafsa', 'Monastir', 'Ben Arous',
  'Kasserine', 'Médenine', 'Nabeul', 'Tataouine', 'Béja',
  'Kef', 'Mahdia', 'Sidi Bouzid', 'Jendouba', 'Tozeur',
  'Manouba', 'Siliana', 'Zaghouan', 'Kebili'
];

export default function Profil() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    // Add classe and ville to initial state
    const [profileData, setProfileData] = useState({
        nom: '',
        prenom: '',
        email: '',
        specialite: '',
        dateNaissance: '',
        currentPassword: '',
        newPassword: '',
        active: true,
        classe: '',  // Add this
        ville: ''    // Add this
    });
    const [role, setRole] = useState('');
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchProfile();
    }, [navigate]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setSnackbar({
                    open: true,
                    message: 'Veuillez vous connecter.',
                    severity: 'error'
                });
                navigate('/login');
                return;
            }

            const response = await axios.get('http://localhost:5000/api/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.data.success) {
                throw new Error(response.data.message || 'Réponse inattendue du serveur');
            }

            const { user, profile } = response.data.data;
            if (!user) {
                throw new Error('Utilisateur non trouvé dans la réponse.');
            }

            setUserData(user);
            setRole(user.role);
            setProfileData({
                nom: profile?.nom || '',
                prenom: profile?.prenom || '',
                email: user.email || '',
                specialite: profile?.specialite || '',
                dateNaissance: profile?.dateNaissance ? new Date(profile.dateNaissance).toISOString().split('T')[0] : '',
                currentPassword: '',
                newPassword: '',
                active: profile?.active ?? true,
                classe: profile?.classe || '',  // Add this
                ville: profile?.ville || ''     // Add this
            });
        } catch (error) {
            console.error('Erreur lors du chargement du profil:', error);
            let errorMessage = error.response?.data?.message || error.message || 'Erreur inconnue';
            if (error.response?.status === 401) {
                errorMessage = 'Session expirée. Veuillez vous reconnecter.';
                localStorage.removeItem('token');
                navigate('/login');
            }
            setSnackbar({
                open: true,
                message: errorMessage,
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setSnackbar({
                    open: true,
                    message: 'Veuillez vous connecter.',
                    severity: 'error'
                });
                navigate('/login');
                return;
            }

            const payload = {
                email: profileData.email,
                nom: profileData.nom,
                prenom: profileData.prenom,
                dateNaissance: profileData.dateNaissance,
                ...(role === 'enseignant' && { 
                    specialite: profileData.specialite,
                    active: profileData.active 
                }),
                ...(role === 'eleve' && {
                    classe: profileData.classe,
                    ville: profileData.ville
                }),
                ...(profileData.currentPassword && profileData.newPassword && {
                    currentPassword: profileData.currentPassword,
                    newPassword: profileData.newPassword
                })
            };

            const response = await axios.put('http://localhost:5000/api/profile', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.data.success) {
                throw new Error(response.data.message || 'Échec de la mise à jour du profil');
            }

            setSnackbar({
                open: true,
                message: response.data.message || 'Profil mis à jour avec succès',
                severity: 'success'
            });

            // In handleSubmit success handler
            const { user, profile } = response.data.data;
            setUserData(user);
            setProfileData(prev => ({
                ...prev,
                nom: profile?.nom || prev.nom,
                prenom: profile?.prenom || prev.prenom,
                email: user.email,
                specialite: profile?.specialite || prev.specialite,
                dateNaissance: profile?.dateNaissance ? new Date(profile.dateNaissance).toISOString().split('T')[0] : prev.dateNaissance,
                ville: profile?.ville || prev.ville,
                classe: profile?.classe || prev.classe,
                currentPassword: '',
                newPassword: ''
            }));
        } catch (error) {
            console.error('Erreur lors de la mise à jour du profil:', error);
            let errorMessage = error.response?.data?.message || 'Erreur lors de la mise à jour du profil';
            if (error.response?.status === 401) {
                errorMessage = 'Session expirée. Veuillez vous reconnecter.';
                localStorage.removeItem('token');
                navigate('/login');
            }
            setSnackbar({
                open: true,
                message: errorMessage,
                severity: 'error'
            });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <Sidenav />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Navbar />
                <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#1976d2' }}>
                    Paramètres du Profil
                </Typography>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                        <CircularProgress />
                    </Box>
                ) : userData && role ? (
                    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto' }}>
                        <Grid container spacing={3}>
                            {/* Basic Info Fields */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Nom"
                                    name="nom"
                                    value={profileData.nom}
                                    onChange={handleChange}
                                    variant="outlined"
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Prénom"
                                    name="prenom"
                                    value={profileData.prenom}
                                    onChange={handleChange}
                                    variant="outlined"
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={profileData.email}
                                    onChange={handleChange}
                                    variant="outlined"
                                    required
                                />
                            </Grid>

                            {/* Teacher-specific Fields */}
                            {role === 'enseignant' && (
                                <>
                                    <Grid item xs={12}>
                                        <Select
                                            fullWidth
                                            label="Spécialité"
                                            name="specialite"
                                            value={profileData.specialite}
                                            onChange={handleChange}
                                            variant="outlined"
                                            required
                                            displayEmpty
                                        >
                                            <MenuItem value="" disabled>
                                                Sélectionner une spécialité
                                            </MenuItem>
                                            {[
                                                'Mathématiques',
                                                'Physique',
                                                'Chimie',
                                                'Sciences de la Vie et de la Terre',
                                                'Informatique',
                                                'Français',
                                                'Anglais',
                                                'Arabe',
                                                'Histoire-Géographie',
                                                'Philosophie',
                                                'Education Physique',
                                                'Arts Plastiques',
                                                'Musique',
                                                'Sciences Économiques',
                                                'Technologie'
                                            ].map(specialite => (
                                                <MenuItem key={specialite} value={specialite}>
                                                    {specialite}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Date de Naissance"
                                            name="dateNaissance"
                                            type="date"
                                            value={profileData.dateNaissance}
                                            onChange={handleChange}
                                            variant="outlined"
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Grid>
                                </>
                            )}

                            {/* Student-specific Fields */}
                            {role === 'eleve' && (
                                <>
                                    <Grid item xs={12}>
                                        <Select
                                            fullWidth
                                            label="Classe"
                                            name="classe"
                                            value={profileData.classe}
                                            onChange={handleChange}
                                            variant="outlined"
                                            required
                                            displayEmpty
                                        >
                                            <MenuItem value="" disabled>
                                                Sélectionner une classe
                                            </MenuItem>
                                            {tunisianLevels.map(level => (
                                                <MenuItem key={level} value={level}>
                                                    {level}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Select
                                            fullWidth
                                            label="Ville"
                                            name="ville"
                                            value={profileData.ville}
                                            onChange={handleChange}
                                            variant="outlined"
                                            required
                                            displayEmpty
                                        >
                                            <MenuItem value="" disabled>
                                                Sélectionner une ville
                                            </MenuItem>
                                            {tunisianCities.map(city => (
                                                <MenuItem key={city} value={city}>
                                                    {city}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Date de Naissance"
                                            name="dateNaissance"
                                            type="date"
                                            value={profileData.dateNaissance}
                                            onChange={handleChange}
                                            variant="outlined"
                                            InputLabelProps={{ shrink: true }}
                                            required
                                        />
                                    </Grid>
                                </>
                            )}

                            {/* Password Fields */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Mot de passe actuel"
                                    name="currentPassword"
                                    type="password"
                                    value={profileData.currentPassword}
                                    onChange={handleChange}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Nouveau mot de passe"
                                    name="newPassword"
                                    type="password"
                                    value={profileData.newPassword}
                                    onChange={handleChange}
                                    variant="outlined"
                                />
                            </Grid>

                            {/* Submit Button */}
                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    sx={{ mt: 2, backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}
                                >
                                    Mettre à jour le profil
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                ) : (
                    <Typography color="error" sx={{ mt: 4 }}>
                        Impossible de charger le profil. Veuillez réessayer ou vous reconnecter.
                    </Typography>
                )}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </Box>
    );
}