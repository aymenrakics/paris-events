"""
Schémas Pydantic pour la validation des requêtes et la sérialisation des réponses.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


# ─── Schémas de réponse pour les événements ────────────────────────

class EventBase(BaseModel):
    """Schéma de base d'un événement."""
    title: str
    category: Optional[str] = None
    lead_text: Optional[str] = None
    date_start: Optional[datetime] = None
    date_end: Optional[datetime] = None
    date_description: Optional[str] = None
    address: Optional[str] = None
    place_name: Optional[str] = None
    cover_image_url: Optional[str] = None


class EventSummary(EventBase):
    """Schéma résumé d'un événement (pour les listes)."""
    id: int
    external_id: str
    price_type: Optional[str] = None
    city: str = "Paris"
    zipcode: Optional[str] = None

    class Config:
        from_attributes = True


class EventDetail(EventBase):
    """Schéma détaillé d'un événement (page de détail)."""
    id: int
    external_id: str
    description: Optional[str] = None
    tags: Optional[str] = None

    # Localisation
    address: Optional[str] = None
    city: str = "Paris"
    zipcode: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    place_name: Optional[str] = None

    # Prix
    price_type: Optional[str] = None
    price_detail: Optional[str] = None

    # Contact
    contact_url: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None

    # Médias
    cover_image_url: Optional[str] = None
    cover_image_alt: Optional[str] = None

    # Accès
    access_type: Optional[str] = None
    access_link: Optional[str] = None
    transport: Optional[str] = None

    # Accessibilité
    pmr_accessible: bool = False
    blind_accessible: bool = False
    deaf_accessible: bool = False

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Schéma de pagination ──────────────────────────────────────────

class PaginatedResponse(BaseModel):
    """Réponse paginée générique."""
    items: List[EventSummary]
    total: int
    page: int
    per_page: int
    total_pages: int
    has_next: bool
    has_prev: bool


# ─── Schéma pour les catégories ────────────────────────────────────

class CategoryInfo(BaseModel):
    """Information sur une catégorie d'événements."""
    name: str
    count: int
    slug: str


# ─── Schéma pour la synchronisation ───────────────────────────────

class SyncStatus(BaseModel):
    """Statut d'une synchronisation."""
    status: str
    events_fetched: int = 0
    events_created: int = 0
    events_updated: int = 0
    message: str = ""


# ─── Schéma pour le health check ──────────────────────────────────

class HealthCheck(BaseModel):
    """Réponse du health check."""
    status: str = "ok"
    version: str = "1.0.0"
    database: str = "connected"
    total_events: int = 0
    last_sync: Optional[datetime] = None
