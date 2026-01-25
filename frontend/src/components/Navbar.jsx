import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = window.location.pathname;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    closeMobileMenu();
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
        <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
          QrGanic
        </Link>

        {user && (
          <div className="mobile-menu-icon" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            )}
          </div>
        )}

        <div className={`navbar-links ${isMobileMenuOpen ? 'active' : ''}`}>
          {user && (
            <>
              <Link
                to={getRoleRoute()}
                className={`navbar-link ${location === getRoleRoute() ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Link>
              {user.role === 'user' && (
                <>
                  <Link to="/user/cart" className="navbar-link" onClick={closeMobileMenu}>Cart</Link>
                  <Link to="/user/purchases" className="navbar-link" onClick={closeMobileMenu}>Orders</Link>
                </>
              )}
              <Link to="/qr-lookup" className="navbar-link" onClick={closeMobileMenu}>
                QR Lookup
              </Link>
              <span className="navbar-user">
                {user.name} · {user.role}
              </span>
              <button className="navbar-link theme-btn">
                Light
              </button>
              <button onClick={handleLogout} className="navbar-link logout-btn">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

