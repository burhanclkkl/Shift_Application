from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.services.super_admin_service import SuperAdminService

super_admin_bp = Blueprint('super_admin', __name__, url_prefix='/api/super-admin')

def check_super_admin():
    """İstek atan kullanıcının rolünü kontrol eden yardımcı fonksiyon"""
    claims = get_jwt()
    return claims.get("role") == "super_admin"


# === ŞİRKET (COMPANY) ENDPOINT'LERİ ===

@super_admin_bp.route('/companies', methods=['POST'])
@jwt_required()
def create_company():
    if not check_super_admin():
        return jsonify({"error": "Bu işlem için Super Admin yetkisine sahip olmalısınız."}), 403
    data = request.get_json()
    actor_id = get_jwt_identity()
    response, status_code = SuperAdminService.create_company(
        data.get('name'), 
        data.get('license_end_date'), 
        data.get('manager_email'),
        data.get('manager_password'),
        actor_id
    )
    return jsonify(response), status_code

@super_admin_bp.route('/companies', methods=['GET'])
@jwt_required()
def get_companies():
    if not check_super_admin():
        return jsonify({"error": "Yetkisiz erişim. Super Admin olmalısınız."}), 403
    response, status_code = SuperAdminService.get_all_companies()
    return jsonify(response), status_code

@super_admin_bp.route('/companies/<int:company_id>', methods=['PUT'])
@jwt_required()
def update_company(company_id):
    if not check_super_admin():
        return jsonify({"error": "Yetkisiz erişim."}), 403
    data = request.get_json()
    actor_id = get_jwt_identity()
    response, status_code = SuperAdminService.update_company(
        company_id=company_id,
        name=data.get('name'),
        license_end_date_str=data.get('license_end_date'),
        manager_email=data.get('manager_email'),
        manager_password=data.get('manager_password'),
        actor_id=actor_id
    )
    return jsonify(response), status_code

@super_admin_bp.route('/companies/<int:company_id>/license', methods=['PUT'])
@jwt_required()
def update_company_license(company_id):
    if not check_super_admin():
        return jsonify({"error": "Yetkisiz erişim. Super Admin olmalısınız."}), 403
    data = request.get_json()
    if not data or 'license_end_date' not in data:
        return jsonify({"error": "license_end_date alanı zorunludur."}), 400
    actor_id = get_jwt_identity()
    response, status_code = SuperAdminService.update_company_license(company_id, data.get('license_end_date'), actor_id)
    return jsonify(response), status_code

@super_admin_bp.route('/companies/<int:company_id>/toggle', methods=['PATCH'])
@jwt_required()
def toggle_company(company_id):
    if not check_super_admin():
        return jsonify({"error": "Yetkisiz erişim."}), 403
    actor_id = get_jwt_identity()
    response, status_code = SuperAdminService.toggle_company_status(company_id, actor_id)
    return jsonify(response), status_code

@super_admin_bp.route('/companies/<int:company_id>', methods=['DELETE'])
@jwt_required()
def delete_company(company_id):
    if not check_super_admin():
        return jsonify({"error": "Yetkisiz erişim."}), 403
    actor_id = get_jwt_identity()
    response, status_code = SuperAdminService.delete_company(company_id, actor_id)
    return jsonify(response), status_code


# === KULLANICI / ADMIN ENDPOINT'LERİ ===

@super_admin_bp.route('/companies/<int:company_id>/admins', methods=['GET'])
@jwt_required()
def get_company_admins(company_id):
    if not check_super_admin():
        return jsonify({"error": "Yetkisiz erişim. Super Admin olmalısınız."}), 403
    response, status_code = SuperAdminService.get_company_admins(company_id)
    return jsonify(response), status_code

@super_admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    if not check_super_admin():
        return jsonify({"error": "Yetkisiz erişim."}), 403
    data = request.get_json()
    if data and 'role' in data:
        return jsonify({"error": "Rol güncellemesi bu rota üzerinden yapılamaz."}), 400
    actor_id = get_jwt_identity()
    response, status_code = SuperAdminService.update_user(user_id, data.get('email'), data.get('password'), data.get('is_active'), actor_id)
    return jsonify(response), status_code

@super_admin_bp.route('/users/<int:user_id>/toggle', methods=['PATCH'])
@jwt_required()
def toggle_user(user_id):
    if not check_super_admin():
        return jsonify({"error": "Yetkisiz erişim."}), 403
    actor_id = get_jwt_identity()
    response, status_code = SuperAdminService.toggle_user_status(user_id, actor_id)
    return jsonify(response), status_code

@super_admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    if not check_super_admin():
        return jsonify({"error": "Yetkisiz erişim."}), 403
    actor_id = get_jwt_identity()
    response, status_code = SuperAdminService.delete_user(user_id, actor_id)
    return jsonify(response), status_code