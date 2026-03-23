#!/bin/bash
set -e

echo "=== Running migrations ==="
python manage.py migrate --noinput

echo "=== Collecting static files ==="
python manage.py collectstatic --noinput

echo "=== Starting supervisor (gunicorn + nginx) ==="
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/app.conf