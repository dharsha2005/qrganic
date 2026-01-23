import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const res = await axios.get('/api/cart');
            setCart(res.data.cart);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching cart:', error);
            setLoading(false);
        }
    };

    const handleUpdateQuantity = async (itemId, currentQty, change) => {
        const newQty = currentQty + change;
        if (newQty < 1) return;

        try {
            // itemId is the PRODUCT ID (ObjectId) based on my backend implementation
            const res = await axios.put(`/api/cart/${itemId}`, { quantity: newQty });
            setCart(res.data.cart);
        } catch (error) {
            alert('Failed to update quantity');
        }
    };

    const handleRemove = async (itemId) => {
        try {
            const res = await axios.delete(`/api/cart/${itemId}`);
            setCart(res.data.cart);
        } catch (error) {
            alert('Failed to remove item');
        }
    };

    const handleCheckout = async () => {
        setProcessing(true);
        try {
            await axios.post('/api/cart/checkout');
            alert('Checkout successful! QR codes have been emailed.');
            setCart({ ...cart, items: [] });
            navigate('/user/purchases');
        } catch (error) {
            alert(error.response?.data?.message || 'Checkout failed');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="loading">Loading Cart...</div>;

    if (!cart || cart.items.length === 0) {
        return (
            <div className="cart-page">
                <h1>Your Cart</h1>
                <div className="empty-cart">
                    <p>Your cart is empty.</p>
                    <button onClick={() => navigate('/user')} className="btn-primary">Browse Products</button>
                </div>
            </div>
        );
    }

    const total = cart.items.reduce((sum, item) => sum + (item.product.finalPrice * item.quantity), 0);

    return (
        <div className="cart-page">
            <h1>Your Cart</h1>
            <div className="cart-container">
                <div className="cart-items">
                    {cart.items.map((item) => (
                        <div key={item._id} className="cart-item">
                            <div className="item-details">
                                <h3>{item.product.name}</h3>
                                <p>Seller: {item.product.userId || 'Unknown'}</p> {/* Note: user.js getProducts didn't populate userId name. Cart populates product. We didn't populate userId deeper. */}
                                <p>Price: ₹{item.product.finalPrice}</p>
                            </div>
                            <div className="item-actions">
                                <div className="quantity-controls">
                                    <button onClick={() => handleUpdateQuantity(item.product._id, item.quantity, -1)}>-</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => handleUpdateQuantity(item.product._id, item.quantity, 1)}>+</button>
                                </div>
                                <button onClick={() => handleRemove(item.product._id)} className="btn-remove">Remove</button>
                            </div>
                            <div className="item-total">
                                ₹{item.product.finalPrice * item.quantity}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="cart-summary">
                    <h2>Summary</h2>
                    <div className="summary-row">
                        <span>Total Items:</span>
                        <span>{cart.items.reduce((acc, item) => acc + item.quantity, 0)}</span>
                    </div>
                    <div className="summary-row total">
                        <span>Total Price:</span>
                        <span>₹{total}</span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={processing}
                        className="btn-checkout"
                    >
                        {processing ? 'Processing...' : 'Proceed to Checkout'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
