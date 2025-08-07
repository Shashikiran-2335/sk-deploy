import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavClick = (path) => {
    navigate(path);
    setMenuOpen(false); // Close the menu
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">Kirana Manager</div>
      <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        &#9776;
      </div>
      <ul className={`navbar-links ${menuOpen ? 'active' : ''}`}>
        <li onClick={() => handleNavClick('/')}>Home</li>
        <li onClick={() => handleNavClick('/borrow')}>Add Borrow</li>
        <li onClick={() => handleNavClick('/log')}>Borrow Log</li>
        <li onClick={() => handleNavClick('/dashboard')}>Dashboard</li>
      </ul>
    </nav>
  );
};

export default Navbar;
