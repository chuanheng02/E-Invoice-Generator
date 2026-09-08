import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, LogIn, AlertCircle, CheckCircle } from 'lucide-react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      navigate('/app');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      setError('Please enter both email and password to sign up.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        navigate('/app');
      } else {
        setSuccessMsg('Account created! Please check your email for a confirmation link, then log in.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container login-container">
      <div className="header">
        <h1>元天宫</h1>
        <p className="subtitle">E-Invoice Generator</p>
        <span className="org-badge">Registration No. 1025-07-WKL</span>
      </div>

      <form onSubmit={handleLogin}>
        <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              <Mail className="icon" />
              Email
            </label>
            <div className="input-icon-wrapper">
              <Mail className="icon" />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              <Lock className="icon" />
              Password
            </label>
            <div className="input-icon-wrapper">
              <Lock className="icon" />
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {successMsg && (
          <div className="success-message" style={{ marginBottom: '1rem' }}>
            <CheckCircle size={16} />
            {successMsg}
          </div>
        )}

        <div className="btn-row">
          <button type="submit" className="btn-generate" disabled={isLoading}>
            {isLoading ? 'Signing in...' : (
              <><LogIn className="icon" /> Login</>
            )}
          </button>
          <button
            type="button"
            onClick={handleSignUp}
            className="btn-secondary"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Sign Up'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;
