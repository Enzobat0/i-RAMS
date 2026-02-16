import os
from django.contrib.gis.utils import LayerMapping
from django.core.management.base import BaseCommand
from roads.models import NationalRoad

class Command(BaseCommand):
    help = 'Ingest National Roads for Bugesera to use as graph anchors'

    def handle(self, *args, **options):
        # Adjust mapping based on your specific National Roads .dbf columns
        mapping = {
            'road_id': 'globalid', 
            'district': 'district',
            'geom': 'MULTILINESTRING',
        }

        shp_path = os.path.abspath('../data/raw/National Roads/National Roads.shp')
        
        # Save and filter
        lm = LayerMapping(NationalRoad, shp_path, mapping, transform=False)
        lm.save(strict=True)

        # Keep only Bugesera for efficiency
        NationalRoad.objects.exclude(district__iexact='Bugesera').delete()
        
        self.stdout.write(self.style.SUCCESS(f"Successfully ingested {NationalRoad.objects.count()} National Road segments for Bugesera."))