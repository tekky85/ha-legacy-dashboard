# Changelog

All notable user-facing changes are documented here. Release tags follow
Semantic Versioning and use the `vMAJOR.MINOR.PATCH` form.

## Unreleased

### Changed

- Added five dimension-aware wall-card presentation tiers and a deliberate
  large Climate layout across every valid portrait and landscape grid size.
- Hardened long sensor values, units, binary states, and Climate controls
  against overflow while retaining approximately 44-pixel touch targets.

### Added

- Added persistent per-dashboard sections with optional titles, safe
  unassigned-card handling, and read-only Home Assistant Area references.
- Added section creation, ordering, deletion, and widget assignment to the
  protected Admin editor.
- Added a test-only Card Matrix harness covering all 1,128 supported
  renderer, size, profile, and representative-state combinations.

### Fixed

- Accept normal baseline and progressive JPEG backgrounds with JFIF, EXIF,
  orientation, embedded metadata thumbnails, and ICC profiles while retaining
  structural validation and atomic rollback behavior.

### Documentation

- Documented the HAOS direct-LAN dual-stack case where `.local` resolves to
  IPv4 and IPv6 but the published App port is reachable through IPv4 only.

## 1.0.0-rc.1 – 2026-08-25

### Added

- Responsive legacy dashboard for selected sensors, binary sensors, lights,
  and climate entities, including dedicated Focus views.
- Persistent multi-dashboard configuration and a protected Admin interface.
- Read-only Summary, health, device diagnostics, Repairs, Matter metadata,
  automation impact, and normalized trace summaries.
- Standalone Node.js/LXC deployment with systemd health checks and rollback.
- Custom Home Assistant App packaging with direct LAN access, `/data`
  persistence, and Supervisor Core REST/WebSocket proxy support.
- Reproducible BuildKit release pipeline for amd64 and aarch64, a generic GHCR
  multi-architecture image, standalone archive, and SHA256 checksums.

### Changed

- Centralized issue evaluation with risk-aware grace periods, expected-offline
  rules, flapping detection, stable recovery, and device aggregation.
- Hardened Focus and control layout for older Mobile Safari versions.
- Defined `1.0.0-rc.1` as the first externally testable release candidate;
  no earlier Git tag or published release exists.

### Fixed

- Prevented stale Home Assistant refreshes from overwriting optimistic climate
  and light control feedback.
- Corrected legacy Safari centering and sizing regressions in Grid and Focus.

### Security

- Home Assistant and Supervisor credentials remain backend-only.
- Write actions remain limited to explicit service and entity allowlists.
- Release gates reject tracked private keys, `.env` files, common token
  patterns, inconsistent versions, and unverified release artifacts.

### Upgrade notes

- Standalone data stays in the configured `data` directory; App data stays in
  `/data`. Neither release bundle nor container image replaces these paths.
- Standalone data is not imported automatically into the Home Assistant App.
- Create a backup before upgrading or moving between deployment modes.

### Known issues

- Stable release still requires physical iOS 9 Safari and test-HAOS acceptance.
- Real aarch64 HAOS runtime acceptance is manual; CI builds and validates the
  arm64 image and multi-architecture manifest without contacting production HA.
