# 🍔 La Vurger

A full-stack vegan burger restaurant management platform featuring a customer-facing ordering app and an admin panel — built with **Spring Boot**, **Angular 21**, and real-time communication via **WebSockets**.

---

## 📁 Project Structure

```
la-vurger/
├── backend/               # Spring Boot REST API
├── frontend/              # Angular monorepo
│   ├── projects/
│   │   ├── lavurger-client/   # Customer-facing app (port 4200)
│   │   ├── lavurger-admin/    # Admin panel (port 4201)
│   │   └── shared/            # Shared library between apps
├── docker-compose.yml
├── .env
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
| Spring Data JPA | — | Database ORM |
| Spring WebSocket | — | Real-time communication |
| PostgreSQL | — | Production database |
| H2 | — | In-memory DB for tests |
| SpringDoc OpenAPI | 2.8.5 | API documentation (Swagger UI) |
| Lombok | — | Boilerplate reduction |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Angular | 21 | UI framework |
| NgRx Signals | 21 | Reactive state management |
| STOMP / RxStomp | 7.x / 2.x | WebSocket messaging |
| Tailwind CSS | 3.x | Utility-first styling |
| TypeScript | 5.9 | Type safety |
| Vitest | 4.x | Unit testing |

---

## ⚙️ Prerequisites

- **Java 21**
- **Maven**
- **Node.js** with **npm 11+**
- **Docker & Docker Compose** (for containerized deployment)
- **PostgreSQL** (if running locally without Docker)

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-org/la-vurger.git
cd la-vurger
```

### 2. Configure environment variables

Copy and fill in the `.env` file at the project root:

```env
DB_URL=jdbc:postgresql://localhost:5432/lavurger
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret_key
```

---

### 🐳 Run with Docker Compose (recommended)

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

The API will start at `http://localhost:8080`.

#### Frontend

```bash
cd frontend
npm install
```

Start the **customer app**:
```bash
npm run start:client
# Available at http://localhost:4200
```

Start the **admin panel**:
```bash
npm run start:admin
# Available at http://localhost:4201
```

---

## 🏗️ Build

### Frontend (production)

```bash
cd frontend
npm run build:all
```

This will build both apps:
- `lavurger-client` → standard production build
- `lavurger-admin` → production build with `/admin/` base href

### Backend

```bash
cd backend
mvn clean package
```

---

## 🧪 Testing

### Backend

```bash
cd backend
mvn test
```

The test suite includes unit tests and integration tests:

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

### Frontend

```bash
cd frontend
npm test
```

---

## 📐 Backend Architecture

```
com.mlicer.uoc.lavurgerapi/
├── config/         # Spring Security, WebSocket, CORS configuration
├── controller/     # REST API endpoints
├── dto/            # Data Transfer Objects (request/response)
├── entity/         # JPA entities
├── exception/      # Custom exception handling
├── mapper/         # Entity ↔ DTO mappers
├── repository/     # Spring Data JPA repositories
├── security/       # JWT filter, UserDetailsService, etc.
└── service/        # Business logic
```

---

## 🔌 API Documentation

Once the backend is running, visit:

```
http://localhost:8080/swagger-ui.html
```

---

## 🔒 Authentication

The API uses **JWT Bearer token** authentication. To access protected endpoints:

1. `POST /api/auth/login` with your credentials.
2. Copy the returned `token`.
3. Include it in all subsequent requests as:
   ```
   Authorization: Bearer <token>
   ```

---

## 🌐 Real-Time Features

The application uses **WebSocket (STOMP protocol)** to push real-time updates — for example, notifying the kitchen or admin dashboard when a new order is placed.

WebSocket endpoint: `ws://localhost:8080/ws`

---

## 📦 Frontend Scripts Reference

| Script | Description |
|---|---|
| `npm run start:client` | Serve customer app (dev, port 4200) |
| `npm run start:admin` | Serve admin panel (dev, port 4201) |
| `npm run build:client` | Build customer app for production |
| `npm run build:admin` | Build admin panel for production |
| `npm run build:all` | Build both apps |
| `npm test` | Run unit tests |

---

## 🌍 Live Demo (MVP)

A working MVP is deployed on AWS EC2. You can explore both apps directly:

### 🔧 Admin Panel (Backoffice)
**URL:** http://51.92.201.144/admin/login

### 🛒 Customer App — Takeaway simulation
**URL:** http://51.92.201.144/menu

Simulates a customer accessing the web directly to place a takeaway order (no table linked).

### 📱 Customer App — QR code at table simulation
**URL:** http://51.92.201.144/menu?table=4

Simulates a customer who has scanned the QR code placed on table 4. The `?table=4` query parameter is automatically picked up to bind the order to that table.

---

## 🔄 CI/CD Pipeline

The project uses **GitHub Actions** for continuous integration and deployment to AWS EC2 on every push to `main`.

### Workflow: `Deploy La Vurger MVP`

```
push to main
    │
    ▼
┌─────────────────────────┐
│  🧪 test (blocking)     │
│  - Checkout             │
│  - Setup Java 21        │
│  - mvn clean package    │
│    (compilation check)  │
│  - Setup Node.js 22     │
│  - npm install          │
└───────────┬─────────────┘
            │ on success
            ▼
┌─────────────────────────┐
│  🚀 deploy              │
│  - Checkout             │
│  - SCP files to EC2     │
│    (excl. node_modules  │
│     and target/)        │
│  - SSH into EC2:        │
│    · Write .env         │
│    · docker compose     │
│      down               │
│    · docker system      │
│      prune              │
│    · docker compose     │
│      up --build         │
│    · docker logs        │
└─────────────────────────┘
```

### Required GitHub Secrets

Go to **Settings → Secrets and variables → Actions** and add:

| Secret | Description |
|---|---|
| `EC2_HOST` | Public IP or hostname of the EC2 instance |
| `EC2_SSH_KEY` | Private SSH key to connect as `ubuntu` |
| `DB_URL` | Full JDBC URL (e.g. `jdbc:postgresql://host:5432/db`) |
| `DB_USER` | Database username |
| `DB_PASSWORD` | Database password |
| `JWT_SECRET` | Secret key used to sign JWT tokens |

---

## 📄 License

This project is part of an academic assignment for UOC (Universitat Oberta de Catalunya). All rights reserved.
