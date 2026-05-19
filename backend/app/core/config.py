from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import Literal


class Settings(BaseSettings):
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

    # App
    ENVIRONMENT: Literal["development", "production", "test"] = "development"
    APP_NAME: str = "Event Staffing Platform"
    API_PREFIX: str = "/api/v1"

    # Geolocation
    MAX_DISTANCE_METERS: float = 500.0

    # Rate limiting
    AUTH_RATE_LIMIT: str = "60/minute"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
