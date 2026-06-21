from app.extensions import db
from datetime import datetime

class Shift(db.Model):
    __tablename__ = 'shifts'

    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    
    # Hem tarihi hem saati tam kurumsal doğrulukla tutmak için DateTime kullanıyoruz
    start_datetime = db.Column(db.DateTime, nullable=False) # Örn: 2026-07-03 09:00:00
    end_datetime = db.Column(db.DateTime, nullable=False)   # Örn: 2026-07-03 17:00:00
    
    # Audit (Denetim): Bu vardiyayı hangi admin sisteme girdi?
    created_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)