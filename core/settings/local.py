"""
Local development settings (default for manage.py runserver).
"""
from .base import *  # noqa: F403, F401

DEBUG = os.environ.get('DEBUG', '1') == '1'  # noqa: F405

# Same Wi-Fi mobile testing: accept LAN hosts and frontend origins
if os.environ.get('DJANGO_DEV_ALLOW_LAN', '1') == '1':  # noqa: F405
    ALLOWED_HOSTS = ['*']  # noqa: F405
    CORS_ALLOWED_ORIGIN_REGEXES = [  # noqa: F405
        r'^http://localhost:\d+$',
        r'^http://127\.0\.0\.1:\d+$',
        r'^http://192\.168\.\d{1,3}\.\d{1,3}:\d+$',
        r'^http://10\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$',
    ]
