import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleRoute = () => {
    if (!user) return '/login';
    const roleRoutes = {
      admin: '/admin',
      farmer: '/farmer',
      fpo: '/fpo',
      user: '/user',
    };
    return roleRoutes[user.role] || '/login';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          QrGanic
        </Link>
        <div className="navbar-links">
          {user && (
            <>
              <Link
                to={getRoleRoute()}
                className={`navbar-link ${window.location.pathname === getRoleRoute() ? 'active' : ''}`}
              >
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Link>
              {user.role === 'user' && (
                <>
                  <Link to="/user/cart" className="navbar-link">Cart</Link>
                  <Link to="/user/purchases" className="navbar-link">Orders</Link>
                </>
              )}
              <Link to="/qr-lookup" className="navbar-link">
                QR Lookup
              </Link>
              <span className="navbar-user">
                {user.name} · {user.role}
              </span>
              <button onClick={handleLogout} className="navbar-link logout-btn">
                Logout
              </button>
              <button className="navbar-link theme-btn">
                Light
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

