import os
import django
import sys
from django.test.client import Client

# Setup django environment
sys.path.append(r"c:\Users\aavas\rlg-complaint-system")
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from complaints.models import Rating, Complaint

def run_tests():
    client = Client(SERVER_NAME='localhost')

    # Clear db for testing
    Rating.objects.all().delete()
    Complaint.objects.all().delete()

    print("Testing Normal Complaint (Simulation from updated frontend)...")
    normal_complaint_data = {
        'rating': '5', # default state rating
        'category': 'OTHER', # The new fallback we added in page.tsx
        'department': 'IPD',
        'description': 'Nurse did not attend promptly',
        'is_anonymous': 'false',
        'complainant_name': '',
        'complainant_phone': '',
        'language': 'en'
    }
    response = client.post('/api/complaints/', normal_complaint_data)
    print(f"Normal Complaint Status: {response.status_code}")
    print(f"Normal Complaint Response: {response.json()}")
    
    # Assert
    assert Rating.objects.count() == 0
    assert Complaint.objects.count() == 1
    complaint = Complaint.objects.first()
    assert complaint.category == 'OTHER'
    assert complaint.department == 'IPD'
    assert complaint.description == 'Nurse did not attend promptly'
    assert complaint.ticket_id.startswith('RLG-')

    print("\nAll tests passed successfully!")

if __name__ == '__main__':
    run_tests()
