# Changelog

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
