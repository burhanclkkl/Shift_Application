import React from 'react';
import { Link } from 'react-router-dom';
import './Privacy.css';

const Privacy = () => {
  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <Link to="/" className="back-home-btn">
          ← Ana Sayfaya Dön
        </Link>
        
        <h1 className="privacy-title">Gizlilik Politikası</h1>
        <p className="privacy-date">Son Güncelleme: 21 Haziran 2026</p>

        <section className="privacy-section">
          <h2>1. Giriş</h2>
          <p>
            ShiftApp ("biz", "bize" veya "bizim") olarak, kullanıcılarımızın ("kullanıcı", "siz") gizliliğine ve verilerinin korunmasına büyük önem veriyoruz. Bu Gizlilik Politikası, platformumuzu kullandığınızda kişisel verilerinizin nasıl toplandığını, işlendiğini, saklandığını ve korunduğunu açıklamaktadır.
          </p>
        </section>

        <section className="privacy-section">
          <h2>2. Toplanan Veriler ve Amacı</h2>
          <p>
            ShiftApp, vardiya planlama hizmetlerini yürütmek, hesap güvenliğini sağlamak ve platformu optimize etmek amacıyla sınırlı düzeyde kişisel veri toplar:
          </p>
          <ul>
            <li><strong>Yönetici Bilgileri:</strong> Kayıt aşamasında veya bizimle iletişime geçtiğinizde sağladığınız e-posta adresi, şirket adı ve şifreniz (güvenli bir şekilde scrypt algoritması ile şifrelenir).</li>
            <li><strong>Çalışan/Personel Bilgileri:</strong> Yöneticilerin vardiya atamak amacıyla sisteme eklediği personel isimleri, departman bilgileri ve isteğe bağlı telefon numaraları.</li>
            <li><strong>Kullanım Verileri:</strong> Sisteme giriş zamanları, oluşturulan vardiyalar ve denetim kayıtları (Audit Logs). Bu veriler yasal denetim gereksinimleri ve çakışma önleyici işlemler için tutulur.</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>3. KVKK ve Veri Güvenliği</h2>
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca, ShiftApp üzerinde paylaşılan veriler veri sorumlusu sıfatıyla şirketimiz tarafından güvenli sunucularda saklanır.
          </p>
          <p>
            Verilerinizi yetkisiz erişim, kayıp veya manipülasyona karşı korumak için sektör standardı SSL/TLS şifreleme protokolleri, güçlü şifre özetleme (hashing) algoritmaları ve IP tabanlı erişim kısıtlamaları gibi teknik güvenlik önlemleri uygulamaktayız.
          </p>
        </section>

        <section className="privacy-section">
          <h2>4. Çerezler (Cookies)</h2>
          <p>
            Platformumuz, kullanıcı oturumlarını yönetmek ve kullanıcı deneyimini iyileştirmek için zorunlu teknik çerezler kullanmaktadır. Bu çerezler kişisel kimlik bilgilerini depolamaz ve sadece tarayıcı oturumunuz süresince aktif kalır.
          </p>
        </section>

        <section className="privacy-section">
          <h2>5. Üçüncü Taraflarla Veri Paylaşımı</h2>
          <p>
            ShiftApp, kullanıcıların kişisel verilerini kesinlikle satmaz, kiralamaz veya ticari amaçlarla üçüncü taraflarla paylaşmaz. Verileriniz, yalnızca yasal mercilerden resmi bir talep gelmesi durumunda ve hukuki yükümlülüklerimizin gerektirdiği sınırlar çerçevesinde yetkili kamu kurumlarıyla paylaşılabilecektir.
          </p>
        </section>

        <section className="privacy-section">
          <h2>6. Haklarınız ve İletişim</h2>
          <p>
            KVKK'nın 11. maddesi uyarınca veri sahipleri, verilerinin işlenip işlenmediğini öğrenme, işlenme amacına uygun kullanılıp kullanılmadığını sorgulama ve hatalı işlenmiş verilerin düzeltilmesini talep etme hakkına sahiptir.
          </p>
          <p>
            Gizlilik Politikamız ile ilgili her türlü soru, görüş veya veri silme talebiniz için bizimle doğrudan <a href="mailto:support@shiftapp.com" className="privacy-link">support@shiftapp.com</a> adresinden iletişime geçebilirsiniz.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
