# Changelog

## Unreleased

### Added

- Added persistent logical dashboard sections with optional Home Assistant
  Area references and safe unassigned-card fallback.
- Added native Room Cards with optional Area-based read-only suggestions,
  collapsible details, section support, and secure JPEG/PNG backgrounds.

### Security

- Light, Climate, and Room Card writes require explicit persistent control
  grants and remain restricted to narrow domain-specific service routes.
- Production authorization no longer depends on fixed test entity IDs, and no
  generic Home Assistant service proxy was added.

### Changed

- Derived Climate Power and target-temperature support from actual entity
  capabilities and entity-specific constraints.
- Hardened responsive Sensor, Binary, Light, and Climate card presentations
  across every valid portrait and landscape grid size.

### Fixed

- Enabled supported off-state Climate setpoints without powering on, restored
  confirmed values after rejection, and hid fake Power controls without `off`.
- Hardened JPEG background validation for baseline, progressive, JFIF, EXIF,
  orientation, embedded thumbnail, and ICC variants without weakening malformed
  or disguised-file rejection.

### Documentation

- Clarified direct-LAN hostname diagnostics when `.local` returns both IPv4
  and IPv6 but the published App port is reachable through IPv4 only.

## 1.0.0-rc.1 – 2026-08-25

### Added

- First release-candidate package for the Custom Home Assistant App Repository.
- Generic amd64/aarch64 GHCR image built from the project Dockerfile.
- Direct configurable LAN access for legacy wall displays.
- Persistent dashboard and rule configuration under `/data`.
- Read-only Supervisor Core REST and WebSocket proxy connectivity.

### Security

- Only `homeassistant_api: true` is requested.
- `SUPERVISOR_TOKEN` remains backend-only and is never an App option.
- The Admin API remains disabled by default and requires a separate secret.
