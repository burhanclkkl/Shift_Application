import React from 'react';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Background soft glowing colors */}
      <div className="bg-glow bg-glow-1"></div>
      <div className="bg-glow bg-glow-2"></div>
      
      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <span className="badge">Yönetici Paneli Sürüm 1.0</span>
            <h1 className="hero-title">
              Vardiyaları Planlamak <br />
              Artık Çok <span className="gradient-text">Daha Kolay</span>
            </h1>
            <p className="hero-subtitle">
              Yöneticiler için özel tasarlanmış ShiftApp ile personellerinizi organize edin, departmanlar arası çakışmaları önleyin ve vardiyaları tek tıkla yayınlayın.
            </p>
            <div className="hero-actions">
              <a href="mailto:support@shiftapp.com" className="btn-hero btn-hero-primary">İletişime Geçin</a>
              <a href="#features" className="btn-hero btn-hero-secondary">Özellikleri Keşfet</a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="glass-card preview-card">
              <div className="card-header">
                <div className="header-dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <span className="card-title-text">Yönetici Çalışma Alanı</span>
              </div>
              <div className="card-body-preview">
                <div className="preview-top-actions">
                  <span className="panel-subtitle">Aktif Departman: <strong>Yazılım Geliştirme</strong></span>
                  <button className="badge-action">+ Yeni Vardiya Ekle</button>
                </div>
                <div className="preview-table">
                  <div className="table-header-row">
                    <span>Personel</span>
                    <span>Vardiya Saatleri</span>
                    <span>Eylem</span>
                  </div>
                  <div className="table-row">
                    <span className="emp-name">Burhan A.</span>
                    <span className="shift-time">09:00 - 17:00</span>
                    <span className="row-action edit">Düzenle</span>
                  </div>
                  <div className="table-row">
                    <span className="emp-name">Ahmet K.</span>
                    <span className="shift-time">17:00 - 01:00</span>
                    <span className="row-action edit">Düzenle</span>
                  </div>
                  <div className="table-row warning-row">
                    <span className="emp-name">Mehmet Y.</span>
                    <span className="shift-time">09:00 - 17:00</span>
                    <span className="row-badge-warning">⚠️ Saat Çakışması!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section id="analytics" className="stats-section">
        <div className="stats-container">
          <div className="stat-box">
            <h3 className="stat-number">1 Tıkla</h3>
            <p className="stat-desc">Vardiya Atama</p>
          </div>
          <div className="stat-box">
            <h3 className="stat-number">100%</h3>
            <p className="stat-desc">Çakışmasız Planlama</p>
          </div>
          <div className="stat-box">
            <h3 className="stat-number">5 Kat</h3>
            <p className="stat-desc">Daha Kolay Yönetim</p>
          </div>
          <div className="stat-box">
            <h3 className="stat-number">7/24</h3>
            <p className="stat-desc">Erişim & Kontrol</p>
          </div>
        </div>
      </section>

      {/* Vertical Detailed Features Section */}
      <section id="features" className="features-section-vertical">
        <div className="section-header">
          <span className="section-tag">Gelişmiş Arayüz Özellikleri</span>
          <h2 className="section-title">İşinizi Kolaylaştıran Zengin Detaylar</h2>
          <p className="section-subtitle">Operasyonel mükemmellik ve yüksek verimlilik sunan tüm yönetim araçlarını inceleyin.</p>
        </div>

        <div className="vertical-features-container">
          
          {/* Feature 1: Tek Tıkla Vardiya Atama */}
          <div className="vertical-feature-row">
            <div className="vf-content">
              <div className="feature-icon bg-violet">⚡</div>
              <h3>Tek Tıkla Vardiya Atama</h3>
              <p className="vf-description">
                Yöneticilerin en çok vakit kaybettiği karmaşık Excel tablolarını ve kafa karıştırıcı formları geride bırakın. ShiftApp ile saniyeler içinde personellerinizi seçip çalışacakları saat aralığını belirleyebilirsiniz.
              </p>
              <ul className="vf-bullets">
                <li><span>✦</span> Hızlı personel listeleme ve atama</li>
                <li><span>✦</span> Hazır saat şablonları arasından anında seçim</li>
                <li><span>✦</span> Manuel yazma hatalarını sıfıra indiren arayüz</li>
              </ul>
            </div>
            <div className="vf-visual">
              <div className="mini-card ui-simulation">
                <div className="mini-card-header">Vardiya Atama Modülü</div>
                <div className="simulation-body">
                  <div className="form-group-sim">
                    <label>Personel Seçin</label>
                    <div className="select-box-sim">Burhan A. (Yazılım) ▾</div>
                  </div>
                  <div className="form-group-sim">
                    <label>Vardiya Saati</label>
                    <div className="select-box-sim">Sabah Vardiyası (09:00 - 17:00) ▾</div>
                  </div>
                  <button className="btn-sim bg-violet">+ Vardiyaya Ata</button>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Çakışma Önleyici Sistem (Zigzag - Image Left, Text Right) */}
          <div className="vertical-feature-row reverse">
            <div className="vf-content">
              <div className="feature-icon bg-blue">⚠️</div>
              <h3>Çakışma Önleyici Sistem</h3>
              <p className="vf-description">
                Aynı personelin aynı zaman diliminde farklı departmanlarda veya üst üste binen saatlerde görevlendirilmesi operasyonel krizlere yol açar. Gelişmiş çakışma kontrol motorumuz sayesinde sistem bu hataları gerçek zamanlı yakalar.
              </p>
              <ul className="vf-bullets">
                <li><span>✦</span> Çift atamaları anlık olarak tespit etme</li>
                <li><span>✦</span> Kaydetme tuşuna basmadan görsel uyarılar sunma</li>
                <li><span>✦</span> Personel verimliliğini koruyan otomatik güvenlik bariyeri</li>
              </ul>
            </div>
            <div className="vf-visual">
              <div className="mini-card ui-simulation danger-sim">
                <div className="mini-card-header text-danger">⚠️ Hata Tespit Edildi</div>
                <div className="simulation-body">
                  <div className="error-alert-box">
                    <strong>Hata:</strong> Mehmet Y. zaten bu saatte <strong>Tasarım</strong> departmanında görevlidir!
                  </div>
                  <div className="error-visual-timeline">
                    <div className="timeline-block booked">Tasarım (09:00 - 17:00)</div>
                    <div className="timeline-block conflict">Yeni İstek (09:00 - 17:00) ❌</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3: Departman Bazlı Yönetim */}
          <div className="vertical-feature-row">
            <div className="vf-content">
              <div className="feature-icon bg-pink">🏢</div>
              <h3>Departman Bazlı Yönetim</h3>
              <p className="vf-description">
                Tüm personelleri tek bir havuzda görmek karmaşıklığa neden olur. Yazılım, Tasarım, Destek ve Operasyon gibi departmanlarınızı ayrı ayrı gruplayarak, sadece o ekibe odaklanmış özel vardiya çizelgeleri çıkarabilirsiniz.
              </p>
              <ul className="vf-bullets">
                <li><span>✦</span> Bağımsız departman şemaları oluşturma</li>
                <li><span>✦</span> Departmana özel yetkili liderler tanımlama</li>
                <li><span>✦</span> Ekipleri tek tıkla filtreleyip görünümü sadeleştirme</li>
              </ul>
            </div>
            <div className="vf-visual">
              <div className="mini-card ui-simulation">
                <div className="mini-card-header">Departman Seçici</div>
                <div className="simulation-body">
                  <div className="tab-menu-sim">
                    <span className="tab-item active">💻 Yazılım (5)</span>
                    <span className="tab-item">🎨 Tasarım (3)</span>
                    <span className="tab-item">📞 Destek (2)</span>
                  </div>
                  <div className="tab-content-list">
                    <div className="tab-user-row">👥 Burhan A. (Kıdemli Geliştirici)</div>
                    <div className="tab-user-row">👥 Mehmet Y. (Arayüz Geliştirici)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 4: Personel Eşleştirme (Zigzag) */}
          <div className="vertical-feature-row reverse">
            <div className="vf-content">
              <div className="feature-icon bg-orange">👥</div>
              <h3>Personel Eşleştirme & Uyumluluk</h3>
              <p className="vf-description">
                Hangi çalışanın hangi saatlerde veya hangi rollerde çalışmaya uygun olduğunu bilmek doğru planlama için hayati önem taşır. Personellerin uzmanlık alanlarına göre vardiya eşleşmelerini optimize edebilirsiniz.
              </p>
              <ul className="vf-bullets">
                <li><span>✦</span> Personel bazlı çalışabilirlik takibi</li>
                <li><span>✦</span> Departman gereksinimleri ile uzmanlık eşleşmesi</li>
                <li><span>✦</span> Doğru işe doğru personeli en hızlı şekilde atama</li>
              </ul>
            </div>
            <div className="vf-visual">
              <div className="mini-card ui-simulation">
                <div className="mini-card-header">Uzmanlık Eşleştirme</div>
                <div className="simulation-body">
                  <div className="match-card">
                    <span className="match-user">Burhan A.</span>
                    <span className="match-skills">Backend, SQL, Flask</span>
                    <span className="match-status-badge">Yazılıma Uygun ✓</span>
                  </div>
                  <div className="match-card">
                    <span className="match-user">Ahmet K.</span>
                    <span className="match-skills">UI Design, CSS, Figma</span>
                    <span className="match-status-badge blue">Tasarım Uygun ✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 5: Görsel Kontrol Paneli */}
          <div className="vertical-feature-row">
            <div className="vf-content">
              <div className="feature-icon bg-green">📊</div>
              <h3>Görsel Kontrol Paneli</h3>
              <p className="vf-description">
                Tüm haftalık veya aylık planlamanızı geniş, ferah ve göz yormayan aydınlık bir takvim görünümünde inceleyin. Haftanın hangi gününde kimlerin boşta kaldığını veya kimlerin fazla mesai yaptığını görsel olarak takip edin.
              </p>
              <ul className="vf-bullets">
                <li><span>✦</span> Haftalık ve günlük takvim ızgaraları</li>
                <li><span>✦</span> Boşta kalan günlerin ve izinlerin anlık gösterimi</li>
                <li><span>✦</span> Şirket genel işgücü dengesini tek bakışta analiz etme</li>
              </ul>
            </div>
            <div className="vf-visual">
              <div className="mini-card ui-simulation">
                <div className="mini-card-header">Haftalık Dağılım</div>
                <div className="simulation-body">
                  <div className="calendar-grid-sim">
                    <div className="cal-day">Pzt: <span className="cal-val">09:00 - 17:00</span></div>
                    <div className="cal-day">Sal: <span className="cal-val bg-off">İzinli (Boşta)</span></div>
                    <div className="cal-day">Çar: <span className="cal-val">17:00 - 01:00</span></div>
                    <div className="cal-day">Per: <span className="cal-val">09:00 - 17:00</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 6: Anlık Değişiklik Güncelleme (Zigzag) */}
          <div className="vertical-feature-row reverse">
            <div className="vf-content">
              <div className="feature-icon bg-teal">🚀</div>
              <h3>Anlık Değişiklik Güncelleme</h3>
              <p className="vf-description">
                Yapılan her bir planlama değişikliği, sayfayı yenilemenize gerek kalmadan arka plandaki PostgreSQL veri tabanı ile saniyeler içinde senkronize edilir. Tüm yöneticiler aynı güncel planı eşzamanlı olarak görür.
              </p>
              <ul className="vf-bullets">
                <li><span>✦</span> Sayfa yenilemesiz otomatik kaydetme</li>
                <li><span>✦</span> Eşzamanlı veri tabanı güncellemeleri</li>
                <li><span>✦</span> Yöneticiler arası çifte düzenleme çatışmalarını engelleme</li>
              </ul>
            </div>
            <div className="vf-visual">
              <div className="mini-card ui-simulation">
                <div className="mini-card-header">Veri Eşitleme Durumu</div>
                <div className="simulation-body text-center">
                  <div className="sync-pulse-indicator">
                    <span className="pulse-dot"></span>
                    <span className="pulse-text">Veritabanı Senkronize</span>
                  </div>
                  <div className="sync-detail">
                    Son senkronizasyon: <strong>Şimdi</strong>
                  </div>
                  <div className="cloud-icon-sim">☁️ ⇄ 💻</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Ease of Use (Easiness Section) */}
      <section id="easiness" className="easiness-section">
        <div className="easiness-container">
          <div className="easiness-content">
            <span className="section-tag">Kullanım Kolaylığı</span>
            <h2 className="section-title">En Sade ve Anlaşılır Arayüz Deneyimi</h2>
            <p className="easiness-description">
              Saatlerce karmaşık tablolarla uğraşmanıza gerek yok. ShiftApp, her seviyeden yöneticinin rahatça kullanabileceği basit bir deneyim sunar:
            </p>
            <ul className="easiness-list">
              <li>
                <span className="list-icon">✨</span>
                <span><strong>Sürükle & Bırak Sezgisi:</strong> Vardiyaları ve kişileri hızlıca güncelleyin.</span>
              </li>
              <li>
                <span className="list-icon">🎯</span>
                <span><strong>Doğrudan Filtreleme:</strong> Karışıklığı önlemek için tek seferde yalnızca ilgili ekibi listeleyin.</span>
              </li>
              <li>
                <span className="list-icon">📱</span>
                <span><strong>Tam Mobil Uyum:</strong> Ofiste veya yolda fark etmeksizin cep telefonunuzdan vardiyaları yönetin.</span>
              </li>
            </ul>
          </div>
          <div className="easiness-visual">
            <div className="glass-card easiness-preview-card">
              <div className="easiness-header">
                <span className="easiness-avatar">👤</span>
                <div className="easiness-user-info">
                  <span className="username">Yönetici Paneli</span>
                  <span className="role">Burhan Bey (Şirket Yöneticisi)</span>
                </div>
              </div>
              <div className="easiness-actions-list">
                <div className="action-item">
                  <span className="action-check">✓</span>
                  <span><strong>Yazılım Vardiyası</strong> Başarıyla Güncellendi</span>
                </div>
                <div className="action-item">
                  <span className="action-check">✓</span>
                  <span><strong>Ahmet K.</strong> Tasarım Ekibine Atandı</span>
                </div>
                <div className="action-item warning">
                  <span className="action-check">!</span>
                  <span><strong>Çakışma Önleme</strong> Sistemi Aktif durumda</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2>Hemen İletişime Geçin</h2>
          <p>Şirketinizdeki vardiya planlama süreçlerini kolaylaştırmak ve çakışmasız çalışma düzenine geçmek için bize e-posta gönderin.</p>
          <a href="mailto:support@shiftapp.com" className="btn-hero btn-hero-primary">Bizimle İletişime Geçin</a>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
