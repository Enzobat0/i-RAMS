from rest_framework import serializers
from .models import RoadSegment, InfrastructurePoint, AlgorithmConfig
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

class RoadInventorySerializer(serializers.ModelSerializer):
    # Human-readable priority label derived from the integer priority_level field
    priority_label = serializers.SerializerMethodField()

    class Meta:
        model = RoadSegment
        fields = (
            'id',
            'segment_id',
            'district',
            'road_class',
            'road_type',
            'pop_within_2km',
            'health_facility_count',
            'school_count',
            'is_only_access',
            'latest_ddi_score',
            'current_mca_score',
            'priority_level',
            'priority_label',
        )

    def get_priority_label(self, obj):
        mapping = {1: 'High', 2: 'Medium', 3: 'Low', 0: 'Unranked'}
        return mapping.get(obj.priority_level, 'Unranked')
# AlgorithmConfig Serializer
# Used by both the GET (read current weights) and PUT (save new weights) endpoints for the algorithm configuration. 
# Includes validation to ensure the weights sum to 1 and that the thresholds are logically ordered.   
class AlgorithmConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlgorithmConfig
        fields = (
            'condition_weight',
            'criticality_weight',
            'weight_population',
            'weight_health',
            'weight_education',
            'weight_isolation',
            'threshold_high',
            'threshold_medium',
            'last_updated_by',
            'updated_at',
        )
        # updated_at is auto-set; last_updated_by is set in the view from the JWT user
        read_only_fields = ('updated_at',)

    def validate(self, data):
        # Merge incoming data with existing values so partial updates still validate
        instance = self.instance
        def val(field):
            return data.get(field, getattr(instance, field) if instance else AlgorithmConfig._meta.get_field(field).default)

        top_sum = round(val('condition_weight') + val('criticality_weight'), 6)
        if abs(top_sum - 1.0) > 0.001:
            raise serializers.ValidationError(
                f"condition_weight + criticality_weight must equal 1.0 (currently {top_sum:.3f})."
            )

        sub_sum = round(
            val('weight_population') + val('weight_health') +
            val('weight_education') + val('weight_isolation'), 6
        )
        if abs(sub_sum - 1.0) > 0.001:
            raise serializers.ValidationError(
                f"The four criticality sub-weights must equal 1.0 (currently {sub_sum:.3f})."
            )

        if val('threshold_high') <= val('threshold_medium'):
            raise serializers.ValidationError(
                "threshold_high must be greater than threshold_medium."
            )

        return data
