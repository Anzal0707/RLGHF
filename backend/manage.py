#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
from pathlib import Path


def _reexec_with_project_venv() -> None:
    """Use backend/venv when present so dependencies (e.g. django-unfold) resolve."""
    base_dir = Path(__file__).resolve().parent
    if os.name == 'nt':
        venv_python = base_dir / 'venv' / 'Scripts' / 'python.exe'
    else:
        venv_python = base_dir / 'venv' / 'bin' / 'python'

    if not venv_python.is_file():
        return

    try:
        if Path(sys.executable).resolve() == venv_python.resolve():
            return
    except OSError:
        return

    os.execv(str(venv_python), [str(venv_python), *sys.argv])


_reexec_with_project_venv()


def main():
    """Run administrative tasks."""
    if 'DJANGO_SETTINGS_MODULE' not in os.environ and os.environ.get('RAILWAY_ENVIRONMENT'):
        os.environ['DJANGO_SETTINGS_MODULE'] = 'core.settings.production'
    else:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Activate the backend venv and install deps:\n"
            "  python -m venv venv\n"
            "  venv\\Scripts\\activate   (Windows)\n"
            "  pip install -r requirements.txt"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
