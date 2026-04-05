import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import githubAuth from "../utils/githubAuth";
import "../styles/auth.css";

export default function GitHubCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token');
        const authenticated = searchParams.get('authenticated');

        if (!token) {
          setError('No authentication token received');
          setLoading(false);
          return;
        }

        if (authenticated === 'true') {
          // Store token
          githubAuth.setToken(token);
          localStorage.setItem('token', token);

          // Redirect to dashboard
          setTimeout(() => {
            navigate('/dashboard');
          }, 500);
        } else {
          setError('Authentication failed');
          setLoading(false);
        }
      } catch (err) {
        console.error('GitHub callback error:', err);
        setError(err.message || 'Failed to authenticate with GitHub');
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="auth-container">
      <div className="auth-card fade-in">
        {loading && (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Authenticating with GitHub...</p>
          </div>
        )}

        {error && (
          <div className="error">
            <h2>Authentication Error</h2>
            <p>{error}</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/login')}
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
