import os
from django.core.management.base import BaseCommand
from django.contrib.gis.gdal import DataSource
from django.contrib.gis.measure import D
from roads.models import RoadSegment

class Command(BaseCommand):
    help = 'Calculates has_school based on 3km proximity to Bugesera schools'

    def handle(self, *args, **options):
        shp_path = '../data/raw/Education facilities/Education facilities.shp'

        if not os.path.exists(shp_path):
            self.stdout.write(self.style.ERROR(f"File not found: {shp_path}"))
            return
        
        ds = DataSource(shp_path)
        layer = ds[0]

        self.stdout.write(f"Processing {len(layer)} schools from shapefile...")

        RoadSegment.objects.all().update(school_count=0)
        segments = RoadSegment.objects.all()

        higher_order_keywords = [
            'SECONDARY', 'O LEVEL', 'A LEVEL', 'VTC', 'TVET', 
            'VOCATIONAL', 'TERTIARY', '9YBE', '12YBE', 'O&A', 'IPRC'
        ]

        for segment in segments:
            count = 0
            for feature in layer:
                district = str(feature.get('district')).strip().upper()
                if district == 'BUGESERA':
                    type_raw = str(feature.get('settings_i')).strip().upper()
                    
                    if any(keyword in type_raw for keyword in higher_order_keywords):
                        school_points= feature.geom.geos
                        school_points.srid = 4326

                        if segment.geom.distance(school_points) <= 0.018:  # ~2km in degrees
                            count += 1
            if count > 0:
                segment.school_count = count
                segment.save()
                             
        self.stdout.write(self.style.SUCCESS(f"Updated {segments.filter(school_count__gt=0).count()} roads with school counts."))