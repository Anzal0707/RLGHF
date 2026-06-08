"""Django management command: build Next.js and sync into static/frontend/."""
from __future__ import annotations

from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from core.frontend_sync import sync_frontend


class Command(BaseCommand):
    help = (
        'Build the Next.js frontend and copy frontend/out into static/frontend/. '
        'Run this after UI changes so localhost:8000 matches the production export.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--collectstatic',
            action='store_true',
            help='Also run collectstatic after copying the frontend build.',
        )

    def handle(self, *args, **options):
        backend_dir = Path(__file__).resolve().parents[3]
        if not (backend_dir / 'frontend' / 'package.json').is_file():
            raise CommandError('frontend/package.json not found.')

        self.stdout.write('Building and syncing frontend for Django...')
        try:
            sync_frontend(collectstatic=options['collectstatic'])
        except SystemExit as exc:
            code = exc.code if exc.code is not None else 1
            if code:
                raise CommandError('Frontend sync failed.') from exc
        self.stdout.write(self.style.SUCCESS('Frontend synced successfully.'))
