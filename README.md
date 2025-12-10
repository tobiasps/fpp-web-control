FPP Web Control

Control `Falcon Player (FPP)` sequences from a simple, touch‑friendly web UI and a tiny HTTP API.

This service exposes a small Express server that:
- Serves a minimal control page at `/` with buttons for predefined sequences and command presets (fade out/in/on/off).
- Proxies a couple of API calls to your FPP instance, adding validation and simple sequencing logic.

Purpose: quickly trigger lighting sequences during concerts from a tablet/phone without using the full FPP UI.


Overview
- Language: TypeScript
- Runtime/Framework: Node.js + Express
- Package manager: npm (lockfile present)
- Build: TypeScript compiler (`tsc`)
- Dev runner: `tsx`

Entry points
- Development entry: `src/server.ts`
- Compiled runtime entry (after build): `dist/server.js`


Requirements
- Node.js >= 22.12.0 (enforced via `package.json` engines)
- npm
- An accessible FPP instance (default URL `http://fpp.local`)


Setup
1) Install dependencies
```
npm install
```

2) Development (watch mode)
Runs the server with `tsx` against TypeScript sources.
```
npm run dev
```
By default, the server listens on port `8080` (configurable via `FPPCONTROL_SERVER_PORT`).

3) Build
```
npm run build
```
Outputs compiled JS to `dist/`.

4) Start built server
```
node dist/server.js
```


Configuration (Environment Variables)
- `FPPCONTROL_SERVER_PORT` (number) — HTTP port for this service. Default: `8080`.
- `FPP_URL` (string) — Base URL to your FPP instance. Default: `http://fpp.local`.

Sequence button labels shown on the `/` page are currently defined in code:
- See `src/lib/config.ts` (`config.sequences`).
- TODO: support providing sequence labels via environment variable or external file if needed.

CORS
- The app sets simple CORS headers for local use. When running behind a reverse proxy, you likely won’t need them.


API
All endpoints are served by this app. Calls that reference FPP will proxy to the configured `FPP_URL`.

- `GET /version`
  - Returns a simple version string, e.g. `FPPWebControl v1.0.0`.

- `GET /test`
  - Serves a tiny test page that can start a sequence by name.

- `GET /`
  - Serves a touch‑friendly control UI with buttons for sequence start and a few command presets (Fade Out, Fade In, On, Off).

- `POST /api/sequence/:name/start`
  - Validates `:name` and then performs two steps against FPP:
    1. `GET ${FPP_URL}/api/sequence/current/stop`
    2. `GET ${FPP_URL}/api/sequence/:name/start`
  - On failure to reach FPP: returns `504` for timeouts, otherwise `500`.
  - On FPP error: returns `502` with upstream status/body.

- `POST /api/command-preset/:slot`
  - Proxies to: `GET ${FPP_URL}/api/command/Trigger%20Command%20Preset%20Slot/:slot`
  - Special behavior for slot `1` (Fade Out): after sending slot `1`, the server waits 5 seconds, then stops the current sequence and triggers slot `3` (On).
  - Validates `:slot` as digits. On FPP error: `502`. Timeout: `504`.


Scripts
Defined in `package.json`:
- `npm run dev` — `tsx watch src/server.ts` (start in watch mode)
- `npm run build` — `tsc` (compile TypeScript to `dist/`)

The package also declares:
- `bin: dist/server.js` — allows running the compiled server file directly after building.


Project Structure
```
.
├─ src/
│  ├─ app.ts                # Express app (routes, HTML UIs, proxy logic)
│  ├─ server.ts             # HTTP server bootstrap
│  ├─ lib/
│  │  ├─ config.ts          # Port, FPP base URL, default sequence labels
│  │  └─ logger.ts          # Minimal timestamped logger
│  └─ middlewares/
│     └─ errorHandler.ts    # JSON error handler
├─ dist/                    # Build output (after `npm run build`)
├─ package.json
├─ package-lock.json
├─ tsconfig.json
├─ LICENSE
└─ README.md
```


Running and Using
- Ensure your FPP instance is reachable at `FPP_URL` (default `http://fpp.local`).
- Start the server (dev or built). Open the control UI at `http://localhost:<port>/`.
- Tap a sequence button to start that sequence via FPP.
- Tap command preset buttons to send preset commands (Fade Out, Fade In, On, Off). See the slot behavior noted above for slot `1`.


Tests
- There are currently no automated tests in this repository.
- TODO: add unit tests for route validation and proxy logic.


Deployment
- This is a small Node.js service; you can run it as a systemd service, in a container, or behind a reverse proxy.
- TODO: provide a sample systemd unit and/or Dockerfile.


License
This project is licensed under the MIT License. See `LICENSE` for details.
