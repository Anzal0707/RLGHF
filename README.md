# RLG Complaint System

Production-ready **Django + Next.js** app deployed as a single Railway service (`backend/`).

## Project structure

```text
rlg-complaint-system/
├── backend/                 # Django API + Next.js source (Railway root)
│   ├── accounts/
│   ├── complaints/
│   ├── analytics/
│   ├── core/
│   │   ├── settings/        # base.py | local.py | production.py
│   │   ├── urls.py
│   │   └── api_urls.py
│   ├── frontend/            # Next.js App Router (built into static/frontend)
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── lib/api.ts
│   │   │   ├── page.tsx
│   │   │   └── admin-dashboard/
│   │   └── .env.example
│   ├── manage.py
│   └── .env.example
└── README.md
```

## Local development

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows (optional — manage.py auto-uses venv)
pip install -r requirements.txt
copy .env.example .env         # set SECRET_KEY
python manage.py migrate
python manage.py runserver
```

`manage.py` automatically re-runs with `backend/venv` when it exists, so `python manage.py runserver` works even without activating the venv first.

API: `http://127.0.0.1:8000/api/`

### Frontend

```bash
cd backend/frontend
npm install
copy .env.example .env.local
npm run dev
```

App: `http://localhost:3000`

### API routing (frontend)

| Environment                         | API base URL                                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------------------------------- |
| Development                         | `NEXT_PUBLIC_API_URL` if set, else `http://127.0.0.1:8000/api` (or LAN IP when testing on phone)  |
| Production (Railway single-service) | `/api` on the same host (set at build via `NEXT_PUBLIC_API_URL=/api`)                             |

All HTTP calls go through `backend/frontend/app/lib/api.ts` — no hardcoded URLs elsewhere.

## Production deployment (Railway — single service)

One Railway service serves **Django API + admin + Next.js frontend** from the same domain.

1. Create a Railway project with **root directory** `backend/`
2. Add a **PostgreSQL** plugin (Railway sets `DATABASE_URL` automatically)
3. Set these **runtime** variables in Railway → Service → Variables (all required):

```env
DJANGO_SETTINGS_MODULE=core.settings.production
SECRET_KEY=<strong-random-key>
DATABASE_URL=<auto from PostgreSQL plugin>
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_PASSWORD=<strong-password>
DEBUG=0
```

Deploy will **fail at runtime** if `SECRET_KEY` or `DATABASE_URL` is missing. Superuser credentials are optional — `init_admin` creates the admin user when `DJANGO_SUPERUSER_USERNAME` and `DJANGO_SUPERUSER_PASSWORD` are set, and skips safely if they are not.

Generate `SECRET_KEY`:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Deploy

Push to GitHub — Railway builds the Next.js app, copies it into Django static files, runs `collectstatic`, then on deploy runs `migrate`, `init_admin`, and **Gunicorn**.

| URL                 | Purpose                                   |
| ------------------- | ----------------------------------------- |
| `/`                 | Patient portal (React/Next static export) |
| `/admin-dashboard/` | React admin dashboard                     |
| `/admin/`           | Django admin (unfold)                     |
| `/api/`             | REST API                                  |
| `/api/health/`      | Railway health check                      |

No manual Railway console commands are required after setting variables.

### Optional local production smoke test

```bash
cd backend/frontend
npm ci && NEXT_PUBLIC_API_URL=/api npm run build
cd .. && python scripts/copy_frontend_build.py
set DJANGO_SETTINGS_MODULE=core.settings.production
set SECRET_KEY=test-key
set DATABASE_URL=postgresql://...
python manage.py collectstatic --noinput
python manage.py migrate
python manage.py init_admin
python manage.py runserver
```

## UI architecture

Single shared branding system:

- `AppLogo` — hospital logo (`hd-logo.png`)
- `HospitalHeaderBranding` — navbar / login header layout
- `TilgangaLogo` — partner logo
- `hospitalBranding.ts` — shared copy & constants

## Maintenance scripts

```bash
cd backend
python scripts/repair_complaints_migrations.py   # fix duplicate 0007 migrations if needed
```
