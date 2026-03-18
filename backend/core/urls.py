from django.contrib import admin
from django.urls import path,include
from django.core.management import call_command
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import os
from authentication.views import CustomTokenObtainPairView
from roads.views import DashboardSummaryView, road_geojson_view, InfrastructureListView
from rest_framework_simplejwt.views import TokenRefreshView

@csrf_exempt
def setup_view(request):
    """
    One-time setup endpoint. Protected by a secret token in the URL.
    Hit this once to run all migrations and ingestion commands, then
    remove this view from urls.py immediately after.

    Usage: GET /setup/YOUR_SETUP_TOKEN/
    """
    token = request.GET.get('token', '')
    expected = os.environ.get('SETUP_TOKEN', '')

    if not expected or token != expected:
        return JsonResponse({'error': 'Unauthorized'}, status=401)

    log = []
    try:
        call_command('migrate', '--noinput')
        log.append('migrate: OK')
    except Exception as e:
        return JsonResponse({'step': 'migrate', 'error': str(e), 'log': log}, status=500)

    try:
        call_command('ingest_roads')
        log.append('ingest_roads: OK')
    except Exception as e:
        return JsonResponse({'step': 'ingest_roads', 'error': str(e), 'log': log}, status=500)

    try:
        call_command('ingest_infrastructures')
        log.append('ingest_infrastructures: OK')
    except Exception as e:
        return JsonResponse({'step': 'ingest_infrastructures', 'error': str(e), 'log': log}, status=500)

    try:
        call_command('calculate-population-access')
        log.append('calculate-population-access: OK')
    except Exception as e:
        return JsonResponse({'step': 'calculate-population-access', 'error': str(e), 'log': log}, status=500)

    try:
        call_command('calculate-health-access')
        log.append('calculate-health-access: OK')
    except Exception as e:
        return JsonResponse({'step': 'calculate-health-access', 'error': str(e), 'log': log}, status=500)

    try:
        call_command('School-access')
        log.append('School-access: OK')
    except Exception as e:
        return JsonResponse({'step': 'School-access', 'error': str(e), 'log': log}, status=500)

    try:
        call_command('calculate-only-access')
        log.append('calculate-only-access: OK')
    except Exception as e:
        return JsonResponse({'step': 'calculate-only-access', 'error': str(e), 'log': log}, status=500)

    try:
        call_command('calculate_priority')
        log.append('calculate_priority: OK')
    except Exception as e:
        return JsonResponse({'step': 'calculate_priority', 'error': str(e), 'log': log}, status=500)

    try:
        from authentication.models import User
        if not User.objects.filter(email='admin@rtda.gov.rw').exists():
            call_command(
                'create_user',
                email='admin@rtda.gov.rw',
                password='IramsAdmin2026!',
                role='SENIOR_ENGINEER',
                first_name='David',
                last_name='Tuyishimire',
                superuser=True,
            )
            log.append('create_user: OK')
        else:
            log.append('create_user: skipped (user already exists)')
    except Exception as e:
        return JsonResponse({'step': 'create_user', 'error': str(e), 'log': log}, status=500)

    return JsonResponse({'status': 'success', 'log': log})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('setup/', setup_view, name='setup'),
    path('api/', include('roads.urls')),
    path('api/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/dashboard-summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),
    path('api/roads-geojson/', road_geojson_view, name='roads-geojson'),
    path('api/infrastructure/', InfrastructureListView.as_view(), name='infra-list'),
]
