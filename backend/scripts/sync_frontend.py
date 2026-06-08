"""CLI wrapper for core.frontend_sync.sync_frontend."""
from __future__ import annotations

import os
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

from core.frontend_sync import sync_frontend  # noqa: E402


def main(argv: list[str] | None = None) -> int:
    args = argv if argv is not None else sys.argv[1:]
    try:
        sync_frontend(collectstatic='--collectstatic' in args)
    except SystemExit as exc:
        return int(exc.code) if exc.code is not None else 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
