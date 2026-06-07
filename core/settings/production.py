"""
Production deployment settings (Railway, Render, VPS).

Set: DJANGO_SETTINGS_MODULE=core.settings.production
"""
import os

from .base import *  # noqa: F403, F401
from .database import database_config_from_url

DEBUG = False

ALLOWED_HOSTS = env_list(  # noqa: F405
    'ALLOWED_HOSTS',
    'localhost,127.0.0.1,.railway.app',
)

CORS_ALLOWED_ORIGINS = env_list(  # noqa: F405
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:3000,https://your-app.vercel.app',
)

CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS  # noqa: F405

_database_url = os.environ.get('DATABASE_URL')
if _database_url:
    DATABASES = {'default': database_config_from_url(_database_url)}  # noqa: F405

MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')  # noqa: F405

STORAGES = {  # noqa: F405
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
