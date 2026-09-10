# Standalone installieren, aktualisieren und zurückrollen

Diese Anleitung gilt für das versionierte Release-Archiv. Sie setzt Linux,
Node.js 22 oder neuer, npm, systemd und den Dienstbenutzer `dashboard` voraus.
Alle Pfade sind absichtlich mit der mitgelieferten systemd-Unit abgestimmt.

## Vor jeder Installation

Archiv und `SHA256SUMS` gemeinsam herunterladen und im Downloadverzeichnis
prüfen:

```bash
sha256sum --check SHA256SUMS
tar -xzf ha-legacy-dashboard-<version>.tar.gz
```

`<version>` in allen folgenden Befehlen durch den Wert aus der Datei `VERSION`
im entpackten Verzeichnis ersetzen. Niemals `.env`, Token oder private
Schlüssel in das Archiv zurückkopieren.

## Neuinstallation

Als Administrator die stabilen Verzeichnisse anlegen:

```bash
install -d -o dashboard -g dashboard -m 0750 /home/dashboard/ha-legacy-dashboard-releases
install -d -o dashboard -g dashboard -m 0700 /home/dashboard/ha-legacy-dashboard-state
install -d -o dashboard -g dashboard -m 0700 /home/dashboard/ha-legacy-dashboard-state/data
```

Das entpackte Verzeichnis nach
`/home/dashboard/ha-legacy-dashboard-releases/<version>` verschieben. Danach
als Benutzer `dashboard`:

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

Jetzt `/home/dashboard/ha-legacy-dashboard-state/.env` serverseitig bearbeiten.
`HA_URL` und `HA_TOKEN` sind Pflicht; `ADMIN_API_ENABLED` bleibt standardmäßig
`false`. Anschließend als Administrator:

```bash
install -o root -g root -m 0644 /home/dashboard/ha-legacy-dashboard/deploy/systemd/ha-legacy-dashboard.service /etc/systemd/system/ha-legacy-dashboard.service
systemctl daemon-reload
systemctl enable --now ha-legacy-dashboard.service
curl --fail http://127.0.0.1:3000/health
curl --fail http://127.0.0.1:3000/api/status
```

## Update N nach N+1

Vor dem Umschalten als Administrator stoppen und den vollständigen Zustand
sichern. Das Backup enthält Geheimnisse und muss Modus `0600` behalten:

```bash
systemctl stop ha-legacy-dashboard.service
tar -czf /home/dashboard/ha-legacy-dashboard-state/backup-before-<new-version>.tar.gz -C /home/dashboard/ha-legacy-dashboard-state .env data
chown dashboard:dashboard /home/dashboard/ha-legacy-dashboard-state/backup-before-<new-version>.tar.gz
chmod 0600 /home/dashboard/ha-legacy-dashboard-state/backup-before-<new-version>.tar.gz
```

Das neue geprüfte Archiv in
`/home/dashboard/ha-legacy-dashboard-releases/<new-version>` entpacken. Als
`dashboard` die vorhandenen Zustandsdateien nur verlinken und die gelockten
Abhängigkeiten installieren:

```bash
cd /home/dashboard/ha-legacy-dashboard-releases/<new-version>
ln -s /home/dashboard/ha-legacy-dashboard-state/.env .env
ln -s /home/dashboard/ha-legacy-dashboard-state/data data
npm ci --omit=dev
ln -s /home/dashboard/ha-legacy-dashboard-releases/<new-version> /home/dashboard/ha-legacy-dashboard.new
mv -Tf /home/dashboard/ha-legacy-dashboard.new /home/dashboard/ha-legacy-dashboard
```

Danach als Administrator starten und prüfen:

```bash
systemctl start ha-legacy-dashboard.service
systemctl status ha-legacy-dashboard.service --no-pager -l
curl --fail http://127.0.0.1:3000/health
curl --fail http://127.0.0.1:3000/api/status
```

Dashboards, Regeln, Admin-Konfiguration und Hintergründe müssen erhalten sein.
Die Theme-Auswahl liegt browserlokal und wird nicht aus dem Serverbackup
wiederhergestellt. Das alte Release und sein Backup erst nach der Abnahme
löschen.

## Rollback

Ein Downgrade darf nicht versuchen, eine von N+1 migrierte Konfiguration mit
N zu lesen. Stattdessen Dienst stoppen, den fehlgeschlagenen Zustand
wiederherstellbar umbenennen, das zum alten Release gehörende Backup einspielen
und erst dann den Runtime-Link zurücksetzen:

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

Die umbenannten fehlgeschlagenen Daten erst nach erfolgreicher Diagnose
löschen. Bei Fehlern Dienst gestoppt lassen und Logs mit
`journalctl -u ha-legacy-dashboard.service` prüfen; Tokens nicht in Tickets
oder Screenshots übernehmen.
