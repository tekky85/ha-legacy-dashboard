# Public Test Release 1.0.0-rc.3

`1.0.0-rc.3` is an installable public test release. It is not stable, does
not update the container tag `latest`, and does not replace the outstanding
Sprint 27 repair and manual acceptance work.

It supersedes `1.0.0-rc.2`, whose standalone archives differed between macOS
and Linux only in gzip's informational host-OS byte. Rc.3 normalizes that byte
without changing application behavior or security boundaries.

## Immutable release targets

- Git tag: `v1.0.0-rc.3`
- Source commit: `771683b804f0b7c684eb3d457b58fb579a3ccdb6`
- Home Assistant App image:
  `ghcr.io/tekky85/ha-legacy-dashboard:1.0.0-rc.3`
- Standalone archive: `ha-legacy-dashboard-1.0.0-rc.3.tar.gz`
- Integrity file: `SHA256SUMS`

The release workflow builds both `linux/amd64` and `linux/arm64` from
`ha_legacy_dashboard/Dockerfile`, creates one versioned manifest, runs the
container against an isolated local mock, and publishes the GitHub prerelease
only after all gates pass.

Published verification:

- GitHub prerelease:
  `https://github.com/tekky85/ha-legacy-dashboard/releases/tag/v1.0.0-rc.3`
- Release workflow: `34471183386`
- GHCR manifest digest:
  `sha256:7aa35767909de4b12119386112887845705f9e29214069d5ab4c1350a6432550`
- Standalone SHA256:
  `4d6ca325365d041b21b2fc06512dfd9e029a53cbbf6db2a9577ec6e682437295`
- Archive size: 217208 bytes; 117 archive entries
- Stable `latest`: not published

## Home Assistant App smoke test

Before an install or update, create a Home Assistant backup that contains the
App data. Then:

1. Refresh the custom App repository and verify that version `1.0.0-rc.3` is
   offered.
2. Install or update the App and verify that it starts without startup errors.
3. Inspect sanitized logs; they must contain no token or secret.
4. Open `/health`, `/admin`, the default dashboard, one custom dashboard,
   Summary, and Errors over the configured direct LAN port.
5. Verify state loading, one explicitly authorized Light, one explicitly
   authorized Climate entity, and a background image.
6. Restart the App and verify that `/data` configuration and backgrounds are
   retained.
7. Record the App version and published image digest with the result.

The App continues to request only `homeassistant_api: true`. It uses no
Ingress, privileged mode, host network, Docker access, `/config` mount, manual
Long-Lived Access Token, or browser-to-Home-Assistant WebSocket.

### Home Assistant App rollback

The project does not claim that the Home Assistant App UI supports arbitrary
downgrades. Keep the previous tag and image
`ghcr.io/tekky85/ha-legacy-dashboard:1.0.0-rc.2` available and create a backup
before updating. If rollback is required, restore the matching Home Assistant
backup and deploy a repository package whose `config.yaml` references the
compatible earlier version. Confirm the exact procedure on a test HAOS system
before using it for important data.

## Existing Git-based LXC update

The existing target is `/home/dashboard/ha-legacy-dashboard`, runtime user
`dashboard`, service `ha-legacy-dashboard.service`. Back up `.env` and the
complete `data` directory before switching versions. On the LXC as
`dashboard`:

```bash
cd /home/dashboard/ha-legacy-dashboard
git status
git fetch --tags origin
./deploy/rollback.sh v1.0.0-rc.3
./deploy/health-check.sh
```

`deploy/rollback.sh` is also the repository's safe exact-revision deployment
tool: it rejects local changes, checks out the requested immutable tag in
detached mode, installs locked dependencies, runs tests, restarts only
`ha-legacy-dashboard.service`, and verifies health. Then open:

```text
http://<lxc-address>:3000/health
http://<lxc-address>:3000/admin
http://<lxc-address>:3000/
```

Verify a custom dashboard, HA states, one authorized control, Summary, Errors,
and sanitized service logs. This procedure is documented for the existing
Git checkout; the standalone release archive instead contains its own
`docs/INSTALL.de.md` and `docs/INSTALL.en.md`.

### Git-based LXC rollback

The immediately preceding public test source is `v1.0.0-rc.2`. Keep the
matching pre-update configuration backup. To return to it:

```bash
cd /home/dashboard/ha-legacy-dashboard
./deploy/rollback.sh v1.0.0-rc.2
./deploy/health-check.sh
```

If returning as far as `v1.0.0-rc.1`, restore the state backup created for
that old runtime before starting it. An older schema must not read a
configuration already migrated by a newer release.

## Standalone archive smoke test

Download both release assets into an empty directory and verify them before
extracting:

```bash
sha256sum --check SHA256SUMS
tar -xzf ha-legacy-dashboard-1.0.0-rc.3.tar.gz
```

Follow only the bundled installation guide. Confirm service startup,
`/health`, `/admin`, default/custom dashboards, HA states, a representative
authorized control, Summary, Errors, persistence, and secret-free logs. For a
real N→N+1 and rollback test, use an isolated LXC/VM and retain matching
runtime and state backups for both versions.

## iPad manual test focus

Physical iPad checks remain manual. On an iPad mini 1 with iOS 9.3.5, verify
HomeScreen fullscreen navigation, Summary/Errors/custom-dashboard same-window
behavior, themes, backgrounds, Sections, Room Card collapse/background,
Grid/Focus controls, off-state Climate target changes, responsive layouts,
and Guided Access. Record failures against the exact release version.

## Reporting defects

Use the repository's GitHub issue form. Include version, deployment type,
Home Assistant version, device/browser, affected dashboard/card, exact steps,
expected and actual behavior, screenshots, and sanitized logs. Never attach
tokens, passwords, `.env`, private keys, personal data, or unredacted logs.
