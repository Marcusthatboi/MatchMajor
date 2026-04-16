import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register as apiRegister } from '../api/auth';
import { useUser } from '../context/UserContext';
import './Register.css';

const Register = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useUser();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!form.username || !form.email || !form.password) {
      setError('All fields are required');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await apiRegister(form.username, form.email, form.password);
      if (response.success && response.user) {
        register(response.user);
        navigate('/survey');
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Register error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
        />
        <input 
          name="email" 
          value={form.email} 
          onChange={handleChange} 
          placeholder="Email"
          type="email"
          disabled={isLoading}
          required
        />
        <input 
          name="password" 
          type="password" 
          value={form.password} 
          onChange={handleChange} 
          placeholder="Password (min 6 characters)"
          disabled={isLoading}
          required
        />
        <input 
          name="confirmPassword" 
          type="password" 
          value={form.confirmPassword} 
          onChange={handleChange} 
          placeholder="Confirm Password"
          disabled={isLoading}
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Register'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <p style={{ marginTop: '15px', textAlign: 'center' }}>
        Already have an account? <a href="/login" style={{ color: 'var(--primary-cyan)', textDecoration: 'underline' }}>Login here</a>
      </p>
    </div>
  );
};

export default Register;
