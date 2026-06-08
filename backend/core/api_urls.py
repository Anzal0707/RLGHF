from django.db import connection
from django.urls import path, include
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Liveness probe for Railway; reports DB status without failing the deploy."""
    db_status = 'connected'
    db_detail = None
    try:
        connection.ensure_connection()
    except Exception as exc:
        db_status = 'disconnected'
        db_detail = str(exc)

    payload = {
        'status': 'healthy' if db_status == 'connected' else 'degraded',
        'service': 'RLG Eye Hospital Complaint System API',
        'version': '1.0.0',
        'database': db_status,
    }
    if db_detail:
        payload['detail'] = db_detail

    return Response(payload)


urlpatterns = [
    path('health/', health_check, name='api_health_check'),
    path('auth/', include('accounts.urls')),
    path('complaints/', include('complaints.urls')),
    path('analytics/', include('analytics.urls')),
]
