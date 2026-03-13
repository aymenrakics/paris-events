"""
Service de requêtes pour les événements.
Contient la logique métier de recherche, filtrage et pagination.
"""

import math
from datetime import datetime, timedelta
from typing import Optional, List, Tuple

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.database import Event


class EventService:
    """Service pour les opérations de lecture sur les événements."""

    @staticmethod
    def get_events(
        db: Session,
        q: Optional[str] = None,
        category: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        free_only: bool = False,
        sort_by: str = "date",
        order: str = "asc",
        page: int = 1,
        per_page: int = 20,
    ) -> Tuple[List[Event], int]:
        """
        Recherche et filtre les événements avec pagination.

        Args:
            db: Session de base de données
            q: Recherche textuelle (titre, description)
            category: Filtre par catégorie
            date_from: Date de début minimum
            date_to: Date de fin maximum
            free_only: Ne retourner que les événements gratuits
            sort_by: Champ de tri (date, title)
            order: Ordre de tri (asc, desc)
            page: Numéro de page
            per_page: Nombre de résultats par page

        Returns:
            Tuple (liste d'événements, nombre total)
        """
        query = db.query(Event).filter(Event.is_active.is_(True))

        # ── Recherche textuelle ────────────────────────────────
        if q:
            search_term = f"%{q}%"
            query = query.filter(
                or_(
                    Event.title.ilike(search_term),
                    Event.description.ilike(search_term),
                    Event.lead_text.ilike(search_term),
                    Event.place_name.ilike(search_term),
                    Event.tags.ilike(search_term),
                )
            )

        # ── Filtre par catégorie ───────────────────────────────
        if category:
            query = query.filter(Event.category == category)

        # ── Filtre par date ────────────────────────────────────
        if date_from:
            query = query.filter(
                or_(
                    Event.date_end >= date_from,
                    Event.date_start >= date_from,
                )
            )
        if date_to:
            query = query.filter(Event.date_start <= date_to)

        # ── Filtre gratuit ─────────────────────────────────────
        if free_only:
            query = query.filter(
                or_(
                    Event.price_type.ilike("%gratuit%"),
                    Event.price_type.ilike("%free%"),
                )
            )

        # ── Comptage total (avant pagination) ──────────────────
        total = query.count()

        # ── Tri ────────────────────────────────────────────────
        if sort_by == "title":
            order_col = Event.title.asc() if order == "asc" else Event.title.desc()
        elif sort_by == "date":
            order_col = (
                Event.date_start.asc() if order == "asc" else Event.date_start.desc()
            )
        else:
            order_col = Event.date_start.desc()

        query = query.order_by(order_col)

        # ── Pagination ─────────────────────────────────────────
        offset = (page - 1) * per_page
        events = query.offset(offset).limit(per_page).all()

        return events, total

    @staticmethod
    def get_event_by_id(db: Session, event_id: int) -> Optional[Event]:
        """Récupère un événement par son ID."""
        return db.query(Event).filter(Event.id == event_id).first()

    @staticmethod
    def get_categories(db: Session) -> List[dict]:
        """
        Récupère toutes les catégories avec le nombre d'événements associés.

        Returns:
            Liste de dictionnaires {name, count, slug}
        """
        results = (
            db.query(Event.category, func.count(Event.id).label("count"))
            .filter(Event.is_active.is_(True))
            .filter(Event.category.isnot(None))
            .group_by(Event.category)
            .order_by(func.count(Event.id).desc())
            .all()
        )

        categories = []
        for name, count in results:
            slug = (
                name.lower()
                .replace(" ", "-")
                .replace("é", "e")
                .replace("è", "e")
                .replace("ê", "e")
                .replace("â", "a")
                .replace("î", "i")
            )
            categories.append({"name": name, "count": count, "slug": slug})

        return categories

    @staticmethod
    def get_stats(db: Session) -> dict:
        """Retourne des statistiques globales sur les événements."""
        total = db.query(Event).filter(Event.is_active.is_(True)).count()
        now = datetime.utcnow()

        upcoming = (
            db.query(Event)
            .filter(Event.is_active.is_(True), Event.date_start >= now)
            .count()
        )

        today = (
            db.query(Event)
            .filter(
                Event.is_active.is_(True),
                Event.date_start <= now,
                or_(Event.date_end >= now, Event.date_end.is_(None)),
            )
            .count()
        )

        return {
            "total_events": total,
            "upcoming_events": upcoming,
            "today_events": today,
        }
