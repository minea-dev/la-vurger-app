# <a name="_6a3l1lru0lp9"></a>**🍔 La Vurger App - TFM**
This project is a full-stack restaurant management system featuring a **Spring Boot API**, an **Angular Frontend**, and a **PostgreSQL Database**, all orchestrated and containerized using **Docker**.
## <a name="_bah8lgyp61l"></a>**🚀 Quick Start (Docker)**
The fastest way to run the application is using **Docker Compose**. You do not need to install Java, Node.js, or PostgreSQL manually on your machine—only Docker is required.
### <a name="_684motwiqacc"></a>**1. Prerequisites**
- **Docker & Docker Compose:** Installed and running (Docker Desktop is recommended).
- **Git:** To clone the repository.
### <a name="_ta2wyixjmbwp"></a>**2. Installation & Setup**
Clone the repository and navigate to the project root folder:

**git clone:** [**https://github.com/your-username/la-vurger-app.git**](https://www.google.com/search?q=https://github.com/your-username/la-vurger-app.git&authuser=4)

**cd la-vurger-app**
### <a name="_7q8r5c2mrzq6"></a>**3. Launch the Application**
Run the following command to build the images and start all services in detached mode:

**docker compose up -d --build**

**What happens next?**

- **Docker pulls** the PostgreSQL image and initializes the database.
- The **Spring Boot** backend is compiled and packaged inside a container.
- The **Angular** frontend is built for production and served via **Nginx**.
- **Nginx** acts as a Reverse Proxy, routing /api calls to the backend.
### <a name="_zfl6xah5tpzz"></a>**4. Access the App**
Once the terminal shows all containers are "Started", open your browser:

- **Frontend UI:** http://localhost?table=1
- **API Swagger Docs:** http://localhost:8080/swagger-ui/index.html
-----
## <a name="_8l5znrqqdl4f"></a>**🛠 Project Architecture**
The system follows a **3-Tier Architecture** fully integrated within a Docker network:

- **Frontend (Port 80):** Angular 17+ application served by an optimized Nginx web server.
- **Backend (Port 8080):** Java Spring Boot REST API handling business logic and security.
- **Database (Port 5432):** PostgreSQL instance for persistent data storage.
- **Networking:** Nginx handles all incoming traffic on port 80. Requests starting with /api are automatically forwarded to the backend container, eliminating CORS issues in production.
-----
## <a name="_inxkn613nnsj"></a>**💾 Data Persistence**
Database records (products, tables, orders) are stored in a Docker volume named **postgres\_data**. This ensures that your data is **persistent** even if you stop or remove the containers.

To reset the database completely (including volumes), run:

**docker compose down -v**

-----
## <a name="_c699ri5aj9l6"></a>**📋 Useful Docker Commands**

|**Action**|**Command**|
| :- | :- |
|**Start all services**|docker compose up -d|
|**Stop all services**|docker compose stop|
|**View API logs**|docker compose logs -f api|
|**Rebuild after code changes**|docker compose up -d --build|
|**Check container status**|docker compose ps|
|**Access PostgreSQL CLI**|docker exec -it lavurger-postgres psql -U postgres -d la\_vurger\_db|

-----
## <a name="_yo56h0jqtd3v"></a>**🔧 Troubleshooting**
- **Port Conflicts:** Ensure ports **80**, **8080**, and **5432** are free. If you have a local Apache, Nginx, or Postgres running, stop them first.
- **Connection Refused:** If the frontend loads but cannot see products, check the browser console (F12). Ensure the environment.prod.ts file uses apiUrl: '/api' (relative path).
- **Missing Tables:** If the app fails to send orders, ensure you have initialized the database with the required restaurant\_tables entries.

