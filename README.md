# 🍔 La Vurger

> Full-stack vegan burger restaurant management platform — live at **[lavurger.com](https://lavurger.com)**

A production-ready web application featuring a customer-facing ordering experience and a real-time admin backoffice, built with **Spring Boot 3**, **Angular 21**, and **WebSockets** — deployed on AWS EC2 via a fully automated CI/CD pipeline.

---

## 📸 Live Demo

| App | URL | Description |
|---|---|---|
| 🛒 Customer App (takeaway) | [lavurger.com/menu](https://lavurger.com/menu) | Place a takeaway order directly |
| 📱 Customer App (dine-in) | [lavurger.com/menu?table=4](https://lavurger.com/menu?table=4) | Simulates scanning a QR code at table 4 |
| 🔧 Admin Panel | [lavurger.com/admin/login](https://lavurger.com/admin/login) | Backoffice for order and menu management |
| 📖 Swagger UI | [lavurger.com/api/swagger-ui.html](http://localhost:8080/swagger-ui.html) | REST API docs (available locally) |

> The `?table=N` query parameter binds an order to a specific restaurant table — the same mechanism triggered by a physical QR code on the table.

---

## 📁 Project Structure

```
la-vurger/
├── backend/                    # Spring Boot REST API
│   └── src/
│       ├── main/java/com/mlicer/uoc/lavurgerapi/
│       │   ├── config/         # Security, WebSocket, CORS
│       │   ├── controller/     # REST endpoints
│       │   ├── dto/            # Request / response DTOs
│       │   ├── entity/         # JPA entities
│       │   ├── exception/      # Global exception handling
│       │   ├── mapper/         # Entity ↔ DTO mappers
│       │   ├── repository/     # Spring Data JPA
│       │   ├── security/       # JWT filter, UserDetailsService
│       │   └── service/        # Business logic
│       └── test/java/
│           ├── service/        # Unit tests
│           └── *ControllerIT   # Integration tests (H2)
├── frontend/                   # Angular monorepo
│   └── projects/
│       ├── lavurger-client/    # Customer app (port 4200)
│       ├── lavurger-admin/     # Admin panel (port 4201)
│       └── shared/             # Shared components & services
├── .github/workflows/          # GitHub Actions CI/CD
├── docker-compose.yml
├── .env                        # Environment variables (not committed)
└── README.md
```

---

## 🛠️ Tech Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Java | 21 | Runtime |
| Spring Boot | 3.4.3 | Application framework |
| Spring Security + JWT | — | Authentication & authorization |
| Spring Data JPA | — | ORM / database layer |
| Spring WebSocket (STOMP) | — | Real-time push notifications |
| PostgreSQL | — | Production database |
| H2 | — | In-memory DB for integration tests |
| SpringDoc OpenAPI | 2.8.5 | Swagger UI / API docs |
| Lombok | — | Boilerplate reduction |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| Angular | 21 | UI framework (standalone components) |
| NgRx Signals | 21 | Reactive state management |
| STOMP / RxStomp | 7.x / 2.x | WebSocket client |
| Tailwind CSS | 3.x | Utility-first styling |
| TypeScript | 5.9 | Type safety |
| Vitest | 4.x | Unit testing |

### Infrastructure & DevOps

| Tool | Purpose |
|---|---|
| Docker & Docker Compose | Containerised multi-service deployment |
| Nginx | Reverse proxy, static file serving, WebSocket upgrade |
| AWS EC2 | Cloud hosting |
| AWS S3 | Product image storage |
| GitHub Actions | CI/CD pipeline (build → test → deploy) |

---

## ⚙️ Prerequisites

- **Java 21**
- **Maven 3.x**
- **Node.js** with **npm 11+**
- **Docker & Docker Compose** *(for containerised deployment)*
- **PostgreSQL** *(only needed for local runs without Docker)*

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/minea-dev/la-vurger-app.git
cd la-vurger-app
```

### 2. Configure environment variables

Create a `.env` file at the project root:

```env
# Database
DB_URL=jdbc:postgresql://localhost:5432/lavurger
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Auth
JWT_SECRET=your_jwt_secret_key

# AWS S3 (product image storage)
AWS_S3_BUCKET=your_bucket_name
AWS_S3_REGION=eu-west-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
```

---

### 🐳 Run with Docker Compose *(recommended)*

```bash
docker-compose up --build
```

| Service | URL |
|---|---|
| REST API | http://localhost:8080 |
| Customer App | http://localhost |
| Admin Panel | http://localhost/admin/ |
| Swagger UI | http://localhost:8080/swagger-ui.html |

---

### 🔧 Run Locally (without Docker)

#### Backend

```bash
cd backend
mvn spring-boot:run
```

API available at `http://localhost:8080`.

#### Frontend

```bash
cd frontend
npm install
```

Start the **customer app**:

```bash
npm run start:client
# → http://localhost:4200
```

Start the **admin panel**:

```bash
npm run start:admin
# → http://localhost:4201
```

---

## 🏗️ Build (production)

### Frontend

```bash
cd frontend
npm run build:all
```

Outputs:
- `lavurger-client` → standard production build
- `lavurger-admin` → production build with `/admin/` base href

### Backend

```bash
cd backend
mvn clean package
```

---

## 🔒 Authentication

The API uses **JWT Bearer token** authentication.

1. `POST /api/auth/login` with valid credentials.
2. Copy the `token` from the response.
3. Pass it in all subsequent requests:

```
Authorization: Bearer <token>
```

---

## 🌐 Real-Time Features

The platform uses the **STOMP protocol over WebSockets** to broadcast events instantly across both apps — for example, routing a new order to the kitchen display the moment a customer completes checkout.

| Environment | Endpoint |
|---|---|
| Local dev | `ws://localhost:8080/ws` |
| Production | `wss://lavurger.com/ws-la-vurger` *(proxied via Nginx with automatic protocol upgrade)* |

---

## 📦 Frontend Scripts Reference

| Script | Description |
|---|---|
| `npm run start:client` | Serve customer app in dev mode (port 4200) |
| `npm run start:admin` | Serve admin panel in dev mode (port 4201) |
| `npm run build:client` | Build customer app for production |
| `npm run build:admin` | Build admin panel for production |
| `npm run build:all` | Build both apps |
| `npm test` | Run all unit tests |

---

## 🧪 Testing

### Backend

```bash
cd backend
mvn test
```

Test suite:

```
src/test/java/
├── service/
│   ├── OrderServiceTest
│   ├── ProductServiceTest
│   ├── RestaurantTableServiceTest
│   └── UserServiceTest
├── OrderControllerIT
├── ProductControllerIT
└── UserControllerIT
```

Integration tests run against an **H2 in-memory database** — no external PostgreSQL instance required.

### Frontend

```bash
cd frontend
npm test
```

21 **Playwright E2E tests** cover the full user journey across both apps (executed locally against the live stack).

---

## 🔄 CI/CD Pipeline

Every push to `main` triggers a two-stage GitHub Actions workflow:

```
push to main
    │
    ▼
┌────────────────────────┐
│  🧪 test (blocking)    │
│  · Setup Java 21       │
│  · mvn clean package   │
│  · Setup Node.js 22    │
│  · npm install         │
└──────────┬─────────────┘
           │ on success
           ▼
┌────────────────────────┐
│  🚀 deploy             │
│  · SCP source to EC2   │
│    (excl. node_modules │
│     and target/)       │
│  · SSH into EC2:       │
│    · Write .env        │
│    · docker compose    │
│      down              │
│    · docker system     │
│      prune             │
│    · docker compose    │
│      up --build        │
│    · docker logs       │
└────────────────────────┘
```

### Required GitHub Secrets

Go to **Settings → Secrets and variables → Actions** and configure:

| Secret | Description |
|---|---|
| `EC2_HOST` | Public IP or hostname of the EC2 instance |
| `EC2_SSH_KEY` | Private SSH key (connects as `ubuntu`) |
| `DB_URL` | Full JDBC URL, e.g. `jdbc:postgresql://host:5432/lavurger` |
| `DB_USER` | Database username |
| `DB_PASSWORD` | Database password |
| `JWT_SECRET` | Secret key used to sign JWT tokens |
| `AWS_S3_BUCKET` | S3 bucket name for product image storage |
| `AWS_S3_REGION` | AWS region of the bucket (e.g. `eu-west-1`) |
| `AWS_ACCESS_KEY_ID` | AWS IAM access key ID |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret access key |

---

## 📊 Quality, Security & Performance

### 🟢 SAST — SonarQube Cloud

Backend evaluated against SonarQube's corporate Quality Gates:

| Metric | Result |
|---|---|
| Status | ✅ PASSED |
| Code duplication | 0.0% |
| Lines of code | 2,000+ clean Java lines |
| Critical vulnerabilities | 0 |

### ⚡ Frontend — Google Lighthouse

Audited under real mobile constraints (Moto G Power, Slow 4G throttling):

| Metric | Score |
|---|---|
| Best Practices | 100 / 100 |
| Accessibility | 95 / 100 |
| SEO | 92 / 100 |
| Total Blocking Time | 30 ms |

### 📈 Backend Load Testing — ApacheBench

200 requests, 10 concurrent threads against `/api/products`:

| Metric | Result |
|---|---|
| Failed requests | 0 (0% error rate) |
| Throughput | 114.79 req/s |
| Mean latency | 87.11 ms |
| p95 latency | < 120 ms |

---

## 📄 License

This project was developed as an academic assignment for **UOC — Universitat Oberta de Catalunya**. All rights reserved.
