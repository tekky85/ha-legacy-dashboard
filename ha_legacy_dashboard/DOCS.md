# HA Legacy Dashboard – Home Assistant App

## Scope

This package is distributed through the HA Legacy Dashboard Custom Home
Assistant App Repository. It is not an official Home Assistant App. The App
uses the generic multi-architecture image
`ghcr.io/tekky85/ha-legacy-dashboard` for amd64 and aarch64.

## Installation

1. Add `https://github.com/tekky85/ha-legacy-dashboard` under
   `Settings > Apps > App store > Repositories` or use the documented My Home
   Assistant repository link.
2. Refresh the App store and select **HA Legacy Dashboard**.
3. Install the App, configure the host port if port 3000 is
   already occupied, and start the App.
4. Check the App log and open the Web UI.
5. Open `http://HOME_ASSISTANT_HOST:CONFIGURED_PORT/` directly from the wall
   display.

Create a Home Assistant backup before installing a release candidate or
upgrading an existing App.

## Upgrade and rollback

App configuration remains under `/data` when the App image changes. Before an
upgrade, create a backup that includes the App. Verify the Web UI, Home
Assistant connection, Admin protection, and persisted dashboards after the
update. Use a previously tested backup to restore an older state; no
unverified Supervisor rollback mechanism is assumed.

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
