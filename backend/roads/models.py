from django.contrib.gis.db import models

class RoadSegment(models.Model):
    #Data from District roads shapefile
    segment_id = models.CharField(max_length=50, unique=True)
    district = models.CharField(max_length=50)
    road_class = models.CharField(max_length=50)
    road_type = models.CharField(max_length=50)
    geom = models.MultiLineStringField(srid=4326, geography=True)


    #attributes for MCA ranking
    pop_within_2km = models.IntegerField(default=0)
    health_facility_count = models.IntegerField(default=0)
    school_count = models.IntegerField(default=0)
    is_only_access = models.BooleanField(default=False)

    #performance attributes
    latest_ddi_score = models.FloatField(default=0.0)
    current_mca_score = models.FloatField(default=0.0)
    priority_level = models.IntegerField(default=0)

    def __str__(self):
        return f"Segment {self.segment_id} ({self.district})"
    
class NationalRoad(models.Model):
    # Basic data for reference
    road_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100, null=True, blank=True)
    district = models.CharField(max_length=50)
    geom = models.MultiLineStringField(srid=4326, geography=True)

    def __str__(self):
        return f"National Road {self.road_id} - {self.district}"
    
class InfrastructurePoint(models.Model):
    point_type = models.CharField(max_length=20) # 'school' or 'healthcare'
    name = models.CharField(max_length=255, null=True, blank=True)
    facility_type = models.CharField(max_length=100, null=True, blank=True) # e.g., 'Health Centre'
    geom = models.PointField(srid=4326) 

    def __str__(self):
        return f"{self.name} ({self.point_type})"

class ConditionSurvey(models.Model):
# Tracks every AI survey conducted on a segment 
    survey_id = models.CharField(max_length=100, unique=True) 
    segment = models.ForeignKey(RoadSegment, on_delete=models.CASCADE) 
    source_video_url = models.URLField() 
    total_pothole_count = models.IntegerField(default=0) 
    total_crack_count = models.IntegerField(default=0) 
    calculated_ddi = models.FloatField(default=0.0) 
    timestamp = models.DateTimeField(auto_now_add=True) 

class AlgorithmConfig(models.Model):
    """
    Singleton model that stores the MCA algorithm weights.
    Only one row should ever exist (id=1). The admin Configuration
    page reads and writes this row via the API.

    All weight fields are stored as floats representing a proportion
    of 1.0, e.g. 0.5 means 50%.  The two top-level weights
    (condition_weight + criticality_weight) must sum to 1.0.
    The four criticality sub-weights must also sum to 1.0.
    Validation is enforced in the serializer, not here.
    """

    # --- Top-level split: Condition vs. Criticality ---
    condition_weight    = models.FloatField(default=0.50)   # weight for DDI score
    criticality_weight  = models.FloatField(default=0.50)   # weight for criticality index

    # --- Criticality sub-weights (must sum to 1.0) ---
    weight_population   = models.FloatField(default=0.40)   # pop_within_2km
    weight_health       = models.FloatField(default=0.20)   # health_facility_count
    weight_education    = models.FloatField(default=0.20)   # school_count
    weight_isolation    = models.FloatField(default=0.20)   # is_only_access

    # --- Priority thresholds ---
    # Segments with MCA score >= high_threshold are Priority 1 (Red)
    # Segments with MCA score >= medium_threshold are Priority 2 (Yellow)
    # Everything below medium_threshold is Priority 3 (Green)
    threshold_high      = models.FloatField(default=4.0)
    threshold_medium    = models.FloatField(default=2.5)

    # Audit trail — who last changed the config and when
    last_updated_by     = models.CharField(max_length=255, blank=True, default='')
    updated_at          = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Algorithm Configuration'

    def __str__(self):
        return (
            f"MCA Config | Condition: {self.condition_weight*100:.0f}% / "
            f"Criticality: {self.criticality_weight*100:.0f}% | "
            f"Updated: {self.updated_at.strftime('%Y-%m-%d %H:%M') if self.updated_at else 'never'}"
        )

    @classmethod
    def get_config(cls):
        """Always returns the singleton config, creating it with defaults if it doesn't exist."""
        config, _ = cls.objects.get_or_create(pk=1)
        return config


