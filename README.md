# 🎭 Paris Events — Découvrez les événements culturels à Paris

> Application web full-stack permettant de rechercher et explorer les événements culturels et ludiques à Paris : concerts, spectacles, théâtre, sport, expositions, et plus encore.

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)

---

## 📋 Table des matières

- [Aperçu du projet](#-aperçu-du-projet)
- [Architecture technique](#-architecture-technique)
- [Stack technique](#-stack-technique)
- [Installation et lancement](#-installation-et-lancement)
- [API Documentation](#-api-documentation)
- [Choix techniques et justifications](#-choix-techniques-et-justifications)
- [Améliorations possibles](#-améliorations-possibles)

---

## 🎯 Aperçu du projet

Paris Events est une application qui agrège les données d'événements culturels depuis l'**API Open Data de la Ville de Paris** et les présente dans une interface moderne et intuitive.

### Fonctionnalités

- **Recherche** d'événements par mot-clé
- **Filtrage** par catégorie (concert, théâtre, exposition, sport, etc.)
- **Filtrage par date** (aujourd'hui, cette semaine, ce mois)
- **Tri** par date, titre ou pertinence
- **Pagination** des résultats
- **Détail** complet d'un événement (description, lieu, dates, prix, accès)
- **Favoris** (stockage local côté client)
- **Design responsive** (mobile-first)

---

## 🏗 Architecture technique

Le backend agit comme un **proxy intelligent** :
1. Il récupère les données depuis l'API Open Data Paris
2. Il les normalise et les enrichit (parsing des dates, catégorisation)
3. Il les cache en base SQLite pour améliorer les performances
4. Il expose une API REST propre et documentée au frontend

---

## 🛠 Stack technique

### Backend
| Technologie | Justification |
|---|---|
| **Python 3.11+** | Langage principal, excellent écosystème web/data |
| **FastAPI** | Framework moderne, auto-documentation OpenAPI, async natif, validation Pydantic |
| **SQLAlchemy** | ORM Python de référence, flexible et puissant |
| **SQLite** | Base légère, zéro config, parfaite pour un MVP |
| **httpx** | Client HTTP async pour les appels à l'API Paris |
| **Pydantic** | Validation et sérialisation des données |

### Frontend
| Technologie | Justification |
|---|---|
| **React 18** | Bibliothèque UI de référence, composants réutilisables |
| **Vite** | Bundler ultra-rapide, DX supérieure à CRA |
| **Tailwind CSS** | Utility-first CSS, prototypage rapide, design cohérent |
| **Axios** | Client HTTP avec interceptors et gestion d'erreurs |
| **React Router** | Navigation SPA |
| **date-fns** | Manipulation de dates légère |

### DevOps
| Technologie | Justification |
|---|---|
| **Docker** | Conteneurisation, reproductibilité |
| **Docker Compose** | Orchestration multi-services |

---

## 🚀 Installation et lancement

### Option 1 : Docker (recommandé)

```bash
# Cloner le repo
git clone https://github.com/votre-username/paris-events.git
cd paris-events

# Lancer avec Docker Compose
docker-compose up --build

# L'application est accessible sur :
# Frontend : http://localhost:5173
# Backend API : http://localhost:8000
# Documentation API : http://localhost:8000/docs
```

### Option 2 : Installation manuelle

#### Backend

```bash
cd backend

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Installer les dépendances
pip install -r requirements.txt

# Lancer le serveur
uvicorn app.main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

---

## 📡 API Documentation

Une fois le backend lancé, la documentation interactive est disponible sur :
- **Swagger UI** : http://localhost:8000/docs
- **ReDoc** : http://localhost:8000/redoc

### Endpoints principaux

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/events` | Liste des événements (avec filtres) |
| `GET` | `/api/events/{id}` | Détail d'un événement |
| `GET` | `/api/categories` | Liste des catégories |
| `POST` | `/api/events/sync` | Synchronisation depuis Open Data Paris |
| `GET` | `/api/health` | Health check |

### Paramètres de recherche (`GET /api/events`)

| Paramètre | Type | Description |
|---|---|---|
| `q` | string | Recherche textuelle |
| `category` | string | Filtre par catégorie |
| `date_from` | date | Date de début |
| `date_to` | date | Date de fin |
| `sort_by` | string | Tri : `date`, `title` |
| `order` | string | Ordre : `asc`, `desc` |
| `page` | int | Numéro de page (défaut: 1) |
| `per_page` | int | Résultats par page (défaut: 20) |

---

## 🔮 Améliorations possibles

Si j'avais plus de temps, voici ce que j'ajouterais :

1. **Carte interactive** pour visualiser les événements géographiquement
2. **Système d'authentification** pour des favoris persistants côté serveur
3. **Notifications** push pour les nouveaux événements dans les catégories suivies
4. **CI/CD** avec GitHub Actions
5. **Migration PostgreSQL** pour la production
6. **Recherche full-text** avec indexation avancée
7. **Intégration IA** : recommandations personnalisées basées sur l'historique de consultation

---

## 👤 Auteur

**Aymen RAKI** 
📧 aymen.raki.cs@gmail.com  
🔗 [LinkedIn](https://www.linkedin.com/in/aymen-raki)

---

*Projet réalisé dans le cadre d'un test technique pour DentalCall IA — Mars 2026*
