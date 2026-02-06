## i-RAMS (Intelligent Road Asset Management System)

### Project Description

i-RAMS is a data-driven initiative designed to modernize road maintenance monitoring in Rwanda, specifically focused on the Bugesera District. By combining GIS (PostGIS), Computer Vision (YOLO), and Web Technologies (Django/React), i-RAMS automates the detection of road distresses (like potholes and cracks) and ranks road segments for maintenance based on a Multi-Criteria Decision Analysis (MCDA).

### Repository Link
[Link to repository](https://github.com/Enzobat0/i-RAMS)

### Environment & Project Setup
Prerequisites:
- Python 3.10+

- Node.js & npm

- PostgreSQL with PostGIS extension

#### 1. Backend Setup (Django & PostGIS)
```
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env file with your DB credentials
# Run migrations
python manage.py makemigrations
python manage.py migrate

# INGEST DATA 
python manage.py ingest_roads
```

#### 2. Frontend Setup (React & Tailwind)
```
cd frontend
npm install
npm start
```

### Designs

Dashboard Design:
![Alt text](/docs/Screenshot%202026-02-06%20at%2020.47.35.png)

Login Screen:
![Alt text](/docs/login.png)

Survey page:
![Alt text](/docs/survey.png)

### Deployment Plan

The current version of i-RAMS is deployed and demonstrated in a local development environment to allow rapid iteration and testing during the early stages of the project.

For production deployment, i-RAMS is designed to be hosted on a cloud-based virtual machine, such as Microsoft Azure, AWS, or DigitalOcean. The planned deployment architecture is as follows:

- The Django backend will be deployed on a Linux virtual machine and served using Gunicorn behind Nginx.

- The PostgreSQL + PostGIS database will run on the same virtual machine to simplify configuration.

- The React frontend will be built and served as static files via Nginx.

- The YOLO-based road damage detection will run as an asynchronous server-side process, triggered after survey data (video/images and GPS) is uploaded.

All user interaction (survey upload, road visualization, and ranking results) will be accessible through a web browser, to make the system usable on both desktop and mobile devices without requiring a native mobile application.

### Video Demo

[Link to video](https://youtu.be/yAGGWUPMf9A)

