## Friend Connection Project

This project is composed of multiple services, including a PostgreSQL database, backend, frontend, socket server, and a PGAdmin interface. Below are instructions on how to set up and run each component of the project.

### Services and Ports

- **Database (PostgreSQL):**
  - Image: postgres
  - Port: 5432 (default)
  - Environment:
    - POSTGRES_DB: friendconnection
    - POSTGRES_USER: user
    - POSTGRES_PASSWORD: password

- **Backend:**
  - Dockerfile: ./backend/Dockerfile-backend
  - Port: 8000
  - Environment:
    - DATABASE_URL: postgresql://user:password@db/friendconnection

- **Frontend:**
  - Dockerfile: ./frontend/Dockerfile-frontend
  - Port: 3000

- **Socket Server:**
  - Dockerfile: ./socket-server/Dockerfile
  - Port: 3001

- **PGAdmin:**
  - Image: dpage/pgadmin4
  - Port: 5050
  - Credentials:
    - Email: admin@example.com
    - Password: admin

### Running the Project

1. **Clone the Repository:**
   ```
   git clone <repository_url>
   cd tech-interview
   ```

2. **Docker Compose:**
   Run the following command to start all services defined in the `docker-compose.yml` file:
   ```
   docker-compose up --build
   ```

3. **Migrations:**
   To generate and apply migrations for the backend, execute the following commands:
   ```
   docker-compose exec backend alembic revision -m "Increase password hash length"
   docker-compose exec backend alembic upgrade head
   ```

### Connecting to the Database

To connect to the PostgreSQL database from your local machine or any database client, use the following credentials:

- **Host:** localhost
- **Port:** 5432
- **Database:** friendconnection
- **Username:** user
- **Password:** password

### Accessing Services

- **Backend API:** http://localhost:8000
- **Frontend:** http://localhost:3000
- **Socket Server:** ws://localhost:3001
- **PGAdmin:** http://localhost:5050

### Additional Notes

- The frontend application runs on port 3000, and any changes made to frontend code will be reflected automatically.
- For backend changes, you might need to rebuild the backend service using `docker-compose up --build`.
- The socket server handles real-time communication and is essential for certain features of the application.