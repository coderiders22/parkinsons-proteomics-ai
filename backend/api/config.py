"""
Application Configuration
"""
import os
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # App Settings
    APP_NAME: str = "Parkinson's Proteomics AI API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # API Settings
    API_PREFIX: str = "/api/v1"
    
    # JWT Settings
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Model Settings
    # If model files are in backend/ directory (for Render deployment)
    # Otherwise, they should be in repo root
    _backend_dir = os.path.dirname(os.path.dirname(__file__))  # backend/
    _repo_root = os.path.dirname(_backend_dir)  # repo root
    
    # Try backend/ first (for Render), then repo root
    _model_in_backend = os.path.join(_backend_dir, "lgb_model_20251211_093754.pkl")
    _model_in_root = os.path.join(_repo_root, "lgb_model_20251211_093754.pkl")
    
    MODEL_PATH: str = _model_in_backend if os.path.exists(_model_in_backend) else _model_in_root
    SCALER_PATH: str = (
        os.path.join(_backend_dir, "scaler_20251211_093754.pkl")
        if os.path.exists(os.path.join(_backend_dir, "scaler_20251211_093754.pkl"))
        else os.path.join(_repo_root, "scaler_20251211_093754.pkl")
    )
    
    # CORS Settings - Allow all origins in development
    CORS_ORIGINS: list = ["*"] if os.getenv("ENVIRONMENT", "development") == "development" else [
        "http://localhost:8081",
        "http://localhost:19000",
        "http://localhost:19001",
        "http://localhost:19002",
        "http://localhost:19006",
        "exp://localhost:8081",
        "http://192.168.1.6:8081",
        "exp://192.168.1.6:8081",
        "http://192.168.1.6:19000",
        "http://192.168.1.6:19001",
        "http://192.168.1.6:19002",
        "http://192.168.1.6:19006",
        os.getenv("FRONTEND_URL", "http://localhost:8081"),
    ]
    
    # Database Settings (for Django)
    DATABASE_URL: str = "sqlite:///./db.sqlite3"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


settings = get_settings()
