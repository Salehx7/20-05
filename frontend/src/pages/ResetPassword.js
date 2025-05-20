import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';
import './ResetPassword.css';

function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            handleError('Lien de réinitialisation invalide');
            navigate('/forgot-password');
        }
    }, [token, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!password || !confirmPassword) {
            setLoading(false);
            return handleError('Tous les champs sont requis');
        }

        if (password.length < 8) {
            setLoading(false);
            return handleError('Le mot de passe doit contenir au moins 8 caractères');
        }

        if (password !== confirmPassword) {
            setLoading(false);
            return handleError('Les mots de passe ne correspondent pas');
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, password }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                handleSuccess('Mot de passe réinitialisé avec succès');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                handleError(result.message || 'Lien expiré ou invalide');
            }
        } catch (err) {
            handleError('Erreur réseau ou serveur indisponible');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-password-container">
            <form onSubmit={handleSubmit} className="reset-password-form">
                <h1 className="reset-password-title">Réinitialiser le mot de passe</h1>
                <div className="input-group">
                    <label htmlFor="password">Nouveau mot de passe</label>
                    <input
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        name="password"
                        placeholder="Entrez votre nouveau mot de passe"
                        value={password}
                        className="input-field"
                        disabled={loading}
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                    <input
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirmez votre nouveau mot de passe"
                        value={confirmPassword}
                        className="input-field"
                        disabled={loading}
                    />
                </div>
                <button type="submit" className="reset-btn" disabled={loading}>
                    {loading ? 'Réinitialisation...' : 'Réinitialiser'}
                </button>
                <span className="back-to-login">
                    Retour à la <a href="/login">connexion</a>
                </span>
            </form>
            <ToastContainer />
        </div>
    );
}

export default ResetPassword;