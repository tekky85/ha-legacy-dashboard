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
