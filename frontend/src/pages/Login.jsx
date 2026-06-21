import React, { useState } from 'react';
import { Zap, Mail, Eye, EyeOff, Lock } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' }); // 'success', 'error' or 'info'
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0); // Spam/ardışık istek önleme süresi

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Eğer halihazırda istek atılıyorsa veya bekleme süresindeyse engelle
    if (loading || cooldown > 0) return;

    setMessage({ text: '', type: '' });
    setLoading(true);

    if (!email || !password) {
      setMessage({ text: 'Lütfen e-posta ve şifrenizi girin.', type: 'error' });
      setLoading(false);
      return;
    }

    try {
      // Backend API bağlantısı
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        // Hatalı giriş durumunda spam/kötü niyetli üst üste tıklamaları engellemek için 3 saniye bekleme süresi koy
        setMessage({ text: data.error || 'Giriş yapılamadı. Bilgilerinizi kontrol edin.', type: 'error' });
        setLoading(false);
        startCooldown(3);
        return;
      }

      // Başarılı giriş durumunda token ve kullanıcı rollerini sakla
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('email', email);

      if (data.role === 'super_admin') {
        setMessage({ text: 'Giriş başarılı! Super Admin paneline yönlendiriliyorsunuz...', type: 'success' });
        setTimeout(() => {
          navigate('/super-admin');
        }, 1000);
      } else {
        setMessage({ 
          text: `Giriş başarılı! Şirket yöneticisi olarak yönlendiriliyorsunuz...`, 
          type: 'success' 
        });
        setTimeout(() => {
          navigate('/admin');
        }, 1000);
      }
    } catch (err) {
      setMessage({ 
        text: 'Backend sunucusuna bağlanılamadı. Lütfen backend uygulamasının port 5001 üzerinde çalıştığından emin olun.', 
        type: 'error' 
      });
      setLoading(false);
      startCooldown(3); // Sunucu kapalıyken de spam istekleri önle
    }
  };

  // Bekleme süresini (cooldown) yöneten fonksiyon
  const startCooldown = (seconds) => {
    setCooldown(seconds);
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (loading || cooldown > 0) return;
    setMessage({ 
      text: 'Şifrenizi sıfırlamak için lütfen şirket yöneticiniz veya sistem yöneticisi ile iletişime geçiniz.', 
      type: 'info' 
    });
  };

  return (
    <div className="login-page">
      {/* Background glowing decorations */}
      <div className="login-glow login-glow-1"></div>
      <div className="login-glow login-glow-2"></div>

      <Link to="/" className="login-back-btn">
        ← Ana Sayfa
      </Link>

      <div className="login-card-container">
        <div className="login-card">
          <div className="login-card-header">
            <div className="login-logo">
              <span className="logo-icon"><Zap size={24} color="#7c3aed" /></span>
              <span className="logo-text">Shift<span className="accent">App</span></span>
            </div>
            <p className="login-subtitle">
              Yönetici hesabınızla giriş yapın
            </p>
          </div>

          {/* Status Message */}
          {message.text && (
            <div className={`status-msg-box ${message.type}`}>
              {message.text}
            </div>
          )}

          {/* Input Form */}
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">E-posta Adresi</label>
              <div className="input-wrapper">
                <span className="input-icon"><Mail size={18} /></span>
                <input 
                  type="email" 
                  id="email" 
                  placeholder="E-posta adresinizi giriniz" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || cooldown > 0}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Şifre</label>
              <div className="input-wrapper">
                <span className="input-icon"><Lock size={18} /></span>
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || cooldown > 0}
                  required
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading || cooldown > 0}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="login-options">
              <button 
                type="button" 
                className="forgot-link-btn" 
                onClick={handleForgotPassword}
                disabled={loading || cooldown > 0}
              >
                Şifremi Unuttum
              </button>
            </div>

            <button type="submit" className="submit-btn" disabled={loading || cooldown > 0}>
              {loading 
                ? 'Bağlanılıyor...' 
                : cooldown > 0 
                  ? `Lütfen Bekleyin (${cooldown}sn)` 
                  : 'Giriş Yap'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
