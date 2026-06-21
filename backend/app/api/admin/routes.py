from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.services.admin_service import AdminService
from app.services.employee_service import EmployeeService
from app.services.shift_template_service import ShiftTemplateService
from app.services.shift_service import ShiftService

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

def check_admin_authority():
    """Kullanıcının şirket admini veya üstü olduğunu doğrular"""
    claims = get_jwt()
    return claims.get("role") in ["admin", "super_admin"]

def get_company_id_safely(claims, data=None):
    """Claims içinden company_id alır. Eğer super_admin ise istekten dinamik çeker."""
    company_id = claims.get("company_id")
    if not company_id and claims.get("role") == "super_admin":
        if data and isinstance(data, dict):
            company_id = data.get("company_id")
        if not company_id:
            company_id = request.args.get("company_id", type=int)
    return company_id


# ==========================================
# === DEPARTMAN (MESLEK TÜRÜ) YÖNETİMİ ===
# ==========================================

@admin_bp.route('/departments', methods=['POST'])
@jwt_required()
def create_department():
    if not check_admin_authority():
        return jsonify({"error": "Bu işlem için Admin yetkisine sahip olmalısınız."}), 403
    data = request.get_json()
    if not data or 'name' not in data:
        return jsonify({"error": "Departman adı zorunludur."}), 400
    claims = get_jwt()
    company_id = get_company_id_safely(claims, data)
    if not company_id:
        return jsonify({"error": "company_id parametresi zorunludur."}), 400
    actor_id = get_jwt_identity()
    response, status_code = AdminService.create_department(data['name'], company_id, actor_id)
    return jsonify(response), status_code

@admin_bp.route('/departments', methods=['GET'])
@jwt_required()
def get_departments():
    if not check_admin_authority():
        return jsonify({"error": "Yetkisiz erişim."}), 403
    claims = get_jwt()
    company_id = get_company_id_safely(claims)
    if not company_id:
        return jsonify({"error": "company_id parametresi zorunludur."}), 400
    response, status_code = AdminService.get_my_departments(company_id)
    return jsonify(response), status_code

@admin_bp.route('/departments/<int:department_id>', methods=['PUT'])
@jwt_required()
def update_department(department_id):
    if not check_admin_authority():
        return jsonify({"error": "Yetkisiz erişim."}), 403
    data = request.get_json()
    claims = get_jwt()
    company_id = get_company_id_safely(claims, data)
    if not company_id:
        return jsonify({"error": "company_id parametresi zorunludur."}), 400
    actor_id = get_jwt_identity()
    response, status_code = AdminService.update_department(department_id, data.get('name'), company_id, actor_id)
    return jsonify(response), status_code

@admin_bp.route('/departments/<int:department_id>', methods=['DELETE'])
@jwt_required()
def delete_department(department_id):
    if not check_admin_authority():
        return jsonify({"error": "Yetkisiz erişim."}), 403
    claims = get_jwt()
    company_id = get_company_id_safely(claims)
    if not company_id:
        return jsonify({"error": "company_id parametresi zorunludur."}), 400
    actor_id = get_jwt_identity()
    response, status_code = AdminService.delete_department(department_id, company_id, actor_id)
    return jsonify(response), status_code


# ==========================================
# === PERSONEL (EMPLOYEE) YÖNETİMİ ========
# ==========================================

@admin_bp.route('/employees', methods=['POST'])
@jwt_required()
def create_employee():
    if not check_admin_authority():
        return jsonify({"error": "Bu işlem için Admin yetkisine sahip olmalısınız."}), 403
        
    data = request.get_json()
    if not data or 'first_name' not in data or 'last_name' not in data or 'department_id' not in data:
        return jsonify({"error": "Ad, soyad ve departman_id alanları zorunludur."}), 400
        
    claims = get_jwt()
    company_id = get_company_id_safely(claims, data)
    if not company_id:
        return jsonify({"error": "company_id parametresi zorunludur."}), 400
    actor_id = get_jwt_identity()
    
    response, status_code = EmployeeService.create_employee(
        first_name=data['first_name'],
        last_name=data['last_name'],
        phone=data.get('phone'),
        department_id=data['department_id'],
        company_id=company_id,
        actor_id=actor_id
    )
    return jsonify(response), status_code

@admin_bp.route('/employees', methods=['GET'])
@jwt_required()
def get_employees():
    if not check_admin_authority():
        return jsonify({"error": "Yetkisiz erişim."}), 403
        
    claims = get_jwt()
    company_id = get_company_id_safely(claims)
    if not company_id:
        return jsonify({"error": "company_id parametresi zorunludur."}), 400
    response, status_code = EmployeeService.get_my_employees(company_id)
    return jsonify(response), status_code

@admin_bp.route('/employees/<int:employee_id>', methods=['PUT'])
@jwt_required()
def update_employee(employee_id):
    if not check_admin_authority():
        return jsonify({"error": "Yetkisiz erişim."}), 403
        
    data = request.get_json()
    claims = get_jwt()
    company_id = get_company_id_safely(claims, data)
    if not company_id:
        return jsonify({"error": "company_id parametresi zorunludur."}), 400
    actor_id = get_jwt_identity()
    
    response, status_code = EmployeeService.update_employee(
        employee_id=employee_id,
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        phone=data.get('phone'),
        department_id=data.get('department_id'),
        is_active=data.get('is_active'),
        company_id=company_id,
        actor_id=actor_id
    )
    return jsonify(response), status_code

@admin_bp.route('/employees/<int:employee_id>', methods=['DELETE'])
@jwt_required()
def delete_employee(employee_id):
    if not check_admin_authority():
        return jsonify({"error": "Yetkisiz erişim."}), 403
        
    claims = get_jwt()
    company_id = get_company_id_safely(claims)
    if not company_id:
        return jsonify({"error": "company_id parametresi zorunludur."}), 400
    actor_id = get_jwt_identity()
    
    response, status_code = EmployeeService.delete_employee(employee_id, company_id, actor_id)
    return jsonify(response), status_code


# ==========================================
# === VARDİYA ŞABLONU (TEMPLATE) YÖNETİMİ ==
# ==========================================

@admin_bp.route('/shift-templates', methods=['POST'])
@jwt_required()
def create_shift_template():
    if not check_admin_authority():
        return jsonify({"error": "Bu işlem için Admin yetkisine sahip olmalısınız."}), 403
        
    data = request.get_json()
    if not data or 'name' not in data or 'start_time' not in data or 'end_time' not in data:
        return jsonify({"error": "Şablon adı, başlangıç ve bitiş saatleri zorunludur."}), 400
        
    claims = get_jwt()
    company_id = get_company_id_safely(claims, data)
    if not company_id:
        return jsonify({"error": "company_id parametresi zorunludur."}), 400
    actor_id = get_jwt_identity()
    
    response, status_code = ShiftTemplateService.create_template(
        name=data['name'],
        start_time_str=data['start_time'],
        end_time_str=data['end_time'],
        company_id=company_id,
        actor_id=actor_id
    )
    return jsonify(response), status_code

@admin_bp.route('/shift-templates', methods=['GET'])
@jwt_required()
def get_shift_templates():
    if not check_admin_authority():
        return jsonify({"error": "Yetkisiz erişim."}), 403
        
    claims = get_jwt()
    company_id = get_company_id_safely(claims)
    if not company_id:
        return jsonify({"error": "company_id parametresi zorunludur."}), 400
    
    response, status_code = ShiftTemplateService.get_my_templates(company_id)
    return jsonify(response), status_code

@admin_bp.route('/shift-templates/<int:template_id>', methods=['PUT'])
@jwt_required()
def update_shift_template(template_id):
    if not check_admin_authority():
        return jsonify({"error": "Yetkisiz erişim."}), 403
        
    data = request.get_json()
    claims = get_jwt()
    company_id = get_company_id_safely(claims, data)
    if not company_id:
        return jsonify({"error": "company_id parametresi zorunludur."}), 400
    actor_id = get_jwt_identity()
    
    response, status_code = ShiftTemplateService.update_template(
        template_id=template_id,
        name=data.get('name'),
        start_time_str=data.get('start_time'),
        end_time_str=data.get('end_time'),
        company_id=company_id,
        actor_id=actor_id
    )
    return jsonify(response), status_code

@admin_bp.route('/shift-templates/<int:template_id>', methods=['DELETE'])
@jwt_required()
def delete_shift_template(template_id):
    if not check_admin_authority():
        return jsonify({"error": "Yetkisiz erişim."}), 403
        
    claims = get_jwt()
    company_id = get_company_id_safely(claims)
    if not company_id:
        return jsonify({"error": "company_id parametresi zorunludur."}), 400
    actor_id = get_jwt_identity()
    
    response, status_code = ShiftTemplateService.delete_template(template_id, company_id, actor_id)
    return jsonify(response), status_code


# ==========================================
# === VARDİYA (SHIFT) YÖNETİMİ ============
# ==========================================

@admin_bp.route('/shifts', methods=['POST'])
@jwt_required()
def create_shift():
    if not check_admin_authority():
        return jsonify({"error": "Bu işlem için Admin yetkisine sahip olmalısınız."}), 403
        
    data = request.get_json()
    if not data or 'employee_id' not in data or 'start_datetime' not in data or 'end_datetime' not in data:
        return jsonify({"error": "employee_id, start_datetime ve end_datetime alanları zorunludur."}), 400
        
    claims = get_jwt()
    company_id = get_company_id_safely(claims, data)
    if not company_id:
        return jsonify({"error": "company_id parametresi zorunludur."}), 400
    actor_id = get_jwt_identity()
    
    response, status_code = ShiftService.create_shift(
        employee_id=data['employee_id'],
        start_datetime_str=data['start_datetime'],
        end_datetime_str=data['end_datetime'],
        company_id=company_id,
        actor_id=actor_id
    )
    return jsonify(response), status_code

@admin_bp.route('/shifts', methods=['GET'])
@jwt_required()
def get_shifts():
    if not check_admin_authority():
        return jsonify({"error": "Yetkisiz erişim."}), 403
        
    claims = get_jwt()
    company_id = get_company_id_safely(claims)
    if not company_id:
        return jsonify({"error": "company_id parametresi zorunludur."}), 400
        
    response, status_code = ShiftService.get_my_shifts(company_id)
    return jsonify(response), status_code

@admin_bp.route('/shifts/<int:shift_id>', methods=['PUT'])
@jwt_required()
def update_shift(shift_id):
    if not check_admin_authority():
        return jsonify({"error": "Yetkisiz erişim."}), 403
        
    data = request.get_json()
    claims = get_jwt()
    company_id = get_company_id_safely(claims, data)
    if not company_id:
        return jsonify({"error": "company_id parametresi zorunludur."}), 400
    actor_id = get_jwt_identity()
    
    response, status_code = ShiftService.update_shift(
        shift_id=shift_id,
        employee_id=data.get('employee_id'),
        start_datetime_str=data.get('start_datetime'),
        end_datetime_str=data.get('end_datetime'),
        company_id=company_id,
        actor_id=actor_id
    )
    return jsonify(response), status_code

@admin_bp.route('/shifts/<int:shift_id>', methods=['DELETE'])
@jwt_required()
def delete_shift(shift_id):
    if not check_admin_authority():
        return jsonify({"error": "Yetkisiz erişim."}), 403
        
    claims = get_jwt()
    company_id = get_company_id_safely(claims)
    if not company_id:
        return jsonify({"error": "company_id parametresi zorunludur."}), 400
    actor_id = get_jwt_identity()
    
    response, status_code = ShiftService.delete_shift(shift_id, company_id, actor_id)
    return jsonify(response), status_code


# ==========================================
# === SİSTEM LOGLARI (AUDIT LOGS) =========
# ==========================================

@admin_bp.route('/logs', methods=['GET'])
@jwt_required()
def get_audit_logs():
    if not check_admin_authority():
        return jsonify({"error": "Yetkisiz erişim."}), 403
        
    claims = get_jwt()
    is_super_admin = claims.get("role") == "super_admin"
    company_id = get_company_id_safely(claims)
    
    # Super admin değilse ve şirketi yoksa hata döner
    if not is_super_admin and not company_id:
        return jsonify({"error": "company_id parametresi zorunludur."}), 400
        
    response, status_code = AdminService.get_audit_logs(
        company_id=company_id,
        is_super_admin=is_super_admin
    )
    return jsonify(response), status_code