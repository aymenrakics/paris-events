"""
Paris Events API — Point d'entrée principal
Application FastAPI pour la découverte d'événements culturels à Paris.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router as api_router
from app.models.database import init_db
from app.services.sync_service import SyncService


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestion du cycle de vie de l'application."""
    # Startup : initialiser la base de données et lancer une première synchronisation
    init_db()
    sync_service = SyncService()
    await sync_service.sync_events()
    yield
    # Shutdown : nettoyage si nécessaire


app = FastAPI(
    title="Paris Events API",
    description=(
        "API pour découvrir les événements culturels et ludiques à Paris. "
        "Données issues de l'Open Data de la Ville de Paris."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# Configuration CORS pour le frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enregistrement des routes
app.include_router(api_router, prefix="/api")


@app.get("/", tags=["Root"])
async def root():
    """Endpoint racine — informations sur l'API."""
    return {
        "name": "Paris Events API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health",
    }
