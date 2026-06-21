from app.models.employee import Employee
from app.models.department import Department
from app.models.audit_log import AuditLog
from app.extensions import db

class EmployeeService:

    @staticmethod
    def create_employee(first_name, last_name, phone, department_id, company_id, actor_id):
        """Adminin kendi şirketine yeni bir personel eklemesini sağlar"""
        
        # 1. Güvenlik ve Kurumsal Kontrol: Atanmak istenen departman gerçekten bu şirkete mi ait?
        dept = Department.query.filter_by(id=department_id, company_id=company_id).first()
        if not dept:
            return {"error": "Seçilen departman bulunamadı veya bu şirkete ait değil."}, 400

        # 2. Şirket içi benzersiz telefon kontrolü (Opsiyonel ama kurumsal pratik)
        if phone:
            existing_phone = Employee.query.filter_by(phone_number=phone, company_id=company_id).first()
            if existing_phone:
                return {"error": "Bu telefon numarasıyla kayıtlı bir personel zaten var."}, 400

        # 3. Personeli oluştur
        new_employee = Employee(
            first_name=first_name,
            last_name=last_name,
            phone_number=phone,
            department_id=department_id,
            company_id=company_id
        )
        db.session.add(new_employee)
        db.session.commit()

        # Audit Log
        log = AuditLog(user_id=actor_id, action=f"Yeni personel eklendi: {first_name} {last_name} (Departman: {dept.name})")
        db.session.add(log)
        db.session.commit()

        return {
            "message": f"Personel başarıyla oluşturuldu: {first_name} {last_name}",
            "employee_id": new_employee.id
        }, 201

    @staticmethod
    def get_my_employees(company_id):
        """Sadece istek atan adminin şirketine ait personelleri listeler"""
        employees = Employee.query.filter_by(company_id=company_id).all()
        result = []
        for e in employees:
            result.append({
                "id": e.id,
                "first_name": e.first_name,
                "last_name": e.last_name,
                "phone": e.phone_number,
                "is_active": e.is_active,
                "department": {
                    "id": e.department.id,
                    "name": e.department.name
                } if e.department else None
            })
        return result, 200

    @staticmethod
    def update_employee(employee_id, first_name, last_name, phone, department_id, is_active, company_id, actor_id):
        """Adminin kendi şirketine ait bir personeli güncellemesini sağlar"""
        
        # Güvenlik Kontrolü: Personel var mı ve bu şirkete mi ait?
        emp = Employee.query.filter_by(id=employee_id, company_id=company_id).first()
        if not emp:
            return {"error": "Personel bulunamadı veya bu işlem için yetkiniz yok."}, 404

        has_first_name_change = first_name is not None and first_name != emp.first_name
        has_last_name_change = last_name is not None and last_name != emp.last_name
        has_phone_change = phone is not None and phone != emp.phone_number
        has_dept_change = department_id is not None and department_id != emp.department_id
        has_status_change = is_active is not None and is_active != emp.is_active

        if not has_first_name_change and not has_last_name_change and not has_phone_change and not has_dept_change and not has_status_change:
            return {"message": "Herhangi bir değişiklik yapılmadı."}, 200

        # Eğer departman değiştirilmek isteniyorsa, yeni departman bu şirkete mi ait kontrolü
        if has_dept_change:
            dept = Department.query.filter_by(id=department_id, company_id=company_id).first()
            if not dept:
                return {"error": "Seçilen yeni departman bu şirkete ait değil."}, 400
            emp.department_id = department_id

        # Telefon çakışma kontrolü
        if has_phone_change:
            existing_phone = Employee.query.filter_by(phone_number=phone, company_id=company_id).first()
            if existing_phone:
                return {"error": "Bu telefon numarası başka bir personel tarafından kullanılıyor."}, 400
            emp.phone_number = phone

        if has_first_name_change: emp.first_name = first_name
        if has_last_name_change: emp.last_name = last_name
        if has_status_change: emp.is_active = is_active

        db.session.commit()

        # Audit Log
        log = AuditLog(user_id=actor_id, action=f"Personel bilgileri güncellendi (ID: {employee_id}): {emp.first_name} {emp.last_name}")
        db.session.add(log)
        db.session.commit()

        return {"message": "Personel bilgileri başarıyla güncellendi."}, 200

    @staticmethod
    def delete_employee(employee_id, company_id, actor_id):
        """Adminin kendi şirketine ait bir personeli sistemden silmesini sağlar"""
        emp = Employee.query.filter_by(id=employee_id, company_id=company_id).first()
        if not emp:
            return {"error": "Personel bulunamadı veya bu işlem için yetkiniz yok."}, 404

        emp_name = f"{emp.first_name} {emp.last_name}"
        db.session.delete(emp)
        db.session.commit()

        # Audit Log
        log = AuditLog(user_id=actor_id, action=f"Personel sistemden silindi: {emp_name}")
        db.session.add(log)
        db.session.commit()

        return {"message": f"'{emp_name}' isimli personel sistemden başarıyla silindi."}, 200