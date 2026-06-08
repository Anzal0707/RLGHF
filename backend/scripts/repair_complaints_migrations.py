"""One-time repair for duplicate complaints 0007 + merge 0008 migration graph.

Run from backend/: python scripts/repair_complaints_migrations.py
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
MIGRATIONS_DIR = BACKEND_DIR / "complaints" / "migrations"

KEEP_0007 = "0007_departmentrating_hospitalrating_and_more.py"
REMOVE_FILES = {"0007_rating_is_hospital_rating_proxies.py"}
REMOVE_DB_NAMES = {
    "0007_rating_is_hospital_rating_proxies",
    "0008_merge_20260607_0836",
}


def main() -> int:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
    sys.path.insert(0, str(BACKEND_DIR))

    import django
    from django.core.management import call_command
    from django.db.migrations.loader import MigrationLoader
    from django.db.migrations.recorder import MigrationRecorder
    from io import StringIO

    django.setup()

    removed_files: list[str] = []
    for name in REMOVE_FILES:
        path = MIGRATIONS_DIR / name
        if path.exists():
            path.unlink()
            removed_files.append(name)

    for path in MIGRATIONS_DIR.glob("0008_merge_*.py"):
        path.unlink()
        removed_files.append(path.name)

    recorder = MigrationRecorder.Migration
    deleted_db, _ = recorder.objects.filter(
        app="complaints",
        name__in=REMOVE_DB_NAMES,
    ).delete()

    loader = MigrationLoader(None, ignore_no_migrations=True)
    leaves = loader.graph.leaf_nodes("complaints")

    err = StringIO()
    check_ok = True
    try:
        call_command("makemigrations", "--check", stderr=err)
    except SystemExit as exc:
        check_ok = exc.code == 0

    migrate_ok = True
    migrate_err = StringIO()
    try:
        call_command("migrate", stderr=migrate_err)
    except SystemExit as exc:
        migrate_ok = exc.code == 0

    if not (MIGRATIONS_DIR / KEEP_0007).exists():
        print(f"ERROR: missing canonical migration {KEEP_0007}", file=sys.stderr)
        return 1

    if not check_ok or not migrate_ok:
        print("Repair incomplete.", file=sys.stderr)
        return 1

    print("Complaints migration graph repaired.")
    print(f"  Kept: {KEEP_0007}")
    if removed_files:
        print(f"  Removed files: {', '.join(removed_files)}")
    if deleted_db:
        print(f"  Removed django_migrations rows: {deleted_db}")
    print(f"  Graph leaf: {leaves}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
