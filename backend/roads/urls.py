from django.urls import path
from .views import RoadListAPIView

urlpatterns = [
    # This will be accessible at http://127.0.0.1:8000/api/roads/
    path('roads/', RoadListAPIView.as_view(), name='road-list'),
]