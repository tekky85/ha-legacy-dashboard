# Changelog

This file records the implemented project baseline. No release dates or Git
release tags have been assigned.

## 1.0.0

- Initial Gateway: added the Node.js and Express gateway between legacy
  browsers and Home Assistant.
- Legacy Dashboard: added a responsive, touch-friendly card dashboard without
  external frontend dependencies.
- Theme: added light and dark modes with safe local persistence.
- Widgets: added sensor and binary-sensor cards with inline SVG icons.
- Climate: added allowlisted target-temperature control, backend validation,
  optimistic updates, and protection from stale refresh responses.
- Standalone: added iOS home-screen metadata, local application icons, and a
  web app manifest.
- Light: added an allowlisted optimistic on/off control.
- Security/Robustness: added security headers, payload limits, write rate
  limits, structured redacted logs, partial-failure handling, and stale-data
  retention.
- Tests: added local mock-based gateway, frontend-flow, configuration,
  security, standalone, and deployment coverage without production
  credentials.
- Deployment: added systemd assets, fast-forward deployment, health checks,
  CI, and recoverable rollback.
- Wall Display: added a compact clock, date, connection state, and automatic
  recovery display.
- Sprint 12 UI Polish: centered the thermostat controls, compacted the climate
  card, and reduced general card whitespace while retaining 44-pixel touch
  targets and Safari iOS 9 compatibility.
- Sprint 13 Multi-Dashboard Foundation: added static named dashboard profiles,
  stable `/d/:dashboardId` URLs, dashboard-specific read APIs, a public
  dashboard list, and backward-compatible default-dashboard routes without
  changing write allowlists.
- Sprint 14 Persistent Configuration: added schema-versioned atomic JSON
  persistence with stable widget IDs and one valid backup, plus an opt-in
  Bearer-protected Admin API and sanitized Home Assistant entity inventory.
- Sprint 15 Admin Configuration UI: added the separate modern `/admin`
  interface with session-scoped Bearer authentication, dashboard and widget
  draft editing, sanitized entity search, and explicit save/discard without
  changing Home Assistant write allowlists.
- Sprint 16–17.1 Layout: added validated tile presets, persistent responsive
  grid layouts, modern Admin drag/resize editing, and adaptive legacy-card
  content while retaining Safari iOS 9 compatibility.
- Sprint 18 System Dashboard Foundation: added fixed read-only Summary and
  Systemstatus routes backed by one normalized, cached Home Assistant
  snapshot with stale/offline/recovery semantics.
- Sprint 19 Summary Dashboard MVP: added explicit read-only activity rules,
  deterministic priority/category grouping, compact legacy rendering,
  persistent ignored entities, and privacy-safe media-title opt-in without
  extending Home Assistant write permissions.
- Sprint 24 Home Assistant App Packaging: added a local amd64/aarch64 App
  package, central Standalone/Supervisor connection resolution, backend-only
  `SUPERVISOR_TOKEN` handling, `/data` persistence, a direct LAN port, process
  healthcheck, and graceful container shutdown while preserving the existing
  LXC deployment and write allowlists.
