# HA Legacy Dashboard

**Lightweight dashboards for legacy devices.**

HA Legacy Dashboard is a lightweight and modern Home Assistant dashboard for
older tablets and browsers that can no longer display the current Home
Assistant frontend.

The initial target device is an Apple iPad mini first generation running
iOS 9.3.5.

Current project version: `1.0.0`.

The implemented changes are summarized in
[`CHANGELOG.md`](CHANGELOG.md).

## Why?

Modern Home Assistant dashboards depend on browser capabilities that are not
available on many older tablets.

HA Legacy Dashboard places a small gateway between the legacy browser and Home
Assistant:

```text
Legacy device
    |
    | HTTP
    v
HA Legacy Dashboard
    |
    | Home Assistant REST API
    v
Home Assistant
```

The Home Assistant token remains on the server and is never exposed to the
browser.

## Current features

- Node.js and Express gateway
- Home Assistant REST API integration
- responsive card layout
- portrait and landscape support
- light mode
- dark mode
- manual theme switching
- inline SVG icons
- temperature sensor card
- humidity sensor card
- binary sensor card
- allowlisted Esszimmer light card
- responsive optimistic light on/off control
- multiple persistent server-side dashboard profiles
- stable dashboard URLs with a backward-compatible default dashboard
- protected, opt-in Admin API without a graphical Admin UI
- Home Assistant reachability status
- stale-data indicator with last successful refresh
- wall-display clock and German date
- visible gateway and Home Assistant connection badge
- network error banner with automatic recovery
- configurable, server-validated refresh interval
- structured JSON logs with secret-field redaction
- security headers, payload limit, and write rate limit
- climate card
- climate target-temperature controls
- iOS home-screen standalone mode
- local Apple touch icons
- web app manifest for modern browsers
- automatic refresh
- Safari iOS 9 compatibility
- systemd service deployment
- no frontend framework
- no external frontend dependencies

## Compatibility

Primary target:

- iPad mini first generation
- iOS 9.3.5
- Safari on iOS 9

Frontend JavaScript intentionally uses ECMAScript 5 syntax and
`XMLHttpRequest`.

The frontend does not use:

- `fetch`
- `Promise`
- arrow functions
- JavaScript classes
- template literals
- CSS Grid
- Flexbox `gap`

## Requirements

- Debian-based LXC or VM
- Node.js
- npm
- Home Assistant
- Home Assistant long-lived access token
- network access from the gateway to Home Assistant

## Installation

Clone the repository:

```bash
git clone git@github.com:tekky85/ha-legacy-dashboard.git
cd ha-legacy-dashboard
```

Install dependencies:

```bash
npm install
```

Create `.env`:

```ini
PORT=3000
HA_URL=http://home-assistant-address:8123
HA_TOKEN=your-long-lived-access-token
# Optional: 3000 to 300000 milliseconds, default 5000
DASHBOARD_REFRESH_INTERVAL_MS=5000
# Optional: defaults to data/dashboards.json
DASHBOARD_CONFIG_PATH=/home/dashboard/ha-legacy-dashboard/data/dashboards.json
# Admin API remains disabled unless explicitly enabled
ADMIN_API_ENABLED=false
# Required only when ADMIN_API_ENABLED=true; never reuse HA_TOKEN
# ADMIN_TOKEN=use-a-separate-random-secret
```

Never commit `.env`.

Start manually for development:

```bash
npm start
```

Open:

```text
http://gateway-address:3000/
```

The root URL loads the default dashboard. Named dashboards use stable paths:

```text
http://gateway-address:3000/d/default
http://gateway-address:3000/d/esszimmer
```

## iPad home-screen installation

On the iPad, open the dashboard URL in Safari and select:

```text
Share -> Add to Home Screen
```

Start the dashboard from the new home-screen icon. On iOS 9 it then runs as a
classic standalone web app without Safari's address and button bars.

iOS 9 does not support service workers. The dashboard therefore remains an
online application and requires access to the gateway.

## Production deployment

Production path:

```text
/home/dashboard/ha-legacy-dashboard
```

Systemd service:

```text
ha-legacy-dashboard.service
```

Start and enable:

```bash
systemctl enable --now ha-legacy-dashboard.service
```

Status:

```bash
systemctl status ha-legacy-dashboard.service --no-pager -l
```

Logs:

```bash
journalctl -u ha-legacy-dashboard.service -f
```

Automated deployment, health checks, rollback, and the optional narrowly
scoped sudoers rule are documented in
[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

After the one-time sudoers installation, production deployment is:

```bash
cd /home/dashboard/ha-legacy-dashboard
./deploy/deploy.sh
```

## API

Gateway status:

```text
GET /api/status
```

The response reports the gateway and Home Assistant status separately. A
reachable gateway with an unavailable Home Assistant reports `degraded` while
remaining available for diagnostics.

Dashboard data:

```text
GET /api/dashboard
```

Dashboard widget configuration:

```text
GET /api/dashboard/config
```

The two endpoints above are compatibility routes and always refer to the
default dashboard. Multi-dashboard clients can use:

```text
GET /api/dashboards
GET /api/dashboards/:dashboardId/config
GET /api/dashboards/:dashboardId/state
```

Unknown dashboard IDs return HTTP 404 and are never redirected to the default
dashboard.

The optional Admin API is documented below. It is disabled by default and is
not used by the legacy dashboard frontend.

Set climate target temperature:

```text
POST /api/climate/temperature
```

Example body:

```json
{
  "entity_id": "climate.esszimmer_thermostate",
  "temperature": 22.5
}
```

Set the allowlisted Esszimmer light state:

```text
POST /api/light/state
```

Example body:

```json
{
  "entity_id": "light.esszimmer_lampen",
  "state": "on"
}
```

Writable entities must be explicitly allowlisted in the backend.

## Dashboard configuration

The active configuration is stored by default in:

```text
data/dashboards.json
```

The path can be overridden with `DASHBOARD_CONFIG_PATH`. On the first start,
the application validates and migrates the built-in Sprint 13 profiles from
`src/config/dashboard.js`. Runtime files under `data/` are ignored by Git.

The version 1 schema declares `schemaVersion`, one `defaultDashboardId`, and a
list of dashboard profiles. Every profile has a stable lowercase ID, a display
title, a refresh interval, and its own widget list. Every widget also has a
stable globally unique `id`. The migrated profiles are:

- `default` – the complete existing dashboard and the target of `/`
- `esszimmer` – the existing Esszimmer light and climate widgets

Each widget entry defines:

- `id`
- `entity`
- `type`
- `title`
- `subtitle`
- `icon`
- `iconClass`
- `unit`
- `order`
- `visible`

The optional backend environment value `DASHBOARD_REFRESH_INTERVAL_MS`
controls the automatic browser refresh between 3000 and 300000 milliseconds.
Invalid values fall back to 5000 milliseconds. The browser receives only this
sanitized interval and the public widget configuration.

Dashboard visibility controls only which entities are displayed and read.
It never grants write access. Climate and light writes remain protected by
separate explicit backend allowlists.

Every complete configuration is validated before it can replace the active
configuration. Writes use a temporary file in the same directory followed by
an atomic rename. The previous valid version is retained as
`dashboards.json.bak`. Invalid JSON, an unsupported schema, validation errors,
or write failures do not replace the last valid configuration.

Set `visible` to `false` to remove a widget from both the browser
configuration and the dashboard state query. Supported frontend widget types
are explicitly limited to `sensor`, `binary`, `light`, and `climate`.

This configuration controls display and read access only. Adding an entity
here does not make it writable. Climate and light write permissions remain in
the separate allowlists in `src/routes/api.js`.

## Admin API

There is no graphical Admin UI in Sprint 14. The backend API is disabled by
default. To enable it, set both values in the server-only `.env`:

```ini
ADMIN_API_ENABLED=true
ADMIN_TOKEN=use-a-separate-random-secret
```

`ADMIN_TOKEN` must be distinct from `HA_TOKEN`. Every Admin request requires:

```text
Authorization: Bearer <ADMIN_TOKEN>
```

Available routes:

```text
GET    /api/admin/config
PUT    /api/admin/config
GET    /api/admin/dashboards
POST   /api/admin/dashboards
PUT    /api/admin/dashboards/:id
DELETE /api/admin/dashboards/:id
POST   /api/admin/dashboards/:id/widgets
PUT    /api/admin/dashboards/:id/widgets/:widgetId
DELETE /api/admin/dashboards/:id/widgets/:widgetId
GET    /api/admin/entities
```

Admin writes are rate-limited. The entity inventory contains only entity ID,
domain, friendly name, device class, and unit of measurement. Tokens, raw
states, arbitrary attributes, internal paths, services, and write allowlists
are not returned.

Enabling the API still does not grant Home Assistant write permissions.
Climate and Light remain controlled exclusively by their hard-coded backend
allowlists.

## Security model

- The Home Assistant token exists only in `.env`.
- The browser communicates only with the gateway.
- Writable entities are allowlisted.
- Browser input is validated.
- Arbitrary Home Assistant services are not exposed.
- `.env` is excluded from Git.
- JSON request bodies are limited to 16 KB.
- Allowed HA writes are limited to 10 calls per entity in 10 seconds.
- Admin writes are Bearer-authenticated and rate-limited when explicitly
  enabled.
- API responses are not cached.
- CSP, frame, referrer, and MIME-sniffing protection headers are sent.

## Failure handling

Home Assistant requests and browser requests use a 10-second timeout. The
dashboard response contains a `_meta` object with HA status, fetch time, and
failed visible entities. When HA is completely unavailable, the frontend keeps
the last successful cards on screen and shows the time of the last complete
refresh. Partial failures are marked as partially available.

Application events are written as one-line JSON logs. Request bodies,
authorization headers, and Home Assistant tokens are never logged.

## Project structure

```text
ha-legacy-dashboard/
├── AGENTS.md
├── README.md
├── data/
│   └── dashboards.json (runtime, ignored by Git)
├── deploy/
│   └── systemd/
├── docs/
│   └── CODEX_HANDOFF.md
└── src/
    ├── config/
    │   └── dashboard.js
    ├── server.js
    ├── routes/
    │   ├── admin.js
    │   └── api.js
    ├── services/
    │   ├── dashboard-config-store.js
    │   └── homeassistant.js
    └── public/
```

## Development

Check repository state:

```bash
git status
git log --oneline -10
```

Validate changed JavaScript files:

```bash
node --check src/public/js/app.js
node --check src/routes/api.js
```

Test APIs:

```bash
curl http://localhost:3000/api/status
curl http://localhost:3000/api/dashboard
```

After backend changes:

```bash
systemctl restart ha-legacy-dashboard.service
```

After frontend changes, increment the asset version parameters in
`src/public/index.html` to bypass aggressive legacy Safari caching.

## Codex

Codex should read these files before modifying the project:

```text
AGENTS.md
README.md
docs/CODEX_HANDOFF.md
```

## License

No license has been selected yet. The package is marked as private to prevent
accidental publication to npm; this does not grant a software license. A
license remains an explicit project-owner decision before a public release.
