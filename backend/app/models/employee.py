from app.extensions import db
from datetime import datetime

class Employee(db.Model):
    __tablename__ = 'employees'

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    phone_number = db.Column(db.String(20), nullable=True) # WhatsApp entegrasyonu için formatlı tutulacak
    is_active = db.Column(db.Boolean, default=True)
    
    # Hangi şirkete ve hangi departmana bağlı?
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # İlişki: Personelin vardiya geçmişi
    shifts = db.relationship('Shift', backref='employee', lazy=True, cascade="all, delete-orphan")