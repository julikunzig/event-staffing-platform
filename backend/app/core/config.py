from pydantic_settings import BaseSettings
from pydantic import field_validator, ConfigDict
from typing import Literal


class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/event_staffing"

    # JWT
    JWT_SECRET: str = "change-this-secret-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_HOURS: int = 8

    # Notifications
    RESEND_API_KEY: str = ""
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_FROM_NUMBER: str = ""
    TWILIO_WHATSAPP_FROM: str = "whatsapp:+14155238886"  # Twilio sandbox number

    # AI
    OPENAI_API_KEY: str = ""

    # Web Push (VAPID)
    VAPID_PRIVATE_KEY: str = ""
    VAPID_PUBLIC_KEY: str = ""
    VAPID_CLAIMS_EMAIL: str = "mailto:admin@eventscontrol.com"

    # Email Configuration
    USE_MAILHOG: bool = True
    MAILHOG_HOST: str = "localhost"
    MAILHOG_PORT: int = 1025

    # App
    ENVIRONMENT: Literal["development", "production", "test"] = "development"
    APP_NAME: str = "Event Staffing Platform"
    API_PREFIX: str = "/api/v1"

    # Geolocation
    MAX_DISTANCE_METERS: float = 500.0

    # Rate limiting
    AUTH_RATE_LIMIT: str = "60/minute"

    # File storage (uploaded documents). "local" today; swap to "s3" later
    # by adding a backend in app/services/storage.py and changing this value.
    STORAGE_BACKEND: Literal["local"] = "local"
    UPLOAD_DIR: str = "uploads"
    UPLOAD_PUBLIC_PREFIX: str = "/uploads"
    MAX_UPLOAD_SIZE_MB: int = 10


settings = Settings()
