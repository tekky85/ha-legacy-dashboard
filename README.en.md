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

## Choose an Installation

- **Home Assistant OS:** install it as a custom Home Assistant App using the
  [Custom App Repository link](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https%3A%2F%2Fgithub.com%2Ftekky85%2Fha-legacy-dashboard).
- **LXC, VM, or your own Linux server:** use the versioned standalone bundle
  from [GitHub Releases](https://github.com/tekky85/ha-legacy-dashboard/releases).

This project is a Custom App Repository, not an official Home Assistant App.

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
- persistent, freely named sections per dashboard
- configurable widgets
- drag-and-drop grid layout
- portrait and landscape layouts
- configurable card sizes
- responsive compact / standard / wide / tall / large presentation
- independent viewport-aware Focus view with prioritized values and controls
- shared SVG-based Power Control for Light and Climate in Grid and Focus
- Light and Climate control through explicitly allowed backend endpoints
- one independent JPEG/PNG background image per default or custom dashboard
- selectable image position, cover/contain, and optional dark overlay
- a title that can be shown or hidden per dashboard
- viewport-filling presentation with a quiet update footer at the bottom for
  short content and normal scrolling for many cards
- Light/Dark mode
- stale-data and reconnect behavior

Light and Dark are one global browser preference for `/`, every
`/d/<dashboard-id>` route, Summary, and System Status. The selection is loaded
early before rendering from the existing `ha-legacy-theme` key. If an older
Safari exposes `localStorage` but rejects writes, a same-name, non-sensitive
root-path cookie copy keeps the selection stable across refresh and internal
navigation. If both storage paths are unavailable, the current view remains
operable without crashing.

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

All internal dashboard, Summary, System Status, and Back links use validated,
root-relative paths and open in the same window. On older iPads launched from
a HomeScreen icon, this keeps the same standalone/fullscreen context as well
as the same protocol, host, and port. The direct LAN web UI therefore remains
independent of Home Assistant Ingress; internal navigation uses neither
`target="_blank"` nor `window.open()`.

Dashboard backgrounds are uploaded through the protected Admin area and
stored independently per dashboard. The normal wall display receives only a
controlled, read-only image URL; neither the data path nor tokens are exposed.
Hiding a title removes only its unused space. Summary navigation, the Health
indicator, connection state, and theme toggle remain available.

Every default and custom dashboard can optionally be divided into vertically
arranged sections such as rooms, floors, or functional groups. Each section
uses the existing portrait/landscape grid internally and can show or hide its
title. Widgets can move between sections or deliberately remain Unassigned.
Dashboards without sections render unchanged in the previous grid. Deleting a
section retains every widget and safely returns it to the unassigned area.

A section may optionally store the ID of an existing Home Assistant Area as a
read-only metadata reference. A section and an HA Area remain separate
concepts: sections work without an Area, and the dashboard never creates,
renames, or modifies Home Assistant Areas.

### iPad mini as a Wall Display

For one iPad mini 1 running iOS 9.3.5, **Guided Access** is the recommended
practical kiosk mode. Launch the dashboard from its HomeScreen icon first,
then lock it with a triple-click of the Home button. A normal Home-button press
must no longer leave the web app; Touch must remain enabled for navigation and
Light/Climate controls.

Guided Access is not a guaranteed auto-start kiosk after an iPad reboot or
power loss. The operator may need to unlock the device, launch the HomeScreen
web app again, and start a new Guided Access session. For multiple centrally
managed devices, Supervision plus Single App Mode/App Lock through Apple
Configurator or MDM is the stronger alternative. Neither approach
automatically stores Admin or Home Assistant credentials on the iPad.

The historical iOS 9 menu paths, recommended button/Touch/rotation options,
recovery limits, and mandatory real-device checklist are documented in
[`docs/IPAD_KIOSK.md`](docs/IPAD_KIOSK.md).

### Admin Area

Dashboards and widgets are managed under `/admin`.

Features include:

- create, rename, duplicate and delete dashboards
- select the default dashboard
- create, rename, order, and safely delete sections
- assign or move widgets between sections, or leave them unassigned
- optionally reference existing Home Assistant Areas read-only
- browse entities
- add and edit widgets
- visibility and ordering
- card sizes
- drag-and-drop layout
- portrait / landscape layouts
- live card preview
- light / dark preview
- upload, preview, replace, or remove JPEG/PNG backgrounds
- image position, cover/contain, overlay, and title visibility per dashboard
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

The four severity subsets are exact filters: `Critical` shows only
`critical`, `Error` only `error`, `Warning` only `warning`, and `Info` only
`info`. Severity and state are combined with AND on the same child issue. For
Device Cards, child issues are filtered first; the count, visible severity,
and expanded details are then derived only from those matches. This changes
neither the unfiltered overall status nor the global Health indicator.

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

#### Per-Dashboard Background

Every default and custom dashboard can use its own JPEG or PNG image,
position, cover/contain mode, overlay strength and optional title display.
The background remains behind navigation, the Health Indicator, cards and the
Focus view.

![User dashboard with a per-dashboard background](docs/screenshots/dashboards/background-image.png)

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

#### Dashboard Background

![Background upload and display settings in the Admin area](docs/screenshots/admin/dashboard-background.png)

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
      background-image.png
      compact-cards.png
      focus-card.png
    admin/
      dashboard-management.png
      dashboard-background.png
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

The App package under `ha_legacy_dashboard/` uses the generic multi-architecture
image `ghcr.io/tekky85/ha-legacy-dashboard` for `amd64` and `aarch64`. Add the
repository, refresh the App store, install **HA Legacy Dashboard**, check the
network port, start it, and inspect its logs. Port `3000/tcp` remains
configurable for direct LAN access.

For wall displays, a reserved/static IPv4 address or a local DNS name with an
unambiguous A record is the most reliable choice. A `.local` name can return
both IPv4 and IPv6 even when the published App port is reachable on the HAOS
host through IPv4 only. In that case the IP URL or an IPv4-forced test works,
while the browser may choose an unreachable IPv6 address for the hostname.
This is not a reason to enable host networking or broader App privileges;
check A/AAAA resolution and port 3000 separately.

The App requests only `homeassistant_api: true` and uses neither Ingress nor
host, Docker, or Supervisor API privileges. Persistent configuration is stored
at `/data/dashboards.json`, with background images under `/data/backgrounds/`;
both are covered by Home Assistant backups. Create a
backup before installing a release candidate and before every upgrade.

Important: the Home Assistant App has its own data area. Existing
standalone/LXC configuration is not imported automatically.

### Installation B – Standalone

Standalone operation requires Node.js 22 or newer. Download the release bundle
and `SHA256SUMS`, verify the checksum, extract it, configure `.env.example` as
a server-side `.env`, and run `npm ci --omit=dev`. Debian-based LXC/VM systems
can use the included systemd unit. `HA_URL` and `HA_TOKEN` remain in the
protected `.env`, and `data/dashboards.json` remains unchanged during upgrades.
Background images are stored under `data/backgrounds/` by default. `DATA_DIR`
can override the shared persistent data path for both configuration and images.

Back up `.env` and `data` before an upgrade. Prefer extracting new releases
into a new directory and retire the old runtime only after a successful health
check. For rollback, activate the old release and matching configuration
backup.

Complete instructions: `docs/DEPLOYMENT.md` and `docs/RELEASING.md`.

## Releases, Support, and License

Release candidates and stable releases use SemVer tags. Every release contains
a versioned standalone archive and `SHA256SUMS`; containers are available as
`ghcr.io/tekky85/ha-legacy-dashboard:<version>`. RC versions never update
`latest`. Report bugs through
[GitHub Issues](https://github.com/tekky85/ha-legacy-dashboard/issues).

The source code is available under the [ISC License](LICENSE). Home Assistant
and Supervisor credentials remain backend-only in every distribution mode.
The project contains no telemetry or analytics.

## Project Status and Roadmap

- Technical status: `docs/PROJECT_STATUS.md`
- Roadmap: `docs/SPRINT_ROADMAP.md`

## Language

- [Deutsch](README.de.md)
