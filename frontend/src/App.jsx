import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/Admin/Dashboard';
import UserDashboard from './pages/User/Dashboard';
import Cart from './pages/User/Cart';
import PurchaseHistory from './pages/User/PurchaseHistory';
import FarmerDashboard from './pages/Farmer/Dashboard';
import FPODashboard from './pages/FPO/Dashboard';
import QRLookup from './pages/QRLookup';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/qr-lookup" element={<QRLookup />} />
            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/user"
              element={
                <PrivateRoute>
                  <UserDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/user/cart"
              element={
                <PrivateRoute>
                  <Cart />
                </PrivateRoute>
              }
            />
            <Route
              path="/user/purchases"
              element={
                <PrivateRoute>
                  <PurchaseHistory />
                </PrivateRoute>
              }
            />
            <Route
              path="/farmer"
              element={
                <PrivateRoute>
                  <FarmerDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/fpo"
              element={
                <PrivateRoute>
                  <FPODashboard />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

