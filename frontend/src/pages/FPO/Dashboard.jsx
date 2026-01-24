import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const FPODashboard = () => {
  const [applications, setApplications] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [products, setProducts] = useState([]);
  const [expiredProducts, setExpiredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('applications');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appsRes, farmersRes, productsRes, expiredRes] = await Promise.all([
        axios.get('/api/fpo/applications'),
        axios.get('/api/fpo/farmers'),
        axios.get('/api/fpo/products'),
        axios.get('/api/fpo/products/expired'),
      ]);
      console.log('Farmers data received:', farmersRes.data.farmers);
      setApplications(appsRes.data.applications);
      setFarmers(farmersRes.data.farmers);
      setProducts(productsRes.data.products);
      setExpiredProducts(expiredRes.data.products);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await axios.put(`/api/fpo/applications/${userId}/approve`);
      alert('Application approved successfully!');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error approving application');
    }
  };

  const handleReject = async (userId) => {
    if (window.confirm('Are you sure you want to reject this application?')) {
      try {
        await axios.put(`/api/fpo/applications/${userId}/reject`);
        alert('Application rejected');
        fetchData();
      } catch (error) {
        alert(error.response?.data?.message || 'Error rejecting application');
      }
    }
  };

  const handleRemoveFarmer = async (userId) => {
    console.log('Attempting to remove farmer with userId:', userId);
    if (window.confirm('Are you sure you want to remove this farmer? This action cannot be undone.')) {
      try {
        const response = await axios.put(`/api/fpo/farmers/${userId}/remove`);
        console.log('Remove farmer response:', response.data);
        alert('Farmer removed successfully!');
        fetchData();
      } catch (error) {
        console.error('Error removing farmer:', error.response?.data);
        alert(error.response?.data?.message || 'Error removing farmer');
      }
    }
  };

  const handleRemoveProduct = async (productId) => {
    if (window.confirm('Are you sure you want to permanently delete this product? This action cannot be undone.')) {
      try {
        await axios.put(`/api/fpo/products/${productId}/remove`);
        alert('Product deleted permanently from system!');
        fetchData();
      } catch (error) {
        alert(error.response?.data?.message || 'Error removing product');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="fpo-dashboard">
      <div className="dashboard-header">
        <h1>FPO Portal</h1>
        <p>Manage farmer applications and monitor products</p>
      </div>

      <div className="tabs">
        <button
          className={activeTab === 'applications' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('applications')}
        >
          Applications ({applications.length})
        </button>
        <button
          className={activeTab === 'farmers' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('farmers')}
        >
          Farmers ({farmers.length})
        </button>
        <button
          className={activeTab === 'products' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('products')}
        >
          Products ({products.length})
        </button>
        <button
          className={activeTab === 'expired' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('expired')}
        >
          Expired ({expiredProducts.length})
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'applications' && (
          <div className="applications-list">
            {applications.map((app) => (
              <div key={app._id} className="application-card">
                <div className="application-info">
                  <h3>{app.name}</h3>
                  <p>Email: {app.email}</p>
                  <p>Farming Type: {app.farmerApplication?.farmingType || '—'}</p>
                  <p>Location: {app.farmerApplication?.location || '—'}</p>
                  <p>Products: {app.farmerApplication?.cultivatedProducts?.join(', ') || '—'}</p>
                </div>
                <div className="application-actions">
                  <button onClick={() => handleApprove(app.userId)} className="btn-primary">
                    Approve
                  </button>
                  <button onClick={() => handleReject(app.userId)} className="btn-danger">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'farmers' && (
          <div className="farmers-list">
            {farmers.map((farmer) => (
              <div key={farmer._id} className="farmer-card">
                <div className="farmer-info">
                  <h3>{farmer.name}</h3>
                  <p>Email: {farmer.email}</p>
                  <p>Contact: {farmer.contact || '—'}</p>
                  <p>Address: {farmer.address || '—'}</p>
                </div>
                <div className="farmer-actions">
                  <button onClick={() => handleRemoveFarmer(farmer.userId)} className="btn-danger">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="products-list">
            {products.map((product) => (
              <div key={product._id} className="product-card">
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p>Type: {product.productType}</p>
                  <p>Quantity: {product.quantity}</p>
                  <p>Price: ₹{product.finalPrice}</p>
                  <p>Farmer: {product.userId?.name || 'Unknown'}</p>
                  <p>Status: {product.status}</p>
                </div>
                <div className="product-actions">
                  <button onClick={() => handleRemoveProduct(product.productId)} className="btn-danger">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'expired' && (
          <div className="expired-products-list">
            {expiredProducts.map((product) => (
              <div key={product._id} className="product-card expired">
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p>Type: {product.productType}</p>
                  <p>Quantity: {product.quantity}</p>
                  <p>Farmer: {product.userId?.name || 'Unknown'}</p>
                  <p>Expired: {new Date(product.expirationDate).toLocaleDateString()}</p>
                </div>
                <button onClick={() => handleRemoveProduct(product.productId)} className="btn-danger">
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FPODashboard;

