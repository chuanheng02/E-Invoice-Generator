import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, LogIn, AlertCircle } from 'lucide-react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // If successful, redirect to the app
      navigate('/app');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      // Alert user to check their email for verification, or if auto-confirm is on, just redirect.
      alert('Sign up successful! If email confirmation is enabled on Supabase, please check your inbox.');
      
      if (data.session) {
        navigate('/app');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ maxWidth: '400px', margin: 'auto', marginTop: '10vh' }}>
      <div className="header">
        <h1>Welcome Back</h1>
        <p>Login to E-Invoice Generator</p>
      </div>

      <form onSubmit={handleLogin}>
        <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
          
          <div className="form-group full-width">
            <label className="form-label">
              <Mail className="icon" size={16} />
              Email
            </label>
            <div className="input-icon-wrapper">
              <Mail className="icon" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input" 
                placeholder="admin@example.com"
                required
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label className="form-label">
              <Lock className="icon" size={16} />
              Password
            </label>
            <div className="input-icon-wrapper">
              <Lock className="icon" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input" 
                placeholder="••••••••"
                required
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message" style={{ marginBottom: '1.5rem' }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" className="btn-generate" disabled={isLoading} style={{ flex: 1 }}>
            {isLoading ? 'Loading...' : (
              <><LogIn className="icon" /> Login</>
            )}
          </button>
          
          <button 
            type="button" 
            onClick={handleSignUp} 
            className="btn-generate" 
            disabled={isLoading} 
            style={{ flex: 1, backgroundColor: 'var(--surface-color)', color: 'var(--primary-color)', border: '1px solid var(--border-color)' }}
          >
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;
