# Hasamex Expert Database

A modern, high-performance web application designed to manage and track expert profiles. Built with a robust FastAPI backend and a scalable infrastructure using PostgreSQL and MinIO.

## 🚀 Tech Stack

- **Backend:** [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **ORM & Migrations:** [SQLAlchemy](https://www.sqlalchemy.org/) & [Alembic](https://alembic.sqlalchemy.org/)
- **Storage:** [MinIO](https://min.io/) (S3 Compatible Storage)
- **Containerization:** [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

---

## 🛠️ Getting Started

### 1. Prerequisites
- Python 3.10+
- Docker & Docker Compose
- Virtual Environment (recommended)

### 2. Infrastructure Setup
Spin up the required services (Database & Storage) using Docker Compose:
```bash
docker-compose up -d
```

### 3. Backend Setup
Navigate to the `backend` directory and install dependencies:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Configuration
Ensure your `.env` file is present in the `backend/` directory with the following keys:
- `DATABASE_URL`
- `S3_ENDPOINT_URL`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`

### 5. Running the Application
Apply database migrations and start the development server:
```bash
# Apply Migrations
alembic upgrade head

# Run Server
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`. You can access the interactive documentation at `http://localhost:8000/docs`.

---

## 📂 Project Structure

```text
├── backend/            # FastAPI source code
│   ├── app/            # Core application logic
│   ├── alembic/        # DB migration scripts
│   └── scripts/        # Utility & seeding scripts
├── Documents/          # Project documentation & UI mockups
├── docker-compose.yml  # Infrastructure as Code
└── .gitignore          # Git exclusion rules
```

---

## 🛡️ API Endpoints

- `GET /`: Welcome message
- `GET /health`: System health check
- `GET /api/v1/experts`: Manage expert profiles (Check `/docs` for full details)

---

## 📄 License
Internal Project - All Rights Reserved.
