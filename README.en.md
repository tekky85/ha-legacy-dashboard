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
- independent viewport-aware Focus view with prioritized values and controls
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
- read-only status of diagnostic Home Assistant sources

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

### Registry and Diagnostic Enrichment

The gateway enriches REST-based state data on the server with read-only
metadata from the Entity, Device and Area Registries, Config Entries and,
when supported, Home Assistant Repairs. A single authenticated Home Assistant
WebSocket connection exists exclusively in the backend. The browser receives
neither WebSocket access nor credentials or raw registry data.

Sources are capability-driven and cached independently:

- Entity, Device and Area Registries: 60 seconds
- Config Entries: 30 seconds
- Repairs: 30 seconds
- Matter diagnostics: 60 seconds or controlled `unsupported`

Partial failures leave the existing REST state snapshot, Summary and System
Status operational. Entity issues can therefore show device, area,
integration and platform context. Disabled entities are not treated as
`unavailable`, and registry entries without a state are not automatically
classified as orphaned. Config Entry problems and Repairs remain notices only,
without reload, reauthentication, repair or Matter actions.

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
- Home Assistant WebSocket exclusively in the backend
- registries, Config Entries, Repairs and Matter are read-only in Sprint 21
- no raw registry API or generic WebSocket command API

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

The current gallery was captured from the unchanged application using a local, controlled Home Assistant mock with fake credentials. It contains no production data.

### User Dashboards

#### Light Mode

![User dashboard in light mode](docs/screenshots/dashboards/main-light.png)

#### Dark Mode

![User dashboard in dark mode](docs/screenshots/dashboards/main-dark.png)

#### Compact Cards in Landscape Layout

![Compact cards in landscape layout](docs/screenshots/dashboards/compact-cards.png)

#### Focus Card

The Focus view is a separate interaction view: it is rebuilt from the widget
definition, current state and server-determined capabilities, and it clones
neither Grid DOM nor Grid geometry. Its own Focus classes, actual viewport
dimensions and explicit shrink protection keep core values and allowed
controls reachable in Mobile Safari while preserving the dashboard position.
Automated checks cover 768×1024, 1024×768 and the small 320×460 legacy
viewport; physical Safari acceptance remains part of the device rollout.

![Open focus card](docs/screenshots/dashboards/focus-card.png)

### Admin

#### Dashboard Management

![Dashboard management in the Admin area](docs/screenshots/admin/dashboard-management.png)

#### Layout Editor

![Grid-based layout editor](docs/screenshots/admin/layout-editor.png)

#### Live Preview

![Live preview in landscape and dark mode](docs/screenshots/admin/live-preview.png)

#### Diagnostic Sources

![Read-only status of diagnostic Home Assistant sources](docs/screenshots/admin/system-diagnostics.png)

### System Dashboards

#### Summary

![Summary Dashboard with active states](docs/screenshots/system/summary.png)

#### System Status

![Error Dashboard with unavailable and unknown states](docs/screenshots/system/errors.png)

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
      system-diagnostics.png
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

Standalone operation requires Node.js 22 or newer and supports Debian-based
LXC/VM systems with systemd. The architecture also remains suitable for future
Home Assistant App packaging.

## Project Status and Roadmap

- Technical status: `docs/PROJECT_STATUS.md`
- Roadmap: `docs/SPRINT_ROADMAP.md`

## Language

- [Deutsch](README.de.md)
