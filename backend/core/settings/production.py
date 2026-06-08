"""
Production deployment settings (Railway single-service).

Set: DJANGO_SETTINGS_MODULE=core.settings.production
"""
import os

import dj_database_url

from .base import *  # noqa: F403, F401
from .base import BUILD_SECRET_KEY_FALLBACK

DEBUG = False

# Railway build runs collectstatic before service variables may be injected.
# buildCommand sets DJANGO_BUILD_PHASE=1 and a throwaway SECRET_KEY for that step only.
_BUILD_ONLY_SECRET_KEYS = frozenset(
    {
        BUILD_SECRET_KEY_FALLBACK,
        'build-only-not-for-runtime',
    }
)

if os.environ.get('DJANGO_BUILD_PHASE') != '1':
    _runtime_secret_key = os.environ.get('SECRET_KEY', '')
    if not _runtime_secret_key or _runtime_secret_key in _BUILD_ONLY_SECRET_KEYS:
        raise ValueError(
            'SECRET_KEY must be set in Railway service variables for production runtime. '
            'Generate one with: python -c "from django.core.management.utils import '
            'get_random_secret_key; print(get_random_secret_key())"'
        )
    SECRET_KEY = _runtime_secret_key  # noqa: F405

    _database_url = os.environ.get('DATABASE_URL')
    if not _database_url:
        raise ValueError(
            'DATABASE_URL is required in production. Add a PostgreSQL plugin on Railway.'
        )
    _default_ssl_mode = 'disable' if os.environ.get('RAILWAY_ENVIRONMENT') else 'require'
    DATABASES = {  # noqa: F405
        'default': dj_database_url.config(
            default=_database_url,
            conn_max_age=600,
            ssl_require=os.environ.get('DATABASE_SSLMODE', _default_ssl_mode) != 'disable',
        )
    }

ALLOWED_HOSTS = env_list(  # noqa: F405
    'ALLOWED_HOSTS',
    'localhost,127.0.0.1,.railway.app',
)
_railway_public_domain = os.environ.get('RAILWAY_PUBLIC_DOMAIN', '').strip()
if _railway_public_domain and _railway_public_domain not in ALLOWED_HOSTS:  # noqa: F405
    ALLOWED_HOSTS.append(_railway_public_domain)  # noqa: F405
if '.railway.app' not in ALLOWED_HOSTS:  # noqa: F405
    ALLOWED_HOSTS.append('.railway.app')  # noqa: F405

# Same-origin single-service deploy: browser uses /api on the same host.
CORS_ALLOWED_ORIGINS = env_list(  # noqa: F405
    'CORS_ALLOWED_ORIGINS',
    '',
)

_csrf_origins = list(CORS_ALLOWED_ORIGINS)  # noqa: F405
if _railway_public_domain:
    _csrf_origins.append(f'https://{_railway_public_domain}')

if _csrf_origins:
    CSRF_TRUSTED_ORIGINS = _csrf_origins  # noqa: F405

MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')  # noqa: F405

# ── Cloudinary media storage ──────────────────────────────────────────────────
# Uploaded files (voice recordings, attachments) are stored on Cloudinary so
# they survive Railway container restarts and are publicly accessible.
# Required Railway service variables:
#   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.environ.get('CLOUDINARY_CLOUD_NAME', ''),
    'API_KEY': os.environ.get('CLOUDINARY_API_KEY', ''),
    'API_SECRET': os.environ.get('CLOUDINARY_API_SECRET', ''),
}

STORAGES = {  # noqa: F405
    'default': {
        'BACKEND': 'cloudinary_storage.storage.MediaCloudinaryStorage',
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
