import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';
import './ForgotPassword.css';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Add the handleChange function
    const handleChange = (e) => {
        setEmail(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setLoading(false);
            return handleError('Veuillez entrer un email valide');
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                handleSuccess('Un email de réinitialisation a été envoyé. Veuillez vérifier votre boîte de réception.');
                setTimeout(() => navigate('/login'), 3000);
            } else {
                handleError(result.message || 'Une erreur est survenue');
            }
        } catch (err) {
            handleError('Erreur réseau ou serveur indisponible');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-container">
            <form onSubmit={handleSubmit} className="forgot-password-form">
                <h1 className="forgot-password-title">Trouver votre compte</h1>
                <p className="forgot-password-description">
                    Entrez votre adresse email pour recevoir un lien de réinitialisation.
                </p>
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input
                        onChange={handleChange}
                        type="email"
                        name="email"
                        placeholder="Entrez votre adresse e-mail"
                        value={email}
                        className="input-field"
                        disabled={loading}
                    />
                </div>
                <button type="submit" className="reset-btn" disabled={loading}>
                    {loading ? 'Envoi en cours...' : 'Envoyer'}
                </button>
                <span className="back-to-login">
                    Retour à la <a href="/login">connexion</a>
                </span>
            </form>
            <ToastContainer />
        </div>
    );
}

export default ForgotPassword;