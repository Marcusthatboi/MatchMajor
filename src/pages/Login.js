import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../api/auth';
import { useUser } from '../context/UserContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useUser();

  /**
   * Diagnostic error handler - provides detailed feedback based on error type
   */
  const getDiagnosticError = (err) => {
    const timestamp = new Date().toLocaleTimeString();
    let userMessage = 'Login failed. Please try again.';
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
      } else if (err.message?.includes('timeout')) {
        userMessage = '❌ Connection timeout. Server is not responding.';
        debugMessage += ' | The backend may be overwhelmed or crashed';
      } else {
        userMessage = '❌ Network error. Check your internet connection.';
        debugMessage += ` | Error: ${err.message}`;
      }
      return { userMessage, debugMessage };
    }

    const status = err.response?.status;
    const data = err.response?.data;
    const errorCode = data?.errorCode || 'UNKNOWN_ERROR';

    // 401 - Unauthorized / Invalid credentials
    if (status === 401) {
      debugMessage = `[${timestamp}] 401 Unauthorized - ${errorCode}`;
      
      if (data?.message?.toLowerCase().includes('password')) {
        userMessage = '❌ Incorrect password. Please try again.';
        debugMessage += ' | Password mismatch detected';
      } else if (data?.message?.toLowerCase().includes('not found') || data?.message?.toLowerCase().includes('no user')) {
        userMessage = '❌ Account not found. Check your email or create a new account.';
        debugMessage += ' | User does not exist in database';
      } else if (data?.message?.toLowerCase().includes('token')) {
        userMessage = '❌ Session expired. Please log in again.';
        debugMessage += ' | JWT token invalid or expired';
      } else {
        userMessage = '❌ Invalid credentials. Please check your email and password.';
        debugMessage += ' | Authentication failed';
      }
      return { userMessage, debugMessage };
    }

    // 400 - Bad Request / Validation error
    if (status === 400) {
      debugMessage = `[${timestamp}] 400 Bad Request - ${errorCode}`;
      
      if (data?.message?.includes('email') || data?.message?.includes('Email')) {
        userMessage = '❌ Invalid email format. Please enter a valid email.';
        debugMessage += ' | Email validation failed';
      } else if (data?.message?.includes('required')) {
        userMessage = '❌ Email and password are required.';
        debugMessage += ' | Missing required fields';
      } else {
        userMessage = `❌ ${data?.message || 'Invalid input. Please check your credentials.'}`;
        debugMessage += ' | Validation error';
      }
      return { userMessage, debugMessage };
    }

    // 429 - Too Many Requests / Rate limited
    if (status === 429) {
      debugMessage = `[${timestamp}] 429 Rate Limited`;
      userMessage = '❌ Too many login attempts. Please wait a few minutes before trying again.';
      debugMessage += ' | Rate limiting enforced: 5 attempts per 15 minutes';
      return { userMessage, debugMessage };
    }

    // 500 - Server error
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

    // Generic error handling
    debugMessage = `[${timestamp}] HTTP ${status} - ${errorCode}`;
    userMessage = data?.message || `❌ Login failed (Error code: ${errorCode})`;
    debugMessage += ` | Error: ${data?.message || 'Unknown error'}`;

    return { userMessage, debugMessage };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDebugInfo('');
    setIsLoading(true);

    // Client-side validation
    if (!email?.trim()) {
      setError('❌ Please enter your email address');
      setDebugInfo('[Client Validation] Email is empty');
      setIsLoading(false);
      return;
    }

    if (!password) {
      setError('❌ Please enter your password');
      setDebugInfo('[Client Validation] Password is empty');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('❌ Password must be at least 6 characters');
      setDebugInfo('[Client Validation] Password too short');
      setIsLoading(false);
      return;
    }
    
    try {
      setDebugInfo(`[${new Date().toLocaleTimeString()}] Sending login request...`);
      const response = await apiLogin(email, password);
      
      if (response.success && response.user) {
        setDebugInfo(`[${new Date().toLocaleTimeString()}] ✅ Login successful`);
        login(response.user);
        // Navigate to home - Home page will check if survey is needed
        setTimeout(() => navigate('/'), 500);
      } else {
        const errorMsg = response.message || 'Login failed - no response data';
        setError(`❌ ${errorMsg}`);
        setDebugInfo(`[${new Date().toLocaleTimeString()}] Login rejected: ${errorMsg}`);
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
    <div className="page login-page">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="Email or Username"
          disabled={isLoading}
          required
          autoComplete="email"
        />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Password"
          disabled={isLoading}
          required
          autoComplete="current-password"
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      {/* Error message with visual emphasis */}
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
        </div>
      )}
      
      {/* Success indicator while loading */}
      {isLoading && debugInfo && (
        <p className="loading-info">⏳ {debugInfo}</p>
      )}

      <p style={{ marginTop: '15px', textAlign: 'center' }}>
        Don't have an account? <a href="/register" style={{ color: 'var(--primary-cyan)', textDecoration: 'underline' }}>Register here</a>
      </p>
    </div>
  );
};

export default Login;
