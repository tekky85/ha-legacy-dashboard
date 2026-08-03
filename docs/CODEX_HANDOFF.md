# Codex Handoff – HA Legacy Dashboard

## Purpose

This document transfers the current project context from the original ChatGPT
development conversation to Codex.

Codex must inspect the actual repository and Git history before changing any
file. Proposed changes in this document may or may not already be implemented.

## Project objective

HA Legacy Dashboard provides a lightweight, modern Home Assistant dashboard for
legacy devices that cannot display the current Home Assistant frontend.

The initial target device is:

- Apple iPad mini first generation
- iOS 9.3.5
- Safari on iOS 9

## Environment

Gateway host:

```text
Proxmox LXC
```

Gateway address during development:

```text
192.168.1.24
```

Gateway port:

```text
3000
```

Production project path:

```text
/home/dashboard/ha-legacy-dashboard
```

Runtime user:

```text
dashboard
```

Systemd service:

```text
ha-legacy-dashboard.service
```

GitHub repository:

```text
git@github.com:tekky85/ha-legacy-dashboard.git
```

Default branch:

```text
main
```

## Architecture

```text
iPad Safari
    |
    | HTTP
    v
HA Legacy Dashboard Gateway
    |
    | Home Assistant REST API
    v
Home Assistant
```

The Home Assistant long-lived access token remains exclusively on the backend.

## Current backend

The backend uses:

- Node.js
- Express
- axios
- dotenv
- Home Assistant REST API
- systemd

Important files:

```text
src/server.js
src/config/dashboard.js
src/routes/api.js
src/services/homeassistant.js
```

## Current frontend

The frontend uses:

- HTML
- one consolidated CSS file
- plain JavaScript
- ECMAScript 5-compatible syntax
- XMLHttpRequest through `compat.js`
- inline SVG icons
- Flexbox layout
- media queries
- light and dark themes

Important files:

```text
src/public/index.html
src/public/css/style.css
src/public/js/app.js
src/public/js/core/compat.js
src/public/js/core/dashboard.js
src/public/js/core/icons.js
src/public/js/core/theme.js
src/public/js/core/widget.js
src/public/js/widgets/sensor.js
src/public/js/widgets/binary.js
src/public/js/widgets/climate.js
```

## Implemented features

- Home Assistant API gateway
- server-side token storage
- dashboard status endpoint
- dashboard entity endpoint
- responsive cards
- portrait layout
- landscape layout
- light mode
- dark mode
- manual theme toggle
- theme persistence
- inline SVG icons
- temperature sensor card
- humidity sensor card
- binary window sensor card
- allowlisted Esszimmer light card
- responsive optimistic light on/off control
- server-side dashboard widget configuration
- HA reachability status and dashboard response metadata
- stale-data display with last successful refresh
- structured JSON logging with secret-field redaction
- security headers, 16 KB JSON limit, and write rate limit
- climate card
- target-temperature controls
- automatic refresh
- systemd service
- GitHub repository integration

## Current Home Assistant entities

```text
sensor.badezimmer_smart_indoor_module_temperatur
sensor.badezimmer_smart_indoor_module_luftfeuchtigkeit
binary_sensor.kuche_fenster_rechts
binary_sensor.kuche_fenster_mitte
light.esszimmer_lampen
climate.esszimmer_thermostate
```

Codex must inspect the actual entity list in `src/routes/api.js` and
`src/config/dashboard.js`.

## Dashboard configuration

Visible widgets and read-only entity selection are centrally defined in:

```text
src/config/dashboard.js
```

The browser obtains the sanitized visible configuration from:

```text
GET /api/dashboard/config
```

The supported widget types are explicitly mapped in
`src/public/js/core/dashboard.js`. Unknown types are ignored. Display
configuration never grants write access; the climate and light write
allowlists remain separate in `src/routes/api.js`.

## Legacy-browser constraints

Safari on iOS 9 does not support `fetch`.

The project therefore uses:

```text
XMLHttpRequest
```

through:

```text
src/public/js/core/compat.js
```

Frontend JavaScript must not use:

- `let`
- `const`
- arrow functions
- JavaScript classes
- template literals
- `fetch`
- `Promise`
- `async`
- `await`
- optional chaining
- nullish coalescing

CSS must not depend on:

- CSS Grid
- Flexbox `gap`
- modern selectors unsupported by Safari 9
- unsupported CSS custom-property behavior

## Climate control

The climate card uses:

```text
climate.esszimmer_thermostate
```

The backend control endpoint is:

```text
POST /api/climate/temperature
```

The backend must use the Home Assistant service:

```text
climate.set_temperature
```

The entity must remain explicitly allowlisted.

## Light control

The light card uses:

```text
light.esszimmer_lampen
```

The backend control endpoint is:

```text
POST /api/light/state
```

Only the explicitly allowlisted entity is accepted. The requested state is
mapped exclusively to `light.turn_on` or `light.turn_off`; the browser cannot
select arbitrary Home Assistant services.

The backend should validate:

- entity ID
- numeric temperature
- minimum temperature
- maximum temperature
- target step

## Last observed climate behavior

Pressing the plus button displayed:

```text
Setze Zieltemperatur auf 22.5 °C …
```

The command appeared to be sent, but initially:

- the success message was not visibly displayed,
- the target temperature shown on the card did not change.

A follow-up patch was proposed to:

1. avoid immediately overwriting the success message,
2. update the target temperature optimistically,
3. temporarily block automatic refresh,
4. poll Home Assistant for state confirmation,
5. return HTTP 200 when confirmed,
6. return HTTP 202 when accepted but not yet confirmed.

The files reported as modified before the initial GitHub merge included:

```text
src/public/js/app.js
src/routes/api.js
src/server.js
.gitignore
```

These changes were later committed and pushed, but Codex must verify the exact
current implementation.

## First Codex task

1. Read `AGENTS.md`.
2. Read `README.md`.
3. Run `git status`.
4. Run `git log --oneline -10`.
5. Inspect the current climate implementation.
6. Determine whether the confirmation and optimistic-update patch exists.
7. Trace the complete request flow:
   - button click,
   - browser POST,
   - gateway validation,
   - Home Assistant service call,
   - response,
   - frontend update,
   - automatic refresh.
8. Implement only the smallest reliable correction.
9. Preserve ECMAScript 5 compatibility.
10. Preserve Safari iOS 9 compatibility.
11. Validate every modified JavaScript file with `node --check`.
12. Provide exact deployment and test commands.

## Verification commands

Repository:

```bash
git status
git log --oneline -10
```

Syntax:

```bash
node --check src/routes/api.js
node --check src/public/js/app.js
node --check src/public/js/widgets/climate.js
```

Service:

```bash
systemctl restart ha-legacy-dashboard.service
systemctl status ha-legacy-dashboard.service --no-pager -l
```

Logs:

```bash
journalctl -u ha-legacy-dashboard.service -n 100 --no-pager
```

API:

```bash
curl http://localhost:3000/api/status
curl -s http://localhost:3000/api/dashboard | jq
```

Climate endpoint:

```bash
curl -i   -X POST   -H "Content-Type: application/json"   -d '{
    "entity_id":"climate.esszimmer_thermostate",
    "temperature":22.5
  }'   http://localhost:3000/api/climate/temperature
```

## Deployment notes

Backend changes require:

```bash
systemctl restart ha-legacy-dashboard.service
```

Frontend-only changes normally do not require a service restart.

After frontend changes, increment asset version parameters in:

```text
src/public/index.html
```

This is necessary because Safari on iOS 9 caches JavaScript and CSS
aggressively.

## Security reminders

- Do not commit `.env`.
- Do not expose `HA_TOKEN`.
- Do not log secrets.
- Do not accept arbitrary Home Assistant services.
- Do not accept arbitrary writable entities.
- Keep all control endpoints allowlisted.

## Robustness and security controls

- `GET /api/status` checks Home Assistant and reports `online` or `degraded`.
- `/api/dashboard` includes `_meta.home_assistant`, `_meta.fetched_at`, and
  `_meta.failed_entities`.
- Fully failed refreshes preserve the last rendered cards in the browser.
- JSON request bodies are limited to 16 KB.
- HA writes are limited to 10 calls per allowlisted entity per 10 seconds.
- API responses use `Cache-Control: no-store`.
- Static and API responses receive CSP, frame, referrer, and nosniff headers.
- Logs are one-line JSON and redact fields whose names look like secrets.
- Browser and HA requests time out after 10 seconds.
