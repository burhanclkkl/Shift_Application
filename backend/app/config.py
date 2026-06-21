import os
from datetime import timedelta
from dotenv import load_dotenv

# .env dosyasını çevre değişkenlerine yükle
load_dotenv()

def _prepare_db_url(url):
    """Veritabanı URL'sini SQLAlchemy için hazırlar."""
    if url and url.startswith("postgresql://"):
        # SQLAlchemy 1.4+ sonrası için postgresql+psycopg2 formatını garantiler.
        return url.replace("postgresql://", "postgresql+psycopg2://", 1)
    return url

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "varsayilan-gizli-anahtar")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "varsayilan-jwt-anahtari")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=8)
    SQLALCHEMY_TRACK_MODIFICATIONS = False


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = _prepare_db_url(os.getenv("DATABASE_URL") or os.getenv("SQLALCHEMY_DATABASE_URI"))
    
    # SQLite kullanımını tamamen devre dışı bırakıyoruz; adres tanımlanmamışsa hata fırlatıyoruz.
    if not SQLALCHEMY_DATABASE_URI:
        raise ValueError("Veritabanı bağlantı adresi (DATABASE_URL veya SQLALCHEMY_DATABASE_URI) bulunamadı! Lütfen .env dosyasını kontrol edin.")


class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = _prepare_db_url(os.getenv("DATABASE_URL"))


config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig
}