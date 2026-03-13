"""
Routes de l'API — Endpoints REST pour les événements culturels à Paris.
"""

import math
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.models.database import get_db, Event, SyncLog
from app.schemas.events import (
    EventSummary,
    EventDetail,
    PaginatedResponse,
    CategoryInfo,
    SyncStatus,
    HealthCheck,
)
from app.services.event_service import EventService
from app.services.sync_service import SyncService

router = APIRouter()
event_service = EventService()


# ─── Health Check ──────────────────────────────────────────────────

@router.get("/health", response_model=HealthCheck, tags=["System"])
async def health_check(db: Session = Depends(get_db)):
    """
    Vérifie l'état de santé de l'API.
    Retourne le statut, la version, et des métriques de base.
    """
    total = db.query(Event).count()
    last_sync = (
        db.query(SyncLog)
        .filter(SyncLog.status == "success")
        .order_by(SyncLog.completed_at.desc())
        .first()
    )

    return HealthCheck(
        status="ok",
        version="1.0.0",
        database="connected",
        total_events=total,
        last_sync=last_sync.completed_at if last_sync else None,
    )


# ─── Événements ───────────────────────────────────────────────────

@router.get("/events", response_model=PaginatedResponse, tags=["Events"])
async def list_events(
    q: Optional[str] = Query(None, description="Recherche textuelle"),
    category: Optional[str] = Query(None, description="Filtre par catégorie"),
    date_from: Optional[str] = Query(None, description="Date de début (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="Date de fin (YYYY-MM-DD)"),
    date_filter: Optional[str] = Query(
        None, description="Filtre rapide : today, week, month"
    ),
    free_only: bool = Query(False, description="Événements gratuits uniquement"),
    sort_by: str = Query("date", description="Tri : date, title"),
    order: str = Query("asc", description="Ordre : asc, desc"),
    page: int = Query(1, ge=1, description="Numéro de page"),
    per_page: int = Query(20, ge=1, le=100, description="Résultats par page"),
    db: Session = Depends(get_db),
):
    """
    Liste les événements culturels à Paris avec filtrage, recherche et pagination.

    Paramètres de recherche combinables : texte libre, catégorie, plage de dates,
    et filtre de gratuité.
    """
    # Parsing des dates
    parsed_date_from = None
    parsed_date_to = None

    if date_filter:
        now = datetime.utcnow()
        if date_filter == "today":
            parsed_date_from = now.replace(hour=0, minute=0, second=0)
            parsed_date_to = now.replace(hour=23, minute=59, second=59)
        elif date_filter == "week":
            parsed_date_from = now
            parsed_date_to = now + timedelta(days=7)
        elif date_filter == "month":
            parsed_date_from = now
            parsed_date_to = now + timedelta(days=30)

    if date_from:
        try:
            parsed_date_from = datetime.strptime(date_from, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(400, "Format de date invalide. Utilisez YYYY-MM-DD.")

    if date_to:
        try:
            parsed_date_to = datetime.strptime(date_to, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(400, "Format de date invalide. Utilisez YYYY-MM-DD.")

    # Requête
    events, total = event_service.get_events(
        db=db,
        q=q,
        category=category,
        date_from=parsed_date_from,
        date_to=parsed_date_to,
        free_only=free_only,
        sort_by=sort_by,
        order=order,
        page=page,
        per_page=per_page,
    )

    total_pages = math.ceil(total / per_page) if total > 0 else 1

    return PaginatedResponse(
        items=[EventSummary.model_validate(e) for e in events],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages,
        has_next=page < total_pages,
        has_prev=page > 1,
    )


@router.get("/events/{event_id}", response_model=EventDetail, tags=["Events"])
async def get_event(event_id: int, db: Session = Depends(get_db)):
    """
    Récupère le détail complet d'un événement par son ID.
    """
    event = event_service.get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Événement non trouvé")
    return EventDetail.model_validate(event)


# ─── Catégories ────────────────────────────────────────────────────

@router.get("/categories", response_model=list[CategoryInfo], tags=["Categories"])
async def list_categories(db: Session = Depends(get_db)):
    """
    Liste toutes les catégories d'événements avec le nombre d'événements par catégorie.
    """
    categories = event_service.get_categories(db)
    return [CategoryInfo(**c) for c in categories]


# ─── Synchronisation ──────────────────────────────────────────────

@router.post("/events/sync", response_model=SyncStatus, tags=["System"])
async def sync_events():
    """
    Lance une synchronisation manuelle des événements depuis l'API Open Data Paris.
    """
    sync_service = SyncService()
    try:
        stats = await sync_service.sync_events()
        return SyncStatus(
            status="success",
            events_fetched=stats["fetched"],
            events_created=stats["created"],
            events_updated=stats["updated"],
            message="Synchronisation terminée avec succès.",
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la synchronisation : {str(e)}",
        )


# ─── Statistiques ─────────────────────────────────────────────────

@router.get("/stats", tags=["System"])
async def get_stats(db: Session = Depends(get_db)):
    """
    Retourne des statistiques globales sur les événements.
    """
    return event_service.get_stats(db)
