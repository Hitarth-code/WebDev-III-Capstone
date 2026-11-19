// Login Page
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  // Helper for quick testing with demo credentials
  const fillCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-header">
        <h2>Welcome Back to StayEasy</h2>
        <p>Log in to manage your bookings and explore hotels</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            required
            placeholder="youremail@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Logging in...' : 'Sign In'}
        </button>
      </form>

      {/* Quick Test Demo Credentials for Evaluators */}
      <div style={{ marginTop: '24px', padding: '12px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <p style={{ fontSize: '12px', fontWeight: '600', color: '#4b5563', marginBottom: '8px' }}>
          💡 Quick Demo Accounts (Click to autofill):
        </p>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => fillCredentials('guest@stayeasy.com', 'password123')}
            className="btn btn-outline btn-sm"
          >
            Guest
          </button>
          <button
            type="button"
            onClick={() => fillCredentials('manager@stayeasy.com', 'password123')}
            className="btn btn-outline btn-sm"
          >
            Hotel Manager
          </button>
          <button
            type="button"
            onClick={() => fillCredentials('admin@stayeasy.com', 'password123')}
            className="btn btn-outline btn-sm"
          >
            Admin
          </button>
        </div>
      </div>

      <div className="auth-switch">
        Don't have an account? <Link to="/register">Create Account</Link>
      </div>
    </div>
  );
};

export default Login;
