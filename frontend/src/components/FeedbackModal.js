import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogContent, DialogActions,
  Button, TextField, List, ListItem, Typography,
  Box, Avatar, CircularProgress, Alert, ListItemText
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Styles inspirés de Discord
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: '#2f3136',
    color: '#dcddde',
    borderRadius: 8,
    maxWidth: 600,
    width: '100%',
  },
}));

const StyledTextField = styled(TextField)({
  '& .MuiInputBase-root': {
    backgroundColor: '#40444b',
    color: '#dcddde',
    borderRadius: 4,
  },
  '& .MuiInputLabel-root': {
    color: '#b9bbbe',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#40444b',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#5865f2',
  },
});

const StyledButton = styled(Button)({
  backgroundColor: '#5865f2',
  color: '#ffffff',
  textTransform: 'none',
  borderRadius: 4,
  '&:hover': {
    backgroundColor: '#4752c4',
  },
  '&:disabled': {
    backgroundColor: '#4e5058',
    color: '#72767d',
  },
});

const StyledListItem = styled(ListItem)(({ role }) => ({
  backgroundColor: '#36393f',
  borderRadius: 4,
  marginBottom: 8,
  padding: '12px',
  '& .MuiListItemText-primary': {
    color: role === 'admin' ? '#ff0000' : role === 'student' ? '#00ff00' : '#ffff00',
    fontWeight: role === 'admin' ? 'bold' : 'normal',
  },
  '& .MuiListItemText-secondary': {
    color: '#b9bbbe',
  },
}));

const FeedbackModal = ({ open, onClose, user }) => {
  const [message, setMessage] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Récupérer les feedbacks
  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Vous devez être connecté.');

      const res = await axios.get('http://localhost:5000/api/feedback', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbacks(res.data.feedbacks || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des feedbacks.');
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) fetchFeedbacks();
  }, [open, fetchFeedbacks]);

  // Gestion de l'envoi du message
  const handleSend = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const userEmail = localStorage.getItem('userEmail');
      const userRole = localStorage.getItem('role') || 'user';

      if (!userEmail || !token) {
        throw new Error('Informations utilisateur manquantes. Veuillez vous reconnecter.');
      }

      await axios.post(
        'http://localhost:5000/api/feedback',
        {
          senderId: userEmail,
          senderRole: userRole,
          message,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage('');
      fetchFeedbacks();
      toast.success('Message envoyé !', { theme: 'dark' });
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erreur lors de l\'envoi du message.';
      setError(errorMsg);
      toast.error(errorMsg, { theme: 'dark' });
    } finally {
      setLoading(false);
    }
  };

  // Gestion de la touche Entrée pour envoyer
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Générer un avatar basé sur l'email
  const getAvatar = (email) => {
    const initial = email ? email.charAt(0).toUpperCase() : '?';
    return (
      <Avatar sx={{ bgcolor: '#5865f2', mr: 2, width: 40, height: 40 }}>
        {initial}
      </Avatar>
    );
  };

  return (
    <StyledDialog open={open} onClose={onClose}>
      <DialogContent sx={{ p: 3 }}>
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />
        {error && (
          <Alert severity="error" sx={{ mb: 2, bgcolor: '#4e2a2a', color: '#ff9999' }}>
            {error}
          </Alert>
        )}
        <Typography variant="h6" sx={{ mb: 2, color: '#ffffff' }}>
          Feedback & Messages
        </Typography>
        <Box sx={{ mb: 3 }}>
          <StyledTextField
            placeholder="Écrivez votre message..."
            fullWidth
            multiline
            minRows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            variant="outlined"
          />
          <StyledButton
            onClick={handleSend}
            disabled={!message.trim() || loading}
            sx={{ mt: 2 }}
            startIcon={loading && <CircularProgress size={20} color="inherit" />}
          >
            {loading ? 'Envoi...' : 'Envoyer'}
          </StyledButton>
        </Box>
        <List sx={{ maxHeight: 400, overflowY: 'auto', pr: 1 }}>
          {loading && !feedbacks.length ? (
            <Box display="flex" justifyContent="center">
              <CircularProgress sx={{ color: '#5865f2' }} />
            </Box>
          ) : feedbacks.length === 0 ? (
            <Typography sx={{ color: '#72767d' }}>Aucun message pour le moment.</Typography>
          ) : (
            feedbacks.map((fb) => (
              <StyledListItem key={fb._id} role={fb.senderRole}>
                <Box display="flex" alignItems="flex-start" width="100%">
                  {getAvatar(fb.senderId)}
                  <ListItemText
                    primary={fb.message}
                    secondary={
                      <>
                        <strong>{fb.senderId}</strong> •{' '}
                        {fb.senderRole === 'admin'
                          ? 'Administrateur'
                          : fb.senderRole === 'student'
                          ? 'Élève'
                          : 'Professeur'}{' '}
                        • {new Date(fb.createdAt).toLocaleString('fr-FR')}
                      </>
                    }
                  />
                </Box>
              </StyledListItem>
            ))
          )}
        </List>
      </DialogContent>
      <DialogActions sx={{ bgcolor: '#2f3136', p: 2 }}>
        <StyledButton onClick={onClose} disabled={loading} variant="outlined">
          Fermer
        </StyledButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default FeedbackModal;