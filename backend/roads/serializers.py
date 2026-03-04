from rest_framework import serializers
from .models import RoadSegment, InfrastructurePoint
from rest_framework_gis.serializers import GeoFeatureModelSerializer

class RoadSegmentSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = RoadSegment
        geo_field = "geom"
        fields = (
            'id', 'segment_id', 'pop_within_2km', 'health_facility_count', 
            'school_count', 'is_only_access', 'latest_ddi_score', 
            'current_mca_score', 'priority_level', 'road_class', 'road_type', 'district'
        )

class InfrastructurePointSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = InfrastructurePoint
        geo_field = 'geom'
        fields = ['id', 'point_type', 'name', 'facility_type']