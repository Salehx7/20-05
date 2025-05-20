import React, { useState, useMemo, useCallback, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Grid,
  Card,
  Breadcrumbs,
  Link,
  TextField,
  InputAdornment,
  Chip,
  CircularProgress,
  Paper,
  Button,
  Avatar,
  LinearProgress,
  List,
  ListItem,
  IconButton,
  Tabs,
  Tab,
  Modal,
  ListItemButton,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import {
  Search,
  ArrowBack,
  YouTube,
  LiveTv,
  PictureAsPdf,
  Bookmark,
  CheckCircle,
  Star,
  Close as CloseIcon,
  AccessTime,
  Science,
  Functions,
  Build,
  Computer,
  Translate,
  Language,
  GTranslate,
  Psychology,
  SelfImprovement,
  Groups,
  Brush,
  SportsSoccer,
  AccountBalance,
  Public,
  Bolt,
  Biotech,
  MenuBook
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import ReactPlayer from 'react-player';

// Palette de couleurs inspirée 2025
const theme = {
  primary: 'linear-gradient(135deg, #3B82F6 0%, #A855F7 100%)',
  secondary: '#10B981',
  accent: '#F59E0B',
  background: '#F8FAFC',
  cardBg: 'rgba(255, 255, 255, 0.8)',
  textPrimary: '#1E293B',
  textSecondary: '#64748B'
};

// Animations
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

const listItemVariants = {
  hover: { scale: 1.02, backgroundColor: 'rgba(59, 130, 246, 0.05)' },
  tap: { scale: 0.98 }
};

// Constantes
const getIconForSubject = (subject) => {
  const iconMap = {
    "Sciences": <Science sx={{ color: '#3B82F6' }} />,
    "Mathématiques": <Functions sx={{ color: '#A855F7' }} />,
    "Technologie": <Build sx={{ color: '#10B981' }} />,
    "Informatique": <Computer sx={{ color: '#F59E0B' }} />,
    "Langue Arabe": <Translate sx={{ color: '#EC4899' }} />,
    "Langue Française": <Language sx={{ color: '#6366F1' }} />,
    "Langue Anglaise": <GTranslate sx={{ color: '#14B8A6' }} />,
    "Philosophie": <Psychology sx={{ color: '#F97316' }} />,
    "Éducation Islamique": <SelfImprovement sx={{ color: '#6B7280' }} />,
    "Éducation Civique": <Groups sx={{ color: '#D946EF' }} />,
    "Éducation Artistique": <Brush sx={{ color: '#22C55E' }} />,
    "Éducation Physique": <SportsSoccer sx={{ color: '#EF4444' }} />,
    "Économie et Gestion": <AccountBalance sx={{ color: '#3B82F6' }} />,
    "Histoire-Géographie": <Public sx={{ color: '#8B5CF6' }} />,
    "Physique": <Bolt sx={{ color: '#F59E0B' }} />,
    "Chimie": <Biotech sx={{ color: '#10B981' }} />,
    "SVT": <Biotech sx={{ color: '#14B8A6' }} />,
    "Autre": <MenuBook sx={{ color: '#64748B' }} />
  };
  return iconMap[subject] || <MenuBook sx={{ color: '#64748B' }} />;
};

const CATEGORY_COLORS = {
  Sciences: '#3B82F6',
  Langues: '#EC4899',
  Humanités: '#8B5CF6',
  Arts: '#22C55E',
  Sports: '#EF4444',
  Économie: '#F59E0B'
};

const TABS = ['youtubeUrl', 'sessionUrl', 'pdfUrl'];

// Hook personnalisé pour le fetching
const useFetch = (url, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!url) {
      setData(null);
      return;
    }
    setLoading(true);
    try {
      const { data: res } = await axios.get(url);
      setData(res);
      setError(null);
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...deps]);

  return { data, loading, error, refetch: fetchData };
};

// Composants
const MatiereCard = React.memo(({ matiere, onClick, selected, category, progress }) => (
  <Grid item xs={12} sm={6} md={4} lg={3}>
    <motion.div variants={cardVariants} initial="hidden" animate="visible">
      <Card
        onClick={onClick}
        sx={{
          p: 3,
          borderRadius: 3,
          cursor: 'pointer',
          background: theme.cardBg,
          backdropFilter: 'blur(10px)',
          border: selected ? `2px solid ${CATEGORY_COLORS[category] || '#ccc'}` : '1px solid rgba(255, 255, 255, 0.2)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
          }
        }}
      >
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar sx={{ bgcolor: 'transparent', mr: 2, width: 48, height: 48 }}>
            {getIconForSubject(matiere.nom)}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600} color={theme.textPrimary}>
              {matiere.nom}
            </Typography>
            <Chip
              label={category || 'N/A'}
              size="small"
              sx={{
                mt: 0.5,
                bgcolor: `${CATEGORY_COLORS[category] || '#ccc'}20`,
                color: CATEGORY_COLORS[category] || theme.textSecondary,
                fontWeight: 500
              }}
            />
          </Box>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: 'rgba(0, 0, 0, 0.1)',
            '& .MuiLinearProgress-bar': { bgcolor: CATEGORY_COLORS[category] || theme.secondary }
          }}
        />
        <Box display="flex" justifyContent="space-between" mt={1}>
          <Typography variant="caption" color={theme.textSecondary}>
            {progress}% complété
          </Typography>
          <Typography variant="caption" color={theme.textSecondary}>
            {matiere.chapitresCount || 0} leçons
          </Typography>
        </Box>
      </Card>
    </motion.div>
  </Grid>
));

const ChapitreList = ({ chapitres, selectedId, onSelect, completed }) => (
  <List sx={{ overflowY: 'auto', maxHeight: 'calc(100vh - 300px)', pr: 1 }}>
    <AnimatePresence>
      {chapitres.map((c, idx) => (
        <motion.div
          key={c._id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
        >
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              component={motion.div}
              variants={listItemVariants}
              whileHover="hover"
              whileTap="tap"
              selected={selectedId === c._id}
              onClick={() => onSelect(c)}
              sx={{
                borderRadius: 2,
                p: 2,
                bgcolor: selectedId === c._id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                '&.Mui-selected': {
                  borderLeft: `4px solid ${theme.secondary}`,
                  bgcolor: 'rgba(59, 130, 246, 0.1)'
                }
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: completed.includes(c._id) ? theme.secondary : 'grey.200',
                    color: 'white',
                    width: 36,
                    height: 36
                  }}
                >
                  {completed.includes(c._id) ? <CheckCircle fontSize="small" /> : idx + 1}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={<Typography variant="subtitle1" fontWeight={600} color={theme.textPrimary}>{c.titre}</Typography>}
                secondary={
                  <Box display="flex" alignItems="center" mt={0.5}>
                    <AccessTime fontSize="small" sx={{ mr: 0.5, color: theme.textSecondary }} />
                    <Typography variant="caption" color={theme.textSecondary} mr={2}>
                      {c.duree || '--:--'}
                    </Typography>
                    <Chip
                      label={c.niveau || 'Général'}
                      size="small"
                      sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: theme.secondary }}
                    />
                  </Box>
                }
              />
            </ListItemButton>
          </ListItem>
        </motion.div>
      ))}
    </AnimatePresence>
  </List>
);

const MediaContent = ({ chapitre, tabIndex, onFullscreen }) => {
  const urlMap = {
    youtubeUrl: chapitre.youtubeUrl,
    sessionUrl: chapitre.sessionUrl,
    pdfUrl: chapitre.pdfUrl
  };
  const type = TABS[tabIndex];
  const url = urlMap[type];

  if (!url) return (
    <Box display="flex" justifyContent="center" alignItems="center" height={400} bgcolor="rgba(0, 0, 0, 0.05)">
      <Typography color={theme.textSecondary}>Contenu non disponible pour cet onglet.</Typography>
    </Box>
  );

  switch (type) {
    case 'pdfUrl':
      return (
        <Box sx={{ height: 600, position: 'relative', borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
          <iframe
            src={url}
            style={{ width: '100%', height: '100%', border: 0 }}
            title={`${chapitre.titre} PDF Document`}
          />
          <Button
            variant="contained"
            size="small"
            onClick={() => window.open(url, '_blank')}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: theme.secondary,
              '&:hover': { bgcolor: '#059669' }
            }}
          >
            Ouvrir dans un nouvel onglet
          </Button>
        </Box>
      );
    default:
      return (
        <Box sx={{ position: 'relative', aspectRatio: '16/9', borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
          <ReactPlayer
            url={url}
            width="100%"
            height="100%"
            controls
            config={{ file: { attributes: { controlsList: 'nodownload' } } }}
          />
          <Button
            variant="contained"
            size="small"
            onClick={() => onFullscreen(url)}
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              bgcolor: theme.secondary,
              '&:hover': { bgcolor: '#059669' }
            }}
          >
            Plein écran
          </Button>
        </Box>
      );
  }
};

export default function MesMatieresEleve() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedMatiere, setSelectedMatiere] = useState(null);
  const [selectedChapitre, setSelectedChapitre] = useState(null);
  const [completed, setCompleted] = useState([]);
  const [mediaTab, setMediaTab] = useState(0);
  const [fullscreenUrl, setFullscreenUrl] = useState(null);

  const { data: matieresData, loading: loadingMatieres, error: errorMatieres } = useFetch('/matieres/with-chapitres');

  const matieres = useMemo(() => {
    return matieresData ? matieresData.matieres : [];
  }, [matieresData]);

  const categories = useMemo(() => [...new Set(matieres.map(m => m.categorie))], [matieres]);

  const filteredMatieres = useMemo(() => {
    return matieres
      .filter(m => m.nom.toLowerCase().includes(search.toLowerCase()))
      .filter(m => category === 'all' || m.categorie === category);
  }, [matieres, search, category]);

  const toggleComplete = id => setCompleted(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const openFs = url => setFullscreenUrl(url);
  const closeFs = () => setFullscreenUrl(null);

  if (loadingMatieres) {
    return (
      <Box textAlign="center" mt={8} bgcolor={theme.background}>
        <CircularProgress size={60} thickness={4} sx={{ color: theme.secondary }} />
        <Typography variant="body2" color={theme.textSecondary} mt={2}>
          Chargement de votre espace d'apprentissage...
        </Typography>
      </Box>
    );
  }

  if (errorMatieres) {
    return (
      <Box textAlign="center" mt={8} bgcolor={theme.background}>
        <Typography color="error" variant="h6">{errorMatieres}</Typography>
        <Button
          variant="outlined"
          onClick={() => window.location.reload()}
          sx={{ mt: 2, color: theme.secondary, borderColor: theme.secondary }}
        >
          Réessayer
        </Button>
      </Box>
    );
  }

  return (
    <Box display="flex" minHeight="100vh" bgcolor={theme.background} sx={{ fontFamily: 'Poppins, sans-serif' }}>
      <Box flexGrow={1} p={{ xs: 2, md: 4 }} sx={{ transition: 'all 0.3s' }}>
        <Box mb={4}>
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3, color: theme.textSecondary }}>
            {selectedMatiere ? (
              [
                <Link key="1" onClick={() => setSelectedMatiere(null)} sx={{ cursor: 'pointer', color: theme.textSecondary, '&:hover': { color: theme.secondary } }}>
                  Toutes les matières
                </Link>,
                <Typography key="2" color={theme.textPrimary}>
                  {selectedMatiere.nom}
                </Typography>
              ]
            ) : (
              <Typography color={theme.textPrimary}>Mes Matières</Typography>
            )}
          </Breadcrumbs>

          <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
            <TextField
              placeholder="Recherche intelligente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              variant="outlined"
              size="small"
              sx={{
                flexGrow: 1,
                maxWidth: 500,
                bgcolor: 'white',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: theme.secondary },
                  '&.Mui-focused fieldset': { borderColor: theme.secondary }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" sx={{ color: theme.textSecondary }} />
                  </InputAdornment>
                )
              }}
            />
            <Chip
              label="Toutes catégories"
              onClick={() => setCategory('all')}
              variant={category === 'all' ? 'filled' : 'outlined'}
              sx={{
                bgcolor: category === 'all' ? theme.secondary : 'transparent',
                color: category === 'all' ? 'white' : theme.textSecondary,
                borderColor: theme.secondary,
                '&:hover': { bgcolor: category === 'all' ? '#059669' : 'rgba(0, 0, 0, 0.05)' }
              }}
            />
            {categories.map(cat => (
              <Chip
                key={cat}
                label={cat}
                onClick={() => setCategory(cat)}
                variant={category === cat ? 'filled' : 'outlined'}
                sx={{
                  bgcolor: category === cat ? CATEGORY_COLORS[cat] || theme.secondary : 'transparent',
                  color: category === cat ? 'white' : theme.textSecondary,
                  borderColor: CATEGORY_COLORS[cat] || theme.secondary,
                  '&:hover': { bgcolor: category === cat ? (CATEGORY_COLORS[cat] ? `${CATEGORY_COLORS[cat]}CC` : '#059669') : 'rgba(0, 0, 0, 0.05)' }
                }}
              />
            ))}
          </Box>
        </Box>

        {!selectedMatiere ? (
          filteredMatieres.length > 0 ? (
            <Grid container spacing={3}>
              {filteredMatieres.map(m => (
                <MatiereCard
                  key={m._id}
                  matiere={m}
                  onClick={() => setSelectedMatiere(m)}
                  selected={selectedMatiere?._id === m._id}
                  category={m.categorie}
                  progress={m.progression || 0}
                />
              ))}
            </Grid>
          ) : (
            <Typography variant="h6" color={theme.textSecondary} textAlign="center" mt={8}>
              Aucune matière trouvée.
            </Typography>
          )
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4}>
              <Paper sx={{ width: { xs: '100%', md: 340 }, p: 3, borderRadius: 3, bgcolor: theme.cardBg, backdropFilter: 'blur(10px)' }}>
                <Button
                  startIcon={<ArrowBack />}
                  onClick={() => setSelectedMatiere(null)}
                  sx={{ mb: 3, color: theme.secondary, '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.05)' } }}
                >
                  Retour aux matières
                </Button>

                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Avatar sx={{ width: 48, height: 48, bgcolor: 'transparent' }}>
                    {getIconForSubject(selectedMatiere.nom)}
                  </Avatar>
                  <Typography variant="h5" fontWeight={600} color={theme.textPrimary}>
                    {selectedMatiere.nom}
                  </Typography>
                </Box>

                <Box mb={3}>
                  <Chip
                    label={`${selectedMatiere.chapitresCount} chapitres`}
                    size="small"
                    sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: theme.secondary }}
                  />
                  <LinearProgress
                    variant="determinate"
                    value={selectedMatiere.progression}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      mt: 1,
                      bgcolor: 'rgba(0, 0, 0, 0.1)',
                      '& .MuiLinearProgress-bar': { bgcolor: theme.secondary }
                    }}
                  />
                </Box>

                <ChapitreList
                  chapitres={selectedMatiere.chapitres || []}
                  selectedId={selectedChapitre?._id}
                  onSelect={setSelectedChapitre}
                  completed={completed}
                />
              </Paper>

              {selectedChapitre && (
                <Paper sx={{ flexGrow: 1, p: 4, borderRadius: 3, bgcolor: theme.cardBg, backdropFilter: 'blur(10px)' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={4}>
                    <Box>
                      <Typography variant="h4" fontWeight={700} color={theme.textPrimary} gutterBottom>
                        {selectedChapitre.titre}
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        <Chip
                          label={`Durée : ${selectedChapitre.duree || '--:--'}`}
                          size="small"
                          icon={<AccessTime fontSize="small" sx={{ color: theme.textSecondary }} />}
                          sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: theme.textSecondary }}
                        />
                        <Chip
                          label={`Niveau : ${selectedChapitre.niveau || 'Général'}`}
                          size="small"
                          sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: theme.secondary }}
                        />
                      </Box>
                    </Box>

                    <Box display="flex" gap={1}>
                      <IconButton
                        onClick={() => toggleComplete(selectedChapitre._id)}
                        sx={{ color: completed.includes(selectedChapitre._id) ? theme.secondary : theme.textSecondary }}
                        aria-label={completed.includes(selectedChapitre._id) ? "Marquer comme non complété" : "Marquer comme complété"}
                      >
                        {completed.includes(selectedChapitre._id) ? (
                          <CheckCircle fontSize="large" />
                        ) : (
                          <Bookmark fontSize="large" />
                        )}
                      </IconButton>
                      <IconButton sx={{ color: theme.accent }} aria-label="Ajouter aux favoris">
                        <Star fontSize="large" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Tabs
                    value={mediaTab}
                    onChange={(_, v) => setMediaTab(v)}
                    sx={{ mb: 4, '& .MuiTab-root': { color: theme.textSecondary }, '& .Mui-selected': { color: theme.secondary } }}
                  >
                    {TABS.map((tab, idx) =>
                      selectedChapitre[tab] && (
                        <Tab
                          key={tab}
                          label={
                            <Box display="flex" alignItems="center" gap={1}>
                              {tab === 'youtubeUrl' && <YouTube sx={{ color: theme.textSecondary }} />}
                              {tab === 'sessionUrl' && <LiveTv sx={{ color: theme.textSecondary }} />}
                              {tab === 'pdfUrl' && <PictureAsPdf sx={{ color: theme.textSecondary }} />}
                              <Typography variant="body2">{tab.replace('Url', '')}</Typography>
                            </Box>
                          }
                          aria-label={`Contenu ${tab.replace('Url', '')}`}
                        />
                      )
                    )}
                  </Tabs>

                  <MediaContent
                    chapitre={selectedChapitre}
                    tabIndex={mediaTab}
                    onFullscreen={openFs}
                  />

                  <Box mt={4} p={3} bgcolor="rgba(255, 255, 255, 0.9)" borderRadius={3}>
                    <Typography variant="h6" fontWeight={600} color={theme.textPrimary} gutterBottom>
                      Objectifs du chapitre
                    </Typography>
                    <List dense sx={{ listStyleType: 'disc', pl: 4, color: theme.textSecondary }}>
                      {selectedChapitre.objectifs?.map((obj, index) => (
                        <ListItem key={index} sx={{ display: 'list-item' }}>
                          <Typography variant="body2">{obj}</Typography>
                        </ListItem>
                      )) || (
                        <Typography variant="body2" color={theme.textSecondary}>
                          Aucun objectif spécifié
                        </Typography>
                      )}
                    </List>
                  </Box>
                </Paper>
              )}
            </Box>
          </motion.div>
        )}
      </Box>

      <Modal open={!!fullscreenUrl} onClose={closeFs}>
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(0, 0, 0, 0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <IconButton
            onClick={closeFs}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'white',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' }
            }}
            aria-label="Fermer le mode plein écran"
          >
            <CloseIcon fontSize="large" />
          </IconButton>
          {fullscreenUrl && (
            <ReactPlayer
              url={fullscreenUrl}
              playing
              controls
              width="90vw"
              height="90vh"
              config={{
                file: {
                  attributes: {
                    controlsList: 'nodownload'
                  }
                }
              }}
            />
          )}
        </Box>
      </Modal>
    </Box>
  );
}
