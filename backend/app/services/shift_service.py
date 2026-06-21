from app.models.shift import Shift
from app.models.employee import Employee
from app.models.audit_log import AuditLog
from app.extensions import db
from datetime import datetime

class ShiftService:

    @staticmethod
    def create_shift(employee_id, start_datetime_str, end_datetime_str, company_id, actor_id):
        # 1. Personel var mı ve bu şirkete mi ait?
        emp = Employee.query.filter_by(id=employee_id, company_id=company_id).first()
        if not emp:
            return {"error": "Personel bulunamadı veya bu şirkete ait değil."}, 400

        try:
            start_dt = datetime.strptime(start_datetime_str, "%Y-%m-%d %H:%M:%S")
            end_dt = datetime.strptime(end_datetime_str, "%Y-%m-%d %H:%M:%S")
        except ValueError:
            try:
                # Alternatif ISO veya T'li format
                start_dt = datetime.fromisoformat(start_datetime_str)
                end_dt = datetime.fromisoformat(end_datetime_str)
            except ValueError:
                return {"error": "Geçersiz tarih formatı. YYYY-MM-DD HH:MM:SS formatında olmalıdır."}, 400

        if start_dt >= end_dt:
            return {"error": "Başlangıç tarihi bitiş tarihinden önce olmalıdır."}, 400

        # 2. Vardiya Çakışma Kontrolü (Aynı personel için aynı zaman diliminde başka bir vardiya var mı?)
        overlap = Shift.query.filter(
            Shift.employee_id == employee_id,
            Shift.start_datetime < end_dt,
            Shift.end_datetime > start_dt
        ).first()
        if overlap:
            return {"error": f"Personelin bu saatler arasında başka bir vardiyası bulunmaktadır ({overlap.start_datetime.strftime('%Y-%m-%d %H:%M')} - {overlap.end_datetime.strftime('%Y-%m-%d %H:%M')})."}, 400

        # 3. Vardiyayı oluştur
        new_shift = Shift(
            employee_id=employee_id,
            start_datetime=start_dt,
            end_datetime=end_dt,
            created_by_id=actor_id
        )
        db.session.add(new_shift)
        db.session.commit()

        # Audit Log
        log = AuditLog(user_id=actor_id, action=f"Yeni vardiya atandı: Personel ID {employee_id} ({start_datetime_str} - {end_datetime_str})")
        db.session.add(log)
        db.session.commit()

        return {
            "message": "Vardiya başarıyla atandı.",
            "shift_id": new_shift.id
        }, 201

    @staticmethod
    def get_my_shifts(company_id):
        # Şirkete ait personellerin vardiyalarını getir
        shifts = db.session.query(Shift).join(Employee).filter(Employee.company_id == company_id).all()
        result = []
        for s in shifts:
            result.append({
                "id": s.id,
                "employee_id": s.employee_id,
                "employee_name": f"{s.employee.first_name} {s.employee.last_name}",
                "start_datetime": s.start_datetime.strftime("%Y-%m-%d %H:%M:%S"),
                "end_datetime": s.end_datetime.strftime("%Y-%m-%d %H:%M:%S"),
                "created_by_id": s.created_by_id,
                "created_at": s.created_at.strftime("%Y-%m-%d %H:%M:%S")
            })
        return result, 200

    @staticmethod
    def update_shift(shift_id, employee_id, start_datetime_str, end_datetime_str, company_id, actor_id):
        # 1. Vardiya var mı ve bu şirketin personeline mi ait?
        shift = db.session.query(Shift).join(Employee).filter(Shift.id == shift_id, Employee.company_id == company_id).first()
        if not shift:
            return {"error": "Vardiya bulunamadı veya bu işlem için yetkiniz yok."}, 404

        has_employee_change = employee_id is not None and employee_id != shift.employee_id
        
        # Saatleri doğrula ve değişiklik kontrolü yap
        start_dt = shift.start_datetime
        end_dt = shift.end_datetime

        has_start_change = False
        if start_datetime_str:
            try:
                new_start = datetime.strptime(start_datetime_str, "%Y-%m-%d %H:%M:%S")
            except ValueError:
                try:
                    new_start = datetime.fromisoformat(start_datetime_str)
                except ValueError:
                    return {"error": "Geçersiz başlangıç tarihi formatı."}, 400
            has_start_change = new_start != shift.start_datetime
            if has_start_change:
                start_dt = new_start
                
        has_end_change = False
        if end_datetime_str:
            try:
                new_end = datetime.strptime(end_datetime_str, "%Y-%m-%d %H:%M:%S")
            except ValueError:
                try:
                    new_end = datetime.fromisoformat(end_datetime_str)
                except ValueError:
                    return {"error": "Geçersiz bitiş tarihi formatı."}, 400
            has_end_change = new_end != shift.end_datetime
            if has_end_change:
                end_dt = new_end

        if not has_employee_change and not has_start_change and not has_end_change:
            return {"message": "Herhangi bir değişiklik yapılmadı."}, 200

        target_employee_id = employee_id if employee_id else shift.employee_id
        
        # Eğer personel değişiyorsa yeni personelin şirket kontrolü
        if has_employee_change:
            emp = Employee.query.filter_by(id=employee_id, company_id=company_id).first()
            if not emp:
                return {"error": "Seçilen yeni personel bu şirkete ait değil."}, 400
            shift.employee_id = employee_id

        if start_dt >= end_dt:
            return {"error": "Başlangıç tarihi bitiş tarihinden önce olmalıdır."}, 400

        # Çakışma kontrolü (Güncellenen vardiyanın kendisi hariç)
        overlap = Shift.query.filter(
            Shift.id != shift_id,
            Shift.employee_id == target_employee_id,
            Shift.start_datetime < end_dt,
            Shift.end_datetime > start_dt
        ).first()
        
        if overlap:
            return {"error": f"Personelin bu saatler arasında başka bir vardiyası bulunmaktadır ({overlap.start_datetime.strftime('%Y-%m-%d %H:%M')} - {overlap.end_datetime.strftime('%Y-%m-%d %H:%M')})."}, 400

        if has_start_change:
            shift.start_datetime = start_dt
        if has_end_change:
            shift.end_datetime = end_dt

        db.session.commit()

        # Audit Log
        log = AuditLog(user_id=actor_id, action=f"Vardiya güncellendi (ID: {shift_id}): Personel ID {target_employee_id}")
        db.session.add(log)
        db.session.commit()

        return {"message": "Vardiya başarıyla güncellendi."}, 200

    @staticmethod
    def delete_shift(shift_id, company_id, actor_id):
        shift = db.session.query(Shift).join(Employee).filter(Shift.id == shift_id, Employee.company_id == company_id).first()
        if not shift:
            return {"error": "Vardiya bulunamadı veya bu işlem için yetkiniz yok."}, 404

        db.session.delete(shift)
        db.session.commit()

        # Audit Log
        log = AuditLog(user_id=actor_id, action=f"Vardiya silindi (ID: {shift_id})")
        db.session.add(log)
        db.session.commit()

        return {"message": "Vardiya başarıyla silindi."}, 200
