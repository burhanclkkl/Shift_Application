import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import './SuperAdminDashboard.css';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'companies', 'add-company', 'logs'
  const [companies, setCompanies] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Yeni şirket ekleme form states
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newManagerEmail, setNewManagerEmail] = useState('');
  const [newManagerPassword, setNewManagerPassword] = useState('');
  const [newLicenseDuration, setNewLicenseDuration] = useState('12'); // Ay olarak
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success'); // 'success' or 'error'

  // Seçilen özel tarihleri tutmak için state
  const [customDates, setCustomDates] = useState({});

  // Düzenleme durumu state'i
  const [editingCompany, setEditingCompany] = useState(null); // { id, name, manager_email, license_end_date, password: '' }

  // Filtre state'leri
  const [companyFilter, setCompanyFilter] = useState('');
  const [superLogFilter, setSuperLogFilter] = useState('');

  // Şirket listesini getir
  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/super-admin/companies`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      } else if (response.status === 401 || response.status === 403) {
        navigate('/login');
      }
    } catch (err) {
      console.error("Şirket verileri yüklenirken hata oluştu:", err);
    }
  };

  // Sistem loglarını getir
  const fetchLogs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/logs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (err) {
      console.error("Log verileri yüklenirken hata oluştu:", err);
    }
  };

  useEffect(() => {
    // Oturum kontrolü
    if (!token || role !== 'super_admin') {
      navigate('/login');
      return;
    }

    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchCompanies(), fetchLogs()]);
      setLoading(false);
    };

    initData();
  }, [token, role, navigate]);

  // Lisans uzatma fonksiyonu (30 gün)
  const handleExtendLicense = async (id, currentLicenseEnd) => {
    try {
      const currentDate = new Date(currentLicenseEnd);
      currentDate.setDate(currentDate.getDate() + 30);
      const newLicenseEnd = currentDate.toISOString().split('T')[0];

      const response = await fetch(`${API_BASE_URL}/api/super-admin/companies/${id}/license`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ license_end_date: newLicenseEnd })
      });

      if (response.ok) {
        setMessageType('success');
        setMessage('Şirket lisans süresi başarıyla 30 gün uzatıldı.');
        fetchCompanies();
        fetchLogs();
        setTimeout(() => setMessage(''), 4000);
      } else {
        const errData = await response.json();
        setMessageType('error');
        setMessage(`Hata: ${errData.error || 'İşlem başarısız.'}`);
      }
    } catch (err) {
      console.error("Lisans uzatılırken hata oluştu:", err);
      setMessageType('error');
      setMessage('Bağlantı hatası oluştu.');
    }
  };

  // Özel lisans tarihi atama fonksiyonu
  const handleCustomLicenseDate = async (id) => {
    const selectedDate = customDates[id];
    if (!selectedDate) {
      setMessageType('error');
      setMessage('Lütfen geçerli bir tarih seçin.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/super-admin/companies/${id}/license`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ license_end_date: selectedDate })
      });

      if (response.ok) {
        setMessageType('success');
        setMessage(`Şirket lisans bitiş tarihi ${selectedDate} olarak güncellendi.`);
        setCustomDates(prev => ({ ...prev, [id]: '' }));
        fetchCompanies();
        fetchLogs();
        setTimeout(() => setMessage(''), 4000);
      } else {
        const errData = await response.json();
        setMessageType('error');
        setMessage(`Hata: ${errData.error || 'İşlem başarısız.'}`);
      }
    } catch (err) {
      console.error("Lisans tarihi güncellenirken hata oluştu:", err);
      setMessageType('error');
      setMessage('Bağlantı hatası oluştu.');
    }
  };

  // Şirket dondurma / aktif etme toggle
  const handleToggleStatus = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/super-admin/companies/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessageType('success');
        setMessage('Şirket erişim durumu başarıyla güncellendi.');
        fetchCompanies();
        fetchLogs();
        setTimeout(() => setMessage(''), 4000);
      } else {
        const errData = await response.json();
        setMessageType('error');
        setMessage(`Hata: ${errData.error || 'İşlem başarısız.'}`);
      }
    } catch (err) {
      console.error("Şirket durumu değiştirilirken hata oluştu:", err);
      setMessageType('error');
      setMessage('Bağlantı hatası oluştu.');
    }
  };

  // Yeni şirket ekleme
  const handleAddCompany = async (e) => {
    e.preventDefault();
    if (!newCompanyName || !newManagerEmail || !newManagerPassword) {
      setMessageType('error');
      setMessage('Lütfen tüm alanları doldurun.');
      return;
    }

    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() + parseInt(newLicenseDuration));
    const licenseEndDateStr = currentDate.toISOString().split('T')[0];

    try {
      const response = await fetch(`${API_BASE_URL}/api/super-admin/companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newCompanyName,
          license_end_date: licenseEndDateStr,
          manager_email: newManagerEmail,
          manager_password: newManagerPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessageType('success');
        setMessage('Yeni kurumsal şirket kaydı başarıyla oluşturuldu ve yönetici temsilcisi tanımlandı.');
        setNewCompanyName('');
        setNewManagerEmail('');
        setNewManagerPassword('');
        setNewLicenseDuration('12');
        fetchCompanies();
        fetchLogs();
        setActiveTab('companies'); // Şirket listesine yönlendir
        setTimeout(() => setMessage(''), 5000);
      } else {
        setMessageType('error');
        setMessage(`Hata: ${data.error || 'Şirket kaydı oluşturulamadı.'}`);
      }
    } catch (err) {
      console.error("Şirket oluşturulurken hata:", err);
      setMessageType('error');
      setMessage('Bağlantı hatası oluştu.');
    }
  };

  // Şirket düzenleme modalını kaydet
  const handleUpdateCompany = async (e) => {
    e.preventDefault();
    if (!editingCompany.name || !editingCompany.manager_email) {
      setMessageType('error');
      setMessage('Lütfen şirket adı ve yönetici e-postasını doldurun.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/super-admin/companies/${editingCompany.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editingCompany.name,
          license_end_date: editingCompany.license_end_date,
          manager_email: editingCompany.manager_email,
          manager_password: editingCompany.password || undefined // Boş bırakıldıysa gönderme
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessageType('success');
        setMessage('Şirket ve yönetici bilgileri başarıyla güncellendi.');
        setEditingCompany(null); // Modalı kapat
        fetchCompanies();
        fetchLogs();
        setTimeout(() => setMessage(''), 4000);
      } else {
        setMessageType('error');
        setMessage(`Hata: ${data.error || 'Bilgiler güncellenemedi.'}`);
      }
    } catch (err) {
      console.error("Şirket güncellenirken hata:", err);
      setMessageType('error');
      setMessage('Bağlantı hatası oluştu.');
    }
  };

  // Çıkış yapma
  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Metrikler
  const totalCompanies = companies.length;
  const activeCompanies = companies.filter(c => c.is_active).length;
  const frozenCompanies = companies.filter(c => !c.is_active).length;

  // Yakın zamanda lisansı bitecek olanlar (30 gün veya daha az kalmış)
  const expiringSoonCompanies = companies.filter(c => {
    const timeDiff = new Date(c.license_end_date) - new Date();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff > 0 && daysDiff <= 30;
  });

  // --- RENDERING SECTIONS ---

  // Sekme 1: Genel Bakış
  const renderOverview = () => (
    <div className="overview-tab">
      <section className="metrics-grid">
        <div className="metric-card">
          <span className="metric-icon">🏢</span>
          <div className="metric-info">
            <h3>Kayıtlı Şirket Sayısı</h3>
            <p className="metric-number">{totalCompanies}</p>
          </div>
        </div>
        <div className="metric-card success">
          <span className="metric-icon">🟢</span>
          <div className="metric-info">
            <h3>Aktif Lisanslı</h3>
            <p className="metric-number">{activeCompanies}</p>
          </div>
        </div>
        <div className="metric-card warning">
          <span className="metric-icon">❄️</span>
          <div className="metric-info">
            <h3>Dondurulmuş Şirketler</h3>
            <p className="metric-number">{frozenCompanies}</p>
          </div>
        </div>
      </section>

      <div className="overview-summary-grid">
        <div className="summary-card expiring-card">
          <h3>⚠️ Lisansı Yakında Bitecek Firmalar (Son 30 Gün)</h3>
          {expiringSoonCompanies.length > 0 ? (
            <div className="expiring-list">
              {expiringSoonCompanies.map(c => {
                const daysLeft = Math.ceil((new Date(c.license_end_date) - new Date()) / (1000 * 3600 * 24));
                return (
                  <div key={c.id} className="expiring-item">
                    <span className="exp-name">{c.name}</span>
                    <span className="exp-badge">{daysLeft} gün kaldı (📅 {c.license_end_date})</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="no-expiring">Lisansı kritik seviyeye yaklaşmış şirket bulunmamaktadır. Harika!</p>
          )}
        </div>

        <div className="summary-card stats-summary-card">
          <h3>⚡ Hızlı Eylemler</h3>
          <div className="quick-actions-list">
            <button onClick={() => setActiveTab('add-company')} className="quick-action-btn primary-action">
              ➕ Yeni Şirket Tanımla
            </button>
            <button onClick={() => setActiveTab('companies')} className="quick-action-btn secondary-action">
              📂 Şirket Listesini İncele
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompaniesList = () => {
    const filtered = companies.filter(c =>
      c.name.toLowerCase().includes(companyFilter.toLowerCase()) ||
      (c.manager_email || '').toLowerCase().includes(companyFilter.toLowerCase())
    );
    return (
    <section className="companies-list-section">
      <div className="section-title-row">
        <h2>Kayıtlı Şirketler</h2>
        <span className="list-count">{totalCompanies} Şirket</span>
      </div>

      <div className="list-filter-bar">
        <span className="filter-icon">🔍</span>
        <input
          type="text"
          className="list-filter-input"
          placeholder="Şirket adı veya yönetici e-postasına göre ara..."
          value={companyFilter}
          onChange={e => setCompanyFilter(e.target.value)}
        />
        {companyFilter && (
          <button className="filter-clear-btn" onClick={() => setCompanyFilter('')}>✕</button>
        )}
      </div>

      <div className="companies-table-container">
        <table className="companies-table">
          <thead>
            <tr>
              <th>Şirket Bilgileri / Yönetici Temsilci</th>
              <th>Lisans Bitiş Tarihi</th>
              <th>Erişim Durumu</th>
              <th>Yönetici Aksiyonları</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? filtered.map(company => (
              <tr key={company.id} className={!company.is_active ? 'row-frozen' : ''}>
                <td>
                  <div className="company-meta">
                    <span className="comp-title">{company.name}</span>
                    <span className="comp-email">{company.manager_email}</span>
                  </div>
                </td>
                <td>
                  <span className={`license-date-badge ${new Date(company.license_end_date) < new Date() ? 'expired' : ''}`}>
                    📅 {company.license_end_date}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${company.is_active ? 'active' : 'frozen'}`}>
                    {company.is_active ? 'Aktif' : 'Donduruldu'}
                  </span>
                </td>
                <td>
                  <div className="actions-cell">
                    <div className="row-actions-group">
                      <button 
                        onClick={() => handleToggleStatus(company.id)} 
                        className={`action-btn-small ${company.is_active ? 'freeze' : 'activate'}`}
                        title={company.is_active ? 'Şirket Erişimini Dondur' : 'Şirket Erişimini Aktifleştir'}
                      >
                        {company.is_active ? '❄️ Dondur' : '⚡ Aktif Et'}
                      </button>
                      <button 
                        onClick={() => handleExtendLicense(company.id, company.license_end_date)} 
                        className="action-btn-small extend"
                        title="Lisans Süresini 30 Gün Uzat"
                      >
                        ➕ 30 Gün Uzat
                      </button>
                      <button 
                        onClick={() => setEditingCompany({ ...company, password: '' })} 
                        className="action-btn-small edit-btn"
                        title="Şirketi Düzenle"
                      >
                        ✏️ Düzenle
                      </button>
                    </div>
                    
                    <div className="custom-date-picker">
                      <input 
                        type="date" 
                        value={customDates[company.id] || ''} 
                        onChange={(e) => setCustomDates({...customDates, [company.id]: e.target.value})}
                        className="custom-date-input"
                        min={new Date().toISOString().split('T')[0]}
                      />
                      <button 
                        onClick={() => handleCustomLicenseDate(company.id)} 
                        className="action-btn-small apply-date"
                        title="Belirtilen Tarihi Lisans Sonu Olarak Ayarla"
                        disabled={!customDates[company.id]}
                      >
                        Uygula
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="4" className="no-logs">{companyFilter ? 'Arama sonucu bulunamadı.' : 'Kayıtlı şirket bulunmamaktadır.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
    );
  };

  // Sekme 3: Yeni Şirket Ekleme Formu
  const renderAddCompanyForm = () => (
    <section className="add-company-section">
      <div className="form-header-row">
        <h2>Yeni Şirket Tanımla</h2>
        <p className="form-description">Sisteme yeni bir kurumsal şirket ekleyin, lisans süresi ve yönetici yetkilerini tanımlayın.</p>
      </div>

      <form onSubmit={handleAddCompany} className="add-company-form long-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Şirket Unvanı / Adı</label>
            <input 
              type="text" 
              placeholder="Örn: Kahve Dünyası A.Ş." 
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Yönetici Temsilci E-postası</label>
            <input 
              type="email" 
              placeholder="yonetici@sirket.com" 
              value={newManagerEmail}
              onChange={(e) => setNewManagerEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Yönetici Temsilci Şifresi</label>
            <input 
              type="password" 
              placeholder="En az 6 karakter girin" 
              value={newManagerPassword}
              onChange={(e) => setNewManagerPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Lisans Geçerlilik Süresi</label>
            <select 
              value={newLicenseDuration}
              onChange={(e) => setNewLicenseDuration(e.target.value)}
            >
              <option value="1">1 Ay Lisans</option>
              <option value="3">3 Ay Lisans</option>
              <option value="6">6 Ay Lisans</option>
              <option value="12">1 Yıl Lisans (Önerilen)</option>
            </select>
          </div>
        </div>

        <button type="submit" className="create-company-btn">
          Yeni Şirket Kaydını Tanımla
        </button>
      </form>
    </section>
  );

  // Sekme 4: Sistem Logları (Audit Logs)
  const renderAuditLogs = () => (
    <section className="audit-logs-section no-margin-top">
      <div className="section-title-row">
        <h2>Sistem İşlem Geçmişi (Audit Logs)</h2>
        <button onClick={fetchLogs} className="refresh-logs-btn">🔄 Listeyi Yenile</button>
      </div>
      <div className="list-filter-bar">
        <span className="filter-icon">🔍</span>
        <input
          type="text"
          className="list-filter-input"
          placeholder="E-posta, eylem veya IP adresine göre ara..."
          value={superLogFilter}
          onChange={e => setSuperLogFilter(e.target.value)}
        />
        {superLogFilter && (
          <button className="filter-clear-btn" onClick={() => setSuperLogFilter('')}>✕</button>
        )}
      </div>
      <div className="logs-table-container">
        <table className="logs-table">
          <thead>
            <tr>
              <th>Tarih / Saat</th>
              <th>İşlemi Gerçekleştiren</th>
              <th>Eylem / Açıklama</th>
              <th>IP Adresi</th>
            </tr>
          </thead>
          <tbody>
            {logs
              .filter(log => {
                const q = superLogFilter.toLowerCase();
                return !q ||
                  (log.user_email || '').toLowerCase().includes(q) ||
                  (log.action || '').toLowerCase().includes(q) ||
                  (log.ip_address || '').includes(q);
              }).length > 0 ? (
              logs
                .filter(log => {
                  const q = superLogFilter.toLowerCase();
                  return !q ||
                    (log.user_email || '').toLowerCase().includes(q) ||
                    (log.action || '').toLowerCase().includes(q) ||
                    (log.ip_address || '').includes(q);
                })
                .map(log => (
                <tr key={log.id}>
                  <td className="log-time">⏱️ {log.timestamp}</td>
                  <td className="log-user">{log.user_email}</td>
                  <td className="log-action">{log.action}</td>
                  <td className="log-ip">{log.ip_address || '127.0.0.1'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-logs">{superLogFilter ? 'Arama sonucu bulunamadı.' : 'Herhangi bir sistem işlemi kaydedilmemiştir.'}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );

  // Düzenleme Modalı Bileşeni (Overlay)
  const renderEditModal = () => (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Şirket ve Yönetici Güncellemesi</h2>
          <button onClick={() => setEditingCompany(null)} className="close-modal-btn">✕</button>
        </div>
        <form onSubmit={handleUpdateCompany} className="modal-form">
          <div className="form-group">
            <label>Şirket Unvanı / Adı</label>
            <input 
              type="text" 
              value={editingCompany.name} 
              onChange={(e) => setEditingCompany({ ...editingCompany, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Yönetici Temsilci E-postası</label>
            <input 
              type="email" 
              value={editingCompany.manager_email} 
              onChange={(e) => setEditingCompany({ ...editingCompany, manager_email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Yönetici Temsilci Şifresi (Değiştirmek istemiyorsanız boş bırakın)</label>
            <input 
              type="password" 
              placeholder="Yeni şifreyi giriniz" 
              value={editingCompany.password} 
              onChange={(e) => setEditingCompany({ ...editingCompany, password: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Lisans Bitiş Tarihi</label>
            <input 
              type="date" 
              value={editingCompany.license_end_date} 
              onChange={(e) => setEditingCompany({ ...editingCompany, license_end_date: e.target.value })}
              required
            />
          </div>

          <div className="modal-footer-buttons">
            <button type="button" onClick={() => setEditingCompany(null)} className="modal-btn cancel">Vazgeç</button>
            <button type="submit" className="modal-btn submit">Değişiklikleri Kaydet</button>
          </div>
        </form>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Yönetici paneli yükleniyor, lütfen bekleyiniz...</p>
      </div>
    );
  }

  return (
    <div className="super-admin-dashboard-layout">
      {/* Sol Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="logo-icon">⚡</span>
          <div className="brand-meta">
            <span className="logo-text">Shift<span className="accent">App</span></span>
            <span className="sidebar-role">Süper Admin</span>
          </div>
        </div>
        
        <nav className="sidebar-menu">
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`sidebar-item ${activeTab === 'overview' ? 'active' : ''}`}
          >
            📊 Genel Bakış
          </button>
          <button 
            onClick={() => setActiveTab('companies')} 
            className={`sidebar-item ${activeTab === 'companies' ? 'active' : ''}`}
          >
            🏢 Şirket Listesi
          </button>
          <button 
            onClick={() => setActiveTab('add-company')} 
            className={`sidebar-item ${activeTab === 'add-company' ? 'active' : ''}`}
          >
            ➕ Şirket Kaydet
          </button>
          <button 
            onClick={() => setActiveTab('logs')} 
            className={`sidebar-item ${activeTab === 'logs' ? 'active' : ''}`}
          >
            ⏱️ Sistem Günlüğü
          </button>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-sidebar-btn">
            ↪ Güvenli Çıkış
          </button>
        </div>
      </aside>

      {/* Sağ Ana İçerik Alanı */}
      <div className="main-content">
        <header className="main-header">
          <div className="header-title">
            <h1>{
              activeTab === 'overview' ? 'Sistem Genel Durumu' :
              activeTab === 'companies' ? 'Şirket Yönetim Paneli' :
              activeTab === 'add-company' ? 'Yeni Kurumsal Şirket Kaydı' :
              'Sistem İşlem Geçmişi (Audit Logs)'
            }</h1>
            <p>Şirketleri, lisans sürelerini ve yönetici erişimlerini tek merkezden yönetin.</p>
          </div>
          <div className="user-profile-badge">
            <span className="user-avatar">👑</span>
            <div className="user-details">
              <span className="user-email">{localStorage.getItem('email') || 'superadmin@shiftapp.com'}</span>
              <span className="user-role-label">Sistem Yöneticisi</span>
            </div>
          </div>
        </header>

        <div className="content-container">
          {message && (
            <div className={`dashboard-alert ${messageType}`}>
              {messageType === 'success' ? '✅' : '❌'} {message}
            </div>
          )}

          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'companies' && renderCompaniesList()}
          {activeTab === 'add-company' && renderAddCompanyForm()}
          {activeTab === 'logs' && renderAuditLogs()}
        </div>
      </div>

      {/* Şirket Düzenleme Modalı */}
      {editingCompany && renderEditModal()}
    </div>
  );
};

export default SuperAdminDashboard;
