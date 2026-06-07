"""Parse DATABASE_URL for Railway PostgreSQL (no extra dependencies)."""
from __future__ import annotations

import os
from urllib.parse import unquote, urlparse


def database_config_from_url(url: str) -> dict:
    if url.startswith('postgres://'):
        url = 'postgresql://' + url[len('postgres://') :]

    parsed = urlparse(url)
    config: dict = {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': (parsed.path or '/').lstrip('/'),
        'USER': parsed.username or '',
        'PASSWORD': unquote(parsed.password or ''),
        'HOST': parsed.hostname or '',
        'PORT': str(parsed.port or 5432),
        'CONN_MAX_AGE': 600,
    }
    sslmode = os.environ.get('DATABASE_SSLMODE', 'require')
    if sslmode:
        config['OPTIONS'] = {'sslmode': sslmode}
    return config
