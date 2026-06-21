import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Footer from './components/Footer';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Login from './pages/Login';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Landing Layout: Ana sayfa (Navbar ve Footer ile birlikte)
const LandingLayout = () => {
  return (
    <>
      <Navbar />
      <LandingPage />
      <Footer />
    </>
  );
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Ana Sayfa */}
          <Route path="/" element={<LandingLayout />} />
          
          {/* Giriş Ekranı (İzole Sayfa) */}
          <Route path="/login" element={<Login />} />
          
          {/* Super Admin Dashboard (İzole Sayfa) */}
          <Route path="/super-admin" element={<SuperAdminDashboard />} />
          
          {/* Company Admin Dashboard (İzole Sayfa) */}
          <Route path="/admin" element={<AdminDashboard />} />
          
          {/* Gizlilik Politikası (İzole Sayfa) */}
          <Route path="/privacy" element={<Privacy />} />
          
          {/* Kullanım Şartları (İzole Sayfa) */}
          <Route path="/terms" element={<Terms />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
