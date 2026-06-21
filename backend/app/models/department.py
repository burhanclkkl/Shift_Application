from app.extensions import db

class Department(db.Model):
    __tablename__ = 'departments'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False) # Örn: "Mutfak"
    
    # Her departman bir şirkete aittir
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)

    # İlişki: Bu departmana bağlı personeller listesi
    employees = db.relationship('Employee', backref='department', lazy=True)