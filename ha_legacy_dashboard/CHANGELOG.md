# Changelog

## Unreleased

No user-facing changes have been recorded after the current public test
release.

## 1.0.0-rc.5 – 2026-09-14

This candidate replaces the unpublished RC.4 build without moving its public
tag. Runtime behavior is unchanged; the release source-identity test now
supports both the pre-tag and post-tag states used by the protected workflow.

## 1.0.0-rc.4 – 2026-09-14

This release candidate combines all completed Sprint 27.1 repair hardening
after RC.3 for Home Assistant App and legacy wall-display validation.

### Fixed

- Corrected compact Room Card presentation uncovered by the real browser
  matrix and retained shared Grid/Focus/Room capability handling.
- Hardened backend WebSocket recovery and sanitized rule/automation diagnostic
  freshness without changing Home Assistant write boundaries.

### Release hardening

- Added full multi-renderer browser coverage, source/tag identity checks,
  immutable release targets, candidate-bound evidence, and the protected
  Stable approval gate.
- Preserved the minimal `homeassistant_api: true` App permission and direct LAN
  access; no token, default Admin secret, or production data is packaged.

## 1.0.0-rc.3 – 2026-09-10

This release candidate supersedes `1.0.0-rc.2` as the reproducible public test
release. App runtime behavior and permissions are unchanged; the release
bundle now has a platform-neutral gzip header.

## 1.0.0-rc.2 – 2026-09-10

This release candidate is a public test release, not a stable release.

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

- Fixed Room Card collapse/expand visibility and applied room backgrounds
  through the CSP-safe runtime controller path.
- Enabled supported off-state Climate setpoints without powering on, restored
  confirmed values after rejection, and hid fake Power controls without `off`.
- Hardened JPEG background validation for baseline, progressive, JFIF, EXIF,
  orientation, embedded thumbnail, and ICC variants without weakening malformed
  or disguised-file rejection.

### Documentation

- Clarified direct-LAN hostname diagnostics when `.local` returns both IPv4
  and IPv6 but the published App port is reachable through IPv4 only.
- Added self-contained standalone installation, upgrade, backup, and rollback
  instructions to the release bundle.

### Release hardening

- Hardened PNG validation and last-valid background replacement.
- Unified immutable frontend asset versions across all entry points.
- Repaired backend WebSocket recovery and sanitized diagnostics freshness.
- Separated local Supervisor source builds from the production GHCR image,
  added cross-version persistence/rollback coverage, and removed known
  production dependency advisories.

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
