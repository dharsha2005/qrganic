import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Setup axios interceptors for better error handling
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // Don't automatically logout on network errors
        if (!error.response && error.code === 'NETWORK_ERROR') {
          console.log('Network error detected, keeping user logged in');
          return Promise.reject(error);
        }
        // Only logout on 401 Unauthorized
        if (error.response && error.response.status === 401) {
          console.log('Token expired, logging out');
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      // Add timeout to prevent hanging
      const response = await Promise.race([
        axios.get('/api/auth/me'),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        )
      ]);
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user)); // Sync persistent storage
    } catch (error) {
      console.error('Error fetching user:', error);
      // Only logout if token is invalid (401)
      if (error.response && error.response.status === 401) {
        console.log('Token is invalid, logging out');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
      }
      // If it's a network error, server error, or timeout, keep the user logged in with cached data
      else {
        console.log('Network/server/timeout error, keeping user logged in with cached data');
        // Don't logout, keep existing user state from localStorage
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🟢 AuthContext: Making login request to /api/auth/login');
      const response = await axios.post('/api/auth/login', { email, password });
      console.log('🟢 AuthContext: Login response:', response.data);
      const { token: newToken, user: userData } = response.data;

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData)); // Persist user

      setToken(newToken);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      console.log('🟢 AuthContext: Login successful, user set to:', userData);
      return { success: true, user: userData };
    } catch (error) {
      console.log('🟢 AuthContext: Login error:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      const { token: newToken, user: newUser } = response.data;

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser)); // Persist user

      setToken(newToken);
      setUser(newUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      return { success: true, user: newUser };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

