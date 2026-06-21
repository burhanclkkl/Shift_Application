import React, { useEffect, useState } from 'react';
import { 
  CalendarDays, MousePointer2, MoveVertical, Layers, 
  Moon, Activity, ShieldCheck, ChevronRight, CheckCircle2,
  Users, BarChart3, AlertCircle, ArrowUpDown
} from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page-premium">
      {/* Dynamic Backgrounds */}
      <div className="ambient-bg ambient-1"></div>
      <div className="ambient-bg ambient-2"></div>
      <div className="ambient-bg ambient-3"></div>



      {/* Hero Section */}
      <header className="premium-hero">
        <div className="hero-content">
          <div className="hero-badge">Yönetici Paneli Sürüm 2.0 Yayında 🎉</div>
          <h1 className="hero-title">
            Vardiya Yönetiminde <br/>
            <span className="text-gradient-primary">Yeni Bir Standart.</span>
          </h1>
          <p className="hero-subtitle">
            Gelişmiş sürükle-bırak teknolojisi, akıllı çakışma algılama ve esnek boyutlandırma özellikleriyle
            tüm şirketinizin çalışma takvimini saniyeler içinde tasarlayın.
          </p>
          <div className="hero-actions">
            <a href="/login" className="btn-primary-large">
              Hemen Başla <ChevronRight size={20} />
            </a>
          </div>
        </div>

        {/* Hero Visual - Floating UI */}
        <div className="hero-visual-showcase">
          <div className="floating-ui-card ui-main">
            <div className="ui-header">
              <div className="mac-dots"><span className="red"></span><span className="yellow"></span><span className="green"></span></div>
              <div className="ui-title">Haftalık Planlayıcı</div>
            </div>
            <div className="ui-body">
              <div className="mock-grid">
                <div className="mock-col time-col">
                  <span>08:00</span><span>09:00</span><span>10:00</span>
                </div>
                <div className="mock-col day-col">
                  <div className="day-header">Pazartesi</div>
                  <div className="mock-shift-block drag-anim">
                    <span className="name">Burhan A.</span>
                    <span className="time">08:00 - 16:00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="floating-badge badge-1">
            <ShieldCheck size={20} /> %100 Çakışma Koruması
          </div>
          <div className="floating-badge badge-2">
            <MousePointer2 size={20} /> Sürükle ve Bırak
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section id="analytics" className="premium-stats-section">
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon"><MousePointer2 size={32} /></div>
            <h3 className="stat-number">1 Sn</h3>
            <p className="stat-desc">Vardiya Atama Hızı</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><ShieldCheck size={32} /></div>
            <h3 className="stat-number">%100</h3>
            <p className="stat-desc">Çakışma Koruması</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><Activity size={32} /></div>
            <h3 className="stat-number">5 Kat</h3>
            <p className="stat-desc">Daha Hızlı Planlama</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><BarChart3 size={32} /></div>
            <h3 className="stat-number">7/24</h3>
            <p className="stat-desc">Erişim & İzleme</p>
          </div>
        </div>
      </section>

      {/* Easiness Section */}
      <section id="easiness" className="premium-easiness-section">
        <div className="easiness-content">
          <h2>Excel Karmaşasına Son!</h2>
          <p>Sıfır klavye kullanarak sadece sürükle-bırak yöntemleriyle bir haftalık devasa planları dakikalar içinde hazırlayın. Yöneticiler için öğrenme eğrisi sıfırdır.</p>
        </div>
      </section>

      {/* Detail Features Vertical Layout */}
      <section id="features" className="premium-features-section">
        <div className="section-heading">
          <h2>Yöneticiler İçin Üstün Yetenekler</h2>
          <p>Her bir özellik, operasyonel hızınızı artırmak ve hata payını sıfıra indirmek için özel tasarlandı.</p>
        </div>

        <div className="feature-showcase-container">
          
          {/* Feature 1: Sürükle Bırak */}
          <div className="feature-row">
            <div className="feature-text">
              <div className="icon-wrapper blue"><MousePointer2 size={28} /></div>
              <h3>Pürüzsüz Sürükle-Bırak Deneyimi</h3>
              <p>Personelinizi sol listeden tutup, takvimdeki istediğiniz gün ve saatin üzerine bırakın. Hiçbir form doldurmadan, sadece farenizi kullanarak devasa planlamaları dakikalar içinde bitirin.</p>
              <ul className="feature-bullets">
                <li><CheckCircle2 size={18} /> Anında hücre algılama ve hizalama</li>
                <li><CheckCircle2 size={18} /> Otomatik saat hesaplaması</li>
              </ul>
            </div>
            <div className="feature-visual">
              <div className="interactive-mock mock-drag">
                <div className="mock-cursor"><MousePointer2 size={24} color="#000" /></div>
                <div className="mock-employee-card">Ahmet K. (Yazılım)</div>
                <div className="mock-drop-zone">09:00 - 10:00</div>
              </div>
            </div>
          </div>

          {/* Feature 2: Yukarı/Aşağı Esnetme (Resizing) */}
          <div className="feature-row reverse">
            <div className="feature-text">
              <div className="icon-wrapper purple"><ArrowUpDown size={28} /></div>
              <h3>Dinamik Vardiya Esnetme (Resizing)</h3>
              <p>Bir vardiyanın süresini mi değiştireceksiniz? Kartın üst veya alt kenarından tutup çekmeniz yeterli! Siz sürüklerken saatler gerçek zamanlı olarak değişir, tam istediğiniz dakikada bırakırsınız.</p>
              <ul className="feature-bullets">
                <li><CheckCircle2 size={18} /> Yukarı çekerek başlangıç saatini erkene alma</li>
                <li><CheckCircle2 size={18} /> Aşağı çekerek bitiş saatini uzatma</li>
                <li><CheckCircle2 size={18} /> Anlık saat önizlemesi (Örn: 08:30 - 17:45)</li>
              </ul>
            </div>
            <div className="feature-visual">
              <div className="interactive-mock mock-resize">
                <div className="resize-handle top"></div>
                <div className="mock-shift resizing-active">
                  <div className="shift-time-live">07:30 - 16:00</div>
                  <div className="shift-name">Merve S.</div>
                </div>
                <div className="resize-handle bottom"></div>
                <div className="mock-cursor-resize"><MoveVertical size={24} color="#000" /></div>
              </div>
            </div>
          </div>

          {/* Feature 3: Çakışma ve Yan Yana Dizilme */}
          <div className="feature-row">
            <div className="feature-text">
              <div className="icon-wrapper orange"><Layers size={28} /></div>
              <h3>Akıllı Hücre İçi Optimizasyon (Overlapping)</h3>
              <p>Aynı gün ve saatte çalışan birden fazla personeliniz olduğunda kartlar üst üste binmez. Sistem, gelişmiş bir algoritma ile çakışan kartları kusursuzca daraltır ve yan yana dizer.</p>
              <ul className="feature-bullets">
                <li><CheckCircle2 size={18} /> Sonsuz sayıda personeli yan yana dizebilme</li>
                <li><CheckCircle2 size={18} /> Matematiksel olarak eşit alan paylaşımı</li>
                <li><CheckCircle2 size={18} /> Hiçbir bilginin okunmaz hale gelmemesi</li>
              </ul>
            </div>
            <div className="feature-visual">
              <div className="interactive-mock mock-overlap">
                <div className="overlap-container">
                  <div className="mock-shift half left">09:00 - 17:00 <br/>Ali Y.</div>
                  <div className="mock-shift half right">10:00 - 18:00 <br/>Can T.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 4: Gece Vardiyaları */}
          <div className="feature-row reverse">
            <div className="feature-text">
              <div className="icon-wrapper indigo"><Moon size={28} /></div>
              <h3>Gelişmiş Gece Vardiyası Algoritması</h3>
              <p>Personeliniz gece 23:00'te işe başlayıp sabah 07:00'de mi çıkıyor? Sistem, "bitiş saatinin başlangıçtan küçük olması" durumunu otomatik algılar ve vardiyanın ikinci yarısını ertesi günün sabahına görsel olarak sarkıtır.</p>
              <ul className="feature-bullets">
                <li><CheckCircle2 size={18} /> Sıfır konfigürasyonla gün aşırı hesaplama</li>
                <li><CheckCircle2 size={18} /> Ertesi günün 00:00 sütununda otomatik gösterim</li>
              </ul>
            </div>
            <div className="feature-visual">
              <div className="interactive-mock mock-night">
                <div className="day-col">
                  <div className="header">Salı</div>
                  <div className="mock-shift night-start">23:00 Başlangıç</div>
                </div>
                <div className="day-col">
                  <div className="header">Çarşamba</div>
                  <div className="mock-shift night-end">07:00 Bitiş</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 5: Kontrol & Güvenlik */}
          <div className="feature-row">
            <div className="feature-text">
              <div className="icon-wrapper red"><AlertCircle size={28} /></div>
              <h3>Gerçek Zamanlı Hata Önleyici Bariyerler</h3>
              <p>Aynı personeli aynı saatte farklı bir departmana mı atamaya çalıştınız? Veya izinli olduğu bir güne mi? ShiftApp sizi anında uyarır ve operasyonel hataları veritabanına kaydetmeden önce engeller.</p>
              <ul className="feature-bullets">
                <li><CheckCircle2 size={18} /> Çift atama (Double-booking) engeli</li>
                <li><CheckCircle2 size={18} /> Anında ekranda beliren görsel uyarılar</li>
              </ul>
            </div>
            <div className="feature-visual">
              <div className="interactive-mock mock-error">
                <div className="error-toast">
                  <AlertCircle size={20} />
                  <span>Hata: Burhan A. zaten 09:00-17:00 arası görevli!</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>


    </div>
  );
};

export default LandingPage;
