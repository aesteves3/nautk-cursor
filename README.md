# NAUTK Website

React + Vite marketing site for NAUTK, deployable on **any web host** (static, PHP shared hosting, or Node/VPS). No Base44 runtime required.

## Quick start (local)

```bash
npm install
cp .env.example .env.local

# Terminal 1 — frontend
npm run dev

# Terminal 2 — form API (contact + enrollment emails)
npm run server:install
cp server/.env.example server/.env
npm run server:dev
```

Open http://localhost:5173 — Vite proxies `/api/*` to the Node server on port 3001.

## Environment variables

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Backend base URL for forms. Empty = same origin `/api/...` |
| `VITE_COURSES_SOURCE` | `static` (default) loads `/data/courses.json`; `api` uses `GET /api/courses` |
| `VITE_BASE_PATH` | Subfolder deploy, e.g. `/nautk/` |
| `VITE_DEV_API_PROXY` | Dev proxy target (default `http://localhost:3001`) |

Server (Node): copy `server/.env.example` → `server/.env` and set SMTP for email.

PHP (shared hosting): copy `public/api/config.sample.php` → `public/api/config.php` on the server after upload.

## Production build

```bash
npm run build
```

Upload the contents of **`dist/`** to your web root.

Included in `dist/`:
- Static React app
- `data/courses.json` — course catalog
- `api/*.php` — optional PHP form handlers (cPanel / Apache)
- `.htaccess` — SPA routing + API rewrite (Apache)

## Deployment options

### A — Static + PHP (cPanel, Hostinger, etc.)

1. `npm run build`
2. Upload all files from `dist/` to `public_html`
3. Copy `dist/api/config.sample.php` → `dist/api/config.php` on the server
4. Create writable folder `public_html/api/data/` (chmod 755 or 775)
5. Ensure Apache `mod_rewrite` is enabled (`.htaccess` included)

Forms POST to `/api/contact` and `/api/enrollments` (rewritten to PHP).

### B — Node.js (VPS, Railway, Render)

1. `npm run build`
2. Configure `server/.env` (SMTP, `CORS_ORIGIN`, `PORT`)
3. Start API: `npm run server:start` (serves `dist/` + `/api/*`)

Or use Nginx to serve `dist/` and proxy `/api/` — see `deploy/nginx.example.conf`.

### C — Static only (Netlify, Cloudflare Pages, S3)

1. `npm run build`
2. Upload `dist/` ( `_redirects` included for SPA routing)
3. Point `VITE_API_URL` at a separate API host (Node or PHP) when building:

```bash
VITE_API_URL=https://api.nautk.org npm run build
```

Course pages work without an API (`VITE_COURSES_SOURCE=static`).

## Updating course data

Edit `Data/Course/Course_export.csv`, then:

```bash
npm run import:courses
```

This regenerates `public/data/courses.json`.

## Project layout

```
src/api/          — HTTP client (config, courses, forms)
public/data/      — Static course JSON (built into dist)
public/api/       — PHP form API (optional, for shared hosting)
server/           — Node.js form API (optional, for VPS)
deploy/           — Nginx example
base44/           — Legacy Base44 schema (reference only, not used at runtime)
```

## Legacy Base44 folder

The `base44/` directory is kept as documentation of the original data model. It is **not** used after migration.
