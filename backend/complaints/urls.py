from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ComplaintCreateView, RatingAdminViewSet, ComplaintAdminViewSet

router = DefaultRouter()
router.register(r'admin/ratings', RatingAdminViewSet, basename='admin-rating')
router.register(r'admin/complaints', ComplaintAdminViewSet, basename='admin-complaint')

urlpatterns = [
    # POST /api/complaints/ to submit a complaint
    path('', ComplaintCreateView.as_view(), name='complaint_create'),
    # Admin API endpoints
    path('', include(router.urls)),
]
