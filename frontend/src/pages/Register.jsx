import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Register.css';

const Register = () => {
  console.log('🔴 REGISTER COMPONENT RENDERED');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    contact: '',
  });
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const { confirmPassword, ...registerData } = formData;
    // Always register as 'user' by default
    const result = await register({ ...registerData, role: 'user' });

    if (result.success) {
      navigate('/user');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1>QRGanic</h1>
        <h2>Register</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label className="form-label">Full Name *</label>
          <input
            type="text"
            name="name"
            placeholder="Enter your full name (e.g., John Doe)"
            value={formData.name}
            onChange={handleChange}
            className="input-field"
            required
          />
          <label className="form-label">Email Address *</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email (e.g., john@example.com)"
            value={formData.email}
            onChange={handleChange}
            className="input-field"
            required
          />
          <label className="form-label">Password *</label>
          <input
            type="password"
            name="password"
            placeholder="Create a strong password (min. 6 characters)"
            value={formData.password}
            onChange={handleChange}
            className="input-field"
            required
          />
          <label className="form-label">Confirm Password *</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Re-enter your password to confirm"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="input-field"
            required
          />
          <label className="form-label">Address (Optional)</label>
          <input
            type="text"
            name="address"
            placeholder="Enter your address (e.g., City, State, Country)"
            value={formData.address}
            onChange={handleChange}
            className="input-field"
          />
          <label className="form-label">Contact Number (Optional)</label>
          <input
            type="text"
            name="contact"
            placeholder="Enter your phone number (e.g., +1234567890)"
            value={formData.contact}
            onChange={handleChange}
            className="input-field"
          />
          <button type="submit" className="btn-primary">
            Register
          </button>
        </form>
        <p className="login-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

