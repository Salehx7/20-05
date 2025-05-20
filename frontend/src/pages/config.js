// Configuration de l'application

// URL de base de l'API (à ajuster selon l'environnement)
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Configuration des couleurs de l'application
export const COLORS = {
  primary: '#a37cff',     // Violet clair - couleur principale
  secondary: '#4ecdc4',   // Turquoise - couleur secondaire
  success: '#2ecc71',     // Vert - succès
  warning: '#f9c74f',     // Jaune - avertissement
  error: '#ff6b6b',       // Rouge - erreur
  dark: '#343a40',        // Gris foncé - texte principal
  light: '#f8f9fa',       // Gris très clair - fond
  gray: '#6c757d',        // Gris - texte secondaire
  white: '#ffffff',       // Blanc
  
  // Variantes avec opacité pour les fonds
  primaryLight: 'rgba(163, 124, 255, 0.1)',
  secondaryLight: 'rgba(78, 205, 196, 0.1)',
  warningLight: 'rgba(249, 199, 79, 0.1)',
  errorLight: 'rgba(255, 107, 107, 0.1)',
};

// Configuration de thème pour MUI
export const THEME_OPTIONS = {
  palette: {
    primary: {
      main: COLORS.primary,
      light: '#b794ff',
      dark: '#8a5cf7',
      contrastText: '#ffffff',
    },
    secondary: {
      main: COLORS.secondary,
      light: '#72dbd4',
      dark: '#3db9b0',
      contrastText: '#ffffff',
    },
    error: {
      main: COLORS.error,
    },
    warning: {
      main: COLORS.warning,
    },
    text: {
      primary: COLORS.dark,
      secondary: COLORS.gray,
    },
    background: {
      default: '#f5f6fa',
      paper: COLORS.white,
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          padding: '8px 16px',
          transition: 'all 0.2s',
          '&:hover': {
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.1)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.2)',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
};

// Configuration des notifications Toast
export const TOAST_CONFIG = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

// Niveaux scolaires prédéfinis
export const NIVEAUX_SCOLAIRES = [
  "CP", "CE1", "CE2", "CM1", "CM2",
  "6ème", "5ème", "4ème", "3ème",
  "Seconde", "Première", "Terminale",
  "Licence 1", "Licence 2", "Licence 3",
  "Master 1", "Master 2"
];