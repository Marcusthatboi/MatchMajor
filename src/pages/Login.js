import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import './Login.css';

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(email, password);
      if (response.success) {
        setUser(response.user);
        navigate('/survey');
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      setError('Login failed');
    }
  };

  const handleBypass = () => {
    // Set a dummy user for testing
    const dummyUser = {
      _id: 'bypass-user',
      username: 'TestUser',
      email: 'test@example.com',
      role: 'user'
    };
    setUser(dummyUser);
    navigate('/survey');
  };

  return (
    <div className="page login-page">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email or Username" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <button type="submit">Login</button>
      </form>
      <button onClick={handleBypass} className="bypass-btn">Bypass Login (For Testing)</button>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default Login;
