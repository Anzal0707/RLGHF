from django.contrib import admin
from django.urls import path, include, re_path
from django.http import HttpResponse
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve

def home(request):
    return HttpResponse("<h1>RLG Complaint System API</h1><p>Server is running. API endpoints are active under <code>/api/</code>.</p>")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.api_urls')),
    path('', home),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
else:
    # static() is a no-op when DEBUG is False; serve admin assets for local runserver.
    urlpatterns += [
        re_path(
            r'^static/(?P<path>.*)$',
            serve,
            {'document_root': settings.STATIC_ROOT},
        ),
        re_path(
            r'^media/(?P<path>.*)$',
            serve,
            {'document_root': settings.MEDIA_ROOT},
        ),
    ]
