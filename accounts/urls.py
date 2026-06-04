from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .admin_viewsets import AdminGroupViewSet, AdminPermissionViewSet, AdminUserViewSet
from .views import admin_check_auth, admin_login, admin_me

router = DefaultRouter()
router.register(r'admin/users', AdminUserViewSet, basename='admin-user')
router.register(r'admin/groups', AdminGroupViewSet, basename='admin-group')
router.register(r'admin/permissions', AdminPermissionViewSet, basename='admin-permission')

urlpatterns = [
    path('admin/login/', admin_login, name='admin_login'),
    path('admin/check-auth/', admin_check_auth, name='admin_check_auth'),
    path('admin/me/', admin_me, name='admin_me'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(router.urls)),
]
