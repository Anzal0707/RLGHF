from rest_framework import generics, status, viewsets, filters
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Complaint, Rating
from .serializers import ComplaintSerializer, RatingSerializer, ComplaintAdminSerializer, RatingAdminSerializer


class ComplaintCreateView(generics.CreateAPIView):
    
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request, *args, **kwargs):
        data = request.data.copy()

        is_rating_only = data.get('is_rating_only') == 'true'

        if is_rating_only:
            from .rating_limits import (
                department_rating_exists_today,
                hospital_rating_exists_today,
            )

            is_hospital = data.get('is_hospital_rating') == 'true'
            department = data.get('department')

            if is_hospital and hospital_rating_exists_today():
                return Response(
                    {
                        'detail': (
                            'You have already rated the hospital today. '
                            'You may submit again tomorrow.'
                        ),
                        'code': 'daily_hospital_rating_limit',
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if (
                not is_hospital
                and department
                and department_rating_exists_today(department)
            ):
                return Response(
                    {
                        'detail': (
                            'You have already rated this department today. '
                            'You may submit again tomorrow.'
                        ),
                        'code': 'daily_department_rating_limit',
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Map description to feedback for rating, ignoring the default string
            description = data.get('description', '')
            feedback = description if description != 'Direct rating submission' else ''

            rating_data = {
                'rating': data.get('rating'),
                'department': data.get('department'),
                'language': data.get('language', 'ne'),
                'feedback': feedback,
                'is_hospital_rating': data.get('is_hospital_rating') == 'true',
            }

            serializer = RatingSerializer(data=rating_data)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'ticket_id': f"RATING-{serializer.instance.id}",
                    'type': 'rating'
                }, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            # This is a normal complaint submission
            serializer = ComplaintSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'ticket_id': serializer.instance.ticket_id,
                    'type': 'complaint'
                }, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RatingAdminViewSet(viewsets.ModelViewSet):
    """
    Admin API for Rating CRUD operations
    """
    queryset = Rating.objects.all()
    serializer_class = RatingAdminSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'rating', 'language', 'is_hospital_rating', 'created_at']
    search_fields = ['feedback', 'department']
    ordering_fields = ['created_at', 'rating', 'department']
    ordering = ['-created_at']


class ComplaintAdminViewSet(viewsets.ModelViewSet):
    """
    Admin API for Complaint CRUD operations
    """
    queryset = Complaint.objects.all()
    serializer_class = ComplaintAdminSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'status', 'priority', 'is_anonymous', 'is_individual_complaint', 'language', 'created_at']
    search_fields = ['ticket_id', 'description', 'complainant_name', 'complainant_phone']
    ordering_fields = ['created_at', 'ticket_id', 'status', 'priority']
    ordering = ['-created_at']