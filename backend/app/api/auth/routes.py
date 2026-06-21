from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.auth_service import AuthService
from app.models.user import User
from app.extensions import db

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"error": "E-posta ve şifre alanları zorunludur."}), 400
        
    role = data.get('role', 'admin')
    company_id = data.get('company_id', None)
    
    response, status_code = AuthService.create_user(
        email=data['email'], 
        password=data['password'], 
        role=role,
        company_id=company_id
    )
    return jsonify(response), status_code

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"error": "E-posta ve şifre alanları zorunludur."}), 400
        
    response, status_code = AuthService.login_user(data['email'], data['password'])
    return jsonify(response), status_code

@auth_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_my_profile():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    if not data:
        return jsonify({"error": "Güncellenecek veri bulunamadı."}), 400

    # Güvenlik Kontrolü: Kullanıcı kendi rolünü değiştiremez
    if 'role' in data:
        return jsonify({"error": "Bu rota üzerinden rol güncellemesi yapılamaz."}), 400

    response, status_code = AuthService.update_profile(
        user_id=current_user_id,
        email=data.get('email'),
        password=data.get('password')
    )
    return jsonify(response), status_code

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_my_profile():
    current_user_id = get_jwt_identity()
    response, status_code = AuthService.get_profile(current_user_id)
    return jsonify(response), status_code
