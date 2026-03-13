"""
Tests unitaires pour l'API Paris Events.
Couvre les endpoints principaux et la logique métier.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.models.database import Base, get_db, Event

# ─── Configuration de la base de données de test ──────────────────

SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_db():
    """Crée et détruit la base de test pour chaque test."""
    Base.metadata.create_all(bind=engine)
    # Insérer des données de test
    db = TestingSessionLocal()
    events = [
        Event(
            external_id="test-1",
            title="Concert de Jazz au Sunset",
            description="Un magnifique concert de jazz",
            lead_text="Jazz à Paris",
            category="Concert",
            date_start="2026-04-01T20:00:00",
            date_end="2026-04-01T23:00:00",
            address="60 Rue des Lombards",
            city="Paris",
            zipcode="75001",
            price_type="payant",
            price_detail="15€ - 25€",
            is_active=True,
        ),
        Event(
            external_id="test-2",
            title="Exposition Impressionniste",
            description="Les chefs-d'œuvre de l'impressionnisme",
            lead_text="Art et culture",
            category="Exposition",
            date_start="2026-03-15T10:00:00",
            date_end="2026-06-30T18:00:00",
            address="1 Rue de la Légion d'Honneur",
            city="Paris",
            zipcode="75007",
            price_type="gratuit",
            is_active=True,
        ),
        Event(
            external_id="test-3",
            title="Match de Rugby - Stade Français",
            description="Top 14 - Journée 20",
            category="Sport",
            date_start="2026-04-05T15:00:00",
            address="2 Avenue Gordon Bennett",
            city="Paris",
            zipcode="75016",
            price_type="payant",
            is_active=True,
        ),
    ]
    db.add_all(events)
    db.commit()
    db.close()

    yield

    Base.metadata.drop_all(bind=engine)


client = TestClient(app)


# ─── Tests des endpoints ──────────────────────────────────────────

class TestHealthCheck:
    def test_health_returns_ok(self):
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["database"] == "connected"
        assert data["total_events"] == 3

class TestListEvents:
    def test_list_all_events(self):
        response = client.get("/api/events")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 3
        assert len(data["items"]) == 3

    def test_search_by_keyword(self):
        response = client.get("/api/events?q=jazz")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert "Jazz" in data["items"][0]["title"]

    def test_filter_by_category(self):
        response = client.get("/api/events?category=Sport")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["items"][0]["category"] == "Sport"

    def test_filter_free_only(self):
        response = client.get("/api/events?free_only=true")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["items"][0]["price_type"] == "gratuit"

    def test_pagination(self):
        response = client.get("/api/events?page=1&per_page=2")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 2
        assert data["total"] == 3
        assert data["has_next"] is True
        assert data["has_prev"] is False

    def test_sort_by_title(self):
        response = client.get("/api/events?sort_by=title&order=asc")
        assert response.status_code == 200
        data = response.json()
        titles = [e["title"] for e in data["items"]]
        assert titles == sorted(titles)


class TestGetEvent:
    def test_get_existing_event(self):
        # D'abord récupérer la liste pour avoir un ID
        list_response = client.get("/api/events")
        event_id = list_response.json()["items"][0]["id"]

        response = client.get(f"/api/events/{event_id}")
        assert response.status_code == 200
        assert response.json()["id"] == event_id

    def test_get_nonexistent_event(self):
        response = client.get("/api/events/99999")
        assert response.status_code == 404


class TestCategories:
    def test_list_categories(self):
        response = client.get("/api/categories")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3
        category_names = [c["name"] for c in data]
        assert "Concert" in category_names
        assert "Exposition" in category_names
        assert "Sport" in category_names


class TestStats:
    def test_get_stats(self):
        response = client.get("/api/stats")
        assert response.status_code == 200
        data = response.json()
        assert data["total_events"] == 3
