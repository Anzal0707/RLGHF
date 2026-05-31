from rest_framework import serializers
from .models import Complaint, Rating


class RatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = [
            'id',
            'department',
            'rating',
            'feedback',
            'language',
            'is_hospital_rating',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError('Rating must be between 1 and 5.')
        return value


class RatingAdminSerializer(serializers.ModelSerializer):
    """Serializer for admin operations with full access"""
    class Meta:
        model = Rating
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class ComplaintSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = [
            'id',
            'ticket_id',
            'department',
            'description',
            'is_anonymous',
            'language',
            'is_individual_complaint',
            'ind_name',
            'ind_appearance',
            'ind_department',
            'ind_role',
            'complainant_name',
            'complainant_phone',
            'patient_id',
            'voice_file',
            'attachment',
            'status',
            'priority',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'ticket_id', 'status', 'priority', 'created_at', 'updated_at']


class ComplaintAdminSerializer(serializers.ModelSerializer):
    """Serializer for admin operations with full access"""
    class Meta:
        model = Complaint
        fields = '__all__'
        read_only_fields = ['id', 'ticket_id', 'created_at', 'updated_at']

    def validate(self, data):
        description = (data.get('description') or '').strip()
        voice_file = data.get('voice_file')
        if voice_file is None and hasattr(self, 'initial_data'):
            voice_file = self.initial_data.get('voice_file')

        if not description and not voice_file:
            raise serializers.ValidationError(
                'Please provide a written description or upload a voice recording.'
            )

        is_anonymous = data.get('is_anonymous', True)
        if not is_anonymous:
            name = (data.get('complainant_name') or '').strip()
            phone = (data.get('complainant_phone') or '').strip()
            if not name and not phone:
                raise serializers.ValidationError(
                    'For non-anonymous complaints, please provide a name or phone number.'
                )
            data['complainant_name'] = name or None
            data['complainant_phone'] = phone or None
        else:
            data['complainant_name'] = None
            data['complainant_phone'] = None

        data['description'] = description or None
        return data
