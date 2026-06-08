from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Complaint


class HealthCheckTests(APITestCase):
    def test_health_check_endpoint(self):
        url = reverse('api_health_check')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'healthy')
        self.assertIn('service', response.data)
        self.assertIn('version', response.data)


class ComplaintSubmissionTests(APITestCase):
    def test_anonymous_complaint_submission(self):
        url = reverse('complaint_create')
        data = {
            'rating': 4,
            'category': 'STAFF',
            'department': 'OPD',
            'description': 'Staff was polite, but waiting room was slightly crowded.',
            'is_anonymous': True,
            'language': 'ne',
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('ticket_id', response.data)
        self.assertEqual(response.data['status'], 'NEW')
        self.assertEqual(response.data['priority'], 'LOW')
        self.assertEqual(response.data['language'], 'ne')

        complaint = Complaint.objects.get(ticket_id=response.data['ticket_id'])
        self.assertEqual(complaint.category, 'STAFF')
        self.assertEqual(complaint.department, 'OPD')
        self.assertTrue(complaint.is_anonymous)

    def test_complaint_requires_description_or_voice(self):
        url = reverse('complaint_create')
        data = {
            'rating': 4,
            'category': 'STAFF',
            'department': 'OPD',
            'description': '',
            'is_anonymous': True,
            'language': 'en',
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_department_rejected(self):
        url = reverse('complaint_create')
        data = {
            'rating': 4,
            'category': 'STAFF',
            'department': 'InvalidDept',
            'description': 'Test complaint',
            'is_anonymous': True,
            'language': 'en',
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_non_anonymous_complaint_missing_details(self):
        url = reverse('complaint_create')
        data = {
            'rating': 3,
            'category': 'BILLING',
            'department': 'Billing',
            'description': 'Double charge issue',
            'is_anonymous': False,
            'language': 'hi',
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_non_anonymous_complaint_with_details(self):
        url = reverse('complaint_create')
        data = {
            'rating': 2,
            'category': 'BILLING',
            'department': 'Billing',
            'description': 'Overcharged for registration.',
            'is_anonymous': False,
            'complainant_name': 'Ram Bahadur',
            'complainant_phone': '9841234567',
            'language': 'ne',
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['priority'], 'HIGH')
