import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard.js";
import Signup from "./pages/Signup";
import Settings from "./pages/Settings";
import GererEleve from "./pages/GererEleve";
import GererEnseignant from "./pages/GererEnseignant";
import Welcome from "./pages/Welcome";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import StudentDashboard from './pages/StudentDashboard';
import MesMatieresEleve from './pages/MesMatieresEleve';
import GererSession from "./pages/GererSession";
import EditSession from "./pages/EditSession";
import GererMatiere from './pages/GererMatiere';
import Layout from './components/Layout';
import TeacherDashboard from './pages/TeacherDashboard';

import SessionNotifications from './components/SessionNotifications';
import Notifications from './pages/Notifications';
import GestionMatieres from './pages/GestionMatieres';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = {
      _id: localStorage.getItem("userId"),
      role: localStorage.getItem("role"),
      nom: localStorage.getItem("userName"), // Changed from name to nom for consistency
      prenom: localStorage.getItem("userPrenom"), // Added prenom
      email: localStorage.getItem("userEmail")
    };
    
    if (token && storedUser._id) {
      setIsAuthenticated(true);
      setUser(storedUser);
    }
  }, []);

  const PrivateRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  const noLayoutRoutes = ["/", "/login", "/signup", "/forgot-password", "/reset-password"];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    localStorage.removeItem("userPrenom"); // Added to clear prenom
    localStorage.removeItem("userEmail");
    setIsAuthenticated(false);
    setUser(null);
    navigate("/login", { replace: true });
  };

  return (
    <div className="App">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {noLayoutRoutes.includes(location.pathname) ? (
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      ) : (
        <Layout user={user} handleLogout={handleLogout}>
          <Routes>
            <Route path="/Admin-Dashboard" element={
              <PrivateRoute>
                <AdminDashboard user={user} />
              </PrivateRoute>
            } />
            <Route path="/student-dashboard" element={
              <PrivateRoute>
                <StudentDashboard />
              </PrivateRoute>
            } />
            <Route path="/teacher-dashboard" element={
              <PrivateRoute>
                <TeacherDashboard />
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile user={user} />
              </PrivateRoute>
            } />
            <Route path="/settings" element={
              <PrivateRoute>
                <Settings user={user} />
              </PrivateRoute>
            } />
            <Route path="/gerer-eleve" element={
              <PrivateRoute>
                <GererEleve />
              </PrivateRoute>
            } />
            <Route path="/gerer-enseignant" element={
              <PrivateRoute>
                <GererEnseignant />
              </PrivateRoute>
            } />
            <Route path="/gerer-matiere" element={
              <PrivateRoute>
                {user?.role === "enseignant" ? (
                  <GestionMatieres user={user} />
                ) : (
                  <Navigate to="/" replace />
                )}
              </PrivateRoute>
            } />
            <Route path="/gestion-matieres" element={
              <PrivateRoute>
                {user?.role === "enseignant" ? (
                  <GestionMatieres user={user} />
                ) : (
                  <Navigate to="/" replace />
                )}
              </PrivateRoute>
            } />
            <Route path="/gerer-session" element={
              <PrivateRoute>
                <GererSession />
              </PrivateRoute>
            } />
            <Route path="/edit-session/:id" element={
              <PrivateRoute>
                <EditSession />
              </PrivateRoute>
            } />
            <Route path="/mes-matieres" element={
              <PrivateRoute>
                <MesMatieresEleve />
              </PrivateRoute>
            } />
            <Route path="/teacher-courses" element={
              <PrivateRoute>
             
              </PrivateRoute>
            } />
            <Route path="/session-notifications" element={
              <PrivateRoute>
                <SessionNotifications userId={user?._id} userType={user?.role} />
              </PrivateRoute>
            } />
            <Route 
              path="/notifications" 
              element={
                <PrivateRoute>
                  <Notifications />
                </PrivateRoute>
              } 
            />
            
            {/* Add session-notifications route for backward compatibility */}
            <Route path="/session-notifications" element={
              <PrivateRoute>
                <Navigate to="/notifications" replace />
              </PrivateRoute>
            } />
          </Routes>
        </Layout>
      )}
    </div>
  );
}

export default App;