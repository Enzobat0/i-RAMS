from django.test import TestCase
from django.contrib.auth import get_user_model

User = get_user_model()

class AuthenticationConfigTest(TestCase):
    def test_custom_user_creation(self):
        """
        Verify that the Custom User model works and roles are assigned.
        This confirms the migration to AbstractUser was successful.
        """
        user = User.objects.create_user(
            email='test@irams.com', 
            password='password123',
            role='SURVEY_AGENT'
        )
        # Check email instead of username
        self.assertEqual(user.email, 'test@irams.com')
        # Check that our custom role field works
        self.assertEqual(user.role, 'SURVEY_AGENT')
        self.assertTrue(User.objects.filter(email='test@irams.com').exists())

    def test_environment_health(self):
        """Standard sanity check for the CI pipeline."""
        self.assertTrue(True)