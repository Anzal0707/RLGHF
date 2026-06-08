"""
Default settings module — local development.

Override in production:
  DJANGO_SETTINGS_MODULE=core.settings.production
"""
from .local import *  # noqa: F403, F401
