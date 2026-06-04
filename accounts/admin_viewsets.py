from django.contrib.auth.models import Group, Permission, User
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated

from .permissions import IsStaffUser, StaffDjangoModelPermissions
from .serializers import AdminGroupSerializer, AdminPermissionSerializer, AdminUserSerializer


class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.prefetch_related('user_permissions__content_type').order_by('username')
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated, IsStaffUser, StaffDjangoModelPermissions]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_staff', 'is_active', 'is_superuser']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['username', 'date_joined', 'last_login']
    ordering = ['username']


class AdminGroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all().order_by('name')
    serializer_class = AdminGroupSerializer
    permission_classes = [IsAuthenticated, IsStaffUser, StaffDjangoModelPermissions]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name']
    ordering = ['name']


class AdminPermissionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Permission.objects.select_related('content_type').order_by(
        'content_type__app_label',
        'codename',
    )
    serializer_class = AdminPermissionSerializer
    permission_classes = [IsAuthenticated, IsStaffUser, StaffDjangoModelPermissions]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'codename', 'content_type__app_label']
    ordering = ['content_type__app_label', 'codename']
