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

        // Optimistic UI Update: Update state immediately
        const previousCart = { ...cart };
        setCart((prev) => ({
            ...prev,
            items: prev.items.map((item) =>
                item.product._id === itemId
                    ? { ...item, quantity: newQty }
                    : item
            ),
        }));

        try {
            // itemId is the PRODUCT ID
            const res = await axios.put(`/api/cart/${itemId}`, { quantity: newQty });
            // Sync with server response to be sure
            setCart(res.data.cart);
        } catch (error) {
            // Revert on failure
            console.error('Update quantity failed:', error);
            setCart(previousCart);
            alert('Failed to update quantity');
        }
    };

    const handleRemove = async (itemId) => {
        // Optimistic UI Update: Remove item immediately
        const previousCart = { ...cart };
        setCart((prev) => ({
            ...prev,
            items: prev.items.filter((item) => item.product._id !== itemId),
        }));

        try {
            const res = await axios.delete(`/api/cart/${itemId}`);
            if (res.data.success) {
                setCart(res.data.cart);
            } else {
                setCart(previousCart);
                alert('Failed to remove item');
            }
        } catch (error) {
            console.error('Remove error:', error);
            setCart(previousCart);
            alert('Failed to remove item');
        }
    };

    const handleClearCart = async () => {
        if (!window.confirm('Are you sure you want to remove all items from your cart?')) return;

        try {
            const res = await axios.delete('/api/cart');
            if (res.data.success) {
                setCart(res.data.cart);
            }
        } catch (error) {
            console.error('Clear cart error:', error);
            alert('Failed to clear cart');
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

    // Calculate total safely based on current state (which might be optimistic)
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
                    <div className="checkout-actions">
                        <button
                            onClick={handleClearCart}
                            className="btn-clear-cart"
                            style={{ marginRight: '10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer' }}
                        >
                            Clear Cart
                        </button>
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
        </div>
    );
};

export default Cart;
