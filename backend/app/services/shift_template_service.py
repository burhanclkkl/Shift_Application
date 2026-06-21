from app.models.shift_template import ShiftTemplate
from app.models.audit_log import AuditLog
from app.extensions import db
from datetime import datetime

class ShiftTemplateService:

    @staticmethod
    def create_template(name, start_time_str, end_time_str, company_id, actor_id):
        """Adminin şirkete özel yeni bir vardiya şablonu oluşturmasını sağlar"""
        
        # 1. Aynı şirkette aynı isimde şablon çakışma kontrolü
        existing = ShiftTemplate.query.filter_by(name=name, company_id=company_id).first()
        if existing:
            return {"error": f"'{name}' adında bir vardiya şablonu zaten mevcut."}, 400

        try:
            # Gelen string saatleri Python time nesnesine çeviriyoruz (Format: "HH:MM")
            start_time = datetime.strptime(start_time_str, "%H:%M").time()
            end_time = datetime.strptime(end_time_str, "%H:%M").time()
        except ValueError:
            return {"error": "Geçersiz saat formatı. HH:MM olmalı (Örn: 08:30)."}, 400

        # 2. Şablonu kaydet
        new_template = ShiftTemplate(
            name=name,
            start_time=start_time,
            end_time=end_time,
            company_id=company_id
        )
        db.session.add(new_template)
        db.session.commit()

        # Audit Log
        log = AuditLog(user_id=actor_id, action=f"Yeni vardiya şablonu oluşturuldu: {name} ({start_time_str} - {end_time_str})")
        db.session.add(log)
        db.session.commit()

        return {
            "message": f"'{name}' vardiya şablonu başarıyla oluşturuldu.",
            "template_id": new_template.id
        }, 201

    @staticmethod
    def get_my_templates(company_id):
        """Sadece istek atan adminin şirketine ait vardiya şablonlarını listeler"""
        templates = ShiftTemplate.query.filter_by(company_id=company_id).all()
        result = []
        for t in templates:
            result.append({
                "id": t.id,
                "name": t.name,
                "start_time": t.start_time.strftime("%H:%M"),
                "end_time": t.end_time.strftime("%H:%M")
            })
        return result, 200

    @staticmethod
    def update_template(template_id, name, start_time_str, end_time_str, company_id, actor_id):
        """Mevcut bir vardiya şablonunu günceller"""
        template = ShiftTemplate.query.filter_by(id=template_id, company_id=company_id).first()
        if not template:
            return {"error": "Vardiya şablonu bulunamadı veya yetkiniz yok."}, 404

        has_name_change = name is not None and name != template.name
        
        has_start_change = False
        if start_time_str:
            try:
                new_start = datetime.strptime(start_time_str, "%H:%M").time()
                has_start_change = new_start != template.start_time
            except ValueError:
                return {"error": "Geçersiz saat formatı. HH:MM olmalı."}, 400

        has_end_change = False
        if end_time_str:
            try:
                new_end = datetime.strptime(end_time_str, "%H:%M").time()
                has_end_change = new_end != template.end_time
            except ValueError:
                return {"error": "Geçersiz saat formatı. HH:MM olmalı."}, 400

        if not has_name_change and not has_start_change and not has_end_change:
            return {"message": "Herhangi bir değişiklik yapılmadı."}, 200

        if has_name_change:
            existing = ShiftTemplate.query.filter_by(name=name, company_id=company_id).first()
            if existing and existing.id != template_id:
                return {"error": f"'{name}' adında başka bir şablon zaten var."}, 400
            template.name = name

        if has_start_change:
            template.start_time = new_start

        if has_end_change:
            template.end_time = new_end

        db.session.commit()

        # Audit Log
        log = AuditLog(user_id=actor_id, action=f"Vardiya şablonu güncellendi (ID: {template_id}): {template.name}")
        db.session.add(log)
        db.session.commit()

        return {"message": "Vardiya şablonu başarıyla güncellendi."}, 200

    @staticmethod
    def delete_template(template_id, company_id, actor_id):
        """Vardiya şablonunu sistemden siler"""
        template = ShiftTemplate.query.filter_by(id=template_id, company_id=company_id).first()
        if not template:
            return {"error": "Vardiya şablonu bulunamadı veya yetkiniz yok."}, 404

        template_name = template.name
        db.session.delete(template)
        db.session.commit()

        # Audit Log
        log = AuditLog(user_id=actor_id, action=f"Vardiya şablonu silindi: {template_name}")
        db.session.add(log)
        db.session.commit()

        return {"message": f"'{template_name}' şablonu başarıyla silindi."}, 200