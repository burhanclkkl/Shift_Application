import React from 'react';
import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon"><Zap size={24} color="#7c3aed" /></span>
          <span className="logo-text">Shift<span className="accent">App</span></span>
        </Link>
        
        <ul className="navbar-menu">
          <li><a href="#features" className="navbar-link">Özellikler</a></li>
          <li><a href="#easiness" className="navbar-link">Kullanım Kolaylığı</a></li>
          <li><a href="#analytics" className="navbar-link">İstatistikler</a></li>
        </ul>
        
        <div className="navbar-actions">
          <a href="mailto:support@shiftapp.com" className="btn btn-secondary">İletişime Geç</a>
          <Link to="/login" className="btn btn-primary">Giriş Yap</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
