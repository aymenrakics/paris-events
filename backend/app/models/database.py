"""
Modèles de base de données et configuration SQLAlchemy.
"""

from datetime import datetime
from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Float,
    Boolean,
    Index,
)
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},  # Nécessaire pour SQLite
    echo=settings.DEBUG,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Event(Base):
    """Modèle représentant un événement culturel à Paris."""

    __tablename__ = "events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    external_id = Column(String(255), unique=True, nullable=False, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    lead_text = Column(Text, nullable=True)  # Texte d'accroche court

    # Catégorisation
    category = Column(String(100), nullable=True, index=True)
    tags = Column(Text, nullable=True)  # Tags séparés par des virgules

    # Dates
    date_start = Column(DateTime, nullable=True, index=True)
    date_end = Column(DateTime, nullable=True)
    date_description = Column(String(500), nullable=True)  # Description textuelle des dates

    # Localisation
    address = Column(String(500), nullable=True)
    city = Column(String(100), default="Paris")
    zipcode = Column(String(10), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    place_name = Column(String(300), nullable=True)

    # Informations complémentaires
    price_type = Column(String(50), nullable=True)  # gratuit, payant
    price_detail = Column(Text, nullable=True)
    contact_url = Column(String(1000), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    contact_email = Column(String(255), nullable=True)

    # Médias
    cover_image_url = Column(String(1000), nullable=True)
    cover_image_alt = Column(String(500), nullable=True)

    # Transport / Accès
    access_type = Column(String(100), nullable=True)
    access_link = Column(String(1000), nullable=True)
    transport = Column(Text, nullable=True)

    # Accessibilité
    pmr_accessible = Column(Boolean, default=False)
    blind_accessible = Column(Boolean, default=False)
    deaf_accessible = Column(Boolean, default=False)

    # Métadonnées
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    synced_at = Column(DateTime, default=datetime.utcnow)

    # Index composites pour les recherches fréquentes
    __table_args__ = (
        Index("idx_category_date", "category", "date_start"),
        Index("idx_active_date", "is_active", "date_start"),
    )

    def __repr__(self):
        return f"<Event(id={self.id}, title='{self.title[:50]}')>"


class SyncLog(Base):
    """Journal de synchronisation avec l'API Open Data Paris."""

    __tablename__ = "sync_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    events_fetched = Column(Integer, default=0)
    events_created = Column(Integer, default=0)
    events_updated = Column(Integer, default=0)
    status = Column(String(20), default="running")  # running, success, error
    error_message = Column(Text, nullable=True)


def init_db():
    """Initialise la base de données en créant toutes les tables."""
    Base.metadata.create_all(bind=engine)


def get_db():
    """Dependency injection pour obtenir une session de base de données."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
