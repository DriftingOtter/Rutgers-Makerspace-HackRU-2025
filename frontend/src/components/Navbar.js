import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signOutUser, signOutAdmin } from '../firebase/auth';
import rutgersLogo from '../Images/Rutgers_Scarlet_Knights_logo.svg.png';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (user && user.isAdmin) {
        await signOutAdmin();
        // Clear the user from auth context
        setUser(null);
      } else {
        await signOutUser();
      }
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <Link to="/" className="nav-logo-link">
            <img src={rutgersLogo} alt="Rutgers Logo" className="rutgers-logo" />
            <h2>RUmakerspace </h2>
          </Link>
        </div>
        
        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <Link to="/" className="nav-link">Home</Link>
          </li>
          <li className="nav-item">
            <Link to="/about" className="nav-link">About Me</Link>
          </li>
          <li className="nav-item">
            <Link to="/equipment" className="nav-link">Equipment</Link>
          </li>
          {user ? (
            <>
              <li className="nav-item">
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link to="/print-request" className="nav-link print-request-btn">Print Request</Link>
              </li>
              <li className="nav-item user-menu">
                <div className="user-info">
                  <span className="user-name">
                    {user.displayName || user.email}
                  </span>
                  <button 
                    className="logout-btn" 
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              </li>
            </>
          ) : (
            <li className="nav-item">
              <Link to="/login" className="nav-link print-request-btn">Print Request</Link>
            </li>
          )}
        </ul>
        
        <div className="hamburger" onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
