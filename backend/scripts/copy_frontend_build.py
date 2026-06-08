"""Copy Next.js static export (frontend/out) into Django static/frontend."""
from __future__ import annotations

import shutil
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SOURCE = BASE_DIR / 'frontend' / 'out'
DEST = BASE_DIR / 'static' / 'frontend'
STALE_STATICFILES_FRONTEND = BASE_DIR / 'staticfiles' / 'frontend'
SHARED_ASSETS = ('hd-logo.png', 'tilganga.png', 'favicon.ico')


def main() -> int:
    if not SOURCE.is_dir():
        print(f'Frontend build output not found: {SOURCE}', file=sys.stderr)
        print('Run: python manage.py sync_frontend', file=sys.stderr)
        return 1

    if DEST.exists():
        shutil.rmtree(DEST)

    shutil.copytree(SOURCE, DEST)

    for name in SHARED_ASSETS:
        src = BASE_DIR / 'static' / name
        if src.is_file():
            shutil.copy2(src, DEST / name)

    if STALE_STATICFILES_FRONTEND.exists():
        shutil.rmtree(STALE_STATICFILES_FRONTEND)
        print(f'Removed stale collectstatic copy: {STALE_STATICFILES_FRONTEND}')

    print(f'Copied frontend build to {DEST}', flush=True)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
