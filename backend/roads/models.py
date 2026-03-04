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
