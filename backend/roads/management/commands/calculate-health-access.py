import os
from django.core.management.base import BaseCommand
from django.contrib.gis.gdal import DataSource
from django.contrib.gis.measure import D
from roads.models import RoadSegment

class Command(BaseCommand):
    help = 'Calculates has_hospital based on proximity to Bugesera health facilities'

    def handle(self, *args, **options):
        shp_path = '../data/raw/Health Facilities/Health Facilities.shp'

        if not os.path.exists(shp_path):
            self.stdout.write(self.style.ERROR(f"File not found: {shp_path}"))
            return
        
        ds = DataSource(shp_path)
        layer = ds[0]

        self.stdout.write(f"Processing {len(layer)} health facilities from shapefile...")

        hospital_points = []
        for feature in layer:
            district = str(feature.get('district')).strip().upper()
            facility_type = str(feature.get('type')).strip().upper()
            
            if district == 'BUGESERA' and facility_type in ['DISTRICT HOSPITAL', 'HEALTH CENTRE', 'REFERENCE HOSPITAL', 'PROVINCIAL HOSPITAL']:
                hospital_points.append(feature.geom.geos)

        self.stdout.write(f"Filtered to {len(hospital_points)} facilities in Bugesera.")

        RoadSegment.objects.all().update(has_hospital=False)

        updated_count = 0
        search_radius = 5  # kilometers

        for pnt in hospital_points:
            pnt.srid = 4326
            affected_segments = RoadSegment.objects.filter(
                geom__distance_lte=(pnt, D(km=search_radius)),
                has_hospital=False
            )
            count = affected_segments.count()
            if count > 0:
                affected_segments.update(has_hospital=True)
                updated_count += count

        self.stdout.write(self.style.SUCCESS(
            f"Successfully updated {updated_count} segments with health access."
        ))