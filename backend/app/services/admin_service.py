from app.models.department import Department
from app.models.audit_log import AuditLog
from app.extensions import db

class AdminService:

    @staticmethod
    def create_department(name, company_id, actor_id):
        """Adminin kendi şirketine özel yeni bir departman eklemesini sağlar"""
        # Aynı şirkette aynı isimde iki departman olamaz kontrolü
        existing = Department.query.filter_by(name=name, company_id=company_id).first()
        if existing:
            return {"error": f"'{name}' adında bir departman şirketinizde zaten mevcut."}, 400

        new_dept = Department(name=name, company_id=company_id)
        db.session.add(new_dept)
        db.session.commit()

        # İşlem loglama
        log = AuditLog(user_id=actor_id, action=f"Şirkete yeni departman eklendi: {name} (Company ID: {company_id})")
        db.session.add(log)
        db.session.commit()

        return {"message": f"'{name}' departmanı başarıyla oluşturuldu.", "department_id": new_dept.id}, 201

    @staticmethod
    def get_my_departments(company_id):
        """
        Sadece istek atan adminin şirketine ait departmanları ve personel sayılarını
        tek bir sorgu ile verimli bir şekilde listeler.
        """
        from sqlalchemy import func
        from app.models.employee import Employee

        # N+1 query problemini önlemek için join ve count kullanımı
        query = db.session.query(
            Department.id,
            Department.name,
            func.count(Employee.id).label('employee_count')
        ).outerjoin(Employee, Department.id == Employee.department_id).filter(Department.company_id == company_id).group_by(Department.id)
        
        departments = [{"id": d.id, "name": d.name, "employee_count": d.employee_count} for d in query.all()]
        return departments, 200

    @staticmethod
    def update_department(department_id, name, company_id, actor_id):
        """Adminin kendi şirketine ait bir departmanı güncellemesini sağlar"""
        # Güvenlik Kontrolü: Departman var mı ve bu şirkete mi ait?
        dept = Department.query.filter_by(id=department_id, company_id=company_id).first()
        if not dept:
            return {"error": "Departman bulunamadı veya bu işlem için yetkiniz yok."}, 404

        if not name or not name.strip():
            return {"error": "Departman adı boş olamaz."}, 400

        name = name.strip()
        if name == dept.name:
            return {"message": "Herhangi bir değişiklik yapılmadı."}, 200

        # Başka bir departman ismiyle çakışma kontrolü
        existing = Department.query.filter_by(name=name, company_id=company_id).first()
        if existing and existing.id != department_id:
            return {"error": f"'{name}' adında başka bir departman zaten mevcut."}, 400

        old_name = dept.name
        dept.name = name
        db.session.commit()

        # İşlem loglama
        log = AuditLog(user_id=actor_id, action=f"Departman ismi güncellendi: {old_name} -> {name}")
        db.session.add(log)
        db.session.commit()

        return {"message": "Departman başarıyla güncellendi."}, 200

    @staticmethod
    def delete_department(department_id, company_id, actor_id):
        """Adminin kendi şirketine ait bir departmanı silmesini sağlar"""
        dept = Department.query.filter_by(id=department_id, company_id=company_id).first()
        if not dept:
            return {"error": "Departman bulunamadı veya bu işlem için yetkiniz yok."}, 404

        # Kurumsal Kontrol: Eğer departmana bağlı personeller varsa silme engellenmeli veya uyarılmalı
        if len(dept.employees) > 0:
            return {"error": "Bu departmana bağlı personeller bulunmaktadır. Önce personellerin departmanını değiştiriniz."}, 400

        dept_name = dept.name
        db.session.delete(dept)
        db.session.commit()

        # İşlem loglama
        log = AuditLog(user_id=actor_id, action=f"Departman silindi: {dept_name}")
        db.session.add(log)
        db.session.commit()

        return {"message": f"'{dept_name}' departmanı başarıyla silindi."}, 200

    @staticmethod
    def get_audit_logs(company_id=None, is_super_admin=False):
        """Şirkete ait veya (super admin ise) tüm sistem loglarını getirir."""
        from app.models.user import User

        if is_super_admin and not company_id:
            query = db.session.query(
                AuditLog.id,
                AuditLog.action,
                AuditLog.ip_address,
                AuditLog.timestamp,
                User.email
            ).outerjoin(User, AuditLog.user_id == User.id).order_by(AuditLog.timestamp.desc())
        else:
            query = db.session.query(
                AuditLog.id,
                AuditLog.action,
                AuditLog.ip_address,
                AuditLog.timestamp,
                User.email
            ).join(User, AuditLog.user_id == User.id).filter(User.company_id == company_id).order_by(AuditLog.timestamp.desc())

        logs = query.all()
        result = []
        for l in logs:
            result.append({
                "id": l.id,
                "user_email": l.email if l.email else "Sistem",
                "action": l.action,
                "ip_address": l.ip_address,
                "timestamp": l.timestamp.strftime("%Y-%m-%d %H:%M:%S")
            })
        return result, 200