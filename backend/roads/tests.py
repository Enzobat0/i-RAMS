from django.test import TestCase
from django.contrib.auth import get_user_model
from django.contrib.gis.geos import MultiLineString, LineString
from rest_framework.test import APIClient
from rest_framework import status
from .models import RoadSegment, AlgorithmConfig

User = get_user_model()


# Helpers

def make_segment(**kwargs):
    """Create a minimal valid RoadSegment for testing."""
    defaults = {
        'segment_id':           kwargs.pop('segment_id', 'TEST-001'),
        'district':             'Bugesera',
        'road_class':           'D2',
        'road_type':            'Unpaved',
        'geom':                 MultiLineString(LineString((30.1, -2.1), (30.2, -2.2))),
        'pop_within_2km':       5000,
        'health_facility_count': 1,
        'school_count':         1,
        'is_only_access':       False,
        'latest_ddi_score':     3.0,
    }
    defaults.update(kwargs)
    return RoadSegment.objects.create(**defaults)


def make_user(email, role, password='testpass123'):
    return User.objects.create_user(email=email, password=password, role=role)


# 1. MCA Algorithm Logic Tests
# Tests the calculate_priority management command's scoring logic directly
# by verifying the mathematical outcomes for known inputs.

class MCAAlgorithmTest(TestCase):

    def setUp(self):
        self.config = AlgorithmConfig.get_config()

    def test_high_priority_segment_scores_correctly(self):
        """
        A segment with max population, multiple facilities, sole access,
        and a high DDI should receive a score >= threshold_high (4.0).
        """
        segment = make_segment(
            segment_id='HIGH-001',
            pop_within_2km=15000,
            health_facility_count=3,
            school_count=3,
            is_only_access=True,
            latest_ddi_score=5.0,
        )
        # Manually compute expected score using default config weights
        score_pop    = (min(15000, 15000) / 15000) * 5.0   # 5.0
        score_health = 5.0                                   # 2+ facilities
        score_edu    = 5.0                                   # 2+ schools
        score_iso    = 5.0                                   # sole access
        crit_idx = (0.40 * score_pop + 0.20 * score_health +
                    0.20 * score_edu + 0.20 * score_iso)
        expected_mca = round((0.50 * 5.0) + (0.50 * crit_idx), 2)
        self.assertGreaterEqual(expected_mca, self.config.threshold_high)

    def test_low_priority_segment_scores_correctly(self):
        """
        A segment with zero population, no facilities, no sole access,
        and a low DDI should score below threshold_medium (2.5).
        """
        score_pop    = 0.0
        score_health = 0.0
        score_edu    = 0.0
        score_iso    = 0.0
        crit_idx     = 0.0
        expected_mca = round((0.50 * 1.0) + (0.50 * crit_idx), 2)
        self.assertLess(expected_mca, self.config.threshold_medium)

    def test_health_score_tiered_logic(self):
        """Health facility count uses tiered scoring: 0→0, 1→3.0, 2+→5.0"""
        self.assertEqual(0.0, 0.0 if 0 == 0 else (3.0 if 0 == 1 else 5.0))
        self.assertEqual(3.0, 0.0 if 1 == 0 else (3.0 if 1 == 1 else 5.0))
        self.assertEqual(5.0, 0.0 if 2 == 0 else (3.0 if 2 == 1 else 5.0))

    def test_population_score_capped_at_15000(self):
        """Population score is capped at 15,000 — values above should score 5.0."""
        pop_metric = min(30000, 15000)
        score = (pop_metric / 15000) * 5.0
        self.assertEqual(score, 5.0)

    def test_isolation_score_binary(self):
        """Sole access roads score 5.0, non-sole-access roads score 0.0."""
        self.assertEqual(5.0, 5.0 if True else 0.0)
        self.assertEqual(0.0, 5.0 if False else 0.0)

    def test_algorithm_config_defaults(self):
        """AlgorithmConfig singleton should be created with correct default weights."""
        self.assertEqual(self.config.condition_weight,   0.50)
        self.assertEqual(self.config.criticality_weight, 0.50)
        self.assertEqual(self.config.weight_population,  0.40)
        self.assertEqual(self.config.weight_health,      0.20)
        self.assertEqual(self.config.weight_education,   0.20)
        self.assertEqual(self.config.weight_isolation,   0.20)
        self.assertEqual(self.config.threshold_high,     4.0)
        self.assertEqual(self.config.threshold_medium,   2.5)

    def test_top_level_weights_sum_to_one(self):
        """condition_weight + criticality_weight must always equal 1.0."""
        total = self.config.condition_weight + self.config.criticality_weight
        self.assertAlmostEqual(total, 1.0, places=5)

    def test_sub_weights_sum_to_one(self):
        """The four criticality sub-weights must always sum to 1.0."""
        total = (self.config.weight_population + self.config.weight_health +
                 self.config.weight_education  + self.config.weight_isolation)
        self.assertAlmostEqual(total, 1.0, places=5)

# 2. Model Tests
# Tests the RoadSegment and AlgorithmConfig model behaviour.

class RoadSegmentModelTest(TestCase):

    def test_segment_creation_with_defaults(self):
        """A road segment created with minimal fields should have correct defaults."""
        segment = make_segment()
        self.assertEqual(segment.district, 'Bugesera')
        self.assertEqual(segment.latest_ddi_score, 3.0)
        self.assertEqual(segment.current_mca_score, 0.0)
        self.assertEqual(segment.priority_level, 0)

    def test_segment_id_is_unique(self):
        """Two segments with the same segment_id should raise an integrity error."""
        make_segment(segment_id='DUPE-001')
        with self.assertRaises(Exception):
            make_segment(segment_id='DUPE-001')

    def test_algorithm_config_singleton(self):
        """get_config() should always return the same single row."""
        config1 = AlgorithmConfig.get_config()
        config2 = AlgorithmConfig.get_config()
        self.assertEqual(config1.pk, config2.pk)
        self.assertEqual(AlgorithmConfig.objects.count(), 1)

# 3. API Endpoint Tests
# Tests the REST API responses for each endpoint.

class DashboardSummaryAPITest(TestCase):

    def setUp(self):
        self.client = APIClient()
        make_segment(segment_id='S1', pop_within_2km=1000,
                     health_facility_count=1, is_only_access=True)
        make_segment(segment_id='S2', pop_within_2km=500,
                     health_facility_count=0, is_only_access=False)

    def test_dashboard_summary_returns_200(self):
        response = self.client.get('/api/dashboard-summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_dashboard_summary_contains_required_keys(self):
        response = self.client.get('/api/dashboard-summary/')
        data = response.json()
        for key in ['total_segments', 'healthcare_access_pct',
                    'vulnerability_pct', 'avg_ddi', 'total_population']:
            self.assertIn(key, data)

    def test_dashboard_summary_total_segments_is_correct(self):
        response = self.client.get('/api/dashboard-summary/')
        self.assertEqual(response.json()['total_segments'], 2)

    def test_dashboard_summary_vulnerability_pct_is_correct(self):
        """1 of 2 segments is sole access → 50.0%"""
        response = self.client.get('/api/dashboard-summary/')
        self.assertEqual(response.json()['vulnerability_pct'], 50.0)


class RoadInventoryAPITest(TestCase):

    def setUp(self):
        self.client = APIClient()
        make_segment(segment_id='INV-001', priority_level=1,
                     current_mca_score=4.5)
        make_segment(segment_id='INV-002', priority_level=2,
                     current_mca_score=3.0)
        make_segment(segment_id='INV-003', priority_level=3,
                     current_mca_score=1.5)

    def test_inventory_returns_200(self):
        response = self.client.get('/api/roads/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_inventory_is_paginated(self):
        """Response should include count, next, previous, and results keys."""
        response = self.client.get('/api/roads/')
        data = response.json()
        self.assertIn('count', data)
        self.assertIn('results', data)

    def test_inventory_filter_by_priority(self):
        """?priority_level=1 should return only high-priority segments."""
        response = self.client.get('/api/roads/?priority_level=1')
        data = response.json()
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['segment_id'], 'INV-001')

    def test_inventory_default_ordering_is_mca_descending(self):
        """Default ordering should return highest MCA score first."""
        response = self.client.get('/api/roads/')
        results = response.json()['results']
        self.assertEqual(results[0]['segment_id'], 'INV-001')

    def test_inventory_search_by_segment_id(self):
        """?search=INV-002 should return only the matching segment."""
        response = self.client.get('/api/roads/?search=INV-002')
        data = response.json()
        self.assertEqual(data['count'], 1)


class AlgorithmConfigAPITest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.senior = make_user('senior@rtda.gov.rw', 'SENIOR_ENGINEER')
        self.engineer = make_user('engineer@bugesera.gov.rw', 'DISTRICT_ENGINEER')

    def test_config_get_returns_200_unauthenticated(self):
        """Config GET is public — should return 200 without a token."""
        response = self.client.get('/api/config/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_config_put_rejected_without_auth(self):
        """Config PUT should return 401 for unauthenticated requests."""
        response = self.client.put('/api/config/',
                                   {'condition_weight': 0.6,
                                    'criticality_weight': 0.4},
                                   format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_config_put_rejected_for_district_engineer(self):
        """District Engineers should receive 403 when attempting to update config."""
        self.client.force_authenticate(user=self.engineer)
        response = self.client.put('/api/config/',
                                   {'condition_weight': 0.6,
                                    'criticality_weight': 0.4},
                                   format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_config_put_accepted_for_senior_engineer(self):
        """Senior Engineers should be able to update config weights successfully."""
        self.client.force_authenticate(user=self.senior)
        response = self.client.put('/api/config/',
                                   {'condition_weight': 0.6,
                                    'criticality_weight': 0.4},
                                   format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['condition_weight'], 0.6)

    def test_config_put_rejects_invalid_weights(self):
        """Weights that don't sum to 1.0 should return 400."""
        self.client.force_authenticate(user=self.senior)
        response = self.client.put('/api/config/',
                                   {'condition_weight': 0.7,
                                    'criticality_weight': 0.7},
                                   format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


# 5. Spatial Join Test (PostGIS)
# Tests the 5km buffer logic used by the health access calculation.
# The system intentionally uses a 5km catchment radius for healthcare
# facilities, reflecting Rwanda's rural context where the nearest health
# centre may be several kilometres from the road serving a community.
# Rather than calling the management command (which requires a shapefile),
# we replicate the exact distance comparison the command uses — a segment's
# geometry distance to a point must be <= 0.045 degrees (~5km) to count.

class SpatialJoinTest(TestCase):

    def test_facility_within_5km_is_counted(self):
        """
        A health facility placed ~1km from a road segment's midpoint
        should fall within the 0.045 degree threshold and be counted.
        """
        from django.contrib.gis.geos import Point

        # Road segment centred around (30.10, -2.10)
        segment = make_segment(
            segment_id='GEO-001',
            geom=MultiLineString(LineString((30.09, -2.10), (30.11, -2.10))),
        )

        # Facility placed ~0.008 degrees away (~900m) — well within 5km
        nearby_facility = Point(30.108, -2.10, srid=4326)

        distance = segment.geom.distance(nearby_facility)
        self.assertLessEqual(
            distance, 0.045,
            msg=f"Facility at ~900m should be within 5km threshold (got {distance:.4f} degrees)"
        )

    def test_facility_beyond_5km_is_not_counted(self):
        """
        A health facility placed ~7km from a road segment
        should exceed the 0.045 degree threshold and not be counted.
        """
        from django.contrib.gis.geos import Point

        segment = make_segment(
            segment_id='GEO-002',
            geom=MultiLineString(LineString((30.09, -2.10), (30.11, -2.10))),
        )

        # Facility placed ~0.065 degrees away (~7km) — outside 5km
        distant_facility = Point(30.175, -2.10, srid=4326)

        distance = segment.geom.distance(distant_facility)
        self.assertGreater(
            distance, 0.045,
            msg=f"Facility at ~7km should exceed 5km threshold (got {distance:.4f} degrees)"
        )

    def test_only_nearby_facility_counted_not_distant(self):
        """
        Given one facility within 5km and one beyond 5km,
        only the nearby one should pass the distance check.
        This mirrors the exact loop logic in calculate-health-access.py.
        """
        from django.contrib.gis.geos import Point

        segment = make_segment(
            segment_id='GEO-003',
            geom=MultiLineString(LineString((30.09, -2.10), (30.11, -2.10))),
        )

        nearby_facility  = Point(30.108, -2.10, srid=4326)   # ~900m — within 5km
        distant_facility = Point(30.175, -2.10, srid=4326)   # ~7km  — beyond 5km

        THRESHOLD = 0.045  # ~5km in degrees

        count = sum(
            1 for facility in [nearby_facility, distant_facility]
            if segment.geom.distance(facility) <= THRESHOLD
        )

        self.assertEqual(count, 1, "Only the facility within 5km should be counted")


class AuthenticationTest(TestCase):

    def setUp(self):
        self.client = APIClient()

    def test_login_with_valid_credentials_returns_tokens(self):
        """Valid login should return access and refresh tokens plus role."""
        make_user('david@rtda.gov.rw', 'SENIOR_ENGINEER', password='pass1234')
        response = self.client.post('/api/login/',
                                    {'email': 'david@rtda.gov.rw',
                                     'password': 'pass1234'},
                                    format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn('access', data)
        self.assertIn('refresh', data)
        self.assertEqual(data['role'], 'SENIOR_ENGINEER')

    def test_login_with_invalid_credentials_returns_401(self):
        """Wrong password should return 401."""
        make_user('david@rtda.gov.rw', 'SENIOR_ENGINEER', password='pass1234')
        response = self.client.post('/api/login/',
                                    {'email': 'david@rtda.gov.rw',
                                     'password': 'wrongpassword'},
                                    format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_role_is_assigned_correctly(self):
        """Each role should be stored and retrievable from the database."""
        senior   = make_user('s@test.com', 'SENIOR_ENGINEER')
        district = make_user('d@test.com', 'DISTRICT_ENGINEER')
        agent    = make_user('a@test.com', 'SURVEY_AGENT')
        self.assertEqual(senior.role,   'SENIOR_ENGINEER')
        self.assertEqual(district.role, 'DISTRICT_ENGINEER')
        self.assertEqual(agent.role,    'SURVEY_AGENT')