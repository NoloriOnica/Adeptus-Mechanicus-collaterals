# Adeptus Mechanicus — Confession Terminal

A two-screen interactive installation:

| App | Role | Default URL |
|-----|------|-------------|
| **Phone** | User submits a confession | `http://localhost:5173` |
| **Tablet** | Displays the AI interpretation | `http://localhost:5174` |
| **Backend** | Manages sessions, runs AI inference | `http://localhost:3001` |

---

## Prerequisites

- **Node.js** ≥ 18
- **pnpm** ≥ 8
  ```bash
  npm install -g pnpm
  ```

---

## Install

```bash
# From the repo root
pnpm install
```

---

## Run (all services)

```bash
pnpm dev
```

This starts backend + phone app + tablet app concurrently with colour-coded logs.

Or start individually:

```bash
pnpm dev:backend   # Express on :3001
pnpm dev:phone     # Vite on :5173
pnpm dev:tablet    # Vite on :5174
```

---

## How to use

### Single-device test (same computer)

1. Open the **tablet** display in a browser window:
   ```
   http://localhost:5174/display/DEMO01
   ```
   You will see the idle screen with the logo and a QR code.

2. Open the **phone** page in another window (or DevTools mobile mode):
   ```
   http://localhost:5173/phone/DEMO01
   ```
   > Both URLs share the same session ID (`DEMO01` in this example).

3. Type a confession on the phone and press **ENTER**.

4. The tablet automatically transitions: Idle → Loading → Result.

5. Press **RESTART** on the tablet (or wait 60 s) to reset.

---

### Physical installation (phone + tablet on the same LAN)

1. Find your computer's LAN IP address (e.g. `192.168.1.42`).

2. Create a `.env` file in `apps/tablet/`:
   ```
   VITE_PHONE_URL=http://192.168.1.42:5173
   ```

3. Allow external connections by updating the dev scripts, e.g.:
   ```bash
   vite --port 5173 --host 0.0.0.0
   ```
   (or add `server: { host: true }` in the Vite configs).

4. Also update the CORS list in `backend/src/index.ts` with your LAN IP.

5. Open the tablet at `http://192.168.1.42:5174/display/<YOUR-SESSION-ID>`.
   The QR code will now link to the correct phone URL.

6. Scan the QR code with your phone.

---

## Session ID

The session ID ties the phone and tablet together. It's just an alphanumeric string in the URL.

- If you go to `/` on either app, it auto-generates a random session ID.
- To pair them manually, use the **same ID** in both URLs:
  - Tablet: `/display/ABC123`
  - Phone: `/phone/ABC123`

---

## Assets

All source assets live in `/assets/` at the repo root:

| File | Used for |
|------|----------|
| `Logo.png` | Tablet idle screen |
| `Border.png` | Top decorative border (phone + tablet) |
| `Loading 1:4.png` – `Loading 4:4.png` | Frame-by-frame loading animation |

Vite imports them as hashed modules — no manual copying needed.

---

## Repository layout

```
/
├── apps/
│   ├── phone/          — Vite + React + TypeScript (port 5173)
│   └── tablet/         — Vite + React + TypeScript (port 5174)
├── backend/            — Express + TypeScript (port 3001)
├── packages/
│   └── shared/         — Types, constants, API client wrapper
├── assets/             — All image assets
├── package.json        — Workspace root (concurrently scripts)
└── pnpm-workspace.yaml
```

---

## Backend API reference

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/session/:id/submit` | Submit a confession |
| `GET` | `/api/session/:id/status` | Poll session status |
| `POST` | `/api/session/:id/reset` | Reset session to idle |

### POST `/api/session/:id/submit`

**Body**
```json
{ "confession": "I have sinned against the Omnissiah." }
```

**Response**
```json
{ "ok": true, "submissionCount": 7 }
```

### GET `/api/session/:id/status`

```json
{
  "status": "idle" | "pending" | "done" | "error",
  "result": "…AI interpretation…",
  "updatedAt": 1712345678901
}
```

---

## Render deployment

This repo includes a root-level [`render.yaml`](./render.yaml) blueprint for:

- `adeptus-backend` — Render web service
- `adeptus-phone` — Render static site
- `adeptus-tablet` — Render static site

### Required environment variables

Before the deployed app can work, set these values in Render:

| Service | Variable | Example |
|--------|----------|---------|
| Backend | `OPENAI_API_KEY` | `sk-...` |
| Backend | `CORS_ALLOWED_ORIGINS` | `https://adeptus-phone.onrender.com,https://adeptus-tablet.onrender.com` |
| Phone | `VITE_API_BASE_URL` | `https://adeptus-backend.onrender.com` |
| Tablet | `VITE_API_BASE_URL` | `https://adeptus-backend.onrender.com` |
| Tablet | `VITE_PHONE_URL` | `https://adeptus-phone.onrender.com` |

Use the `.env.example` files in:

- `backend/.env.example`
- `apps/phone/.env.example`
- `apps/tablet/.env.example`

### Important deployment note

The backend currently stores sessions in memory. On Render free instances, the backend can spin down when idle, which clears active sessions. For an installation or live event, a paid instance or persistent datastore is safer.
