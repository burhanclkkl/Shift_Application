from app.extensions import db
from datetime import datetime

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True) # İşlemi yapan admin/super_admin
    action = db.Column(db.String(255), nullable=False) # Yapılan işlem (Örn: "Admin Eklendi: ahmet@sirket.com")
    ip_address = db.Column(db.String(45), nullable=True) # Güvenlik için IP kaydı
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)