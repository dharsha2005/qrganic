import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, farmers: 0, fpos: 0, products: 0 });
  const [allUsers, setAllUsers] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddFPO, setShowAddFPO] = useState(false);
  const [showAddFarmer, setShowAddFarmer] = useState(false);
  const [fpoForm, setFpoForm] = useState({ name: '', email: '', password: '', address: '', contact: '' });
  const [farmerForm, setFarmerForm] = useState({ name: '', email: '', password: '', address: '', contact: '', fpoId: '', location: '' });
  const [fpos, setFpos] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchFPOs();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard');
      setStats(response.data.stats);
      setAllUsers(response.data.allUsers);
      setAllProducts(response.data.allProducts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const fetchFPOs = async () => {
    try {
      const response = await axios.get('/api/admin/fpos');
      setFpos(response.data.fpos);
    } catch (error) {
      console.error('Error fetching FPOs:', error);
    }
  };

  const handleAddFPO = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/fpo', fpoForm);
      setShowAddFPO(false);
      setFpoForm({ name: '', email: '', password: '', address: '', contact: '' });
      fetchDashboardData();
      fetchFPOs();
      alert('FPO added successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding FPO');
    }
  };

  const handleAddFarmer = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/farmer', farmerForm);
      setShowAddFarmer(false);
      setFarmerForm({ name: '', email: '', password: '', address: '', contact: '', fpoId: '', location: '' });
      fetchDashboardData();
      alert('Farmer added successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding farmer');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin</h1>
        <p>Full control over users, products, and orders</p>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-panel">
          <div className="panel-header">
            <h2>Users and profiles</h2>
            <span className="count">{stats.users + stats.farmers + stats.fpos} total</span>
          </div>
          <div className="panel-actions">
            <button onClick={() => setShowAddFPO(true)} className="btn-primary">Add FPO</button>
            <button onClick={() => setShowAddFarmer(true)} className="btn-primary">Add Farmer</button>
          </div>
          <div className="user-list">
            {allUsers.map((user) => (
              <div key={user._id} className="user-card">
                <div className="user-info">
                  <h3>{user.name}</h3>
                  <p>Role: {user.role}</p>
                  <p>ID: {user.userId}</p>
                  <p>Contact: {user.contact || '—'}</p>
                  <p>FPO: {user.fpoId || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <h2>All products</h2>
            <span className="count">{stats.products} total</span>
          </div>
          <div className="product-list">
            {allProducts.map((product) => (
              <div key={product._id} className="product-card">
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p>Qty: {product.quantity}</p>
                  <p>Quality: {product.quality}</p>
                  <p>Seller: {product.userId?.name || 'Unknown'}</p>
                </div>
                <button className="btn-danger">Remove</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showAddFPO && (
        <div className="modal-overlay" onClick={() => setShowAddFPO(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add New FPO</h2>
            <form onSubmit={handleAddFPO}>
              <label className="form-label">FPO Name *</label>
              <input
                type="text"
                placeholder="Enter FPO organization name (e.g., Mumbai FPO, Pune FPO)"
                value={fpoForm.name}
                onChange={(e) => setFpoForm({ ...fpoForm, name: e.target.value })}
                className="input-field"
                required
              />
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                placeholder="Enter FPO email address (e.g., fpo@example.com)"
                value={fpoForm.email}
                onChange={(e) => setFpoForm({ ...fpoForm, email: e.target.value })}
                className="input-field"
                required
              />
              <label className="form-label">Password *</label>
              <input
                type="password"
                placeholder="Create password for FPO account (min. 6 characters)"
                value={fpoForm.password}
                onChange={(e) => setFpoForm({ ...fpoForm, password: e.target.value })}
                className="input-field"
                required
              />
              <label className="form-label">Location/Address *</label>
              <input
                type="text"
                placeholder="Enter FPO location/region (e.g., Mumbai, Maharashtra) - Used to assign farmers"
                value={fpoForm.address}
                onChange={(e) => setFpoForm({ ...fpoForm, address: e.target.value })}
                className="input-field"
                required
              />
              <label className="form-label">Contact Number (Optional)</label>
              <input
                type="text"
                placeholder="Enter contact number (e.g., +1234567890)"
                value={fpoForm.contact}
                onChange={(e) => setFpoForm({ ...fpoForm, contact: e.target.value })}
                className="input-field"
              />
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Add FPO</button>
                <button type="button" onClick={() => setShowAddFPO(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddFarmer && (
        <div className="modal-overlay" onClick={() => setShowAddFarmer(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Farmer</h2>
            <form onSubmit={handleAddFarmer}>
              <label className="form-label">Farmer Name *</label>
              <input
                type="text"
                placeholder="Enter farmer's full name (e.g., John Doe)"
                value={farmerForm.name}
                onChange={(e) => setFarmerForm({ ...farmerForm, name: e.target.value })}
                className="input-field"
                required
              />
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                placeholder="Enter farmer's email address (e.g., farmer@example.com)"
                value={farmerForm.email}
                onChange={(e) => setFarmerForm({ ...farmerForm, email: e.target.value })}
                className="input-field"
                required
              />
              <label className="form-label">Password *</label>
              <input
                type="password"
                placeholder="Create password for farmer account (min. 6 characters)"
                value={farmerForm.password}
                onChange={(e) => setFarmerForm({ ...farmerForm, password: e.target.value })}
                className="input-field"
                required
              />
              <label className="form-label">Assign FPO *</label>
              <select
                value={farmerForm.fpoId}
                onChange={(e) => setFarmerForm({ ...farmerForm, fpoId: e.target.value })}
                className="select-field"
                required
              >
                <option value="">Select FPO - Choose which FPO will manage this farmer</option>
                {fpos.map((fpo) => (
                  <option key={fpo._id} value={fpo.userId}>{fpo.name} - {fpo.address}</option>
                ))}
              </select>
              <label className="form-label">Farming Location *</label>
              <input
                type="text"
                placeholder="Enter farming location/region (e.g., Mumbai, Pune) - Must match FPO region"
                value={farmerForm.location}
                onChange={(e) => setFarmerForm({ ...farmerForm, location: e.target.value })}
                className="input-field"
                required
              />
              <label className="form-label">Address (Optional)</label>
              <input
                type="text"
                placeholder="Enter complete address (e.g., Street, City, State)"
                value={farmerForm.address}
                onChange={(e) => setFarmerForm({ ...farmerForm, address: e.target.value })}
                className="input-field"
              />
              <label className="form-label">Contact Number (Optional)</label>
              <input
                type="text"
                placeholder="Enter contact number (e.g., +1234567890)"
                value={farmerForm.contact}
                onChange={(e) => setFarmerForm({ ...farmerForm, contact: e.target.value })}
                className="input-field"
              />
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Add Farmer</button>
                <button type="button" onClick={() => setShowAddFarmer(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

