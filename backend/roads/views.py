from rest_framework import generics
from .models import RoadSegment
from .serializers import RoadSegmentSerializer

class RoadListAPIView(generics.ListAPIView):
    queryset = RoadSegment.objects.all()
    serializer_class = RoadSegmentSerializer