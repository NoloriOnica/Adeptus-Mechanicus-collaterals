# Adeptus Mechanicus — Local Setup Guide

Follow these steps exactly to get the project running on your machine.

---

## Step 1: Check if Node.js is installed

Open a terminal and run:

```bash
node --version
```

You should see something like `v18.x.x`, `v20.x.x`, or `v22.x.x`.

**If the command is not found or the version is below 18:**

1. Go to https://nodejs.org
2. Download the **LTS** version (20.x or later recommended)
3. Run the installer and follow the prompts
4. Close and reopen your terminal
5. Run `node --version` again to confirm

---

## Step 2: Install pnpm (package manager)

This project uses **pnpm** workspaces. Install it globally:

```bash
npm install -g pnpm
```

Verify it installed:

```bash
pnpm --version
```

You should see `8.x.x` or later.

---

## Step 3: Clone or copy the project

If you received this as a zip file, unzip it to a folder. If it's a git repo:

```bash
git clone <repo-url>
cd "Adeptus Mechanicus collaterals"
```

Make sure you're in the root folder that contains `package.json`, `pnpm-workspace.yaml`, and the `apps/`, `backend/`, `packages/`, and `assets/` directories.

---

## Step 4: Install all dependencies

From the project root, run:

```bash
pnpm install
```

This installs dependencies for the backend, phone app, tablet app, and shared package in one step.

If you see a prompt about build scripts (esbuild), approve it — esbuild is required for the Vite bundler.

---

## Step 5: Start all services

```bash
pnpm dev
```

This starts three servers concurrently:

| Service | URL | What it does |
|---------|-----|-------------|
| Backend | http://localhost:3001 | Express API — manages sessions and AI processing |
| Phone app | http://localhost:5173 | Mobile confession form |
| Tablet app | http://localhost:5174 | Display screen for AI responses |

You should see colour-coded logs in your terminal from all three services.

---

## Step 6: Open the apps in your browser

### Quick test (both in the same browser)

1. Open the **tablet display** in one browser tab:
   ```
   http://localhost:5174/display/DEMO01
   ```

2. Open the **phone form** in another tab (use DevTools mobile mode for realistic sizing):
   ```
   http://localhost:5173/phone/DEMO01
   ```

   > **Important:** Both URLs must share the same session ID — `DEMO01` in this example. You can use any alphanumeric string.

3. On the phone page, click **NEXT**, type a confession, and press **ENTER**.

4. Watch the tablet tab — it transitions from Idle to Loading to the AI Result automatically.

5. Press **RESTART** on the tablet (or wait 60 seconds) to reset.

---

## Running on separate physical devices (phone + tablet)

If you want to use an actual phone and tablet on the same Wi-Fi network:

### Find your computer's local IP

```bash
# macOS
ipconfig getifaddr en0

# Windows
ipconfig

# Linux
hostname -I
```

Note the IP address (e.g. `192.168.1.42`).

### Update the Vite configs to allow external access

In `apps/phone/vite.config.ts` and `apps/tablet/vite.config.ts`, add `server.host`:

```ts
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,   // <-- add this
  },
  // ... rest of config
});
```

### Set the phone URL for the tablet's QR code

Create a file `apps/tablet/.env`:

```
VITE_PHONE_URL=http://192.168.1.42:5173
```

(Replace `192.168.1.42` with your actual IP.)

### Update CORS in the backend

In `backend/src/index.ts`, add your IP to the `origin` array:

```ts
cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://192.168.1.42:5173',  // <-- add these
    'http://192.168.1.42:5174',
  ],
})
```

### Restart and connect

```bash
pnpm dev
```

- Open the tablet browser to: `http://192.168.1.42:5174/display/DEMO01`
- Scan the QR code with your phone, or manually open: `http://192.168.1.42:5173/phone/DEMO01`

---

## Troubleshooting

### `command not found: pnpm`

Run `npm install -g pnpm` and reopen your terminal.

### `command not found: node`

Install Node.js from https://nodejs.org (LTS version).

### Port already in use

Another process is using port 3001, 5173, or 5174. Either stop that process or change the port in the relevant config:

- Backend port: `backend/src/index.ts` (line with `PORT`)
- Phone port: `apps/phone/vite.config.ts` or `apps/phone/package.json` (`--port` flag)
- Tablet port: `apps/tablet/vite.config.ts` or `apps/tablet/package.json` (`--port` flag)

### Phone/tablet not connecting to backend

- Make sure all three services are running (`pnpm dev` starts them all)
- Check that the backend URL in `packages/shared/src/constants.ts` matches where the backend is actually running (default: `http://localhost:3001`)
- If using separate devices, make sure CORS is updated and all devices are on the same network

### Assets not loading

All images in `/assets/` are imported directly by Vite. If you see broken images, make sure the files exist in the `assets/` folder at the project root:

- `Logo.png`
- `Border.png`
- `Loading 1:4.png`, `Loading 2:4.png`, `Loading 3:4.png`, `Loading 4:4.png`

---

## Stopping the server

Press `Ctrl + C` in the terminal where `pnpm dev` is running. This stops all three services.

---

## Project structure at a glance

```
Adeptus Mechanicus collaterals/
├── apps/
│   ├── phone/        Vite + React + TypeScript (port 5173)
│   └── tablet/       Vite + React + TypeScript (port 5174)
├── backend/          Express + TypeScript (port 3001)
├── packages/
│   └── shared/       Shared types, API client, constants
├── assets/           All image assets (Logo, Border, Loading frames)
├── package.json      Workspace root
└── pnpm-workspace.yaml
```
