from rest_framework import generics
from .models import RoadSegment, InfrastructurePoint, AlgorithmConfig
from .serializers import RoadSegmentSerializer, InfrastructurePointSerializer, AlgorithmConfigSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.management import call_command
from django.utils import timezone
from django.db.models import Sum, Avg
from django.http import JsonResponse
from django.core.serializers import serialize
import json
from authentication.permissions import IsSeniorEngineer

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


    
class AlgorithmConfigView(APIView):

    def get(self, request):
        """Return the current MCA weights. Readable by anyone (page must load for all)."""
        config = AlgorithmConfig.get_config()
        serializer = AlgorithmConfigSerializer(config)
        return Response(serializer.data)

    def put(self, request):
        """
        Update MCA weights. Only SENIOR_ENGINEER users may do this.
        Accepts partial updates — you can send only the fields you want to change.
        """
        if not request.user.is_authenticated:
            from rest_framework.exceptions import NotAuthenticated
            raise NotAuthenticated()

        if request.user.role != 'SENIOR_ENGINEER':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only Senior Engineers can modify algorithm weights.")

        config = AlgorithmConfig.get_config()
        # partial=True allows sending only the changed sliders
        serializer = AlgorithmConfigSerializer(config, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(last_updated_by=request.user.email)
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

class RecalculatePriorityView(APIView):
    permission_classes = [IsAuthenticated, IsSeniorEngineer]

    def post(self, request):
        if request.user.role != 'SENIOR_ENGINEER':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only Senior Engineers can trigger a network recalculation.")

        try:
            call_command('calculate_priority')
            recalculated_count = RoadSegment.objects.count()
            return Response({
                "status": "success",
                "message": f"Network recalculation complete. {recalculated_count} segments updated.",
                "recalculated_at": timezone.now().isoformat(),
            })
        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status=500)