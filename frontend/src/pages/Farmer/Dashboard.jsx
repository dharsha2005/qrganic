import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const FarmerDashboard = () => {
  const [myProducts, setMyProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [activeTab, setActiveTab] = useState('my-products');
  const [productForm, setProductForm] = useState({
    name: '',
    productType: 'Food',
    harvestTime: '',
    dueDate: '',
    manuresUsed: '',
    fertilizersUsed: '',
    testsDone: '',
    initialPrice: '',
    finalPrice: '',
    quantity: '',
    quality: 'Grade A',
    location: '',
  });

  useEffect(() => {
    fetchMyProducts();
    fetchAllProducts();
  }, []);

  const fetchMyProducts = async () => {
    try {
      const response = await axios.get('/api/farmer/products');
      setMyProducts(response.data.products);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const response = await axios.get('/api/user/products');
      setAllProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching all products:', error);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/farmer/products', {
        ...productForm,
        harvestTime: new Date(productForm.harvestTime),
        dueDate: new Date(productForm.dueDate),
        initialPrice: parseFloat(productForm.initialPrice),
        finalPrice: parseFloat(productForm.finalPrice),
        quantity: parseFloat(productForm.quantity),
      });
      setShowProductForm(false);
      setProductForm({
        name: '',
        productType: 'Food',
        harvestTime: '',
        dueDate: '',
        manuresUsed: '',
        fertilizersUsed: '',
        testsDone: '',
        initialPrice: '',
        finalPrice: '',
        quantity: '',
        quality: 'Grade A',
        location: '',
      });
      fetchMyProducts();
      fetchAllProducts();
      alert('Product added successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding product');
    }
  };

  const handleRemoveProduct = async (productId) => {
    if (window.confirm('Are you sure you want to permanently delete this product? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/farmer/products/${productId}`);
        fetchMyProducts();
        fetchAllProducts();
        alert('Product deleted permanently from system!');
      } catch (error) {
        alert(error.response?.data?.message || 'Error removing product');
      }
    }
  };

  const handlePurchase = async (productId) => {
    try {
      const response = await axios.post('/api/user/purchase', { productId });
      alert('Purchase successful! QR code has been sent to your email.');
      fetchAllProducts();
    } catch (error) {
      alert(error.response?.data?.message || 'Purchase failed');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="farmer-dashboard">
      <div className="dashboard-header">
        <h1>Farmer Portal</h1>
        <p>Manage your products and browse marketplace</p>
        <button onClick={() => setShowProductForm(true)} className="btn-primary">
          Add New Product
        </button>
      </div>

      <div className="tabs">
        <button
          className={activeTab === 'my-products' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('my-products')}
        >
          My Products ({myProducts.length})
        </button>
        <button
          className={activeTab === 'marketplace' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('marketplace')}
        >
          Marketplace ({allProducts.length})
        </button>
      </div>

      {activeTab === 'my-products' && (
        <div className="products-grid">
          {myProducts.map((product) => (
            <div key={product._id} className="product-card">
              <div className="product-info">
                <h3>{product.name}</h3>
                <p>Type: {product.productType}</p>
                <p>Quantity: {product.quantity}</p>
                <p>Quality: {product.quality}</p>
                <p>Price: ₹{product.finalPrice}</p>
                <p>Status: {product.status}</p>
                <p>Expires: {new Date(new Date(product.harvestTime).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
              </div>
              <button onClick={() => handleRemoveProduct(product.productId)} className="btn-danger">
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'marketplace' && (
        <div className="products-grid">
          {allProducts.map((product) => (
            <div key={product._id} className="product-card">
              <div className="product-info">
                <h3>{product.name}</h3>
                <p>Type: {product.productType}</p>
                <p>Quantity: {product.quantity}</p>
                <p>Quality: {product.quality}</p>
                <p>Price: ₹{product.finalPrice}</p>
                <p>Location: {product.location}</p>
                <p>Seller: {product.userId?.name || 'Unknown'}</p>
                <p>Expires: {new Date(new Date(product.harvestTime).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
              </div>
              <button 
                onClick={() => handlePurchase(product.productId)} 
                className="btn-primary"
                disabled={product.status !== 'active'}
              >
                {product.status === 'active' ? 'Purchase' : 'Sold'}
              </button>
            </div>
          ))}
        </div>
      )}

      {showProductForm && (
        <div className="modal-overlay" onClick={() => setShowProductForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Product</h2>
            <form onSubmit={handleAddProduct}>
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                placeholder="Enter product name (e.g., Organic Tomatoes, Fresh Potatoes)"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                className="input-field"
                required
              />
              <label className="form-label">Product Type *</label>
              <select
                value={productForm.productType}
                onChange={(e) => setProductForm({ ...productForm, productType: e.target.value })}
                className="select-field"
                required
              >
                <option value="Food">Food - For human consumption</option>
                <option value="Animal Feed">Animal Feed - For livestock</option>
                <option value="Others">Others - Other agricultural products</option>
              </select>
              <label className="form-label">Quantity *</label>
              <input
                type="text"
                placeholder="Enter quantity with unit (e.g., 100kg, 50 boxes, 200 pieces)"
                value={productForm.quantity}
                onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
                className="input-field"
                required
              />
              <label className="form-label">Cultivation Location *</label>
              <input
                type="text"
                placeholder="Enter location where product was cultivated (e.g., Mumbai, Pune)"
                value={productForm.location}
                onChange={(e) => setProductForm({ ...productForm, location: e.target.value })}
                className="input-field"
                required
              />
              <label className="form-label">Harvest Date *</label>
              <input
                type="date"
                placeholder="Select harvest date"
                value={productForm.harvestTime}
                onChange={(e) => setProductForm({ ...productForm, harvestTime: e.target.value })}
                className="input-field"
                required
              />
              <label className="form-label">Due Date *</label>
              <input
                type="date"
                placeholder="Select due date - Last date for sale"
                value={productForm.dueDate}
                onChange={(e) => setProductForm({ ...productForm, dueDate: e.target.value })}
                className="input-field"
                required
              />
              <label className="form-label">Initial Price (₹) *</label>
              <input
                type="number"
                placeholder="Enter initial price per unit (e.g., 50)"
                value={productForm.initialPrice}
                onChange={(e) => setProductForm({ ...productForm, initialPrice: e.target.value })}
                className="input-field"
                required
                min="0"
                step="0.01"
              />
              <label className="form-label">Final Selling Price (₹) *</label>
              <input
                type="number"
                placeholder="Enter final selling price per unit (e.g., 45)"
                value={productForm.finalPrice}
                onChange={(e) => setProductForm({ ...productForm, finalPrice: e.target.value })}
                className="input-field"
                required
                min="0"
                step="0.01"
              />
              <label className="form-label">Quality Grade</label>
              <select
                value={productForm.quality}
                onChange={(e) => setProductForm({ ...productForm, quality: e.target.value })}
                className="select-field"
              >
                <option value="Grade A">Grade A - Premium quality</option>
                <option value="Grade B">Grade B - Good quality</option>
                <option value="Grade C">Grade C - Standard quality</option>
              </select>
              <label className="form-label">Manures Used (Optional)</label>
              <input
                type="text"
                placeholder="List manures used (e.g., Organic compost, Cow dung)"
                value={productForm.manuresUsed}
                onChange={(e) => setProductForm({ ...productForm, manuresUsed: e.target.value })}
                className="input-field"
              />
              <label className="form-label">Fertilizers Used (Optional)</label>
              <input
                type="text"
                placeholder="List fertilizers used (e.g., NPK, Urea) or 'None' for organic"
                value={productForm.fertilizersUsed}
                onChange={(e) => setProductForm({ ...productForm, fertilizersUsed: e.target.value })}
                className="input-field"
              />
              <label className="form-label">Tests Done (Optional)</label>
              <input
                type="text"
                placeholder="List quality tests performed (e.g., Pesticide test, Quality test passed)"
                value={productForm.testsDone}
                onChange={(e) => setProductForm({ ...productForm, testsDone: e.target.value })}
                className="input-field"
              />
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Add Product</button>
                <button type="button" onClick={() => setShowProductForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;

