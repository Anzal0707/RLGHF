# Mobile testing on the same Wi‑Fi

Use this guide to open the app on a phone or tablet while Django and Next.js run on your development PC.

## Prerequisites

- PC and mobile device on the **same Wi‑Fi network**
- Python venv activated and `npm install` completed in `frontend/`
- Root `.env` configured (copy from `.env.example`)
- `DEBUG=1` recommended for local LAN access

## One-time setup

### 1. Find your PC's LAN IP

**Windows (PowerShell or CMD):**

```bat
ipconfig
```

Use the **IPv4 Address** for your Wi‑Fi adapter (e.g. `192.168.1.100`).

### 2. Frontend environment

Copy the example file and set your LAN IP:

```bat
copy frontend\env.local.example frontend\.env.local
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://192.168.1.100:8000/api
NEXT_ALLOWED_DEV_ORIGINS=192.168.1.100
```

Replace `192.168.1.100` with your actual IP.

> **Important:** When you open the site on your phone, API calls must use the PC's LAN IP—not `localhost` (that would point to the phone itself).

### 3. Django environment (optional strict mode)

With `DEBUG=1` and default `DJANGO_DEV_ALLOW_LAN=1` in `.env`, Django accepts:

- All hosts (`ALLOWED_HOSTS=*`)
- CORS from `http://192.168.x.x:3000` and `http://10.x.x.x:3000`

For production-like restrictions, set `DJANGO_DEV_ALLOW_LAN=0` and configure explicitly in `.env`:

```env
ALLOWED_HOSTS=localhost,127.0.0.1,192.168.1.100
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://192.168.1.100:3000
```

## Run the servers

### Windows (recommended)

```bat
start.bat
```

This starts two services:

- **Next.js** — binds `0.0.0.0:3000`
  - PC: <http://localhost:3000>
  - Phone: <http://YOUR_LAN_IP:3000>
- **Django** — binds `0.0.0.0:8000`
  - PC: <http://localhost:8000>
  - Phone API: <http://YOUR_LAN_IP:8000/api/>

### Manual commands

**Django:**

```bat
.\venv\Scripts\activate
python manage.py runserver 0.0.0.0:8000
```

**Next.js:**

```bat
cd frontend
npm run dev
```

(`npm run dev` binds to `0.0.0.0:3000`. Use `npm run dev:local` for localhost-only.)

## Verify

1. On your PC: <http://localhost:3000> — should work as before.
2. On your phone (same Wi‑Fi): <http://YOUR_LAN_IP:3000>
3. Submit a rating or complaint — requests should go to `http://YOUR_LAN_IP:8000/api/`.

If the page loads but API calls fail:

- Confirm `NEXT_PUBLIC_API_URL` in `frontend/.env.local` uses the LAN IP
- Restart the Next.js dev server after changing `.env.local`
- Allow Python/Node through Windows Firewall for private networks
- Confirm `DEBUG=1` or explicit `ALLOWED_HOSTS` / `CORS_ALLOWED_ORIGINS`

## Firewall

On first run, allow **Python** and **Node.js** when Windows Firewall prompts for **Private** networks.
