"""Daily rating limits evaluated in Asia/Kathmandu local calendar days."""

from datetime import datetime, time, timedelta, timezone as dt_timezone
from zoneinfo import ZoneInfo

from django.utils import timezone

from .models import Rating

KATHMANDU_TZ = ZoneInfo("Asia/Kathmandu")


def kathmandu_today():
    return timezone.now().astimezone(KATHMANDU_TZ).date()


def kathmandu_day_utc_range(for_date=None):
    """UTC [start, end) bounds for one Kathmandu calendar day."""
    if for_date is None:
        for_date = kathmandu_today()
    start = datetime.combine(for_date, time.min, tzinfo=KATHMANDU_TZ)
    end = start + timedelta(days=1)
    return start.astimezone(dt_timezone.utc), end.astimezone(dt_timezone.utc)


def hospital_rating_exists_today() -> bool:
    start, end = kathmandu_day_utc_range()
    return Rating.objects.filter(
        is_hospital_rating=True,
        created_at__gte=start,
        created_at__lt=end,
    ).exists()


def department_rating_exists_today(department: str) -> bool:
    start, end = kathmandu_day_utc_range()
    return Rating.objects.filter(
        is_hospital_rating=False,
        department=department,
        created_at__gte=start,
        created_at__lt=end,
    ).exists()
