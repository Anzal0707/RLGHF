from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.conf.urls.static import static

from core.views.frontend import (
    serve_frontend_next_asset,
    serve_frontend_page,
    serve_frontend_public_asset,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.api_urls')),
    re_path(
        r'^_next/(?P<path>.*)$',
        serve_frontend_next_asset,
    ),
    re_path(
        r'^(?P<path>[\w.-]+\.(?:png|jpe?g|gif|webp|ico|svg))$',
        serve_frontend_public_asset,
    ),
    path('admin-dashboard/', serve_frontend_page, {'slug': 'admin-dashboard'}),
    path('', serve_frontend_page, {'slug': ''}),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
