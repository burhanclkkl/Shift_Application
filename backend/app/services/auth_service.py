from app.models.user import User
from app.extensions import db
from flask_jwt_extended import create_access_token
from datetime import datetime

class AuthService:
    
    @staticmethod
    def create_user(email, password, role='admin', company_id=None):
        """Sistemde yeni bir kullanıcı (Admin veya Super Admin) oluşturur"""
        # 1. Rol doğrulaması
        if role not in ['admin', 'super_admin']:
            return {"error": "Geçersiz rol tanımı. 'admin' veya 'super_admin' olmalıdır."}, 400

        # E-posta çakışma kontrolü
        email_check = User.query.filter_by(email=email).first()
        if email_check:
            return {"error": "Bu e-posta adresi zaten kayıtlı."}, 400
            
        # 2. Admin için şirket kontrolü zorunluluğu
        if role == 'admin':
            if not company_id:
                return {"error": "Şirket yöneticisi (admin) kaydetmek için company_id zorunludur."}, 400
            from app.models.company import Company
            company = Company.query.get(company_id)
            if not company:
                return {"error": "Belirtilen şirket bulunamadı."}, 400
        else:
            # Super admin'in şirketi olamaz
            company_id = None
            
        new_user = User(email=email, role=role, company_id=company_id)
        new_user.set_password(password)
        
        db.session.add(new_user)
        db.session.commit()
        
        return {"message": f"Kullanıcı ({role}) başarıyla oluşturuldu: {email}"}, 201

    @staticmethod
    def login_user(email, password):
        """Kullanıcı giriş işlemlerini ve kurumsal kısıtlamaları yönetir"""
        user = User.query.filter_by(email=email).first()
        
        if not user or not user.check_password(password):
            return {"error": "E-posta veya şifre hatalı."}, 401
            
        if not user.is_active:
            return {"error": "Hesabınız pasife alınmıştır."}, 403
            
        if user.role == 'admin' and user.company:
            current_time = datetime.utcnow()
            if not user.company.is_active:
                return {"error": "Şirketinizin erişimi dondurulmuştur."}, 403
            if user.company.license_end_date < current_time:
                return {"error": "Şirketinizin lisans kullanım süresi dolmuştur."}, 403

        additional_claims = {
            "role": user.role,
            "company_id": user.company_id
        }
        access_token = create_access_token(identity=str(user.id), additional_claims=additional_claims)
        
        return {
            "message": "Giriş başarılı",
            "access_token": access_token,
            "role": user.role
        }, 200

    @staticmethod
    def update_profile(user_id, email=None, password=None):
        """Kullanıcının kendi profilini (e-posta, şifre) güncellemesini sağlar."""
        user = User.query.get(user_id)
        if not user:
            return {"error": "Kullanıcı bulunamadı."}, 404

        has_email_change = email is not None and email != user.email
        has_password_change = password is not None and not user.check_password(password)

        if not has_email_change and not has_password_change:
            return {"message": "Herhangi bir değişiklik yapılmadı."}, 200

        if has_email_change:
            # E-postanın başka bir kullanıcı tarafından kullanılıp kullanılmadığını kontrol et
            if User.query.filter(User.id != user_id, User.email == email).first():
                return {"error": "Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor."}, 400
            user.email = email

        if has_password_change:
            user.set_password(password)

        db.session.commit()
        return {"message": "Profiliniz başarıyla güncellendi."}, 200

    @staticmethod
    def get_profile(user_id):
        """Kullanıcının kendi profil bilgilerini getirmesini sağlar."""
        user = User.query.get(user_id)
        if not user:
            return {"error": "Kullanıcı bulunamadı."}, 404
        return {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "company_id": user.company_id,
            "is_active": user.is_active,
            "created_at": user.created_at.strftime("%Y-%m-%d %H:%M:%S")
        }, 200