import random
import string
from django.db import models
from django.utils import timezone


class Rating(models.Model):
    DEPARTMENT_CHOICES = [
        ('OPD', 'OPD (Outpatient Department)'),
        ('IPD', 'Ward / Inpatient Department'),
        ('Pharmacy', 'Pharmacy counter'),
        ('Optical', 'Optical Refraction'),
        ('Billing', 'Billing / Cash counter'),
        ('OT', 'Operation Theater (OT) area'),
        ('Canteen', 'Hospital Canteen'),
        ('Lab & Diagnostics', 'Laboratory & Diagnostics'),
        ('Reception', 'Reception / Help desk'),
        ('Other', 'Other location'),
    ]

    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('ne', 'Nepali'),
        ('hi', 'Hindi'),
    ]

    department = models.CharField(max_length=50, choices=DEPARTMENT_CHOICES)
    rating = models.IntegerField()
    feedback = models.TextField(blank=True, null=True)
    language = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, default='ne')
    # True  -> overall hospital-wide rating (from the entry rating modal)
    # False -> a department-specific rating (default; covers all existing rows)
    is_hospital_rating = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Rating'
        verbose_name_plural = 'Ratings'

    def __str__(self):
        scope = 'Hospital' if self.is_hospital_rating else self.department
        return f"Rating {self.rating}/5 - {scope} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"


class DepartmentRating(Rating):
    """Proxy model: ratings tied to a specific department (is_hospital_rating=False)."""

    class Meta:
        proxy = True
        verbose_name = 'Department Rating'
        verbose_name_plural = 'Department Ratings'


class HospitalRating(Rating):
    """Proxy model: overall hospital-wide ratings (is_hospital_rating=True)."""

    class Meta:
        proxy = True
        verbose_name = 'Hospital Rating'
        verbose_name_plural = 'Hospital Ratings'


class Complaint(models.Model):
    STATUS_CHOICES = [
        ('NEW', 'New'),
        ('REVIEW', 'Under Review'),
        ('ASSIGNED', 'Assigned'),
        ('ACTION', 'Action Taken'),
        ('CLOSED', 'Closed'),
        ('ESCALATED', 'Escalated'),
    ]

    PRIORITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('EMERGENCY', 'Emergency'),
    ]

    DEPARTMENT_CHOICES = [
        ('OPD', 'OPD (Outpatient Department)'),
        ('IPD', 'Ward / Inpatient Department'),
        ('Pharmacy', 'Pharmacy counter'),
        ('Optical', 'Optical Refraction'),
        ('Billing', 'Billing / Cash counter'),
        ('OT', 'Operation Theater (OT) area'),
        ('Canteen', 'Hospital Canteen'),
        ('Lab & Diagnostics', 'Laboratory & Diagnostics'),
        ('Reception', 'Reception / Help desk'),
        ('Other', 'Other location'),
    ]

    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('ne', 'Nepali'),
        ('hi', 'Hindi'),
    ]

    ticket_id = models.CharField(max_length=20, unique=True, editable=False)
    department = models.CharField(max_length=50, choices=DEPARTMENT_CHOICES)
    description = models.TextField(blank=True, null=True)
    is_anonymous = models.BooleanField(default=True)
    language = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, default='ne')

    # Individual Complaint specific fields
    is_individual_complaint = models.BooleanField(default=False)
    ind_name = models.CharField(max_length=100, blank=True, null=True)
    ind_appearance = models.TextField(blank=True, null=True)
    ind_department = models.CharField(max_length=50, choices=DEPARTMENT_CHOICES, blank=True, null=True)
    ind_role = models.CharField(max_length=100, blank=True, null=True)
    complainant_name = models.CharField(max_length=100, blank=True, null=True)
    complainant_phone = models.CharField(max_length=15, blank=True, null=True)
    patient_id = models.CharField(max_length=50, blank=True, null=True)

    voice_file = models.FileField(upload_to='complaints/voice/', blank=True, null=True)
    attachment = models.FileField(upload_to='complaints/attachments/', blank=True, null=True)

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='NEW')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='MEDIUM')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Complaint'
        verbose_name_plural = 'Complaints'

    def save(self, *args, **kwargs):
        if not self.ticket_id:
            self.ticket_id = self.generate_ticket_id()

        # Default priority to MEDIUM since category-based logic is removed
        if self.priority not in ['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']:
            self.priority = 'MEDIUM'

        super().save(*args, **kwargs)

    def generate_ticket_id(self):
        now = timezone.now()
        date_str = now.strftime('%y%m%d')
        random_suffix = ''.join(random.choices(string.digits, k=4))
        return f"RLG-{date_str}-{random_suffix}"

    @property
    def has_content(self):
        return bool(self.description and self.description.strip()) or bool(self.voice_file)

    def __str__(self):
        return f"{self.ticket_id} - {self.department} ({self.status})"


class DepartmentComplaint(Complaint):
    """Proxy model representing complaints about a department (not individual staff)."""

    class Meta:
        proxy = True
        verbose_name = 'Department Complaint'
        verbose_name_plural = 'Department Complaints'

    def get_queryset(self):
        return super().get_queryset().filter(is_individual_complaint=False)


class IndividualComplaint(Complaint):
    """Proxy model representing complaints against individual staff members."""

    class Meta:
        proxy = True
        verbose_name = 'Individual Complaint'
        verbose_name_plural = 'Individual Complaints'

    def get_queryset(self):
        return super().get_queryset().filter(is_individual_complaint=True)
