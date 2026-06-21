from app.models.company import Company
from app.models.user import User
from app.models.audit_log import AuditLog
from app.extensions import db
from datetime import datetime

class SuperAdminService:

    # === ŞİRKET (COMPANY) YÖNETİM METOTLARI ===
    
    @staticmethod
    def create_company(name, license_end_date_str, manager_email, manager_password, actor_id):
        """Yeni bir şirket oluşturur, yöneticisini atar ve loglar"""
        # Boş isim kontrolü
        if not name or not name.strip():
            return {"error": "Şirket adı boş olamaz."}, 400
            
        name = name.strip()
        if Company.query.filter_by(name=name).first():
            return {"error": "Bu isimde bir şirket zaten mevcut."}, 400

        # Yönetici e-posta kontrolü
        if not manager_email or not manager_email.strip():
            return {"error": "Yönetici e-posta adresi boş olamaz."}, 400
        
        manager_email = manager_email.strip().lower()
        if User.query.filter_by(email=manager_email).first():
            return {"error": "Bu e-posta adresiyle kayıtlı bir kullanıcı zaten mevcut."}, 400

        # Yönetici şifre kontrolü
        if not manager_password or not manager_password.strip():
            return {"error": "Yönetici şifresi boş olamaz."}, 400

        try:
            end_date = datetime.strptime(license_end_date_str, "%Y-%m-%d")
        except ValueError:
            return {"error": "Geçersiz tarih formatı. YYYY-MM-DD olmalı."}, 400

        # Şirketi oluştur
        new_company = Company(name=name, license_end_date=end_date)
        db.session.add(new_company)
        db.session.commit() # ID alabilmek için commit

        # Yöneticiyi oluştur
        new_admin = User(
            email=manager_email,
            role="admin",
            is_active=True,
            company_id=new_company.id
        )
        new_admin.set_password(manager_password.strip())
        db.session.add(new_admin)

        # Audit Log Kaydı: Şirket oluşturuldu
        log_company = AuditLog(
            user_id=int(actor_id) if actor_id else None,
            action=f"Yeni şirket oluşturuldu: {name}"
        )
        db.session.add(log_company)

        # Audit Log Kaydı: Yönetici oluşturuldu
        log_admin = AuditLog(
            user_id=int(actor_id) if actor_id else None,
            action=f"Şirket yöneticisi oluşturuldu: {manager_email} (Şirket: {name})"
        )
        db.session.add(log_admin)

        db.session.commit()

        return {
            "message": f"Şirket ({name}) ve yönetici ({manager_email}) başarıyla oluşturuldu.",
            "company_id": new_company.id
        }, 201

    @staticmethod
    def get_all_companies():
        """Tüm şirketleri ve bağlı admin sayılarını listeler"""
        companies = Company.query.all()
        result = []
        for c in companies:
            admin_users = [u for u in c.users if u.role == 'admin']
            manager_email = admin_users[0].email if admin_users else "Yönetici Tanımlanmadı"
            result.append({
                "id": c.id,
                "name": c.name,
                "is_active": c.is_active,
                "license_start_date": c.license_start_date.strftime("%Y-%m-%d %H:%M:%S"),
                "license_end_date": c.license_end_date.strftime("%Y-%m-%d"),
                "admin_count": len(admin_users),
                "manager_email": manager_email
            })
        return result, 200

    @staticmethod
    def update_company(company_id, name, license_end_date_str, manager_email, manager_password, actor_id):
        """Şirketin genel bilgilerini ve yöneticisini günceller"""
        company = Company.query.get(company_id)
        if not company:
            return {"error": "Şirket bulunamadı."}, 404

        has_name_change = name is not None and name.strip() != company.name
        
        has_license_change = False
        if license_end_date_str:
            try:
                new_date = datetime.strptime(license_end_date_str, "%Y-%m-%d")
                has_license_change = new_date != company.license_end_date
            except ValueError:
                return {"error": "Geçersiz tarih formatı. YYYY-MM-DD olmalı."}, 400

        # Yönetici bilgileri güncelleme kontrolü
        admin_user = User.query.filter_by(company_id=company_id, role='admin').first()
        has_email_change = False
        has_password_change = False

        if admin_user:
            has_email_change = manager_email is not None and manager_email.strip().lower() != admin_user.email
            has_password_change = manager_password is not None and manager_password.strip() != ""
            
            if has_email_change:
                new_email = manager_email.strip().lower()
                if User.query.filter_by(email=new_email).first():
                    return {"error": "Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor."}, 400

        if not has_name_change and not has_license_change and not has_email_change and not has_password_change:
            return {"message": "Herhangi bir değişiklik yapılmadı."}, 200

        # Güncellemeleri uygula
        if has_name_change:
            company.name = name.strip()
        
        if has_license_change:
            company.license_end_date = new_date

        if admin_user:
            if has_email_change:
                old_email = admin_user.email
                admin_user.email = manager_email.strip().lower()
                log_email = AuditLog(
                    user_id=int(actor_id) if actor_id else None,
                    action=f"Şirket yöneticisinin e-postası değiştirildi (Şirket: {company.name}): {old_email} -> {admin_user.email}"
                )
                db.session.add(log_email)

            if has_password_change:
                admin_user.set_password(manager_password.strip())
                log_pwd = AuditLog(
                    user_id=int(actor_id) if actor_id else None,
                    action=f"Şirket yöneticisinin şifresi güncellendi (Şirket: {company.name}): {admin_user.email}"
                )
                db.session.add(log_pwd)

        log = AuditLog(user_id=int(actor_id) if actor_id else None, action=f"Şirket genel bilgileri güncellendi (ID: {company_id}): {company.name}")
        db.session.add(log)
        db.session.commit()

        return {"message": "Şirket bilgileri başarıyla güncellendi."}, 200

    @staticmethod
    def update_company_license(company_id, license_end_date_str, actor_id):
        """Şirketin sisteme giriş yapabileceği tarih aralığını (lisans süresini) günceller"""
        company = Company.query.get(company_id)
        if not company:
            return {"error": "Şirket bulunamadı."}, 404

        try:
            new_end_date = datetime.strptime(license_end_date_str, "%Y-%m-%d")
        except ValueError:
            return {"error": "Geçersiz tarih formatı. YYYY-MM-DD olmalı."}, 400

        if company.license_end_date == new_end_date:
            return {"message": "Herhangi bir değişiklik yapılmadı."}, 200

        old_date_str = company.license_end_date.strftime("%Y-%m-%d")
        company.license_end_date = new_end_date
        db.session.commit()

        # Audit Log Kaydı
        log = AuditLog(user_id=int(actor_id) if actor_id else None, action=f"'{company.name}' şirketinin lisans tarihi güncellendi. Eski: {old_date_str} -> Yeni: {license_end_date_str}")
        db.session.add(log)
        db.session.commit()

        return {"message": f"'{company.name}' şirketinin lisans süresi başarıyla güncellendi."}, 200

    @staticmethod
    def toggle_company_status(company_id, actor_id):
        """Şirketi dondurur veya aktifleştirir"""
        company = Company.query.get(company_id)
        if not company:
            return {"error": "Şirket bulunamadı."}, 404

        company.is_active = not company.is_active
        status_text = "Aktif" if company.is_active else "Pasif (Donduruldu)"
        db.session.commit()

        log = AuditLog(user_id=int(actor_id) if actor_id else None, action=f"Şirket durumu değiştirildi (ID: {company_id}): {status_text}")
        db.session.add(log)
        db.session.commit()

        return {"message": f"Şirket durumu güncellendi: {status_text}"}, 200

    @staticmethod
    def delete_company(company_id, actor_id):
        """Şirketi ve ona bağlı her şeyi cascade ile sistemden siler"""
        company = Company.query.get(company_id)
        if not company:
            return {"error": "Şirket bulunamadı."}, 404

        company_name = company.name
        db.session.delete(company)
        db.session.commit()

        log = AuditLog(user_id=int(actor_id) if actor_id else None, action=f"Şirket sistemden silindi: {company_name}")
        db.session.add(log)
        db.session.commit()

        return {"message": f"'{company_name}' şirketi ve bağlı tüm veriler silindi."}, 200


    # === KULLANICI / ADMIN YÖNETİM METOTLARI ===

    @staticmethod
    def get_company_admins(company_id):
        """Belirli bir şirkete ait tüm admin kullanıcılarını listeler"""
        company = Company.query.get(company_id)
        if not company:
            return {"error": "Şirket bulunamadı."}, 404

        admins = User.query.filter_by(company_id=company_id, role='admin').all()
        result = []
        for a in admins:
            result.append({
                "id": a.id,
                "email": a.email,
                "is_active": a.is_active,
                "created_at": a.created_at.strftime("%Y-%m-%d %H:%M:%S")
            })
        return result, 200

    @staticmethod
    def update_user(user_id, email, password, is_active, actor_id):
        """Diğer kullanıcıların (Adminlerin) bilgilerini günceller"""
        user = User.query.get(user_id)
        if not user:
            return {"error": "Kullanıcı bulunamadı."}, 404

        has_email_change = email is not None and email != user.email
        has_password_change = password is not None and not user.check_password(password)
        has_status_change = is_active is not None and is_active != user.is_active

        if not has_email_change and not has_password_change and not has_status_change:
            return {"message": "Herhangi bir değişiklik yapılmadı."}, 200

        if has_email_change:
            if User.query.filter_by(email=email).first():
                return {"error": "Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor."}, 400
            user.email = email

        if has_password_change:
            user.set_password(password)

        if has_status_change:
            user.is_active = is_active

        db.session.commit()

        log = AuditLog(user_id=int(actor_id) if actor_id else None, action=f"Kullanıcı bilgi güncellemesi (ID: {user_id}): {user.email}")
        db.session.add(log)
        db.session.commit()

        return {"message": "Kullanıcı bilgileri başarıyla güncellendi."}, 200

    @staticmethod
    def toggle_user_status(user_id, actor_id):
        """Admin hesabını dondurur veya aktifleştirir"""
        user = User.query.get(user_id)
        if not user:
            return {"error": "Kullanıcı bulunamadı."}, 404

        user.is_active = not user.is_active
        status_text = "Aktif" if user.is_active else "Pasif"
        db.session.commit()

        log = AuditLog(user_id=int(actor_id) if actor_id else None, action=f"Kullanıcı durumu değiştirildi (ID: {user_id}): {status_text}")
        db.session.add(log)
        db.session.commit()

        return {"message": f"Kullanıcı durumu güncellendi: {status_text}"}, 200

    @staticmethod
    def delete_user(user_id, actor_id):
        """Kullanıcıyı (Admini) tamamen siler"""
        user = User.query.get(user_id)
        if not user:
            return {"error": "Kullanıcı bulunamadı."}, 404

        user_email = user.email
        db.session.delete(user)
        db.session.commit()

        log = AuditLog(user_id=int(actor_id) if actor_id else None, action=f"Kullanıcı sistemden silindi: {user_email}")
        db.session.add(log)
        db.session.commit()

        return {"message": f"'{user_email}' kullanıcısı sistemden başarıyla silindi."}, 200