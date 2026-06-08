from django.contrib.auth.models import Group, Permission, User
from rest_framework import serializers


def build_auth_user_payload(user):
    """Serialize user + Django groups/permissions for the React admin dashboard."""
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email or '',
        'first_name': user.first_name or '',
        'last_name': user.last_name or '',
        'is_active': user.is_active,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
        'date_joined': user.date_joined.isoformat() if user.date_joined else None,
        'last_login': user.last_login.isoformat() if user.last_login else None,
        'groups': list(user.groups.values('id', 'name')),
        'permissions': ['*'] if user.is_superuser else sorted(user.get_all_permissions()),
    }


class ProfileSelfUpdateSerializer(serializers.ModelSerializer):
    """Staff self-service profile fields (matches Django admin user identity fields)."""

    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password']

    def validate_username(self, value):
        value = (value or '').strip()
        if not value:
            raise serializers.ValidationError('Username is required.')
        if (
            User.objects.filter(username__iexact=value)
            .exclude(pk=self.instance.pk)
            .exists()
        ):
            raise serializers.ValidationError('A user with that username already exists.')
        return value

    def validate_password(self, value):
        if value and len(value) < 8:
            raise serializers.ValidationError('Password must be at least 8 characters.')
        return value

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class AdminPermissionSerializer(serializers.ModelSerializer):
    app_label = serializers.CharField(source='content_type.app_label', read_only=True)

    class Meta:
        model = Permission
        fields = ['id', 'codename', 'name', 'app_label']


class AdminGroupSerializer(serializers.ModelSerializer):
    permissions = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Permission.objects.all(),
        required=False,
    )
    permission_labels = serializers.SerializerMethodField(read_only=True)
    user_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Group
        fields = ['id', 'name', 'permissions', 'permission_labels', 'user_count']

    def get_permission_labels(self, obj):
        return sorted(f"{p.content_type.app_label}.{p.codename}" for p in obj.permissions.all())

    def get_user_count(self, obj):
        return obj.user_set.count()


class AdminUserSerializer(serializers.ModelSerializer):
    user_permissions = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Permission.objects.all(),
        required=False,
    )
    permission_labels = serializers.SerializerMethodField(read_only=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'is_active',
            'is_staff',
            'is_superuser',
            'user_permissions',
            'permission_labels',
            'password',
            'date_joined',
            'last_login',
        ]
        read_only_fields = ['date_joined', 'last_login']

    def get_permission_labels(self, obj):
        perms = obj.user_permissions.select_related('content_type')
        return sorted(f"{p.content_type.app_label}.{p.codename}" for p in perms)

    def validate(self, attrs):
        request = self.context.get('request')
        actor = getattr(request, 'user', None)
        if attrs.get('is_superuser') and actor and not actor.is_superuser:
            raise serializers.ValidationError(
                {'is_superuser': 'Only superusers can grant superuser status.'},
            )
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user_permissions = validated_data.pop('user_permissions', [])
        if not password:
            raise serializers.ValidationError({'password': 'Password is required when creating a user.'})
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        if user_permissions:
            user.user_permissions.set(user_permissions)
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user_permissions = validated_data.pop('user_permissions', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        if user_permissions is not None:
            instance.user_permissions.set(user_permissions)
        return instance
