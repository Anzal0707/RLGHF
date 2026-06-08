"""Create Django superuser from environment variables when missing."""
from __future__ import annotations

import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = (
        'Create a superuser from DJANGO_SUPERUSER_USERNAME and '
        'DJANGO_SUPERUSER_PASSWORD when one does not already exist.'
    )

    def handle(self, *args, **options):
        username = os.environ.get('DJANGO_SUPERUSER_USERNAME', '').strip()
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', '')

        if not username or not password:
            self.stdout.write(
                self.style.WARNING(
                    'DJANGO_SUPERUSER_USERNAME/PASSWORD not set; skipping superuser creation.'
                )
            )
            return

        user_model = get_user_model()
        if user_model.objects.filter(username=username).exists():
            self.stdout.write(f'Superuser "{username}" already exists; skipping.')
            return

        user_model.objects.create_superuser(username=username, password=password)
        self.stdout.write(self.style.SUCCESS(f'Created superuser "{username}".'))
