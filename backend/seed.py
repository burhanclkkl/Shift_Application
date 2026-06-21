import os
from datetime import datetime, timedelta
from app import create_app
from app.extensions import db
from app.models.company import Company
from app.models.user import User
from app.models.department import Department
from app.models.employee import Employee
from app.models.shift import Shift
from app.models.audit_log import AuditLog

# Flask uygulamasını başlat
app = create_app()

def seed_database():
    print("Veritabanı tohumlama (seeding) işlemi başlatıldı...")
    
    with app.app_context():
        # 1. Eski verileri temizle (Önce bağımlı tabloları, sonra ana tabloları sil)
        print("Mevcut veriler temizleniyor...")
        Shift.query.delete()
        AuditLog.query.delete()
        Employee.query.delete()
        Department.query.delete()
        User.query.delete()
        Company.query.delete()
        db.session.commit()
        
        # 2. Şirket Oluştur
        print("Kurumsal şirket oluşturuluyor...")
        license_start = datetime.utcnow()
        license_end = license_start + timedelta(days=365) # 1 Yıllık lisans
        
        kafe_company = Company(
            name="Kahve Durağı A.Ş.",
            is_active=True,
            license_start_date=license_start,
            license_end_date=license_end
        )
        db.session.add(kafe_company)
        db.session.commit() # ID alabilmek için commit
        
        # 3. Kullanıcılar (Super Admin ve Şirket Admin) Oluştur
        print("Sistem yöneticileri oluşturuluyor...")
        
        # Super Admin
        super_admin = User(
            email="superadmin@shiftapp.com",
            role="super_admin",
            is_active=True
        )
        super_admin.set_password("admin123")
        db.session.add(super_admin)
        
        # Şirket Yöneticisi (Company Admin)
        kafe_admin = User(
            email="kahveduragi@sirket.com",
            role="admin",
            is_active=True,
            company_id=kafe_company.id
        )
        kafe_admin.set_password("admin123")
        db.session.add(kafe_admin)
        db.session.commit() # ID'leri sabitle
        
        # 4. Departmanlar (Şirkete Özel) Oluştur
        print("Şirket departmanları oluşturuluyor...")
        dep_bar = Department(name="Bar / Kahve Hazırlama", company_id=kafe_company.id)
        dep_kasa = Department(name="Kasa / Sipariş", company_id=kafe_company.id)
        dep_mutfak = Department(name="Mutfak / Servis", company_id=kafe_company.id)
        
        db.session.add_all([dep_bar, dep_kasa, dep_mutfak])
        db.session.commit()
        
        # 5. Personeller (Şirket Çalışanları) Oluştur
        print("Şirket personelleri oluşturuluyor...")
        
        emp_ahmet = Employee(
            first_name="Ahmet",
            last_name="Kaya",
            phone_number="+905551112233",
            is_active=True,
            company_id=kafe_company.id,
            department_id=dep_bar.id
        )
        emp_ayse = Employee(
            first_name="Ayşe",
            last_name="Yılmaz",
            phone_number="+905551112244",
            is_active=True,
            company_id=kafe_company.id,
            department_id=dep_kasa.id
        )
        emp_burak = Employee(
            first_name="Burak",
            last_name="Demir",
            phone_number="+905551112255",
            is_active=True,
            company_id=kafe_company.id,
            department_id=dep_mutfak.id
        )
        emp_elif = Employee(
            first_name="Elif",
            last_name="Çelik",
            phone_number="+905551112266",
            is_active=True,
            company_id=kafe_company.id,
            department_id=dep_bar.id
        )
        
        db.session.add_all([emp_ahmet, emp_ayse, emp_burak, emp_elif])
        db.session.commit()
        
        # 6. Vardiyalar (Örnek Vardiya Atamaları) Oluştur
        print("Vardiya atamaları yapılıyor...")
        
        # Bugün ve yarın için vardiyalar
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Ahmet Kaya: Bugün 09:00 - 17:00 (Barista)
        shift1 = Shift(
            employee_id=emp_ahmet.id,
            start_datetime=today + timedelta(hours=9),
            end_datetime=today + timedelta(hours=17),
            created_by_id=kafe_admin.id
        )
        
        # Ayşe Yılmaz: Bugün 17:00 - 01:00 (Kasiyer)
        shift2 = Shift(
            employee_id=emp_ayse.id,
            start_datetime=today + timedelta(hours=17),
            end_datetime=today + timedelta(hours=25), # 17:00 + 8 = Gece 01:00
            created_by_id=kafe_admin.id
        )
        
        # Burak Demir: Bugün 09:00 - 17:00 (Şef - Mutfak)
        shift3 = Shift(
            employee_id=emp_burak.id,
            start_datetime=today + timedelta(hours=9),
            end_datetime=today + timedelta(hours=17),
            created_by_id=kafe_admin.id
        )
        
        # Elif Çelik: Yarın 09:00 - 17:00 (Barista)
        shift4 = Shift(
            employee_id=emp_elif.id,
            start_datetime=today + timedelta(days=1, hours=9),
            end_datetime=today + timedelta(days=1, hours=17),
            created_by_id=kafe_admin.id
        )
        
        db.session.add_all([shift1, shift2, shift3, shift4])
        
        # 7. Audit Log Ekle (Tohumlama kaydı)
        log = AuditLog(
            user_id=kafe_admin.id,
            action="SEEDING: Sistem veritabanı örnek kurumsal Şirket verileri ile seed.py tarafından başarıyla tohumlandı.",
            ip_address="127.0.0.1"
        )
        db.session.add(log)
        
        db.session.commit()
        
    print("\nTohumlama işlemi başarıyla tamamlandı!")
    print("---------------------------------------")
    print("Eklenen Veriler:")
    print("- Şirket: Kahve Durağı A.Ş. (1 Yıl Lisanslı)")
    print("- Super Admin: superadmin@shiftapp.com / admin123")
    print("- Şirket Admin: kahveduragi@sirket.com / admin123")
    print("- Departmanlar: Bar / Kahve Hazırlama, Kasa / Sipariş, Mutfak / Servis")
    print("- Personeller: Ahmet Kaya, Ayşe Yılmaz, Burak Demir, Elif Çelik")
    print("- Örnek Vardiyalar: Ahmet, Ayşe, Burak ve Elif için bugün ve yarınki vardiyalar oluşturuldu.")
    print("---------------------------------------")

if __name__ == "__main__":
    seed_database()
