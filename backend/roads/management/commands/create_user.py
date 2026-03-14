"""
Management command to create i-RAMS user accounts from the terminal.

Usage examples:
  # Create a Senior Engineer (the admin / RTDA role)
  python manage.py create_user --email david@rtda.gov.rw --password SecurePass1 --role SENIOR_ENGINEER --first_name David --last_name Tuyishimire

  # Create a District Engineer
  python manage.py create_user --email enzo@bugesera.gov.rw --password SecurePass2 --role DISTRICT_ENGINEER --first_name Enzo --last_name Batungwanayo

  # Create a Survey Agent (mobile field worker)
  python manage.py create_user --email agent@bugesera.gov.rw --password SecurePass3 --role SURVEY_AGENT --first_name Jean --last_name Mugisha

  # Create a Django superuser (can access /admin panel)
  python manage.py create_user --email admin@irams.rw --password AdminPass1 --role SENIOR_ENGINEER --superuser
"""

from django.core.management.base import BaseCommand, CommandError
from authentication.models import User


class Command(BaseCommand):
    help = 'Create an i-RAMS user account with a specific role.'

    def add_arguments(self, parser):
        parser.add_argument('--email',      required=True,  help='User email address (used as login)')
        parser.add_argument('--password',   required=True,  help='Initial password')
        parser.add_argument('--role',       required=True,
                            choices=['SENIOR_ENGINEER', 'DISTRICT_ENGINEER', 'SURVEY_AGENT'],
                            help='User role')
        parser.add_argument('--first_name', default='',     help='First name (optional)')
        parser.add_argument('--last_name',  default='',     help='Last name (optional)')
        parser.add_argument('--superuser',  action='store_true',
                            help='Grant Django superuser access (allows login to /admin panel)')

    def handle(self, *args, **options):
        email      = options['email'].lower().strip()
        password   = options['password']
        role       = options['role']
        first_name = options['first_name']
        last_name  = options['last_name']
        is_super   = options['superuser']

        if User.objects.filter(email=email).exists():
            raise CommandError(f"A user with email '{email}' already exists.")

        user = User.objects.create_user(
            email      = email,
            password   = password,
            role       = role,
            first_name = first_name,
            last_name  = last_name,
            is_staff   = is_super,       # staff = can access /admin
            is_superuser = is_super,
        )

        role_label = user.get_role_display()
        self.stdout.write(self.style.SUCCESS(
            f"\n  ✓ User created successfully"
            f"\n    Email    : {user.email}"
            f"\n    Name     : {user.get_full_name() or '(not set)'}"
            f"\n    Role     : {role_label}"
            f"\n    Superuser: {'Yes — can access /admin' if is_super else 'No'}\n"
        ))