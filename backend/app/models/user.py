from app.extensions import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False) # Şifreleri asla ham tutmayız, şifreleriz!
    
    # Rol Yönetimi: 'super_admin' veya 'admin'
    role = db.Column(db.String(20), nullable=False, default='admin')
    is_active = db.Column(db.Boolean, default=True) # Pasife alınan admin sisteme giremez
    
    # Foreign Key: Her admin bir şirkete bağlıdır. Super Admin'in şirketi olmaz (nullable=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Kurumsal Güvenlik Fonksiyonları
    def set_password(self, password):
        """Dışarıdan gelen ham şifreyi güvenli bir hash'e dönüştürür"""
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256')

    def check_password(self, password):
        """Giriş yapılırken girilen şifre ile hash'i karşılaştırır"""
        return check_password_hash(self.password_hash, password)