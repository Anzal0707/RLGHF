import os
from pathlib import Path

# Build paths
BASE_DIR = Path(__file__).resolve().parent.parent

# ========== MANUAL .env PARSER (handles BOM, spaces, quotes) ==========
env_path = BASE_DIR / '.env'
if env_path.exists():
    with open(env_path, 'r', encoding='utf-8-sig') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if '=' in line:
                key, value = line.split('=', 1)
                key = key.strip()
                value = value.strip()
                # Remove surrounding quotes if any
                if (value.startswith('"') and value.endswith('"')) or \
                   (value.startswith("'") and value.endswith("'")):
                    value = value[1:-1]
                os.environ[key] = value
else:
    raise FileNotFoundError(f".env file not found at {env_path}")

# ========== READ ENVIRONMENT VARIABLES ==========
SECRET_KEY = os.environ.get('SECRET_KEY')
if not SECRET_KEY:
    raise ValueError("SECRET_KEY not found in .env file. Make sure it's defined (e.g., SECRET_KEY=your-key).")

DEBUG = os.environ.get('DEBUG', '0') == '1'


def _env_list(name: str, default: str) -> list[str]:
    return [item.strip() for item in os.environ.get(name, default).split(',') if item.strip()]


ALLOWED_HOSTS = _env_list('ALLOWED_HOSTS', 'localhost,127.0.0.1')
CORS_ALLOWED_ORIGINS = _env_list('CORS_ALLOWED_ORIGINS', 'http://localhost:3000')

# Same Wi‑Fi mobile testing (DEBUG only): accept LAN hosts and frontend origins
if DEBUG and os.environ.get('DJANGO_DEV_ALLOW_LAN', '1') == '1':
    ALLOWED_HOSTS = ['*']
    CORS_ALLOWED_ORIGIN_REGEXES = [
        r'^http://localhost:\d+$',
        r'^http://127\.0\.0\.1:\d+$',
        r'^http://192\.168\.\d{1,3}\.\d{1,3}:\d+$',
        r'^http://10\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$',
    ]

# ========== DATABASE ==========
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# ========== APPLICATION ==========
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'drf_yasg',
    'django_filters',

    # Local apps
    'accounts',
    'complaints',
    'analytics',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

# ========== PASSWORD VALIDATION ==========
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ========== INTERNATIONALIZATION ==========
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kathmandu'
USE_I18N = True
USE_TZ = True

# ========== STATIC & MEDIA ==========
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
STATICFILES_DIRS = [
    BASE_DIR / "static",
]

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ========== REST FRAMEWORK ==========
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',   # Allow public complaint submission
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_THROTTLE_RATES': {
        'anon': '10/minute',
    },
}