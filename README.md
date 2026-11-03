# FaceAttend
## Complete Enterprise-Grade AI Facial Recognition Attendance Management Platform

FaceAttend is an enterprise-grade AI-powered facial recognition attendance management platform designed for college classes (90 students, 6 working days, 6 periods per day = 36 weekly periods). Built with clean architecture, biometric security, AES-256-GCM encryption at rest, and a premium SaaS UI inspired by Linear, Stripe, and Apple.

---

## Architecture

```
                    ┌────────────────────────────────┐
                    │      React 19 + Vite SPA       │
                    │   Tailwind CSS + Framer Motion  │
                    └───────────────┬────────────────┘
                                    │ HTTPS (REST + SSE)
                                    ▼
                    ┌────────────────────────────────┐
                    │     Spring Boot 3 (Java 21)    │
                    │  Security, JWT, Attendance,    │
                    │  Timetable, AES-256 Encryptor  │
                    └───────┬────────────────┬───────┘
          Internal REST API │                │ JDBC
          (X-API-Key Auth)  ▼                ▼
    ┌─────────────────────────────┐   ┌─────────────────────────────┐
    │     FastAPI AI Service      │   │     Supabase PostgreSQL     │
    │  InsightFace ArcFace R100   │   │  14 Normalised Tables, RLS  │
    │  OpenCV Quality & Liveness  │   │  Storage for Photos/Backups │
    └─────────────────────────────┘   └─────────────────────────────┘
```

> **Security Rule**: The React frontend never connects directly to the AI service. All requests flow through Spring Boot, ensuring strict role-based access control, timetable window checks, and classroom presence validation.

---

## Technology Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, TanStack Query, Framer Motion, Lucide React, Recharts.
- **Backend**: Java 21, Spring Boot 3.2.5, Spring Security, Spring Data JPA, JWT (HS512), Apache POI, OpenCSV, Flyway.
- **AI Microservice**: Python 3.11+, FastAPI, OpenCV, InsightFace (`buffalo_l`), ArcFace pretrained model, ONNX Runtime, NumPy, Pydantic v2.
- **Database & Storage**: Supabase PostgreSQL 16, Supabase Storage.
- **DevOps**: Docker, Docker Compose, Nginx, Render.

---

## Key Features

1. **90-Student Bulk Face Enrollment**:
   - Upload a ZIP containing all 90 photographs (`24A001.jpg` … `24A090.jpg`).
   - Upload CSV/Excel roster (`roll_number, full_name, filename`).
   - Image validation: detects single face, checks resolution ($\ge 112 \times 112$ px), blur score (Laplacian variance), brightness, and frontal orientation.
   - Normalized 512-dimensional ArcFace facial embedding generation.
   - Asynchronous background processing in batches of 10 with Server-Sent Events (SSE) progress tracking.
   - File-level and embedding-level duplicate detection.
   - AES-256-GCM encryption of biometric embeddings at rest in PostgreSQL.

2. **Attendance Engine & Classroom Presence**:
   - Dual-factor attendance: rotating classroom presence QR token + facial identity verification.
   - Automatically detects current day (1–6) and period (1–6).
   - Strict duplicate prevention with unique constraint `(student_id, attendance_date, timetable_id)`.
   - Late arrival threshold calculation based on timetable window.
   - Admin attendance correction with immutable audit trail.

3. **Passive Liveness & Anti-Spoofing**:
   - Real-time texture analysis (Local Binary Pattern variance) and Fourier high-frequency energy checks.
   - Clearly defined verification statuses: `VERIFIED`, `AMBIGUOUS`, `NO_MATCH`, `FAILED_LIVENESS`, `FAILED_QUALITY`, `NO_FACE`, `MULTI_FACE`.

4. **Portals**:
   - **Admin Portal**: Live KPI metrics, bulk enrollment wizard, student directory, 6×6 timetable grid, live attendance monitor, and reports.
   - **Student Portal**: Personal attendance percentage, subject-wise summary, face enrollment status, and face verification camera flow.

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 20+ & npm
- Python 3.11+
- Java 21 & Maven 3.9+ (or Docker)
- Docker & Docker Compose

### 1. Environment Configuration
Copy the template and configure your secrets:
```bash
cp .env.example .env
```

### 2. Run with Docker Compose
To launch all services (PostgreSQL, AI Service, Spring Boot Backend, and Frontend):
```bash
docker compose up --build
```

### 3. Or Run Locally Service-by-Service

#### A. Database
Run PostgreSQL on port `5432` and apply migrations from `database/migrations/` in order (`V1`, `V2`, `V3`).

#### B. AI Service
```bash
cd ai-service
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation available at: `http://localhost:8000/docs`

#### C. Backend
```bash
cd backend
mvn spring-boot:run
```
Backend API available at: `http://localhost:8080/api`

#### D. Frontend
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
Frontend available at: `http://localhost:5173`

---

## Default Administrator Credentials
- **Email**: `admin@faceattend.com`
- **Password**: `AdminPassword@2026`

Student accounts are automatically provisioned during roster import (default password equals the student's roll number).

---

## Deployment to Render & Supabase

### 1. Supabase Setup
1. Create a new Supabase project.
2. In the Supabase SQL Editor, run `database/migrations/V1__initial_schema.sql`, `V2__seed_periods.sql`, and `V3__seed_admin.sql`.
3. Create a private storage bucket named `student-photos`.
4. Copy your PostgreSQL JDBC connection string and API keys to your environment configuration.

### 2. Render Deployment
- **FastAPI AI Service**: Deploy as a Render Web Service using `ai-service/Dockerfile`. Set `AI_SERVICE_API_KEY`.
- **Spring Boot Backend**: Deploy as a Render Web Service using `backend/Dockerfile`. Connect `SUPABASE_DB_URL`, `JWT_SECRET`, `BIOMETRIC_ENCRYPTION_KEY`, and `AI_SERVICE_URL`.
- **Frontend**: Deploy as a Render Static Site from `frontend/` (build command: `npm install --legacy-peer-deps && npm run build`, publish directory: `dist`) or use `docker/frontend.Dockerfile` with Nginx.
