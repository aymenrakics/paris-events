"""
Service de synchronisation avec l'API Open Data de la Ville de Paris.
Récupère les événements depuis le dataset "que-faire-a-paris" et les stocke en base.
"""

import logging
from datetime import datetime
from typing import Optional

import httpx
from sqlalchemy.orm import Session

from app.config import settings
from app.models.database import SessionLocal, Event, SyncLog

logger = logging.getLogger(__name__)


class SyncService:
    """Service responsable de la synchronisation des événements depuis l'API Open Data Paris."""

    def __init__(self):
        self.base_url = settings.OPENDATA_BASE_URL
        self.dataset = settings.OPENDATA_DATASET

    async def fetch_from_api(self, limit: int = 100, offset: int = 0) -> dict:
        """
        Récupère les événements depuis l'API Open Data Paris.

        Args:
            limit: Nombre max d'enregistrements par requête (max 100)
            offset: Décalage pour la pagination

        Returns:
            Données JSON de l'API
        """
        url = f"{self.base_url}/catalog/datasets/{self.dataset}/records"
        params = {
            "limit": min(limit, 100),
            "offset": offset,
            "order_by": "date_start DESC",
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            return response.json()

    def _parse_datetime(self, date_str: Optional[str]) -> Optional[datetime]:
        """Parse une chaîne de date en objet datetime."""
        if not date_str:
            return None
        try:
            # L'API renvoie des dates au format ISO 8601
            return datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        except (ValueError, AttributeError):
            return None

    def _extract_image_url(self, record: dict) -> Optional[str]:
        """Extrait l'URL de l'image de couverture depuis un enregistrement."""
        cover = record.get("cover_url") or record.get("image") or record.get("cover")
        if cover:
            return cover if isinstance(cover, str) else cover.get("url")
        # Tenter le champ cover_alt
        cover_alt = record.get("cover_alt")
        if cover_alt and isinstance(cover_alt, dict):
            return cover_alt.get("url")
        return None

    def _normalize_category(self, raw_category: Optional[str]) -> Optional[str]:
        """
        Normalise les catégories pour regrouper les événements similaires.
        """
        if not raw_category:
            return "Autre"

        category_lower = raw_category.lower().strip()

        category_mapping = {
            "concerts": "Concert",
            "concert": "Concert",
            "musique": "Concert",
            "spectacles": "Spectacle",
            "spectacle": "Spectacle",
            "théâtre": "Théâtre",
            "theatre": "Théâtre",
            "danse": "Danse",
            "expositions": "Exposition",
            "exposition": "Exposition",
            "expo": "Exposition",
            "sport": "Sport",
            "sports": "Sport",
            "conférences": "Conférence",
            "conférence": "Conférence",
            "conference": "Conférence",
            "ateliers": "Atelier",
            "atelier": "Atelier",
            "animations": "Animation",
            "animation": "Animation",
            "festivals": "Festival",
            "festival": "Festival",
            "cinéma": "Cinéma",
            "cinema": "Cinéma",
            "lectures": "Lecture",
            "lecture": "Lecture",
            "salon": "Salon",
            "salons": "Salon",
            "enfants": "Enfants",
            "loisirs": "Loisirs",
            "balade": "Balade",
            "balades": "Balade",
            "visite": "Visite",
            "visites": "Visite",
        }

        return category_mapping.get(category_lower, raw_category.capitalize())

    def _map_record_to_event(self, record: dict) -> dict:
        """
        Transforme un enregistrement de l'API en dictionnaire compatible avec le modèle Event.
        """
        # Les champs peuvent être directement dans le record ou dans record["fields"]
        fields = record.get("fields", record)

        # Extraire les coordonnées géographiques
        lat, lon = None, None
        geo = fields.get("lat_lon") or fields.get("geoloc") or fields.get("geo_point_2d")
        if geo:
            if isinstance(geo, dict):
                lat = geo.get("lat")
                lon = geo.get("lon") or geo.get("lng")
            elif isinstance(geo, list) and len(geo) == 2:
                lat, lon = geo[0], geo[1]

        return {
            "external_id": record.get("id") or fields.get("id") or str(hash(fields.get("title", ""))),
            "title": fields.get("title") or fields.get("titre") or "Sans titre",
            "description": fields.get("description"),
            "lead_text": fields.get("lead_text") or fields.get("chapeau"),
            "category": self._normalize_category(
                fields.get("category") or fields.get("categorie")
            ),
            "tags": fields.get("tags"),
            "date_start": self._parse_datetime(fields.get("date_start") or fields.get("date_debut")),
            "date_end": self._parse_datetime(fields.get("date_end") or fields.get("date_fin")),
            "date_description": fields.get("date_description") or fields.get("occurrences"),
            "address": fields.get("address_street")
            or fields.get("address")
            or fields.get("adresse"),
            "city": fields.get("address_city") or "Paris",
            "zipcode": fields.get("address_zipcode") or fields.get("code_postal"),
            "latitude": lat,
            "longitude": lon,
            "place_name": fields.get("address_name")
            or fields.get("nom_du_lieu")
            or fields.get("place_name"),
            "price_type": fields.get("price_type") or fields.get("type_de_prix"),
            "price_detail": fields.get("price_detail") or fields.get("detail_du_prix"),
            "contact_url": fields.get("contact_url") or fields.get("url"),
            "contact_phone": fields.get("contact_phone") or fields.get("telephone"),
            "contact_email": fields.get("contact_mail") or fields.get("email"),
            "cover_image_url": self._extract_image_url(fields),
            "cover_image_alt": fields.get("cover_alt") if isinstance(fields.get("cover_alt"), str) else None,
            "access_type": fields.get("access_type"),
            "access_link": fields.get("access_link"),
            "transport": fields.get("transport"),
            "pmr_accessible": bool(fields.get("pmr") or fields.get("access_pmr")),
            "blind_accessible": bool(fields.get("blind") or fields.get("access_blind")),
            "deaf_accessible": bool(fields.get("deaf") or fields.get("access_deaf")),
        }

    async def sync_events(self, max_records: int = 500) -> dict:
        """
        Synchronise les événements depuis l'API Open Data Paris.

        Stratégie : upsert (insert or update) basé sur external_id.

        Args:
            max_records: Nombre maximum d'enregistrements à synchroniser

        Returns:
            Statistiques de synchronisation
        """
        db: Session = SessionLocal()
        sync_log = SyncLog(started_at=datetime.utcnow())
        db.add(sync_log)
        db.commit()

        stats = {"fetched": 0, "created": 0, "updated": 0}

        try:
            offset = 0
            batch_size = 100

            while offset < max_records:
                # Récupérer un lot depuis l'API
                data = await self.fetch_from_api(
                    limit=min(batch_size, max_records - offset),
                    offset=offset,
                )

                results = data.get("results", [])
                if not results:
                    break

                stats["fetched"] += len(results)

                # Traiter chaque enregistrement
                for record in results:
                    event_data = self._map_record_to_event(record)

                    # Chercher si l'événement existe déjà
                    existing = (
                        db.query(Event)
                        .filter(Event.external_id == event_data["external_id"])
                        .first()
                    )

                    if existing:
                        # Mise à jour
                        for key, value in event_data.items():
                            if key != "external_id":
                                setattr(existing, key, value)
                        existing.synced_at = datetime.utcnow()
                        stats["updated"] += 1
                    else:
                        # Création
                        new_event = Event(**event_data)
                        db.add(new_event)
                        stats["created"] += 1

                db.commit()
                offset += len(results)

                # Si on a reçu moins que demandé, c'est la fin
                if len(results) < batch_size:
                    break

            # Mettre à jour le log de sync
            sync_log.completed_at = datetime.utcnow()
            sync_log.events_fetched = stats["fetched"]
            sync_log.events_created = stats["created"]
            sync_log.events_updated = stats["updated"]
            sync_log.status = "success"
            db.commit()

            logger.info(
                f"Sync terminée : {stats['fetched']} récupérés, "
                f"{stats['created']} créés, {stats['updated']} mis à jour"
            )

        except Exception as e:
            sync_log.status = "error"
            sync_log.error_message = str(e)
            db.commit()
            logger.error(f"Erreur de synchronisation : {e}")
            raise

        finally:
            db.close()

        return stats
