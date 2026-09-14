# Changelog

All notable user-facing changes are documented here. Release tags follow
Semantic Versioning and use the `vMAJOR.MINOR.PATCH` form.

## Unreleased

No user-facing changes have been recorded after the current public test
release.

## 1.0.0-rc.7 – 2026-09-14

This candidate replaces the unpublished RC.6 build without moving or reusing
its public tag. Application behavior is identical to RC.6.

### Release hardening

- Made manifest publication, container smoke testing, and candidate evidence
  explicitly continue after successful predecessor jobs even when the
  non-matching Stable channel gate is intentionally skipped.
- Extended workflow regressions across every post-gate release boundary.

## 1.0.0-rc.6 – 2026-09-14

This candidate replaces the unpublished RC.5 build without moving or reusing
its public tag. Application behavior is identical to RC.5.

### Release hardening

- Made the architecture-image jobs explicitly depend on successful validation
  and channel gates even when the non-matching Stable gate is intentionally
  skipped for a release candidate.
- Added a regression assertion for the exact RC workflow state that prevented
  RC.5 from publishing images and release artifacts.

## 1.0.0-rc.5 – 2026-09-14

This candidate replaces the unpublished RC.4 build without moving or reusing
its public tag. Application behavior is identical to RC.4.

### Release hardening

- Made the source-identity regression tests valid both immediately before and
  immediately after creation of the immutable release tag.
- Preserved the failed RC.4 workflow as public evidence instead of rewriting
  its tag or source commit.

## 1.0.0-rc.4 – 2026-09-14

This release candidate brings the completed Sprint 27.1 repair and audit
hardening after RC.3 into one immutable candidate for real-device testing.

### Fixed

- Corrected compact Room Card content priority and clipping found by the real
  browser card matrix.
- Required the same immutable frontend asset generation across Dashboard,
  System, Admin, and HomeScreen entry points.
- Repaired backend WebSocket error-only recovery, rule-source explanations,
  dynamic automation uncertainty, and fresh automation impact state.

### Changed

- Added complete requirement traceability for Summary, Errors, Registry,
  Rules, Automation, HomeScreen, backgrounds, and release validation.
- Expanded the executable card matrix to all five production renderers, 316
  valid sizes, and 1,576 representative state/capability cases.
- Rebuilt the product screenshot gallery from a controlled local instance of
  the real application with privacy-scanned demo data.

### Release hardening

- Added a protected Stable approval gate tied to manual results, open P0/P1
  repairs, source commit, image digest, and standalone checksum.
- Added Git-based source/tag identity and immutable GitHub Release/GHCR target
  checks so an older release version cannot silently represent newer code.
- Added generated RC evidence binding one commit, tag, image manifest,
  standalone checksum, and workflow run while leaving real-device results
  explicitly `NOT TESTED`.

### Security

- No Home Assistant write capability or App permission was added.
- Home Assistant, Supervisor, and Admin credentials remain backend-only;
  release tests and artifacts contain no production secrets.

## 1.0.0-rc.3 – 2026-09-10

This release candidate supersedes `1.0.0-rc.2` as the reproducible public test
release. Runtime features and security boundaries are unchanged.

### Fixed

- Normalized the informational gzip OS header byte so the standalone archive
  is byte-identical across macOS and Linux for identical release sources.
- Added a cross-platform header regression after independent verification of
  the published `1.0.0-rc.2` artifact.

## 1.0.0-rc.2 – 2026-09-10

This release candidate is a public test release, not a stable release.

### Changed

- Replaced test-entity-specific Light/Climate authorization with persistent,
  server-validated control grants shared by Grid, Focus, and Room Cards.
- Derived Climate Power and target-temperature eligibility from each entity's
  actual HVAC modes, supported features, and temperature constraints.
- Added five dimension-aware wall-card presentation tiers and a deliberate
  large Climate layout across every valid portrait and landscape grid size.
- Hardened long sensor values, units, binary states, and Climate controls
  against overflow while retaining approximately 44-pixel touch targets.

### Added

- Added persistent per-dashboard sections with optional titles, safe
  unassigned-card handling, and read-only Home Assistant Area references.
- Added section creation, ordering, deletion, and widget assignment to the
  protected Admin editor.
- Added native Room Cards with optional read-only Area auto-setup, explicit
  entity roles, collapsed/expanded views, section integration, and responsive
  compact through large presentations.
- Added secure per-Room Card JPEG/PNG backgrounds by reusing the existing
  validated and atomic background storage.
- Added a test-only Card Matrix harness covering all 1,128 supported
  renderer, size, profile, and representative-state combinations.

### Security

- Visibility no longer implies writes: Light, Climate, and Room Card controls
  require an explicit persisted grant and still use only narrow service routes.
- Removed production authorization dependencies on fixed test entity IDs;
  no generic Home Assistant service proxy was added.
- Room Cards use the cached normalized system snapshot and central issue/risk
  rules without exposing HA credentials, registries, or generic services.

### Fixed

- Fixed Room Card expansion whose detail panel could shrink to zero height in
  the fixed legacy grid, including Compact cards and long scrollable details.
- Applied Room Card backgrounds through a dedicated inner layer and CSP-safe
  controller path so runtime matches the working Admin preview.
- Kept Climate target controls available while a supported thermostat is off,
  without powering it on, and restored the confirmed value after rejection.
- Hid fake Climate Power controls when an entity has no real `off` mode and
  avoided forcing unsupported `heat` modes.
- Accept normal baseline and progressive JPEG backgrounds with JFIF, EXIF,
  orientation, embedded metadata thumbnails, and ICC profiles while retaining
  structural validation and atomic rollback behavior.

### Documentation

- Documented the HAOS direct-LAN dual-stack case where `.local` resolves to
  IPv4 and IPv6 but the published App port is reachable through IPv4 only.
- Added self-contained German and English standalone installation, upgrade,
  backup, and rollback instructions to the release archive.

### Release hardening

- Hardened PNG validation and last-valid background replacement.
- Unified immutable asset versions across Dashboard, System, Admin, and the
  HomeScreen manifest.
- Repaired backend WebSocket recovery, rule-source diagnostics, dynamic
  automation uncertainty, and fresh automation impact state.
- Separated local Supervisor source builds from the production GHCR image,
  added real cross-version persistence/rollback fixtures, and updated the
  production dependency gate to report zero known vulnerabilities.

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
