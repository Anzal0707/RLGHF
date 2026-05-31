from django.urls import path
from .views import admin_login, admin_check_auth

urlpatterns = [
    # Admin authentication endpoints
    path('admin/login/', admin_login, name='admin_login'),
    path('admin/check-auth/', admin_check_auth, name='admin_check_auth'),
]
