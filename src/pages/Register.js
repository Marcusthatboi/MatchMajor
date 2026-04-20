import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register as apiRegister } from '../api/auth';
import { useUser } from '../context/UserContext';
import './Register.css';

const Register = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useUser();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /**
   * Diagnostic error handler for registration
   */
  const getDiagnosticError = (err) => {
    const timestamp = new Date().toLocaleTimeString();
    let userMessage = 'Registration failed. Please try again.';
    let debugMessage = '';

    // Network/Connection errors
    if (!err || !err.response) {
      debugMessage = `[${timestamp}] Network Error - Cannot reach server`;
      console.error('Network error details:', err);
      
      if (err.message?.includes('NetworkError') || err.message?.includes('fetch')) {
        userMessage = '❌ Cannot connect to server. Is the backend running on port 5000?';
        debugMessage += ' | Check: npm run start:backend';
      } else if (err.code === 'ECONNREFUSED') {
        userMessage = '❌ Backend server is not running. Please start it first.';
        debugMessage += ' | Start backend: npm run start:backend';
      } else {
        userMessage = '❌ Network error. Check your internet connection.';
        debugMessage += ` | Error: ${err.message}`;
      }
      return { userMessage, debugMessage };
    }

    const status = err.response?.status;
    const data = err.response?.data;
    const errorCode = data?.errorCode || 'UNKNOWN_ERROR';

    // 400 - Bad Request / Validation error
    if (status === 400) {
      debugMessage = `[${timestamp}] 400 Bad Request - ${errorCode}`;
      const msg = data?.message || '';
      
      if (msg.toLowerCase().includes('email')) {
        userMessage = '❌ Email already in use or invalid format. Try a different email.';
        debugMessage += ' | Email validation/duplication check failed';
      } else if (msg.toLowerCase().includes('username')) {
        userMessage = '❌ Username already taken. Please choose a different one.';
        debugMessage += ' | Username is not unique';
      } else if (msg.toLowerCase().includes('password')) {
        userMessage = '❌ Passwords do not match or do not meet requirements.';
        debugMessage += ' | Password validation failed';
      } else if (msg.toLowerCase().includes('required')) {
        userMessage = '❌ Please fill in all required fields.';
        debugMessage += ' | Missing required fields';
      } else {
        userMessage = `❌ ${msg || 'Invalid registration data.'}`;
        debugMessage += ' | Validation error';
      }
      return { userMessage, debugMessage };
    }

    // 409 - Conflict (email/username exists)
    if (status === 409) {
      debugMessage = `[${timestamp}] 409 Conflict`;
      userMessage = '❌ This email or username is already registered. Please try logging in.';
      debugMessage += ' | Resource already exists in database';
      return { userMessage, debugMessage };
    }

    // 429 - Too Many Requests
    if (status === 429) {
      debugMessage = `[${timestamp}] 429 Rate Limited`;
      userMessage = '❌ Too many registration attempts. Please wait before trying again.';
      debugMessage += ' | Rate limiting enforced';
      return { userMessage, debugMessage };
    }

    // 500+ - Server errors
    if (status >= 500) {
      debugMessage = `[${timestamp}] ${status} Server Error - ${errorCode}`;
      userMessage = '❌ Server error. Please try again later.';
      debugMessage += ' | Internal server error - check backend logs';
      return { userMessage, debugMessage };
    }

    // 503 - Service Unavailable
    if (status === 503) {
      debugMessage = `[${timestamp}] 503 Service Unavailable`;
      userMessage = '❌ Backend service unavailable. Is MongoDB connected?';
      debugMessage += ' | Check: Is MongoDB running?';
      return { userMessage, debugMessage };
    }

    // Generic error
    debugMessage = `[${timestamp}] HTTP ${status} - ${errorCode}`;
    userMessage = data?.message || `❌ Registration failed (Error code: ${errorCode})`;
    debugMessage += ` | Error: ${data?.message || 'Unknown error'}`;

    return { userMessage, debugMessage };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDebugInfo('');

    // Validation
    if (!form.username?.trim()) {
      setError('❌ Username is required');
      setDebugInfo('[Client Validation] Username is empty');
      return;
    }

    // Username must be 3-50 chars and contain only letters, numbers, underscores, and hyphens
    if (!/^[a-zA-Z0-9_-]{3,50}$/.test(form.username)) {
      setError('❌ Username must be 3-50 characters and contain only letters, numbers, underscores, and hyphens (no spaces)');
      setDebugInfo('[Client Validation] Username format invalid - contains invalid characters or wrong length');
      return;
    }

    if (!form.email?.trim()) {
      setError('❌ Email is required');
      setDebugInfo('[Client Validation] Email is empty');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('❌ Please enter a valid email address');
      setDebugInfo('[Client Validation] Email format invalid');
      return;
    }

    if (!form.password) {
      setError('❌ Password is required');
      setDebugInfo('[Client Validation] Password is empty');
      return;
    }

    if (form.password.length < 6) {
      setError('❌ Password must be at least 6 characters');
      setDebugInfo('[Client Validation] Password too short');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('❌ Passwords do not match');
      setDebugInfo('[Client Validation] Password mismatch');
      return;
    }

    setIsLoading(true);
    
    try {
      setDebugInfo(`[${new Date().toLocaleTimeString()}] Sending registration request...`);
      const response = await apiRegister(
        form.username,
        form.email,
        form.password,
        form.confirmPassword
      );
      if (response.success && response.user) {
        setDebugInfo(`[${new Date().toLocaleTimeString()}] ✅ Registration successful`);
        register(response.user);
        setTimeout(() => navigate('/survey'), 500);
      } else {
        const errorMsg = response.message || 'Registration failed';
        setError(`❌ ${errorMsg}`);
        setDebugInfo(`[${new Date().toLocaleTimeString()}] Registration rejected: ${errorMsg}`);
      }
    } catch (err) {
      const { userMessage, debugMessage } = getDiagnosticError(err);
      setError(userMessage);
      setDebugInfo(debugMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page register-page">
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <input 
          name="username" 
          value={form.username} 
          onChange={handleChange} 
          placeholder="Username"
          disabled={isLoading}
          required
          autoComplete="username"
        />
        <input 
          name="email" 
          value={form.email} 
          onChange={handleChange} 
          placeholder="Email"
          type="email"
          disabled={isLoading}
          required
          autoComplete="email"
        />
        <input 
          name="password" 
          type="password" 
          value={form.password} 
          onChange={handleChange} 
          placeholder="Password (min 6 characters)"
          disabled={isLoading}
          required
          autoComplete="new-password"
        />
        <input 
          name="confirmPassword" 
          type="password" 
          value={form.confirmPassword} 
          onChange={handleChange} 
          placeholder="Confirm Password"
          disabled={isLoading}
          required
          autoComplete="new-password"
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Register'}
        </button>
      </form>
      
      {/* Error message with diagnostic info */}
      {error && (
        <div className="error-container">
          <p className="error">{error}</p>
          {debugInfo && (
            <p className="debug-info" title={debugInfo}>
              💡 {debugInfo}
            </p>
          )}
          {error.includes('backend') && (
            <p className="suggestion">
              💾 To start the backend: <code>npm run start:backend</code>
            </p>
          )}
          {error.includes('MongoDB') && (
            <p className="suggestion">
              💾 To start MongoDB: Check your MongoDB installation and ensure the service is running
            </p>
          )}
          {error.includes('already') && (
            <p className="suggestion">
              💾 Try <a href="/login" style={{ color: 'var(--primary-cyan)', textDecoration: 'underline' }}>logging in</a> or use a different email
            </p>
          )}
        </div>
      )}

      {/* Loading info */}
      {isLoading && debugInfo && (
        <p className="loading-info">⏳ {debugInfo}</p>
      )}

      <p style={{ marginTop: '15px', textAlign: 'center' }}>
        Already have an account? <a href="/login" style={{ color: 'var(--primary-cyan)', textDecoration: 'underline' }}>Login here</a>
      </p>
    </div>
  );
};

export default Register;
