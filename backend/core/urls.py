from django.contrib import admin
from django.urls import path,include
from authentication.views import CustomTokenObtainPairView
from roads.views import DashboardSummaryView, road_geojson_view


from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('roads.urls')),
    path('api/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/dashboard-summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),
    path('api/roads-geojson/', road_geojson_view, name='roads-geojson'),
]
