# i-RAMS: Intelligent Road Asset Management System

**Student:** Enzo Batungwanayo  
**Institution:** African Leadership University  
**Supervisor:** Neza David Tuyishimire  


### Project Description

i-RAMS is a data-driven initiative designed to modernize road maintenance monitoring in Rwanda, specifically focused on the Bugesera District. By combining GIS (PostGIS), Computer Vision (YOLO), and Web Technologies (Django/React), i-RAMS automates the detection of road distresses (like potholes and cracks) and ranks road segments for maintenance based on a Multi-Criteria Decision Analysis (MCDA).

### Prerequisites
- Docker Desktop installed
- 8GB RAM minimum
- 10GB free disk space


### Installation & Running Locally
```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/i-rams.git
cd i-rams

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

# 5. Access application
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

# Deployment Plan (In progress)

**Target:** Azure App Service Multi-Container (PostGIS + Django + React)

### **Current Status**
- Dockerized (3 services: db/backend/frontend) **(Done)**
- ACR created (iramsregistry.azurecr.io) **(Done)**
- GitHub Actions pipeline ready **(Done)**
- Azure Web App deployment (multi-container via docker-compose) **(In progress)**

Live URL: [irams-h9e7heehcvdxa0fm.southafricanorth-01.azurewebsites.net](irams-h9e7heehcvdxa0fm.southafricanorth-01.azurewebsites.net)

Fallback: Local Docker (100% functional)

Video Link: [video](https://youtu.be/cCyB68v4KBw)

For detailed testing documentation: [TESTING_RESULTS.md](./docs/TESTING_RESULTS.md)