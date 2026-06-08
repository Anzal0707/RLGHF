from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import ProfileSelfUpdateSerializer, build_auth_user_payload


@api_view(['POST'])
@permission_classes([AllowAny])
def admin_login(request):
    """
    Admin login endpoint
    """
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {'error': 'Username and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(username=username, password=password)

    if user is not None and user.is_staff:
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': build_auth_user_payload(user),
        })
    else:
        return Response(
            {'error': 'Invalid credentials or insufficient permissions'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def admin_check_auth(request):
    """
    Check if user is authenticated and has admin privileges
    """
    if request.user.is_authenticated and request.user.is_staff:
        return Response({
            'authenticated': True,
            'user': build_auth_user_payload(request.user),
        })
    else:
        return Response(
            {'authenticated': False},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def admin_me(request):
    """Current user profile with Django groups and permissions."""
    if not request.user.is_staff:
        return Response(
            {'detail': 'Staff access required.'},
            status=status.HTTP_403_FORBIDDEN,
        )
    user = request.user
    if request.method == 'GET':
        return Response({'user': build_auth_user_payload(user)})
    serializer = ProfileSelfUpdateSerializer(
        user,
        data=request.data,
        partial=True,
        context={'request': request},
    )
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    serializer.save()
    user.refresh_from_db()
    return Response({'user': build_auth_user_payload(user)})
