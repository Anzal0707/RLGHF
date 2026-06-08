"""Serve the Next.js static export from static/frontend/."""
from __future__ import annotations

import mimetypes
from pathlib import Path

from django.conf import settings
from django.http import FileResponse, Http404

FRONTEND_ROOT = Path(settings.BASE_DIR) / 'static' / 'frontend'
SHARED_STATIC_ROOT = Path(settings.BASE_DIR) / 'static'


def _safe_path(base: Path, relative: str) -> Path:
    candidate = (base / relative).resolve()
    base_resolved = base.resolve()
    if not str(candidate).startswith(str(base_resolved)):
        raise Http404()
    return candidate


def _resolve_html(slug: str) -> Path:
    slug = (slug or '').strip('/')
    if not slug:
        candidates = [FRONTEND_ROOT / 'index.html']
    else:
        candidates = [
            FRONTEND_ROOT / slug / 'index.html',
            FRONTEND_ROOT / f'{slug}.html',
        ]

    for path in candidates:
        if path.is_file():
            return path
    raise Http404()


def _file_response(path: Path, default_type: str = 'application/octet-stream') -> FileResponse:
    content_type, _ = mimetypes.guess_type(str(path))
    response = FileResponse(path.open('rb'), content_type=content_type or default_type)
    if settings.DEBUG:
        response['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        response['Pragma'] = 'no-cache'
    return response


def serve_frontend_page(request, slug: str = '') -> FileResponse:
    return _file_response(_resolve_html(slug), 'text/html; charset=utf-8')


def serve_frontend_next_asset(request, path: str) -> FileResponse:
    asset = _safe_path(FRONTEND_ROOT / '_next', path)
    if not asset.is_file():
        raise Http404()
    return _file_response(asset)


def serve_frontend_public_asset(request, path: str) -> FileResponse:
    asset = _safe_path(FRONTEND_ROOT, path)
    if not asset.is_file():
        asset = _safe_path(SHARED_STATIC_ROOT, path)
        if not asset.is_file():
            raise Http404()
    return _file_response(asset)
