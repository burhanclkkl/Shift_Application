from app.extensions import db

class ShiftTemplate(db.Model):
    __tablename__ = 'shift_templates'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)  # Vardiya Adı
    start_time = db.Column(db.Time, nullable=False)  # Başlangıç Saati (09:00)
    end_time = db.Column(db.Time, nullable=False)    # Bitiş Saati (17:00)
    
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)