import os
from datetime import timedelta

class Config:
    """Base configuration class for Japan Education System API."""
    
    # General Settings
    APP_NAME = "Japan Education Portal"
    DEBUG = False
    TESTING = False
    SECRET_KEY = os.environ.get("SECRET_KEY", "super-secret-educational-key-123")
    
    # Regional & Localization Settings
    TIMEZONE = "Asia/Tokyo"
    DEFAULT_LANGUAGE = "ja"
    SUPPORTED_LANGUAGES = ["ja", "en"]
    
    # Academic Calendar Defaults (Japan Standard)
    # The academic year in Japan typically starts on April 1st
    ACADEMIC_YEAR_START_MONTH = 4  
    SEMESTER_SYSTEM = "3-semester"  # Options: 3-semester (Trimester), 2-semester (Semester)
    
    # Database Configuration
    DB_USER = os.environ.get("DB_USER", "edu_user")
    DB_PASSWORD = os.environ.get("DB_PASSWORD", "secure_password_99")
    DB_HOST = os.environ.get("DB_HOST", "localhost")
    DB_PORT = os.environ.get("DB_PORT", "5432")
    DB_NAME = os.environ.get("DB_NAME", "japan_edu_db")
    
    SQLALCHEMY_DATABASE_URI = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Security & Session Settings
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=2)
    PASSWORD_MIN_LENGTH = 8


class DevelopmentConfig(Config):
    """Development environment configurations."""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///dev_education_jp.db"


class TestingConfig(Config):
    """Testing environment configurations."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"


class ProductionConfig(Config):
    """Production environment configurations."""
    # Enforce strict security settings in production
    COOKIE_SECURE = True
    JWT_COOKIE_SECURE = True


# Mapping configurations to short names
config_by_name = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig
}

# Example usage within an application:
# current_config = config_by_name[os.environ.get("FLASK_ENV", "development")]
