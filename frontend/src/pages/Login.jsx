import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  console.log('🔵 LOGIN COMPONENT RENDERED');
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log('🔵 Attempting login with:', formData.email);
    
    const result = await login(formData.email, formData.password);
    console.log('🔵 Login result:', result);
    
    if (result.success) {
      console.log('🔵 Login successful, user:', result.user);
      const roleRoutes = {
        admin: '/admin',
        farmer: '/farmer',
        fpo: '/fpo',
        user: '/user',
      };
      const targetRoute = roleRoutes[result.user?.role] || '/user';
      console.log('🔵 Navigating to:', targetRoute);
      navigate(targetRoute);
    } else {
      console.log('🔵 Login failed:', result.message);
      setError(result.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>QRGanic</h1>
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label className="form-label">Email Address *</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your registered email address"
            value={formData.email}
            onChange={handleChange}
            className="input-field"
            required
          />
          <label className="form-label">Password *</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            className="input-field"
            required
          />
          <button type="submit" className="btn-primary">
            Login
          </button>
        </form>
        <p className="register-link">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

