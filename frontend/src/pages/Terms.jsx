import React from 'react';
import { Link } from 'react-router-dom';
import './Terms.css';

const Terms = () => {
  return (
    <div className="terms-page">
      <div className="terms-container">
        <Link to="/" className="back-home-btn">
          ← Ana Sayfaya Dön
        </Link>
        
        <h1 className="terms-title">Kullanım Şartları</h1>
        <p className="terms-date">Son Güncelleme: 21 Haziran 2026</p>

        <section className="terms-section">
          <h2>1. Sözleşmenin Kabulü</h2>
          <p>
            ShiftApp web sitesine ve uygulamasına erişerek veya bunları kullanarak, bu Kullanım Şartları sözleşmesinde yer alan tüm hüküm ve koşullara uymayı kabul etmiş olursunuz. Eğer bu şartları kabul etmiyorsanız, platformumuzu kullanmamalısınız.
          </p>
        </section>

        <section className="terms-section">
          <h2>2. Fikri Mülkiyet Hakları</h2>
          <p>
            ShiftApp platformundaki tüm tasarım kodları, arayüz elementleri, logolar, grafikler, metinler ve tescilli algoritmalar (çakışma önleyici vardiya planlama yapısı dahil) şirketimize aittir ve fikri mülkiyet kanunları tarafından korunmaktadır.
          </p>
          <p>
            Yazılı iznimiz olmadan platformdaki herhangi bir içeriğin kopyalanması, tersine mühendislik yapılması, değiştirilmesi veya ticari amaçlarla başka mecralarda yayınlanması kesinlikle yasaktır.
          </p>
        </section>

        <section className="terms-section">
          <h2>3. Kabul Edilebilir Kullanım</h2>
          <p>
            ShiftApp'i kullanırken aşağıdaki kurallara uymayı taahhüt edersiniz:
          </p>
          <ul>
            <li>Sistemi yasalara aykırı, yanıltıcı veya kötü niyetli amaçlarla kullanmamak.</li>
            <li>Diğer kullanıcıların hesap güvenliğini veya sistem performansını riske atacak siber saldırı, spam veya yük bindirme faaliyetlerinde bulunmamak.</li>
            <li>Yetkisiz API çağrıları veya sahte kimliklerle veri erişimi yapmamak.</li>
            <li>Yönetici hesap şifrelerinizi güvende tutmak ve paylaşmamak (şifrenizin güvenliğinden doğrudan hesap sahibi sorumludur).</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>4. Sorumluluk Sınırları</h2>
          <p>
            ShiftApp, planlama süreçlerinizdeki operasyonel verimliliği artırmak için tasarlanmış bir araçtır. Sistem kesintilerinden, geçici veri gecikmelerinden veya yöneticilerin hatalı vardiya planlaması yapmasından kaynaklanabilecek işgücü veya finansal kayıplardan ShiftApp sorumlu tutulamaz.
          </p>
          <p>
            Hizmetimiz "olduğu gibi" ve "kullanılabilir olduğu sürece" esasıyla sunulmaktadır. Operasyonel kesintileri en aza indirmek için altyapımızı sürekli optimize etmeye devam etmekteyiz.
          </p>
        </section>

        <section className="terms-section">
          <h2>5. Değişiklikler ve Fesih</h2>
          <p>
            ShiftApp, bu Kullanım Şartları sözleşmesini dilediği zaman güncelleme hakkını saklı tutar. Sözleşmede yapılan değişiklikler, güncel şartların bu sayfada yayınlanmasıyla birlikte geçerlilik kazanır. Kurallara aykırı kullanım tespiti halinde, ShiftApp ilgili hesapları askıya alma veya sonlandırma hakkını saklı tutar.
          </p>
        </section>

        <section className="terms-section">
          <h2>6. İletişim Bilgileri</h2>
          <p>
            Kullanım Şartları ile ilgili her türlü soru, bildirim veya yasal talepleriniz için bizimle doğrudan <a href="mailto:support@shiftapp.com" className="terms-link">support@shiftapp.com</a> adresi üzerinden iletişime geçebilirsiniz.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Terms;
