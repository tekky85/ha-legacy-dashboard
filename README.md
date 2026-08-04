# HA Legacy Dashboard

**Lightweight dashboards for legacy devices.**

HA Legacy Dashboard is a lightweight and modern Home Assistant dashboard for
older tablets and browsers that can no longer display the current Home
Assistant frontend.

The initial target device is an Apple iPad mini first generation running
iOS 9.3.5.

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
- server-side dashboard widget configuration
- Home Assistant reachability status
- stale-data indicator with last successful refresh
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

Visible widgets are defined in:

```text
src/config/dashboard.js
```

Each entry defines:

- `entity`
- `type`
- `title`
- `subtitle`
- `icon`
- `iconClass`
- `unit`
- `order`
- `visible`

Set `visible` to `false` to remove a widget from both the browser
configuration and the dashboard state query. Supported frontend widget types
are explicitly limited to `sensor`, `binary`, `light`, and `climate`.

This configuration controls display and read access only. Adding an entity
here does not make it writable. Climate and light write permissions remain in
the separate allowlists in `src/routes/api.js`.

## Security model

- The Home Assistant token exists only in `.env`.
- The browser communicates only with the gateway.
- Writable entities are allowlisted.
- Browser input is validated.
- Arbitrary Home Assistant services are not exposed.
- `.env` is excluded from Git.
- JSON request bodies are limited to 16 KB.
- Allowed HA writes are limited to 10 calls per entity in 10 seconds.
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
├── deploy/
│   └── systemd/
├── docs/
│   └── CODEX_HANDOFF.md
└── src/
    ├── config/
    │   └── dashboard.js
    ├── server.js
    ├── routes/
    ├── services/
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

No license has been selected yet.
