"""Build Next.js export and copy it into Django static/frontend/."""
from __future__ import annotations

import os
import shutil
import subprocess
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / 'frontend'
COPY_SCRIPT = BASE_DIR / 'scripts' / 'copy_frontend_build.py'
STALE_STATICFILES_FRONTEND = BASE_DIR / 'staticfiles' / 'frontend'


def _run(command: list[str], *, cwd: Path, env: dict[str, str] | None = None) -> None:
    printable = ' '.join(command)
    print(f'+ {printable}  (cwd={cwd})', flush=True)
    result = subprocess.run(command, cwd=cwd, env=env, check=False)
    if result.returncode != 0:
        raise SystemExit(result.returncode)


def _npm_command() -> str:
    return 'npm.cmd' if sys.platform == 'win32' else 'npm'


def sync_frontend(*, collectstatic: bool = False) -> None:
    """Run npm build, copy export to static/frontend, and drop stale collectstatic output."""
    env = os.environ.copy()
    env.setdefault('NEXT_PUBLIC_API_URL', '/api')

    _run([_npm_command(), 'run', 'build'], cwd=FRONTEND_DIR, env=env)
    _run([sys.executable, str(COPY_SCRIPT)], cwd=BASE_DIR)

    if STALE_STATICFILES_FRONTEND.exists():
        shutil.rmtree(STALE_STATICFILES_FRONTEND)
        print(f'Removed stale collectstatic copy: {STALE_STATICFILES_FRONTEND}')

    if collectstatic:
        _run(
            [sys.executable, 'manage.py', 'collectstatic', '--noinput'],
            cwd=BASE_DIR,
        )

    print('Frontend sync complete. Restart Django runserver if it is already running.', flush=True)
