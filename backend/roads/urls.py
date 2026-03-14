from django.urls import path
from .views import RoadListAPIView, AlgorithmConfigView, RecalculatePriorityView

urlpatterns = [
    path('roads/', RoadListAPIView.as_view(), name='road-list'),
    path('config/', AlgorithmConfigView.as_view(), name='algorithm-config'),
    path('recalculate/', RecalculatePriorityView.as_view(), name='recalculate-priority'),
]