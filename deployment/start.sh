#!/bin/bash
set -e

echo "=== Running migrations ==="
if ! python manage.py migrate --noinput 2>&1; then
    echo "=== Regular migrate failed, attempting fake-apply ==="
    python manage.py migrate --fake --noinput
    echo "=== Fake-apply done, running real migrate for any new migrations ==="
    python manage.py migrate --noinput
fi

echo "=== Collecting static files ==="
python manage.py collectstatic --noinput

echo "=== Starting supervisor (gunicorn + nginx) ==="
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/app.conf