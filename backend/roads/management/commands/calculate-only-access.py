import os
import networkx as nx
from django.core.management.base import BaseCommand
# Import both models
from roads.models import RoadSegment, NationalRoad

class Command(BaseCommand):
    help = 'Identifies District segments that provide the only access to a community (anchored by National Roads)'

    def handle(self, *args, **options):
        G = nx.Graph()
        # segment_map will only store District Road IDs since we only want to update those
        segment_map = {} 

        # 1. Add National Roads to the Graph first (The Backbone)
        # We don't save these to segment_map because we won't mark them as bridges
        nat_roads = NationalRoad.objects.all()
        for nr in nat_roads:
            coords = nr.geom[0].coords
            start_node, end_node = coords[0], coords[-1]
            G.add_edge(start_node, end_node, road_type='national')

        self.stdout.write(f"Added {nat_roads.count()} National Road segments to the graph backbone.")

        # 2. Add District Road Segments
        segments = RoadSegment.objects.all()
        for segment in segments:
            coords = segment.geom[0].coords
            start_node, end_node = coords[0], coords[-1]
            
            G.add_edge(start_node, end_node, road_type='district', segment_id=segment.segment_id)
            segment_map[(start_node, end_node)] = segment.segment_id

        self.stdout.write(f"Graph complete: {G.number_of_nodes()} nodes, {G.number_of_edges()} total edges.")

        # 3. Identify Bridges in the combined network
        # nx.bridges detects edges whose removal increases connected components
        # Because District Roads are now connected to the National backbone, 
        # many "false positive" dead-ends will no longer be considered bridges.
        bridges = list(nx.bridges(G))
        
        # 4. Update the Database for District Roads
        RoadSegment.objects.all().update(is_only_access=False)
        
        bridge_ids = []
        for u, v in bridges:
            # Only track this bridge if it exists in our District Road map
            seg_id = segment_map.get((u, v)) or segment_map.get((v, u))
            if seg_id:
                bridge_ids.append(seg_id)

        updated_count = RoadSegment.objects.filter(segment_id__in=bridge_ids).update(is_only_access=True)

        self.stdout.write(self.style.SUCCESS(
            f"Successfully identified {updated_count} 'Only Access' district segments after anchoring."
        ))