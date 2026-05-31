from django.urls import path, include
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint to verify API status.
    """
    return Response({
        "status": "healthy",
        "service": "RLG Eye Hospital Complaint System API",
        "version": "1.0.0"
    })

urlpatterns = [
    path('health/', health_check, name='api_health_check'),
    path('auth/', include('accounts.urls')),
    path('complaints/', include('complaints.urls')),
    path('analytics/', include('analytics.urls')),
]
