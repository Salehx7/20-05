import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

const Item = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  height: '100%',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)'
  },
}));

const Home = ({ user }) => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h2" gutterBottom sx={{ mb: 4 }}>
        Bienvenue, {user?.name}
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Item elevation={3}>
            <Typography variant="h5" gutterBottom>
              Statistiques
            </Typography>
            <Typography variant="body1">
              Contenu organisé et professionnel avec des visualisations claires
            </Typography>
          </Item>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Item elevation={3}>
            <Typography variant="h5" gutterBottom>
              Activités récentes
            </Typography>
            <Typography variant="body1">
              Liste des activités avec des indicateurs visuels
            </Typography>
          </Item>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home;