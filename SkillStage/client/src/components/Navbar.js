import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);

  // Hide Navbar on login, signup, or root if user not logged in
  if (!user || ['/login', '/signup', '/'].includes(location.pathname)) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
        <div />
        <div />
        <div />
      </div>

      <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
        <Link to="/skills" onClick={() => setMenuOpen(false)}>Browse Skills</Link>
        <Link to="/add-skill" onClick={() => setMenuOpen(false)}>Add Skill</Link>
        <Link to="/my-requests" onClick={() => setMenuOpen(false)}>My Requests</Link>
        <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link> {/* ✅ Added */}
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
