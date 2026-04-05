# i-RAMS: Intelligent Road Asset Management System

**Student:** Enzo Batungwanayo  
**Institution:** African Leadership University  
**Supervisor:** Neza David Tuyishimire

**[https://irams.azurewebsites.net/](https://irams.azurewebsites.net/)**

### Project Description

i-RAMS is a web-based decision-support tool designed to assist district engineers and government officials in prioritising feeder road maintenance in Bugesera District, Rwanda. The system integrates geospatial road network data (MININFRA shapefiles), population density data (WorldPop rasters), and infrastructure location data into a centralised PostGIS database, and applies a configurable Multi-Criteria Analysis (MCA) algorithm to rank all 1,555 road segments by maintenance priority.

### Tech Stack
|Layer              | Technology                        |
|-------------------|-----------------------------------|
|Frontend           | React, Tailwind CSS, Leaflet.js |
|BackendDjango | REST Framework, GeoDjango|
|Database | PostgreSQL + PostGIS|
|Deployment | Docker, Microsoft Azure App Service, GitHub Actions CI/CD

### Prerequisites
- Docker Desktop installed
- 8GB RAM minimum
- 10GB free disk space


### Installation & Running Locally
```bash
# 1. Clone repository
git clone https://github.com/Enzobat0/i-RAMS
cd i-RAMS

# 2. Start all services
docker-compose up --build

# 3. Wait for "Starting development server" message (2-3 min)

# 4. In NEW terminal, initialize database:
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py ingest_roads
docker-compose exec backend python manage.py ingest_infrastructures
docker-compose exec backend python manage.py ingest-national-roads
docker-compose exec backend python manage.py calculate-health-access
docker-compose exec backend python manage.py School-access
docker-compose exec backend python manage.py calculate-population-access
docker-compose exec backend python manage.py calculate-only-access
docker-compose exec backend python manage.py calculate_priority

# 5. Create an admin user
docker-compose exec backend python manage.py create_user \
  --email admin@irams.rw \
  --password YourPassword123 \
  --role SENIOR_ENGINEER \
  --first_name Admin \
  --last_name User \
  --superuser

# 6. Access the application
# Frontend: http://localhost:3001
# Backend API: http://localhost:8000/api/
```

## MCDA Algorithm
i-RAMS uses a **Multi-Criteria Decision Analysis (MCDA)** framework based on the World Bank **SPADE** methodology. Each road segment is scored on a scale of 0 to 5, balancing engineering condition with socio-economic utility.

### Criteria Weighting
The final priority score is an equal split between physical condition and network criticality:

| Component              | Indicators                                      | Weight (wi) |
|-----------------------|----------------------------------------------|-------------|
| Road Condition        | Damage Detection Index (DDI)                | 50% (0.50)  |
| Criticality     | Population served, Health access, Education access, Isolation      | 50% (0.50)  |

### The Formula
The final MCA score is calculated as:
$$Final Score = (DDI \times 0.5) + (Cr_{idx} \times 0.5)$$
$$
Criticality = (0.4 \times Pop) + (0.2 \times Health) + (0.2 \times Schools) + (0.2 \times Isolation)
$$
Priority: ≥4.0=P1(RED), ≥2.5=P2(YELLOW), <2.5=P3(GREEN)

Where the Criticality Index ($Cr_{idx}$) is derived from:
- Population (40%): $(\text{Pop within 2km} / 15,000) \times 5$

- Healthcare (20%): Tiered Score (0 for none, 3 for 1, 5 for $>1$)

- Education (20%): Tiered Score (0 for none, 3 for 1, 5 for $>1$)

- Isolation (20%): Binary Score (5 if sole access route, 0 otherwise)

All criteria weights are configurable by Senior Engineers.

# Deployment Plan (In progress)

**Target:** Azure App Service Multi-Container (PostGIS + Django + React)

### **Current Status**
The system is deployed as a single Docker container on Azure App Service with an Azure Database for PostgreSQL Flexible Server.

- CI Pipeline: GitHub Actions runs all 31 unit tests on every push
- CD Pipeline: On push to main, builds the Docker image, pushes to Azure Container Registry, and restarts the App Service
- Live URL: https://irams.azurewebsites.net


Video Link: [Demo](https://drive.google.com/file/d/12XqF5DL0eTq_iUjVlR6_mdyBy1NACpHT/view)

Data Limitations

DDI (Damage Density Index) scores are simulated for demonstration purposes. Real condition survey data from RTDA was pending at the time of submission.
The road network dataset includes only District Road Class 1 and Class 2 segments. Unclassified roads are not included.
Infrastructure data is limited to facilities documented in MININFRA shapefiles.

License
This project was developed as a BSc Software Engineering capstone at the African Leadership University under MIT license