from rest_framework import serializers
from .models import RoadSegment

class RoadSegmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoadSegment
        fields = '__all__'