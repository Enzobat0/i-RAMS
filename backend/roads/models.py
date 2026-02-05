from django.contrib.gis.db import models

class RoadSegment(models.Model):
    #Data from District roads shapefile
    segment_id = models.CharField(max_length=50, unique=True)
    district = models.CharField(max_length=50)
    road_class = models.CharField(max_length=50)
    road_type = models.CharField(max_length=50)
    geom = models.MultiLineStringField()

    #attributes for MCA ranking
    pop_within_2km = models.IntegerField(default=0)
    has_hospital = models.BooleanField(default=False)
    has_school = models.BooleanField(default=False)
    is_only_access = models.BooleanField(default=False)

    #performance attributes
    latest_ddi_score = models.FloatField(default=0.0)
    current_mca_score = models.FloatField(default=0.0)
    priority_level = models.IntegerField(default=0)

    def __str__(self):
        return f"Segment {self.segment_id} ({self.district})"

class ConditionSurvey(models.Model):
# Tracks every AI survey conducted on a segment 
    survey_id = models.CharField(max_length=100, unique=True) 
    segment = models.ForeignKey(RoadSegment, on_delete=models.CASCADE) 
    source_video_url = models.URLField() 
    total_pothole_count = models.IntegerField(default=0) 
    total_crack_count = models.IntegerField(default=0) 
    calculated_ddi = models.FloatField(default=0.0) 
    timestamp = models.DateTimeField(auto_now_add=True) 
