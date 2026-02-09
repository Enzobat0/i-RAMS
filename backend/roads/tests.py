from django.test import TestCase
from django.contrib.auth.models import User

class InfrastructureConfigTest(TestCase):
    def test_database_connection(self):
        """
        Verify that Django can create a user in the test database.
        This confirms our PostGIS/Postgres service in the pipeline is active.
        """
        user = User.objects.create_user(username='testuser', password='password123')
        self.assertEqual(user.username, 'testuser')
        self.assertTrue(User.objects.filter(username='testuser').exists())

    def test_environment_health(self):
        """A simple truth test to ensure the test runner is executing."""
        self.assertTrue(True)