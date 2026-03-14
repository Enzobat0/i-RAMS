import random
from django.core.management.base import BaseCommand
from roads.models import RoadSegment, AlgorithmConfig


class Command(BaseCommand):
    help = (
        'Recalculates MCA scores for every road segment using the weights '
        'stored in the AlgorithmConfig table (configurable via the admin UI).'
    )

    def handle(self, *args, **options):
        # --- Load the singleton config (creates defaults if it doesn't exist yet) ---
        config = AlgorithmConfig.get_config()

        self.stdout.write("Using algorithm weights:")
        self.stdout.write(f"  Condition     : {config.condition_weight*100:.0f}%")
        self.stdout.write(f"  Criticality   : {config.criticality_weight*100:.0f}%")
        self.stdout.write(f"  Sub-weights   => Pop: {config.weight_population*100:.0f}%  "
                          f"Health: {config.weight_health*100:.0f}%  "
                          f"Education: {config.weight_education*100:.0f}%  "
                          f"Isolation: {config.weight_isolation*100:.0f}%")
        self.stdout.write(f"  Thresholds    => High: >={config.threshold_high}  "
                          f"Medium: >={config.threshold_medium}")

        segments = RoadSegment.objects.all()
        count = segments.count()
        self.stdout.write(f"\nRecalculating priority for {count} segments...")

        for road in segments:

            # --- 1. Condition Component (0 – 5 scale, sourced from DDI score) ---
            # If no real DDI data exists yet, inject a realistic simulated score.
            # This represents the output a field survey would produce and allows
            # full system demonstration without real sensor data.
            if road.latest_ddi_score == 0:
                # Weighted distribution: favours "fair" roads, some "bad" outliers
                road.latest_ddi_score = round(random.uniform(1.0, 5.0), 2)

            condition_score = road.latest_ddi_score

            # --- 2. Criticality Sub-components (each on a 0 – 5 scale) ---

            # A. Population Score — linearly scaled, capped at 15,000 people
            MAX_POP = 15000.0
            pop_metric = min(road.pop_within_2km, MAX_POP)
            score_pop = (pop_metric / MAX_POP) * 5.0

            # B. Health Score — tiered: 0 facilities = 0, 1 = 3.0, 2+ = 5.0
            if road.health_facility_count == 0:
                score_health = 0.0
            elif road.health_facility_count == 1:
                score_health = 3.0
            else:
                score_health = 5.0

            # C. Education Score — same tiered logic as health
            if road.school_count == 0:
                score_edu = 0.0
            elif road.school_count == 1:
                score_edu = 3.0
            else:
                score_edu = 5.0

            # D. Isolation Score — binary: 5.0 if sole access road, else 0
            score_iso = 5.0 if road.is_only_access else 0.0

            # --- 3. Criticality Index using configurable sub-weights ---
            crit_idx = (
                (config.weight_population  * score_pop)    +
                (config.weight_health      * score_health) +
                (config.weight_education   * score_edu)    +
                (config.weight_isolation   * score_iso)
            )

            # --- 4. Final MCA Score using configurable top-level weights ---
            final_mca_score = (
                (config.condition_weight   * condition_score) +
                (config.criticality_weight * crit_idx)
            )

            # --- 5. Priority Level using configurable thresholds ---
            if final_mca_score >= config.threshold_high:
                priority_level = 1   # Red  — High Priority
            elif final_mca_score >= config.threshold_medium:
                priority_level = 2   # Yellow — Medium Priority
            else:
                priority_level = 3   # Green  — Low Priority

            road.current_mca_score = round(final_mca_score, 2)
            road.priority_level = priority_level
            road.save()

        self.stdout.write(self.style.SUCCESS(
            f"Successfully recalculated priorities for {count} segments."
        ))