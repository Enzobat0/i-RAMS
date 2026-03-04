import os
from django.core.management.base import BaseCommand
from django.contrib.gis.gdal import DataSource
from roads.models import InfrastructurePoint

class Command(BaseCommand):
    help = 'Ingests school and hospital coordinates for Bugesera'

    def handle(self, *args, **options):
        health_shp = '../data/raw/Health Facilities/Health Facilities.shp'
        school_shp = '../data/raw/Education facilities/Education facilities.shp'
        
        # Clear old points to avoid duplicates
        InfrastructurePoint.objects.all().delete()

        # 1. Ingest Health Facilities
        ds_health = DataSource(health_shp)
        for feature in ds_health[0]:
            if str(feature.get('district')).strip().upper() == 'BUGESERA':
                InfrastructurePoint.objects.create(
                    point_type='healthcare',
                    name=str(feature.get('name')),
                    facility_type=str(feature.get('type')),
                    geom=feature.geom.geos
                )

        # 2. Ingest Schools
        ds_school = DataSource(school_shp)
        for feature in ds_school[0]:
            if str(feature.get('district')).strip().upper() == 'BUGESERA':
                InfrastructurePoint.objects.create(
                    point_type='school',
                    name=str(feature.get('school_nam')),
                    facility_type=str(feature.get('settings_i')),
                    geom=feature.geom.geos
                )

        self.stdout.write(self.style.SUCCESS(f"Ingested {InfrastructurePoint.objects.count()} points."))