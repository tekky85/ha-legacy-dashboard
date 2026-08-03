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
- climate card
- climate target-temperature controls
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

## API

Gateway status:

```text
GET /api/status
```

Dashboard data:

```text
GET /api/dashboard
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

Writable entities must be explicitly allowlisted in the backend.

## Security model

- The Home Assistant token exists only in `.env`.
- The browser communicates only with the gateway.
- Writable entities are allowlisted.
- Browser input is validated.
- Arbitrary Home Assistant services are not exposed.
- `.env` is excluded from Git.

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
