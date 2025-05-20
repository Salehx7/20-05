import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { InsertLink as InsertLinkIcon } from '@mui/icons-material';
import Sidenav from '../components/Sidenav';
import Navbar from '../components/Navbar';

// Utility to get session status
const getSessionStatus = (date, heureDebut, heureFin) => {
  if (!date || !heureDebut || !heureFin) return 'Non programmée';
  
  const now = moment();
  const startTime = moment(`${moment(date).format('YYYY-MM-DD')}T${heureDebut}:00`);
  const endTime = moment(`${moment(date).format('YYYY-MM-DD')}T${heureFin}:00`);
  
  if (now.isBefore(startTime)) return 'À venir';
  if (now.isSameOrAfter(startTime) && now.isSameOrBefore(endTime)) return 'En cours';
  return 'Terminée';
};

const getStatusColor = (status) => {
  switch (status) {
    case 'À venir': return 'info';
    case 'En cours': return 'success';
    case 'Terminée': return 'error';
    case 'Non programmée': return 'default';
    default: return 'default';
  }
};

const TeacherDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchSessions = async () => {
      if (!token) {
        toast.error('Veuillez vous connecter');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch user data to get userId and role
        const userRes = await axios.get('http://localhost:5000/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (userRes.data.role !== 'enseignant') {
          toast.error('Accès réservé aux enseignants');
          setLoading(false);
          return;
        }
        const userId = userRes.data._id;

        // Fetch sessions
        const response = await axios.get('http://localhost:5000/api/sessions', {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Sessions response:', response.data);
        if (!response.data.success) {
          throw new Error(response.data.message || 'Échec de la récupération des sessions');
        }

        // Filter sessions for the logged-in teacher
        const teacherSessions = response.data.sessions.filter(
          session => session.enseignant?._id === userId
        );
        setSessions(teacherSessions || []);
      } catch (error) {
        console.error('Erreur lors du chargement des sessions:', error);
        const message = error.response?.data?.message || 'Erreur lors du chargement des sessions';
        if (error.response?.status === 401) {
          toast.error('Session expirée. Veuillez vous reconnecter.');
          localStorage.removeItem('token');
        } else {
          toast.error(message);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [token]);

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidenav />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Navbar />
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#1976d2' }}>
          Tableau de Bord Enseignant
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 3, color: 'text.secondary' }}>
          Vos sessions de cours assignées
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <CircularProgress />
          </Box>
        ) : sessions.length > 0 ? (
          <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <TableContainer>
              <Table aria-label="tableau des sessions">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Nom</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Horaire</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Élèves</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Statut</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sessions.map((s) => (
                    <TableRow key={s._id}>
                      <TableCell>{s.nom}</TableCell>
                      <TableCell>
                        {s.date ? moment(s.date).format('DD/MM/YYYY') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {s.heureDebut && s.heureFin ? `${s.heureDebut} - ${s.heureFin}` : 'N/A'}
                      </TableCell>
                      <TableCell>{s.eleves?.length || 0}</TableCell>
                      <TableCell>
                        <Chip
                          label={getSessionStatus(s.date, s.heureDebut, s.heureFin)}
                          color={getStatusColor(getSessionStatus(s.date, s.heureDebut, s.heureFin))}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {s.lienDirect && (
                          <Tooltip title="Rejoindre la session">
                            <IconButton
                              href={s.lienDirect}
                              target="_blank"
                              rel="noopener noreferrer"
                              disabled={getSessionStatus(s.date, s.heureDebut, s.heureFin) !== 'En cours'}
                            >
                              <InsertLinkIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        ) : (
          <Typography color="text.secondary" align="center">
            Aucune session assignée. Contactez l'administrateur.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default TeacherDashboard;