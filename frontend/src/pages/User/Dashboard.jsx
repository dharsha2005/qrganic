import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const UserDashboard = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFarmerForm, setShowFarmerForm] = useState(false);
  const [farmerForm, setFarmerForm] = useState({
    farmingType: '',
    location: '',
    cultivatedProducts: '',
    proofDocuments: [],
  });

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    location: '',
  });

  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, [filters]);

  const fetchProducts = async (currentFilters = filters) => {
    try {
      const params = new URLSearchParams();
      if (currentFilters.search) params.append('search', currentFilters.search);
      if (currentFilters.category) params.append('category', currentFilters.category);
      if (currentFilters.location) params.append('location', currentFilters.location);

      const response = await axios.get(`/api/user/products?${params.toString()}`);
      setProducts(response.data.products);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      const res = await axios.get('/api/cart');
      setCart(res.data.cart);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const addToCart = async (productId) => {
    try {
      await axios.post('/api/cart/add', { productId, quantity: 1 });
      alert('Added to cart!');
      fetchCart(); // Refresh cart after adding
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const removeFromCart = async (productId) => {
    console.log('Attempting to remove from cart:', productId);
    try {
      const response = await axios.delete(`/api/cart/${productId}`);
      console.log('Remove from cart response:', response.data);
      alert('Removed from cart!');
      fetchCart(); // Refresh cart after removing
    } catch (error) {
      console.error('Error removing from cart:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to remove from cart');
    }
  };

  const handlePurchase = async (productId) => {
    try {
      const response = await axios.post('/api/user/purchase', { productId });
      alert('Purchase successful! QR code has been sent to your email.');
      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.message || 'Purchase failed');
    }
  };

  const handleFarmerApplication = async (e) => {
    e.preventDefault();
    try {
      const cultivatedProductsArray = farmerForm.cultivatedProducts
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p);

      await axios.post('/api/user/apply-farmer', {
        ...farmerForm,
        cultivatedProducts: cultivatedProductsArray,
      });
      setShowFarmerForm(false);
      setFarmerForm({ farmingType: '', location: '', cultivatedProducts: '', proofDocuments: [] });
      alert('Application submitted successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Application failed');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <h1>User Portal</h1>
        <p>Browse and purchase certified farmer products</p>
        <button onClick={() => setShowFarmerForm(true)} className="btn-primary">
          Apply to Become a Farmer
        </button>
      </div>

      <div className="filters-section" style={{ maxWidth: '1400px', margin: '0 auto 30px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search..."
          className="input-field"
          style={{ width: '200px' }}
          onChange={(e) => fetchProducts({ ...filters, search: e.target.value })}
        />
        <select
          className="input-field"
          style={{ width: '200px' }}
          onChange={(e) => fetchProducts({ ...filters, category: e.target.value })}
        >
          <option value="">All Categories</option>
          <option value="Food">Food</option>
          <option value="Animal Feed">Animal Feed</option>
          <option value="Others">Others</option>
        </select>
        <input
          type="text"
          placeholder="Location"
          className="input-field"
          style={{ width: '200px' }}
          onChange={(e) => fetchProducts({ ...filters, location: e.target.value })}
        />
      </div>

      <div className="products-grid">
        {products.map((product) => {
          const isInCart = cart?.items?.some(item => 
            item.product._id === product._id || 
            item.product === product._id ||
            (item.product && item.product.toString() === product._id)
          );
          
          return (
            <div key={product._id} className="product-card">
              <div className="product-info">
                <h3>{product.name}</h3>
                <p>Type: {product.productType}</p>
                <p>Quantity: {product.quantity}</p>
                <p>Quality: {product.quality}</p>
                <p>Price: ₹{product.finalPrice}</p>
                <p>Location: {product.location}</p>
                <p>Seller: {product.seller?.name || 'Unknown'}</p>
                {isInCart && <p style={{ color: '#28a745', fontWeight: 'bold' }}>✓ In Cart</p>}
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                {!isInCart ? (
                  <button
                    onClick={() => addToCart(product.productId)}
                    className="btn-primary"
                    style={{ flex: 1 }}
                  >
                    Add to Cart
                  </button>
                ) : (
                  <button
                    onClick={() => removeFromCart(product._id)}
                    className="btn-danger"
                    style={{ flex: 1 }}
                  >
                    Remove from Cart
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showFarmerForm && (
        <div className="modal-overlay" onClick={() => setShowFarmerForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Apply to Become a Farmer</h2>
            <form onSubmit={handleFarmerApplication}>
              <label className="form-label">Farming Type *</label>
              <input
                type="text"
                placeholder="Enter your farming type (e.g., Organic Farming, Traditional Farming)"
                value={farmerForm.farmingType}
                onChange={(e) => setFarmerForm({ ...farmerForm, farmingType: e.target.value })}
                className="input-field"
                required
              />
              <label className="form-label">Location/Region *</label>
              <input
                type="text"
                placeholder="Enter your farming location (e.g., Mumbai, Pune, Delhi) - Used to assign FPO"
                value={farmerForm.location}
                onChange={(e) => setFarmerForm({ ...farmerForm, location: e.target.value })}
                className="input-field"
                required
              />
              <label className="form-label">Cultivated Products *</label>
              <input
                type="text"
                placeholder="List products you cultivate (comma separated, e.g., Tomatoes, Potatoes, Onions)"
                value={farmerForm.cultivatedProducts}
                onChange={(e) => setFarmerForm({ ...farmerForm, cultivatedProducts: e.target.value })}
                className="input-field"
                required
              />
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Submit Application</button>
                <button type="button" onClick={() => setShowFarmerForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;

