from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Avg
from django.utils import timezone
from datetime import timedelta

from complaints.models import Complaint, Rating


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    Returns aggregated stats for the admin dashboard.
    GET /api/analytics/stats/
    """
    total_complaints = Complaint.objects.count()
    total_ratings = Rating.objects.count()
    avg_rating = Rating.objects.aggregate(avg=Avg("rating"))["avg"] or 0

    by_status = {
        item["status"]: item["count"]
        for item in Complaint.objects.values("status").annotate(count=Count("id"))
    }
    by_priority = {
        item["priority"]: item["count"]
        for item in Complaint.objects.values("priority").annotate(count=Count("id"))
    }
    by_department = {
        item["department"]: item["count"]
        for item in Complaint.objects.values("department").annotate(count=Count("id"))
        if item["department"]
    }
    rating_distribution = {
        str(item["rating"]): item["count"]
        for item in Rating.objects.values("rating").annotate(count=Count("id"))
    }

    # Last 7 days trend (complaints per day)
    now = timezone.now()
    trend_7d = []
    for i in range(6, -1, -1):
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day.replace(hour=23, minute=59, second=59, microsecond=999999)
        count = Complaint.objects.filter(created_at__range=(day_start, day_end)).count()
        trend_7d.append({"date": day.strftime("%m/%d"), "count": count})

    return Response(
        {
            "total_complaints": total_complaints,
            "total_ratings": total_ratings,
            "avg_rating": round(float(avg_rating), 1),
            "by_status": by_status,
            "by_priority": by_priority,
            "by_department": by_department,
            "rating_distribution": rating_distribution,
            "trend_7d": trend_7d,
            "individual_count": Complaint.objects.filter(
                is_individual_complaint=True
            ).count(),
            "department_count": Complaint.objects.filter(
                is_individual_complaint=False
            ).count(),
        }
    )
