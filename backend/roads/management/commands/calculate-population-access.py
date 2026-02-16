import os
import json
from django.core.management.base import BaseCommand
from rasterstats import zonal_stats
from django.contrib.gis.db.models.functions import Transform
from roads.models import RoadSegment

class Command(BaseCommand):
    help = 'Sums population within a 2km buffer of each road segment'

    def handle(self, *args, **options):
        raster_path = '../data/raw/rwa_pop_2025_CN_100m_R2025A_v1.tif'
        
        if not os.path.exists(raster_path):
            self.stdout.write(self.style.ERROR(f"Raster not found: {raster_path}"))
            return

        
        segments = RoadSegment.objects.all()
        updated_count = 0

        for segment in segments:
            geom_3857 = segment.geom.transform(3857, clone=True)
            buffered = geom_3857.buffer(2000)
            buffered.transform(4326)
            geojson = json.loads(buffered.geojson)
            
            #Calculate Zonal Stats (Sum of pixels)
            stats = zonal_stats(geojson, raster_path, stats="sum")
            
            pop_count = stats[0]['sum'] if stats[0]['sum'] else 0
            
            
            segment.pop_within_2km = int(pop_count)
            segment.save()
            updated_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"Successfully updated population for {updated_count} road segments."
        ))