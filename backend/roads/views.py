from rest_framework import generics
from .models import RoadSegment
from .serializers import RoadSegmentSerializer
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
        
        # Real-time counts based previous processing
        stats = {
            "total_segments": total_segments,
            "hospital_access_count": RoadSegment.objects.filter(has_hospital=True).count(),
            "school_access_count": RoadSegment.objects.filter(has_school=True).count(),
            "sole_access_count": RoadSegment.objects.filter(is_only_access=True).count(),
            "avg_ddi": RoadSegment.objects.aggregate(Avg('latest_ddi_score'))['latest_ddi_score__avg'] or 0,
        }
        
        # Calculate percentages for the KPI cards
        summary = {
            "total_segments": stats["total_segments"],
            "healthcare_access_pct": round((stats["hospital_access_count"] / total_segments) * 100, 1) if total_segments else 0,
            "education_access_pct": round((stats["school_access_count"] / total_segments) * 100, 1) if total_segments else 0,
            "vulnerability_pct": round((stats["sole_access_count"] / total_segments) * 100, 1) if total_segments else 0,
            "total_population": stats["total_population_impacted"],
            "avg_ddi": round(stats["avg_ddi"], 2)
        }
        
        return Response(summary)
    
def road_geojson_view(request):
    segments = RoadSegment.objects.all()
    # Serialize to GeoJSON format
    geojson_data = serialize('geojson', segments, 
                             geometry_field='geom', 
                             fields=('segment_id', 'road_type', 'pop_within_2km', 
                                     'has_hospital', 'has_school', 'is_only_access', 
                                     'latest_ddi_score'))
    
    return JsonResponse(json.loads(geojson_data), safe=False)