// ... existing code ...

// Add 'date' to your form state initialization
const [form, setForm] = useState({
  nom: "",
  enseignantId: "",
  eleveIds: [],
  remarque: "",
  heureDebut: "",
  heureFin: "",
  date: "", // <-- Add this
  lienDirect: "",
  lienSupport: ""
});

const handleChange = (field) => (e) => {
  const value = e.target.value;
  setForm((prev) => ({ ...prev, [field]: value }));
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const formData = new FormData();
    formData.append("nom", form.nom);
    formData.append("enseignant", form.enseignantId);
    formData.append("eleves", form.eleveIds);
    formData.append("remarque", form.remarque);
    formData.append("heureDebut", form.heureDebut || "");
    formData.append("heureFin", form.heureFin || "");
    formData.append("date", form.date || ""); // <-- Add this line
    formData.append("lienDirect", form.lienDirect || "");
    formData.append("lienSupport", form.lienSupport || "");

    await axios.post("/api/sessions", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data"
      }
    });

    toast.success("Session créée !");
    setForm({ 
      nom: "", 
      enseignantId: "", 
      eleveIds: [], 
      remarque: "", 
      heureDebut: "", 
      heureFin: "", 
      date: "", // <-- Reset date
      lienDirect: "",
      lienSupport: "" 
    });
    setRefreshKey(k => k + 1);
  } catch (error) {
    toast.error("Erreur de création.");
  } finally {
    setLoading(false);
  }
};

// Add this function to determine session status based on current time
const getSessionStatus = (date, heureDebut, heureFin) => {
  if (!date || !heureDebut || !heureFin) return "Non programmée";
  
  const now = new Date();
  const startTime = new Date(`${date}T${heureDebut}`);
  const endTime = new Date(`${date}T${heureFin}`);
  
  if (now < startTime) {
    return "À venir";
  } else if (now >= startTime && now <= endTime) {
    return "En cours";
  } else {
    return "Terminée";
  }
};

// Add this function to get appropriate color for status
const getStatusColor = (status) => {
  switch (status) {
    case "À venir":
      return "info";
    case "En cours":
      return "success";
    case "Terminée":
      return "error";
    case "Non programmée":
      return "default";
    default:
      return "default";
  }
};

// Replace the file upload button with a text field for Drive link
<TextField
  label="Lien du support de cours (Google Drive)"
  value={form.lienSupport || ""}
  onChange={handleChange("lienSupport")}
  fullWidth
  margin="normal"
  InputProps={{ startAdornment: <AttachFileIcon sx={{ mr: 1 }} /> }}
  placeholder="https://drive.google.com/..."
/>

// In the sessions list section, update the card to display status
{sessions.map((session) => (
  <Grid item xs={12} md={6} lg={4} key={session._id}>
    <Card 
      elevation={3} 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      {/* Add status chip at the top right corner */}
      <Box position="absolute" top={10} right={10}>
        <Chip 
          label={getSessionStatus(session.heureDebut, session.heureFin)}
          color={getStatusColor(getSessionStatus(session.heureDebut, session.heureFin))}
          size="small"
        />
      </Box>
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom>
          {session.nom}
        </Typography>
        
        {/* Rest of your existing card content */}
        <Box display="flex" alignItems="center" mt={1}>
          <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {enseignants.find(e => e._id === session.enseignant)?.nom || 'Enseignant inconnu'}
          </Typography>
        </Box>
        
        {/* Time display with icon */}
        {session.heureDebut && session.heureFin && (
          <Box display="flex" alignItems="center" mt={1}>
            <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {session.heureDebut} - {session.heureFin}
            </Typography>
          </Box>
        )}
        
        {/* Existing content continues... */}
      </CardContent>
      
      <CardActions>
        {/* Join button - only enabled if session is in progress */}
        {session.lienDirect && (
          <Button 
            variant="contained" 
            size="small" 
            startIcon={<VideoCallIcon />}
            href={session.lienDirect}
            target="_blank"
            disabled={getSessionStatus(session.heureDebut, session.heureFin) !== "En cours"}
            sx={{ mr: 1 }}
          >
            Rejoindre
          </Button>
        )}
        
        {/* Support material download button */}
        {session.supportCours && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            href={session.supportCours}
            target="_blank"
          >
            Support
          </Button>
        )}
        
        {/* Action buttons */}
        <Box flexGrow={1} />
        <IconButton onClick={() => handleEditSession(session)}>
          <EditIcon />
        </IconButton>
        <IconButton color="error" onClick={() => handleDeleteConfirm(session._id)}>
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  </Grid>
))}

// Add a useEffect to refresh the status every minute
useEffect(() => {
  const statusInterval = setInterval(() => {
    // Force re-render to update status chips
    setRefreshKey(prev => prev + 1);
  }, 60000); // Update every minute
  
  return () => clearInterval(statusInterval);
}, []);

// In your form JSX, add a date picker:
<TextField
  label="Date de la session"
  type="date"
  value={form.date}
  onChange={handleChange("date")}
  fullWidth
  margin="normal"
  InputLabelProps={{ shrink: true }}
/>