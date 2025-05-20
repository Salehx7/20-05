import {
    Science as ScienceIcon, Calculate as MathIcon, Engineering as TechIcon,
    Computer as ComputerIcon, Book as BookIcon, Mosque as IslamicIcon,
    Gavel as CivicIcon, Brush as ArtIcon, SportsSoccer as SportsIcon,
    AccountBalance as EconIcon, History as HistoryIcon, QuestionMark as OtherIcon,
    Language as LanguageIcon, Psychology as PhilosophyIcon
  } from '@mui/icons-material';
  import { Box } from '@mui/material';
  
  export const CATEGORIES = [
    "Sciences", "Mathématiques", "Technologie", "Informatique", "Langue Arabe",
    "Langue Française", "Langue Anglaise", "Philosophie", "Éducation Islamique",
    "Éducation Civique", "Éducation Artistique", "Éducation Physique", "Économie et Gestion",
    "Histoire-Géographie", "Physique", "Chimie", "SVT", "Autre"
  ];
  
  export const tunisianLevels = [
    // Primaire
    '1ère année primaire', '2ème année primaire', '3ème année primaire',
    '4ème année primaire', '5ème année primaire', '6ème année primaire',
    // Collège
    '7ème année (1ère année collège)', '8ème année (2ème année collège)', '9ème année (3ème année collège)',
    // Lycée - Tronc commun
    '1ère année secondaire',
    // Lycée - 2ème année
    '2ème année - Sciences', '2ème année - Lettres', '2ème année - Economie et Services',
    '2ème année - Technologies de l\'informatique', '2ème année - Sciences techniques',
    // Lycée - 3ème année
    '3ème année - Sciences expérimentales', '3ème année - Mathématiques', '3ème année - Lettres',
    '3ème année - Economie et Gestion', '3ème année - Sciences techniques', '3ème année - Sciences informatiques',
    // Lycée - Bac
    '4ème année - Sciences expérimentales', '4ème année - Mathématiques', '4ème année - Lettres',
    '4ème année - Economie et Gestion', '4ème année - Sciences techniques', '4ème année - Sciences informatiques'
  ];
  
  export const CATEGORY_ICONS = {
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
  
  export const CATEGORY_COLORS = {
    "Sciences": '#4caf50', "Mathématiques": '#2196f3', "Technologie": '#ff9800', "Informatique": '#9c27b0',
    "Langue Arabe": '#f44336', "Langue Française": '#3f51b5', "Langue Anglaise": '#e91e63', "Philosophie": '#795548',
    "Éducation Islamique": '#009688', "Éducation Civique": '#607d8b', "Éducation Artistique": '#ffeb3b',
    "Éducation Physique": '#8bc34a', "Économie et Gestion": '#673ab7', "Histoire-Géographie": '#ff5722',
    "Physique": '#03a9f4', "Chimie": '#00bcd4', "SVT": '#cddc39', "Autre": '#757575'
  };