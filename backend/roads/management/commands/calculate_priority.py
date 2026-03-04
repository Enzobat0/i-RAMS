import random
from django.core.management.base import BaseCommand
from roads.models import RoadSegment

class Command(BaseCommand):
    help = 'Calculates MCA scores and simulates condition data'

    def handle(self, *args, **options):
        segments = RoadSegment.objects.all()
        count = segments.count()
        self.stdout.write(f"Recalculating priority for {count} segments...")

        for road in segments:
            # --- 1. Condition Component (0 - 5 Scale) ---
            # SIMULATION: For the demo, we inject a realistic random score 
            # if the road hasn't been "surveyed" by the AI yet.
            if road.latest_ddi_score == 0:
                # Weighted random to favor "fair" roads with occasional "bad" ones
                simulated_ddi = random.uniform(1.0, 5.0) 
                road.latest_ddi_score = round(simulated_ddi, 2)
            
            condition_score = road.latest_ddi_score
            
            # --- 2. Criticality Component (0 - 5 Scale) ---
            # A. Population Score (Weight 40%) - Capped at 15,000
            MAX_POP = 15000.0
            pop_metric = min(road.pop_within_2km, MAX_POP)
            score_pop = (pop_metric / MAX_POP) * 5.0
            
            # B. Health Score (Weight 20%) - SPADE Tiered Logic
            if road.health_facility_count == 0:
                score_health = 0.0
            elif road.health_facility_count == 1:
                score_health = 3.0
            else:
                score_health = 5.0
                
            # C. Education Score (Weight 20%) - SPADE Tiered Logic
            if road.school_count == 0:
                score_edu = 0.0
            elif road.school_count == 1:
                score_edu = 3.0
            else:
                score_edu = 5.0
                
            # D. Isolation Score (Weight 20%)
            score_iso = 5.0 if road.is_only_access else 0.0
            
            # Calculate Criticality Index
            crit_idx = (0.40 * score_pop) + (0.20 * score_health) + \
                       (0.20 * score_edu) + (0.20 * score_iso)

            # --- 3. Final MCA Calculation (50/50 Split) ---
            final_mca_score = (condition_score * 0.5) + (crit_idx * 0.5)
            
            # --- 4. Priority Level Mapping (1: Red, 2: Yellow, 3: Green) ---
            if final_mca_score >= 4.0:
                priority_level = 1  # High Priority (Red)
            elif final_mca_score >= 2.5:
                priority_level = 2  # Medium Priority (Yellow)
            else:
                priority_level = 3  # Low Priority (Green)
                
            # Update the database
            road.current_mca_score = round(final_mca_score, 2)
            road.priority_level = priority_level
            road.save()

        self.stdout.write(self.style.SUCCESS(f"Successfully updated {count} segments."))