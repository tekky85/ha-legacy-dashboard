# HA Legacy Dashboard – Home Assistant App

## Scope

This package is the local/development Home Assistant App variant. Public App
repository distribution and published multi-architecture images are planned
for Sprint 25.

## Installation for local testing

1. Check out the repository on a development machine.
2. Run `./deploy/prepare-home-assistant-app.sh /path/to/config/addons/ha_legacy_dashboard`.
3. In Home Assistant OS, refresh the local Apps repository under
   `Settings > Apps`.
4. Install **HA Legacy Dashboard**, configure the host port if port 3000 is
   already occupied, and start the App.
5. Open `http://HOME_ASSISTANT_HOST:CONFIGURED_PORT/` directly from the wall
   display.

The prepared directory is self-contained for Supervisor's local App build.
Do not install or test it on a production Home Assistant system without an
explicit maintenance window and backup.

## Configuration

- `admin_api_enabled` is `false` by default.
- `admin_token` is optional while the Admin API is disabled. If Admin access
  is enabled, set a strong dedicated token. It must never equal any Home
  Assistant or Supervisor credential.
- The direct LAN host port is configured in the App's Network section.

No Long-Lived Home Assistant access token is configured in App options. The
backend uses the server-side `SUPERVISOR_TOKEN` with the Core REST and
WebSocket proxies. The browser sees only the existing sanitized gateway APIs.

## Storage and backups

The complete versioned dashboard configuration is stored atomically at
`/data/dashboards.json`; its previous valid backup is
`/data/dashboards.json.bak`. This includes dashboards, entity rules, critical
detection mode, and grace/flapping rules. Home Assistant includes App `/data`
in backups. The App uses a cold backup mode for a consistent snapshot.

Theme selection is browser-local and remains in Safari `localStorage`; it is
not an App server setting. Registry, trace and flapping transition caches are
bounded in memory and are intentionally rebuilt after a restart.

An existing standalone/LXC configuration is not imported automatically. Copy
and validate it manually only if you deliberately migrate deployments.

## Network and security

Only `homeassistant_api: true` is requested. The App does not request
Supervisor API, Docker, host network, host PID, devices, privileged mode, or a
Home Assistant configuration-directory mount. AppArmor remains enabled.

Ingress is intentionally not enabled: old iPads must be able to use the
direct LAN URL without loading the modern Home Assistant frontend. Existing
write allowlists and the separately authenticated Admin API apply unchanged.

`GET /health` checks only the local Node process. A temporary Home Assistant
outage is reported by the existing application status and does not make the
container healthcheck fail.
