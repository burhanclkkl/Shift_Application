import os
from flask import Flask
from flask_cors import CORS
from app.config import config_by_name
from app.extensions import db, migrate, jwt

def create_app(config_name=None):
    app = Flask(__name__)
    
    # CORS yapılandırması: Tüm origins'lerden gelen /api/* isteklerine izin ver
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    if not config_name:
        config_name = os.getenv("FLASK_ENV", "development")
        
    app.config.from_object(config_by_name[config_name])
    
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    from app import models 
    # ---- API BLUEPRINT KAYITLARI ----
    from app.api.auth.routes import auth_bp
    from app.api.super_admin.routes import super_admin_bp
    from app.api.admin.routes import admin_bp # Burayı ekledik
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(super_admin_bp)
    app.register_blueprint(admin_bp) # Burayı ekledik
    # ---------------------------------
    
    @app.route("/health")
    def health_check():
        return {"status": "healthy", "environment": config_name}, 200
        
    # ---- KÜRESEL HATA YAKALAMA (GLOBAL ERROR HANDLING) ----
    import json
    from werkzeug.exceptions import HTTPException

    @app.errorhandler(HTTPException)
    def handle_http_exception(e):
        """HTTP Hatalarını (404, 405, 400 vb.) JSON formatında yakalar."""
        response = e.get_response()
        response.data = json.dumps({
            "error": e.description,
            "code": e.code
        })
        response.content_type = "application/json"
        return response

    @app.errorhandler(Exception)
    def handle_exception(e):
        """Beklenmeyen sistem hatalarını (500) JSON formatında yakalar."""
        app.logger.error(f"Sunucu hatası: {str(e)}", exc_info=True)
        message = str(e) if app.config.get("DEBUG") else "Lütfen daha sonra tekrar deneyiniz."
        return {
            "error": "Sunucuda beklenmeyen bir hata oluştu.",
            "message": message,
            "code": 500
        }, 500

    return app