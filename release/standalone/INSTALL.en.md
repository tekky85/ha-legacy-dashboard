# Standalone installation, upgrade, and rollback

This guide applies to the versioned release archive. It requires Linux,
Node.js 22 or newer, npm, systemd, and the `dashboard` service account. All
paths deliberately match the bundled systemd unit.

## Before every installation

Download the archive together with `SHA256SUMS` and verify it in the download
directory:

```bash
sha256sum --check SHA256SUMS
tar -xzf ha-legacy-dashboard-<version>.tar.gz
```

Replace `<version>` in all following commands with the value from `VERSION` in
the extracted directory. Never copy `.env`, tokens, or private keys back into
the archive.

## Fresh install

As administrator, create the stable directories:

```bash
install -d -o dashboard -g dashboard -m 0750 /home/dashboard/ha-legacy-dashboard-releases
install -d -o dashboard -g dashboard -m 0700 /home/dashboard/ha-legacy-dashboard-state
install -d -o dashboard -g dashboard -m 0700 /home/dashboard/ha-legacy-dashboard-state/data
```

Move the extracted directory to
`/home/dashboard/ha-legacy-dashboard-releases/<version>`. Then, as the
`dashboard` user:

```bash
cd /home/dashboard/ha-legacy-dashboard-releases/<version>
cp .env.example /home/dashboard/ha-legacy-dashboard-state/.env
chmod 0600 /home/dashboard/ha-legacy-dashboard-state/.env
ln -s /home/dashboard/ha-legacy-dashboard-state/.env .env
ln -s /home/dashboard/ha-legacy-dashboard-state/data data
npm ci --omit=dev
ln -s /home/dashboard/ha-legacy-dashboard-releases/<version> /home/dashboard/ha-legacy-dashboard.new
mv -Tf /home/dashboard/ha-legacy-dashboard.new /home/dashboard/ha-legacy-dashboard
```

Edit `/home/dashboard/ha-legacy-dashboard-state/.env` on the server. `HA_URL`
and `HA_TOKEN` are required; `ADMIN_API_ENABLED` remains `false` by default.
Then, as administrator:

```bash
install -o root -g root -m 0644 /home/dashboard/ha-legacy-dashboard/deploy/systemd/ha-legacy-dashboard.service /etc/systemd/system/ha-legacy-dashboard.service
systemctl daemon-reload
systemctl enable --now ha-legacy-dashboard.service
curl --fail http://127.0.0.1:3000/health
curl --fail http://127.0.0.1:3000/api/status
```

## Upgrade N to N+1

Before switching versions, stop the service and back up all state as
administrator. The backup contains secrets and must retain mode `0600`:

```bash
systemctl stop ha-legacy-dashboard.service
tar -czf /home/dashboard/ha-legacy-dashboard-state/backup-before-<new-version>.tar.gz -C /home/dashboard/ha-legacy-dashboard-state .env data
chown dashboard:dashboard /home/dashboard/ha-legacy-dashboard-state/backup-before-<new-version>.tar.gz
chmod 0600 /home/dashboard/ha-legacy-dashboard-state/backup-before-<new-version>.tar.gz
```

Extract the new verified archive to
`/home/dashboard/ha-legacy-dashboard-releases/<new-version>`. As `dashboard`,
only link the existing state and install locked dependencies:

```bash
cd /home/dashboard/ha-legacy-dashboard-releases/<new-version>
ln -s /home/dashboard/ha-legacy-dashboard-state/.env .env
ln -s /home/dashboard/ha-legacy-dashboard-state/data data
npm ci --omit=dev
ln -s /home/dashboard/ha-legacy-dashboard-releases/<new-version> /home/dashboard/ha-legacy-dashboard.new
mv -Tf /home/dashboard/ha-legacy-dashboard.new /home/dashboard/ha-legacy-dashboard
```

Start and verify as administrator:

```bash
systemctl start ha-legacy-dashboard.service
systemctl status ha-legacy-dashboard.service --no-pager -l
curl --fail http://127.0.0.1:3000/health
curl --fail http://127.0.0.1:3000/api/status
```

Dashboards, rules, Admin configuration, and backgrounds must remain intact.
The theme selection is browser-local and is not restored from the server
backup. Delete neither the previous release nor its backup until acceptance
is complete.

## Rollback

An older release must not read configuration already migrated by N+1. Stop the
service, preserve the failed state by renaming it, restore the backup paired
with the old release, and only then switch the runtime link back:

```bash
systemctl stop ha-legacy-dashboard.service
mv /home/dashboard/ha-legacy-dashboard-state/data /home/dashboard/ha-legacy-dashboard-state/data.failed-<new-version>
mv /home/dashboard/ha-legacy-dashboard-state/.env /home/dashboard/ha-legacy-dashboard-state/.env.failed-<new-version>
tar -xzf /home/dashboard/ha-legacy-dashboard-state/backup-before-<new-version>.tar.gz -C /home/dashboard/ha-legacy-dashboard-state
chown -R dashboard:dashboard /home/dashboard/ha-legacy-dashboard-state
chmod 0700 /home/dashboard/ha-legacy-dashboard-state/data
chmod 0600 /home/dashboard/ha-legacy-dashboard-state/.env
ln -s /home/dashboard/ha-legacy-dashboard-releases/<old-version> /home/dashboard/ha-legacy-dashboard.new
mv -Tf /home/dashboard/ha-legacy-dashboard.new /home/dashboard/ha-legacy-dashboard
systemctl start ha-legacy-dashboard.service
curl --fail http://127.0.0.1:3000/health
curl --fail http://127.0.0.1:3000/api/status
```

Delete the renamed failed state only after successful diagnosis. On failure,
leave the service stopped and inspect
`journalctl -u ha-legacy-dashboard.service`; never copy tokens into issues or
screenshots.
