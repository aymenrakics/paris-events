"""
Configuration de l'application via Pydantic Settings.
Charge les variables d'environnement ou utilise les valeurs par défaut.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Configuration centralisée de l'application."""

    # Base de données
    DATABASE_URL: str = "sqlite:///./paris_events.db"

    # API Open Data Paris
    OPENDATA_BASE_URL: str = "https://opendata.paris.fr/api/explore/v2.1"
    OPENDATA_DATASET: str = "que-faire-a-paris-"

    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100

    # Cache
    SYNC_INTERVAL_HOURS: int = 6  # Re-sync toutes les 6 heures

    # Application
    APP_NAME: str = "Paris Events API"
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
