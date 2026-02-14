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

        school_points = []
        higher_order_keywords = [
            'SECONDARY', 'O LEVEL', 'A LEVEL', 'VTC', 'TVET', 
            'VOCATIONAL', 'TERTIARY', '9YBE', '12YBE', 'O&A', 'IPRC'
        ]
        for feature in layer:
            district = str(feature.get('district')).strip().upper()
            
            if district == 'BUGESERA':
                type_raw = str(feature.get('settings_i')).strip().upper()
                
                
                is_higher_education = any(keyword in type_raw for keyword in higher_order_keywords)
                
                if is_higher_education:
                    school_points.append(feature.geom.geos)

        self.stdout.write(f"Filtered to {len(school_points)} schools in Bugesera.")

        
        RoadSegment.objects.all().update(has_school=False)

        updated_count = 0
        search_radius = 2

        for pnt in school_points:
            pnt.srid = 4326
            affected_segments = RoadSegment.objects.filter(
                geom__distance_lte=(pnt, D(km=search_radius)),
                has_school=False 
            )
            count = affected_segments.count()
            if count > 0:
                affected_segments.update(has_school=True)
                updated_count += count

        self.stdout.write(self.style.SUCCESS(
            f"Successfully updated {updated_count} segments with school access."
        ))