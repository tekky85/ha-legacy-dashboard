# HA Legacy Dashboard

A lightweight external dashboard application for Home Assistant, with a strong focus on legacy browsers and permanently installed wall displays.

## Overview

`ha-legacy-dashboard` runs as a standalone Node.js/Express gateway outside Home Assistant.

```text
Legacy Browser / Wall Tablet
        |
        | HTTP
        v
HA Legacy Dashboard Gateway
Node.js + Express
        |
        | Home Assistant API
        v
Home Assistant
```

The project is **not a Lovelace dashboard**, not a Custom Panel, and not an internal Home Assistant frontend. The Home Assistant token remains exclusively in the backend.

## Target Platform

- Apple iPad mini 1
- iOS 9.3.5
- Safari on iOS 9
- ECMAScript 5

The legacy frontend remains framework-free and uses the existing `Legacy.http` / `XMLHttpRequest` compatibility layer.

## Main Features

### User Dashboards

- multiple dashboards
- persistent configuration
- configurable widgets
- drag-and-drop grid layout
- portrait and landscape layouts
- configurable card sizes
- responsive compact / normal / expanded presentation
- Light and Climate control through explicitly allowed backend endpoints
- Light/Dark mode
- stale-data and reconnect behavior

### Admin Area

Dashboards and widgets are managed under `/admin`.

Features include:

- create, rename, duplicate and delete dashboards
- select the default dashboard
- browse entities
- add and edit widgets
- visibility and ordering
- card sizes
- drag-and-drop layout
- portrait / landscape layouts
- live card preview
- light / dark preview

### Summary Dashboard

```text
/system/summary
```

Shows currently relevant states such as:

- lights that are on
- relevant switches that are on
- open windows and doors
- active covers
- running vacuums
- active heating/cooling
- active media playback

### Errors / System Status Dashboard

```text
/system/errors
```

Shows, among other things:

- `unavailable`
- `unknown`
- security-relevant failures
- severity levels
- stale/offline conditions
- last successful update time

`unknown` and `unavailable` are intentionally treated as distinct states.

## Security Model

Mandatory rules:

- Home Assistant token only in the backend
- no direct browser connection to Home Assistant
- no generic HA service API
- writes only through explicit backend endpoints
- explicit entity/service allowlists
- entity visibility never grants write permission
- Admin token and HA token remain separate
- rate limits
- payload limits
- security headers
- secret redaction

```text
Entity visible != Entity writable
```

## Legacy Compatibility

The legacy frontend deliberately avoids:

- `fetch`
- `Promise`
- `async` / `await`
- arrow functions
- `let`
- `const`
- optional chaining
- nullish coalescing
- CSS Grid
- Flexbox `gap`
- ResizeObserver
- Container Queries

## Screenshots

Product screenshots must be real captures of the running application or a controlled demo/mock instance of the real application. Do not use generated mockups as product screenshots.

### User Dashboards

```text
docs/screenshots/dashboards/main-light.png
docs/screenshots/dashboards/main-dark.png
docs/screenshots/dashboards/compact-cards.png
docs/screenshots/dashboards/focus-card.png
```

### Admin

```text
docs/screenshots/admin/dashboard-management.png
docs/screenshots/admin/layout-editor.png
docs/screenshots/admin/live-preview.png
```

### System Dashboards

```text
docs/screenshots/system/summary.png
docs/screenshots/system/errors.png
```

Once files exist, they can be embedded, for example:

```md
![Dashboard – Light Mode](docs/screenshots/dashboards/main-light.png)
![Admin – Layout Editor](docs/screenshots/admin/layout-editor.png)
![Summary Dashboard](docs/screenshots/system/summary.png)
![Error Dashboard](docs/screenshots/system/errors.png)
```

## Screenshot Maintenance

For every sprint that visibly changes the UI, check:

1. Did a documented view change?
2. Is an existing screenshot outdated?
3. Is a new screenshot needed?
4. Are README references and filenames still correct?

Before committing screenshots, verify:

- no tokens
- no unwanted internal IP addresses
- no private person/device names
- no security-sensitive entity names
- no private media information
- no location data

Prefer demo entities or deliberately approved names.

## Recommended Screenshot Structure

```text
docs/
  screenshots/
    dashboards/
      main-light.png
      main-dark.png
      compact-cards.png
      focus-card.png
    admin/
      dashboard-management.png
      layout-editor.png
      live-preview.png
    system/
      summary.png
      errors.png
```

## Development

Before making changes, read at least:

```text
AGENTS.md
README.md
README.de.md
README.en.md
docs/CODEX_HANDOFF.md
docs/SPRINT_ROADMAP.md
docs/PROJECT_STATUS.md
```

Sprint specifications:

```text
docs/sprints/
```

## Tests

Automated tests cover areas such as the gateway, dashboard configuration, security, Climate, Light, Admin, layout, system dashboards, stale/offline behavior, and local Home Assistant mocks.

Production credentials must never be used for local integration tests.

## Deployment

Standalone operation supports Debian-based LXC/VM systems with systemd. The architecture also remains suitable for future Home Assistant App packaging.

## Project Status and Roadmap

- Technical status: `docs/PROJECT_STATUS.md`
- Roadmap: `docs/SPRINT_ROADMAP.md`

## Language

- [Deutsch](README.de.md)
