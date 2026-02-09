import os
from django.contrib.gis.utils import LayerMapping
from django.core.management.base import BaseCommand
from roads.models import RoadSegment

class Command(BaseCommand):
    help = 'Ingest only Bugesera roads from the shapefile'

    def handle(self, *args, **options):
        mapping = {
            'segment_id': 'globalid',
            'district': 'district',
            'road_class': 'type',
            'road_type': 'status',
            'geom': 'MULTILINESTRING',
        }

        shapefile_path = os.path.abspath('../data/raw/District Roads/District Roads.shp')

        lm = LayerMapping(RoadSegment, shapefile_path, mapping, transform=False, encoding='iso-8859-1')
        lm.save(strict=True, verbose=False)

        initial_count = RoadSegment.objects.count()
        RoadSegment.objects.exclude(district__iexact='Bugesera').delete()
        final_count = RoadSegment.objects.count()

        self.stdout.write(self.style.SUCCESS(
            f"Successfully filtered data. Imported {final_count} roads for Bugesera district (removed {initial_count - final_count} roads not from Bugesera)." 
        ))