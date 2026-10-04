# AIaaS Fraud Detection Platform - Mindora-AI

A multi-tenant AI-as-a-Service platform that exposes machine-learning
capabilities through secure APIs, with fraud detection as the first
fully implemented AI service and an extensible architecture for
additional services.

**Status:**
- Fraud Detection: ✅ Fully implemented (platform side; ML model is a
  mock — see [ML Integration](#ml-integration))
- Document Extraction, Sentiment Analysis, PII Redaction: 🧩 Designed /
  stubbed in the service catalog, not implemented

## Team

- **Person 1** (ML/AI Engineer) — owns the fraud detection model:
  dataset, training, evaluation. Exposes a `POST /predict` contract.
- **Person 2** (Full-Stack/AIaaS Platform Engineer) — owns everything
  in this repo: auth, multi-tenancy, API gateway, rate limiting,
  usage metering, dashboard.

## Architecture at a Glance


Customer → Frontend (Next.js) → Backend (FastAPI)
│
┌────────────────┼────────────────┐
▼ ▼ ▼
Auth / JWT API Key Gateway Dashboard Reads
│
Rate Limit (Redis)
│
Fraud Service → ML Client
│
Mock ML Service (swappable → real)
│
PostgreSQL (requests log)


See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full breakdown.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS |
| Backend | FastAPI, Pydantic, SQLAlchemy (async), Alembic |
| Database | PostgreSQL |
| Cache / Rate Limiting | Redis |
| Infra | Docker, Docker Compose |

## Getting Started

### Prerequisites
- Docker + Docker Compose
- Node.js 20+ (for local frontend dev without Docker)
- Python 3.12+ (for local backend dev / Alembic without Docker)

### Setup

```bash
git clone <repo-url>
cd aiaas-platform
cp .env.example .env
```

Start the database and cache:
```bash
docker compose up -d postgres redis
```

Run migrations (from `backend/`, with a local venv or inside the
container):
```bash
cd backend
alembic upgrade head
python -m app.database.seed   # seeds the service catalog
```

Bring up the full stack:
```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API docs (Swagger) | http://localhost:8000/docs |
| Mock ML service | http://localhost:9000 |

### Running Tests

```bash
docker exec -it aiaas-postgres psql -U aiaas -d aiaas -c "CREATE DATABASE aiaas_test;"  # once
docker compose exec backend pytest -v
```

## ML Integration

The platform currently talks to a **mock ML service** (`mock-ml-service/`)
that implements the exact contract the real fraud model will use — see
[docs/API_CONTRACT.md](docs/API_CONTRACT.md). Switching to the real
model is a config change only:


ML_SERVICE_URL=http://mock-ml:9000 → ML_SERVICE_URL=<real service URL>


No frontend or backend application code needs to change.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Fraud API Contract](docs/API_CONTRACT.md)
- [Security & Limitations](docs/SECURITY_AND_LIMITATIONS.md)

## License

