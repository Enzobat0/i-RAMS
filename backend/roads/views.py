from rest_framework import generics
from .models import RoadSegment, InfrastructurePoint
from .serializers import RoadSegmentSerializer, InfrastructurePointSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Avg
from django.http import JsonResponse
from django.core.serializers import serialize
import json

class RoadListAPIView(generics.ListAPIView):
    queryset = RoadSegment.objects.all()
    serializer_class = RoadSegmentSerializer

class DashboardSummaryView(APIView):
    def get(self, request):
        total_segments = RoadSegment.objects.count()
        
        # Aggregate stats safely
        # Note: Using > 0 checks instead of boolean has_hospital if that field doesn't exist
        stats = {
            "total_segments": total_segments,
            "hospital_access_count": RoadSegment.objects.filter(health_facility_count__gt=0).count(),
            "school_access_count": RoadSegment.objects.filter(school_count__gt=0).count(),
            "sole_access_count": RoadSegment.objects.filter(is_only_access=True).count(),
            "avg_ddi": RoadSegment.objects.aggregate(Avg('latest_ddi_score'))['latest_ddi_score__avg'] or 0,
            "total_pop": RoadSegment.objects.aggregate(Sum('pop_within_2km'))['pop_within_2km__sum'] or 0,
        }
        
        # Build the final summary for the React KPIs
        summary = {
            "total_segments": stats["total_segments"],
            "healthcare_access_pct": round((stats["hospital_access_count"] / total_segments) * 100, 1) if total_segments > 0 else 0,
            "education_access_pct": round((stats["school_access_count"] / total_segments) * 100, 1) if total_segments > 0 else 0,
            "vulnerability_pct": round((stats["sole_access_count"] / total_segments) * 100, 1) if total_segments > 0 else 0,
            "total_population": stats["total_pop"], # Fixed the missing key issue
            "avg_ddi": round(stats["avg_ddi"], 2)
        }
        
        return Response(summary)
    
def road_geojson_view(request):
    segments = RoadSegment.objects.all()
    # Serialize to GeoJSON format
    geojson_data = serialize('geojson', segments, 
                             geometry_field='geom', 
                             fields=('segment_id', 'road_type', 'pop_within_2km', 'district', 'road_class', 'road_type',
                                     'school_count', 'health_facility_count', 'is_only_access', 
                                     'latest_ddi_score', 'current_mca_score', 'priority_level'))
    
    return JsonResponse(json.loads(geojson_data), safe=False)

class InfrastructureListView(generics.ListAPIView):
    queryset = InfrastructurePoint.objects.all()
    serializer_class = InfrastructurePointSerializer