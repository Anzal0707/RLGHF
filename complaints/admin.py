from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from .models import (
    Complaint,
    Rating,
    DepartmentComplaint,
    IndividualComplaint,
    DepartmentRating,
    HospitalRating,
)


# ─────────────────────────────────────────────────────────────────────────────
# Shared display helpers (mixed into both complaint admins via a mixin)
# ─────────────────────────────────────────────────────────────────────────────

class ComplaintDisplayMixin:
    """Reusable display methods for both complaint admin classes."""

    @admin.display(description='Priority', ordering='priority')
    def priority_badge(self, obj):
        colors = {
            'LOW': '#64748b',
            'MEDIUM': '#0d9488',
            'HIGH': '#ea580c',
            'EMERGENCY': '#dc2626',
        }
        color = colors.get(obj.priority, '#64748b')
        return format_html(
            '<span style="background:{};color:white;padding:2px 8px;'
            'border-radius:4px;font-weight:600;">{}</span>',
            color,
            obj.get_priority_display(),
        )

    @admin.display(description='Status', ordering='status')
    def status_badge(self, obj):
        colors = {
            'NEW': '#2563eb',
            'REVIEW': '#7c3aed',
            'ASSIGNED': '#0d9488',
            'ACTION': '#ca8a04',
            'CLOSED': '#64748b',
            'ESCALATED': '#dc2626',
        }
        color = colors.get(obj.status, '#64748b')
        return format_html(
            '<span style="background:{};color:white;padding:2px 8px;'
            'border-radius:4px;font-weight:600;">{}</span>',
            color,
            obj.get_status_display(),
        )

    @admin.display(description='Complainant')
    def complainant_summary(self, obj):
        if obj.is_anonymous:
            return 'Anonymous'
        parts = [p for p in [obj.complainant_name, obj.complainant_phone] if p]
        return ' / '.join(parts) if parts else '—'

    @admin.display(description='Files', boolean=True)
    def has_attachments(self, obj):
        return bool(obj.voice_file or obj.attachment)

    @admin.display(description='Voice playback')
    def voice_file_link(self, obj):
        if not obj.voice_file:
            return '—'
        return format_html(
            '<audio controls src="{}" style="max-width:320px;"></audio>'
            '<br><a href="{}" target="_blank">Download voice file</a>',
            obj.voice_file.url,
            obj.voice_file.url,
        )

    @admin.display(description='Attachment preview')
    def attachment_link(self, obj):
        if not obj.attachment:
            return '—'
        url = obj.attachment.url
        name = obj.attachment.name.split('/')[-1]
        if name.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
            return format_html(
                '<a href="{}" target="_blank">'
                '<img src="{}" style="max-height:120px;border-radius:8px;" />'
                '</a><br><a href="{}" target="_blank">{}</a>',
                url, url, url, name,
            )
        return format_html('<a href="{}" target="_blank">{}</a>', url, name)


# ─────────────────────────────────────────────────────────────────────────────
# Department Complaints  (is_individual_complaint = False)
# ─────────────────────────────────────────────────────────────────────────────

@admin.register(DepartmentComplaint)
class DepartmentComplaintAdmin(ComplaintDisplayMixin, admin.ModelAdmin):
    list_display = [
        'ticket_id',
        'department',
        'priority_badge',
        'status_badge',
        'is_anonymous',
        'language',
        'complainant_summary',
        'has_attachments',
        'created_at',
    ]
    list_filter = [
        'status',
        'priority',
        'department',
        'is_anonymous',
        'language',
        ('created_at', admin.DateFieldListFilter),
    ]
    search_fields = [
        'ticket_id',
        'complainant_name',
        'complainant_phone',
        'patient_id',
        'description',
    ]
    readonly_fields = [
        'ticket_id',
        'priority',
        'created_at',
        'updated_at',
        'voice_file_link',
        'attachment_link',
    ]
    list_per_page = 25
    date_hierarchy = 'created_at'
    ordering = ['-created_at']

    fieldsets = (
        ('Ticket', {
            'fields': ('ticket_id', 'status', 'priority', 'created_at', 'updated_at'),
        }),
        ('Feedback', {
            'fields': (
                'department',
                'language',
                'description',
                'voice_file',
                'voice_file_link',
                'attachment',
                'attachment_link',
            ),
        }),
        ('Complainant', {
            'fields': (
                'is_anonymous',
                'complainant_name',
                'complainant_phone',
                'patient_id',
            ),
        }),
    )

    def get_queryset(self, request):
        """Show only department complaints (not individual staff complaints)."""
        return super().get_queryset(request).filter(is_individual_complaint=False)

    def save_model(self, request, obj, form, change):
        """Ensure newly created records from this admin are always department complaints."""
        obj.is_individual_complaint = False
        super().save_model(request, obj, form, change)

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context['title'] = 'Department Complaints'
        extra_context['last_refreshed'] = timezone.localtime().strftime('%Y-%m-%d %H:%M:%S')
        return super().changelist_view(request, extra_context=extra_context)


# ─────────────────────────────────────────────────────────────────────────────
# Individual Complaints  (is_individual_complaint = True)
# ─────────────────────────────────────────────────────────────────────────────

@admin.register(IndividualComplaint)
class IndividualComplaintAdmin(ComplaintDisplayMixin, admin.ModelAdmin):
    list_display = [
        'ticket_id',
        'department',
        'ind_name',
        'ind_role',
        'ind_department',
        'priority_badge',
        'status_badge',
        'is_anonymous',
        'language',
        'complainant_summary',
        'has_attachments',
        'created_at',
    ]
    list_filter = [
        'status',
        'priority',
        'department',
        'ind_department',
        'is_anonymous',
        'language',
        ('created_at', admin.DateFieldListFilter),
    ]
    search_fields = [
        'ticket_id',
        'complainant_name',
        'complainant_phone',
        'patient_id',
        'description',
        'ind_name',
        'ind_role',
        'ind_appearance',
    ]
    readonly_fields = [
        'ticket_id',
        'priority',
        'created_at',
        'updated_at',
        'voice_file_link',
        'attachment_link',
    ]
    list_per_page = 25
    date_hierarchy = 'created_at'
    ordering = ['-created_at']

    fieldsets = (
        ('Ticket', {
            'fields': ('ticket_id', 'status', 'priority', 'created_at', 'updated_at'),
        }),
        ('Complaint about Staff Member', {
            'fields': (
                'ind_name',
                'ind_role',
                'ind_department',
                'ind_appearance',
            ),
        }),
        ('Details', {
            'fields': (
                'department',
                'language',
                'description',
                'voice_file',
                'voice_file_link',
                'attachment',
                'attachment_link',
            ),
        }),
        ('Complainant', {
            'fields': (
                'is_anonymous',
                'complainant_name',
                'complainant_phone',
                'patient_id',
            ),
        }),
    )

    def get_queryset(self, request):
        """Show only individual staff complaints."""
        return super().get_queryset(request).filter(is_individual_complaint=True)

    def save_model(self, request, obj, form, change):
        """Ensure newly created records from this admin are always individual complaints."""
        obj.is_individual_complaint = True
        super().save_model(request, obj, form, change)

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context['title'] = 'Individual (Staff) Complaints'
        extra_context['last_refreshed'] = timezone.localtime().strftime('%Y-%m-%d %H:%M:%S')
        return super().changelist_view(request, extra_context=extra_context)


# ─────────────────────────────────────────────────────────────────────────────
# Rating
# ─────────────────────────────────────────────────────────────────────────────

@admin.register(DepartmentRating)
class DepartmentRatingAdmin(admin.ModelAdmin):
    """Department-specific ratings (includes all existing ratings)."""
    list_display = ['id', 'department', 'rating', 'language', 'created_at']
    list_filter = ['department', 'rating', 'language', 'created_at']
    search_fields = ['feedback']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']

    def get_queryset(self, request):
        return super().get_queryset(request).filter(is_hospital_rating=False)

    def save_model(self, request, obj, form, change):
        obj.is_hospital_rating = False
        super().save_model(request, obj, form, change)

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context['title'] = 'Department Ratings'
        return super().changelist_view(request, extra_context=extra_context)


@admin.register(HospitalRating)
class HospitalRatingAdmin(admin.ModelAdmin):
    """Overall hospital-wide ratings collected from the entry rating modal."""
    list_display = ['id', 'rating', 'language', 'feedback', 'created_at']
    list_filter = ['rating', 'language', 'created_at']
    search_fields = ['feedback']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']

    def get_queryset(self, request):
        return super().get_queryset(request).filter(is_hospital_rating=True)

    def save_model(self, request, obj, form, change):
        obj.is_hospital_rating = True
        super().save_model(request, obj, form, change)

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context['title'] = 'Hospital Ratings'
        return super().changelist_view(request, extra_context=extra_context)
