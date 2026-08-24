# HA Legacy Dashboard

A lightweight external dashboard application for Home Assistant, with a strong focus on legacy browsers and permanently installed wall displays.

## Overview

`ha-legacy-dashboard` uses the same Node.js/Express gateway in both runtime
modes:

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

- **Home Assistant App:** Home Assistant OS starts the container. The backend
  uses only the Supervisor Core REST/WebSocket proxies and the server-side
  `SUPERVISOR_TOKEN`; no Long-Lived Access Token needs to be configured
  manually.
- **Standalone:** Node.js, LXC, VM, or Docker continues to use `HA_URL` and a
  backend-only `HA_TOKEN`.

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
- shared SVG-based Power Control for Light and Climate in Grid and Focus
- Light and Climate control through explicitly allowed backend endpoints
- Light/Dark mode
- stale-data and reconnect behavior

Every default and custom dashboard has a neutral, always-visible Summary
navigation control in its header. A compact Errors / Health indicator appears
beside it only for `warning`, `error`, or `critical`. `info` notices alone do
not trigger the alarm indicator. Stale or not-yet-known health remains visible,
so an absent indicator means “all clear” only when the data is fresh and
reliable.

Summary and System Status carry the exact internal source path as a validated
return target. They therefore return reliably to both the default dashboard
and `/d/<dashboard-id>`. External, protocol-relative, unknown, or otherwise
invalid targets are rejected in both the server and browser and safely fall
back to `/`. The indicator uses only `GET /api/system-dashboards/status` and
its reduced severity overview; complete Summary or Errors payloads are not
loaded for header navigation.

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
- searchable Entity Rule Manager for Summary ignore, security relevance,
  Errors ignore, Expected Offline, and entity/device grace, flapping, and
  recovery rules
- combinable area, domain, and device search plus a configured-entities-only
  filter
- local change buffer with shared Save and Discard actions
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

The existing normalized categories can be filtered directly by All, Open,
Light & Power, Active, Climate, Media, and Security. Filters and views switch
without another Home Assistant request. Summary has its own safely persisted
1/2/3-column view and falls back in a controlled manner on narrow viewports.
The total appears exactly once in the shared header; the All filter does not
repeat it.
The `← Back` navigation item returns to the validated source dashboard.

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
- separate, combinable filters for severity (All, Critical, Error, Warning,
  Info) and state (All, Unavailable, Unknown)
- compact Device Cards for entity issues sharing the same real `device_id`
- child-entity details collapsed by default
- a separately persisted 1/2/3-column view with responsive fallback

The total likewise appears only once in the header. The All filters do not
repeat it, while the severity subsets and the `Unavailable` and `Unknown`
states retain their own counts.
The `← Back` navigation item uses the same safe return target as Summary.

`unknown` and `unavailable` are intentionally treated as distinct states.
Entities without a `device_id`, as well as Config Entry, Repair, and Matter
notices, remain visible as standalone issues. Grouping is strictly a read-only
presentation layer and changes neither severity rules nor write permissions.

The Admin UI can set critical detection to either `device_class` or
`ha_label`. Device-class mode uses reliable metadata only: safety sensors such
as smoke, CO, gas, or moisture, as well as security sensors and matching
covers such as doors, windows, openings, garage doors, or gates, become
`critical` for `unknown` and `unavailable`; `problem`, `tamper`, `shade`, and
`shutter` do not do so automatically. Label mode stores the stable ID of an
existing Home Assistant label. The gateway reads its device and entity
assignments but never writes labels; area labels are not inherited. Explicit
`securityEntities` retain priority, and device classes are not applied in
parallel in label mode. Missing label metadata or a deleted label is surfaced
as an error, while the last successful cache remains in use fail-safe.

### Grace Periods, Flapping, and Recovery

Issue evaluation is centralized in the backend. `unknown` and `unavailable`
have separate grace periods: the defaults are 15/30 seconds for normal and
30/60 seconds for diagnostic entities. Safety reports both states without a
grace period; Security reports `unknown` immediately and `unavailable` after
5 seconds. This suppresses short radio or integration interruptions without
hiding safety/security sensors behind long delays.

The binding priority is entity, device, explicit security marking, critical
detection mode, risk class, domain, and global default. Entity and device
rules can override grace periods, the default 10-second recovery delay, and
the flapping threshold/window. Four transitions within ten minutes are
flapping by default; at most 16 transitions per entity are held transiently
in memory. Home Assistant history is never queried, and this history may be
lost when the gateway restarts.

`Expected Offline` suppresses only an expected `unavailable`; `unknown`
remains eligible for evaluation. `Ignore`, by contrast, removes the entity
from Errors evaluation completely. Safety/security entities require a second,
explicit confirmation before Expected Offline can suppress them. Neither
setting grants Home Assistant write permission.

Device Cards count unavailable, unknown, flapping, and pending recovery. If
at least two entities and at least 70 percent of all enabled entities sharing
a real `device_id` are unavailable, the UI shows only the conservative hint
that several entities of the device cannot be reached; it does not claim a
confirmed physical device outage.

### Registry and Diagnostic Enrichment

The gateway enriches REST-based state data on the server with read-only
metadata from the Entity, Device, Area and Label Registries, Config Entries and,
when supported, Home Assistant Repairs. A single authenticated Home Assistant
WebSocket connection exists exclusively in the backend. The browser receives
neither WebSocket access nor credentials or raw registry data.

Sources are capability-driven and cached independently:

- Entity, Device, Area and Label Registries: 60 seconds
- Config Entries: 30 seconds
- Repairs: 30 seconds
- Matter diagnostics: 60 seconds or controlled `unsupported`

Partial failures leave the existing REST state snapshot, Summary and System
Status operational. Entity issues can therefore show device, area,
integration and platform context and are combined into Device Cards in System
Status exclusively through their real `device_id`. Disabled entities are not treated as
`unavailable`, and registry entries without a state are not automatically
classified as orphaned. Config Entry problems and Repairs remain notices only,
without reload, reauthentication, repair or Matter actions.

### Automation Impact and Advanced Diagnostics

System Status analyses automations entirely read-only. The inventory comes
from the existing state snapshot; explicit `entity_id`, `device_id`, `area_id`,
and `label_id` references are read from capability-probed automation
configuration and placed into server-side indexes. Direct entity/device
references and indirect area/label references are clearly distinguished.
Dynamic templates and blueprints are not interpreted and are marked as
incomplete or unknown.

Device Cards and standalone entity issues only show which automations may
reference the affected entity or device; they never claim causation. An
automation in the `off` state is merely disabled and is not an error.
`unavailable` may become a diagnostic issue after the existing grace/risk
rules. The age or absence of `last_triggered` never creates severity by itself.

Small Trace Summaries are loaded only when “Advanced Diagnostics” is opened,
cached independently for 30 seconds, and reported as available or unsupported
through capability detection. Condition-false and not-triggered are normal
control flow. Raw automation configuration, trace variables, action/service
data, and complete trace payloads are never sent to the browser. Triggering,
enabling, disabling, reloading, or editing automations remains explicitly
impossible.

## Security Model

Mandatory rules:

- Home Assistant token only in the backend
- `SUPERVISOR_TOKEN` only in the backend in App mode
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

Light and Climate use the same real Power button with a fixed-size inline SVG
in Grid and Focus. Centering and rendering therefore do not depend on Unicode
glyphs, font baselines or native Safari button padding. A shared control
hierarchy separately centers the full control zone, its group, and the button
content. Native buttons are no longer the Flexbox layout container, avoiding
the unreliable internal button box in older Mobile Safari versions. The
independent Focus geometry remains unchanged.

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

#### Entity Rule Manager

![Searchable Entity Rule Manager with batch save](docs/screenshots/admin/entity-rules.png)

### System Dashboards

#### Summary

![Summary Dashboard with active states](docs/screenshots/system/summary.png)

#### System Status

![Error Dashboard with a warning state](docs/screenshots/system/errors.png)

#### Automation Impact and Advanced Diagnostics

![Expanded automation impact and normalized diagnostic information](docs/screenshots/system/errors-automation-impact.png)

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
      errors-automation-impact.png
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

### Installation A – Home Assistant App

The local App package lives in `ha_legacy_dashboard/` and supports `amd64` and
`aarch64`. It requests only `homeassistant_api: true`, uses neither Ingress nor
host/Docker/Supervisor API privileges, and exposes configurable `3000/tcp` for
direct LAN access. Persistent configuration is stored at
`/data/dashboards.json` and is covered by the standard Home Assistant App
backup mechanism.

Sprint 24 provides local development/test packaging; public repository and
image distribution follows in Sprint 25. Controlled local installation is
documented in `ha_legacy_dashboard/DOCS.md`.

Important: the Home Assistant App has its own data area. Existing
standalone/LXC configuration is not imported automatically.

### Installation B – Standalone

Standalone operation requires Node.js 22 or newer and supports Debian-based
LXC/VM systems with systemd. `HA_URL` and `HA_TOKEN` remain in the server-side
`.env`, and the existing default `data/dashboards.json` path is unchanged.

Complete instructions: `docs/DEPLOYMENT.md`.

## Project Status and Roadmap

- Technical status: `docs/PROJECT_STATUS.md`
- Roadmap: `docs/SPRINT_ROADMAP.md`

## Language

- [Deutsch](README.de.md)
