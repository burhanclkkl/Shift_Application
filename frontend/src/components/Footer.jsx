import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-glow"></div>
      <div className="footer-container">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">Shift<span className="accent">App</span></span>
          </Link>
          <p className="footer-description">
            Akıllı Vardiya Yönetimi ile Zamanı Yönetin. Yöneticiler için çakışmasız, esnek ve pratik planlama platformu.
          </p>
        </div>

        <div className="footer-contact">
          <h4>İletişim</h4>
          <p>Destek, soru ve ortaklık talepleriniz için bize ulaşın:</p>
          <a href="mailto:support@shiftapp.com" className="footer-email">support@shiftapp.com</a>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>&copy; {new Date().getFullYear()} ShiftApp. Tüm hakları saklıdır.</p>
          <div className="footer-legal">
            <Link to="/privacy">Gizlilik Politikası</Link>
            <Link to="/terms">Kullanım Şartları</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
