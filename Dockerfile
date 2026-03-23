# ---- Stage 1: Build React frontend ----
FROM node:20-slim AS frontend-build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ .
RUN npm run build

# ---- Stage 2: Production container ----
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# System deps for PostGIS + nginx + supervisor
RUN apt-get update && apt-get install -y \
    binutils libproj-dev gdal-bin libgdal-dev build-essential \
    python3-gdal libpq-dev gcc nginx supervisor \
    && rm -rf /var/lib/apt/lists/*

ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV C_INCLUDE_PATH=/usr/include/gdal

WORKDIR /app

# Python deps
COPY backend/requirements.txt /app/
RUN GDAL_VERSION=$(gdal-config --version) pip install --no-cache-dir -r requirements.txt

# Backend code
COPY backend/ /app/

# Data directory (for ingestion scripts that reference /data)
COPY data/ /data/

# Frontend build output -> nginx html dir
COPY --from=frontend-build /app/build /usr/share/nginx/html

# Nginx config — remove default, install ours
RUN rm -f /etc/nginx/sites-enabled/default
COPY deployment/nginx.conf /etc/nginx/sites-available/default
RUN ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# Supervisor config
COPY deployment/supervisord.conf /etc/supervisor/conf.d/app.conf

# Startup script
COPY deployment/start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 80

CMD ["/start.sh"]