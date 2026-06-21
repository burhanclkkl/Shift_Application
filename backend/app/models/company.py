from app.extensions import db
from datetime import datetime

class Company(db.Model):
    __tablename__ = 'companies' # Veri tabanındaki tablo adı

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False, unique=True) # Şirket adı eşsiz olmalı
    is_active = db.Column(db.Boolean, default=True) # Şirket donduruldu mu?
    
    # İş Analizi maddemiz: Lisans Süresi Yönetimi
    license_start_date = db.Column(db.DateTime, default=datetime.utcnow)
    license_end_date = db.Column(db.DateTime, nullable=False) # Bu tarih geçince sistem kilitlenecek
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Kurumsal İlişkiler (Relationship)
    # Bir şirket silinirse, ona bağlı kullanıcılar, departmanlar ve personeller de otomatik silinir (cascade)
    users = db.relationship('User', backref='company', lazy=True, cascade="all, delete-orphan")
    departments = db.relationship('Department', backref='company', lazy=True, cascade="all, delete-orphan")
    employees = db.relationship('Employee', backref='company', lazy=True, cascade="all, delete-orphan")