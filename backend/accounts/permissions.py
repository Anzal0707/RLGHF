from rest_framework.permissions import BasePermission, DjangoModelPermissions, IsAuthenticated


class IsStaffUser(BasePermission):
    """Staff-only access for admin dashboard APIs."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )


class StaffDjangoModelPermissions(DjangoModelPermissions):
    """
    Map HTTP methods to Django's built-in model permissions (view/add/change/delete).
    Requires authentication + is_staff.
    """

    perms_map = {
        'GET': ['%(app_label)s.view_%(model_name)s'],
        'OPTIONS': [],
        'HEAD': ['%(app_label)s.view_%(model_name)s'],
        'POST': ['%(app_label)s.add_%(model_name)s'],
        'PUT': ['%(app_label)s.change_%(model_name)s'],
        'PATCH': ['%(app_label)s.change_%(model_name)s'],
        'DELETE': ['%(app_label)s.delete_%(model_name)s'],
    }

    def has_permission(self, request, view):
        if not (
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        ):
            return False
        return super().has_permission(request, view)
