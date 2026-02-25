import os
from django.core.management.base import BaseCommand
from django.contrib.gis.gdal import DataSource
from django.contrib.gis.measure import D
from roads.models import RoadSegment

class Command(BaseCommand):
    help = 'Counts health facilities within 5km of each road segment'

    def handle(self, *args, **options):
        shp_path = '../data/raw/Health Facilities/Health Facilities.shp'

        if not os.path.exists(shp_path):
            self.stdout.write(self.style.ERROR(f"File not found: {shp_path}"))
            return
        
        ds = DataSource(shp_path)
        layer = ds[0]

        self.stdout.write(f"Processing {len(layer)} health facilities...")

        # 1. Reset all counts to 0 first
        RoadSegment.objects.all().update(health_facility_count=0)

        # 2. Extract valid health facility points once to save memory
        valid_facilities = []
        for feature in layer:
            district = str(feature.get('district')).strip().upper()
            facility_type = str(feature.get('type')).strip().upper()
            
            if district == 'BUGESERA' and facility_type in ['DISTRICT HOSPITAL', 'HEALTH CENTRE', 'REFERENCE HOSPITAL', 'PROVINCIAL HOSPITAL']:
                pnt = feature.geom.geos
                pnt.srid = 4326
                valid_facilities.append(pnt)

        self.stdout.write(f"Found {len(valid_facilities)} relevant facilities in Bugesera.")

        # 3. Efficiently update each segment
        updated_count = 0
        segments = RoadSegment.objects.all()

        for segment in segments:
            count = 0
            for facility_pnt in valid_facilities:
                if segment.geom.distance(facility_pnt) <= 0.045: # ~5km
                    count += 1
            
            if count > 0:
                segment.health_facility_count = count
                segment.save()
                updated_count += 1

        self.stdout.write(self.style.SUCCESS(f"Successfully updated {updated_count} roads."))