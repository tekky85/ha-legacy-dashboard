# Deployment und Betrieb

HA Legacy Dashboard unterstützt zwei voneinander unabhängige Betriebsarten.
Beide verwenden dieselben Gateway-Routen und dieselbe Anwendung; nur die
serverseitige Home-Assistant-Verbindung und der persistente Datenpfad werden
vom zentralen Runtime-Modus aufgelöst.

## Home Assistant App – lokale Installation

Sprint 24 stellt ein lokales Development-/Test-Paket unter
`ha_legacy_dashboard/` bereit. Die öffentliche App-Repository- und
Container-Veröffentlichung folgt erst in Sprint 25.

Das App-Paket wird ohne zweite Quellcodekopie gepflegt. Für die lokale
Supervisor-Installation erzeugt das Vorbereitungsskript einen in sich
geschlossenen Build-Kontext:

```bash
./deploy/prepare-home-assistant-app.sh \
  /path/to/home-assistant-config/addons/ha_legacy_dashboard
```

Danach in Home Assistant OS unter `Settings > Apps` das lokale Repository neu
laden, **HA Legacy Dashboard** installieren und den Host-Port im Bereich
Network bei Bedarf anpassen. Die direkte Wall-Display-URL lautet anschließend
beispielsweise:

```text
http://homeassistant.local:3000/
```

Der konkrete Port ist der in der App-Netzwerkkonfiguration gewählte Host-Port.
Ingress ist nicht aktiviert und für den iPad-Zugriff nicht erforderlich.

Lokaler Container-Build aus einem sicheren temporären Kontext:

```bash
app_build_dir="$(mktemp -d)"
./deploy/prepare-home-assistant-app.sh "$app_build_dir"
docker build \
  --build-arg BUILD_ARCH=amd64 \
  --build-arg BUILD_VERSION=1.0.0 \
  -t ha-legacy-dashboard-app:local \
  "$app_build_dir"
```

Für einen `aarch64`-Build wird auf einem entsprechend konfigurierten
Buildx-System `--platform linux/arm64` verwendet. Die Veröffentlichung eines
Multi-Arch-Manifests ist Sprint 25 vorbehalten.

### App-Verbindung und Berechtigungen

Der App-Modus setzt intern `HA_RUNTIME_MODE=home_assistant_app`. REST-Zugriffe
laufen ausschließlich über `http://supervisor/core/api`, WebSocket-Zugriffe
über `ws://supervisor/core/websocket`. Beide verwenden den nur im Backend
verfügbaren `SUPERVISOR_TOKEN`. `HA_TOKEN` ist keine App-Option.

Das Paket verlangt ausschließlich `homeassistant_api: true`. Es aktiviert
weder `hassio_api` noch Docker-/Host-/Geräte-/Privileged-Zugriff und mountet
das Home-Assistant-Konfigurationsverzeichnis nicht. AppArmor bleibt aktiv.

### App-Persistenz und Backup

Die versionierte Konfiguration liegt unter:

```text
/data/dashboards.json
/data/dashboards.json.bak
```

Sie enthält Dashboards, Widgets, Layouts, Entity Rules, Critical Detection und
die Sprint-22-Regeln. `/data` ist der persistente App-Datenbereich und Teil von
Home-Assistant-Backups; `backup: cold` sorgt für einen konsistenten Snapshot.
Registry-, Trace- und Flapping-Caches bleiben absichtlich im Arbeitsspeicher.
Die Theme-Auswahl bleibt wie bisher browserlokal in `localStorage`.

Eine Standalone-Konfiguration wird nicht automatisch importiert. Eine spätere
Migration muss als bewusstes, manuell validiertes Kopieren erfolgen.

### App-Admin-Zugriff

Die Admin API bleibt standardmäßig deaktiviert. Wird `admin_api_enabled`
aktiviert, ist ein starkes, separates `admin_token` erforderlich. Es darf
weder mit einem Home-Assistant-Token noch dem `SUPERVISOR_TOKEN`
übereinstimmen. Der direkte LAN-Port wird nicht durch Ingress-Authentifizierung
geschützt; die bestehende Admin-Bearer-Authentifizierung bleibt daher immer
maßgeblich.

### App-Abnahme

Eine reale Installation auf Home Assistant OS erfolgt nur kontrolliert durch
den Betreiber. Danach sind insbesondere Start, `/health`, direkte LAN-WebUI,
REST-/WebSocket-Metadaten, Admin-Schutz, Neustart-Persistenz und die direkte
iPad-URL zu prüfen. Produktionszugangsdaten dürfen nicht in Testprotokollen
oder Screenshots erscheinen.

## Standalone/LXC

## Ziel

Der Produktionsstand liegt im LXC unter:

```text
/home/dashboard/ha-legacy-dashboard
```

Der Dienst läuft als Benutzer `dashboard`:

```text
ha-legacy-dashboard.service
```

Die Deployment-Skripte verändern weder `.env` noch die systemd-Unit. Sie
akzeptieren keinen nicht-linearen Git-Verlauf und führen keinen Force-Push oder
`git reset --hard` aus.

## Schreibbarer Konfigurationspfad

Sprint 14 speichert die Dashboardkonfiguration standardmäßig unter:

```text
/home/dashboard/ha-legacy-dashboard/data/dashboards.json
```

Die gehärtete systemd-Unit hält das übrige Home-Verzeichnis weiterhin
read-only und erlaubt nur für dieses `data`-Verzeichnis Schreibzugriff. Nach
dem ersten Deployment von Sprint 14 muss die aktualisierte Unit einmalig als
root installiert werden:

```bash
sudo install -o root -g root -m 0644 \
  deploy/systemd/ha-legacy-dashboard.service \
  /etc/systemd/system/ha-legacy-dashboard.service

sudo systemctl daemon-reload
sudo systemctl restart ha-legacy-dashboard.service
```

`deploy/deploy.sh` legt den Standardpfad mit Modus `0700` an und migriert die
Sprint-13-Konfiguration vor dem Neustart. Die JSON- und Backup-Dateien erhalten
Modus `0600` und bleiben durch `.gitignore` vom Repository ausgeschlossen.

Bei einem über `DASHBOARD_CONFIG_PATH` gesetzten Pfad muss eine entsprechende
enge `ReadWritePaths=`-Freigabe per systemd-Override eingerichtet werden. Keine
breitere Schreibfreigabe für das gesamte Projektverzeichnis verwenden.

## Einmalige Neustartfreigabe

Für vollständig automatisierte Deployments darf `dashboard` ausschließlich
diesen einen Dienst ohne Passwort neu starten. Die mitgelieferte Regel enthält
keine Shell und keine Platzhalter.

Im LXC zunächst die Quelldatei prüfen:

```bash
cd /home/dashboard/ha-legacy-dashboard
sudo visudo -cf deploy/sudoers/ha-legacy-dashboard
```

Danach installieren und erneut prüfen:

```bash
sudo install -o root -g root -m 0440 \
  deploy/sudoers/ha-legacy-dashboard \
  /etc/sudoers.d/ha-legacy-dashboard

sudo visudo -cf /etc/sudoers.d/ha-legacy-dashboard
```

Funktionsprüfung:

```bash
sudo -n systemctl restart ha-legacy-dashboard.service
```

## Automatisches Deployment

Als Benutzer `dashboard`:

```bash
cd /home/dashboard/ha-legacy-dashboard
./deploy/deploy.sh
```

Das Skript:

1. verweigert einen schmutzigen Arbeitsbaum,
2. wechselt bei Bedarf zurück auf `main`,
3. lädt `origin/main`,
4. akzeptiert ausschließlich einen Fast-Forward,
5. installiert Abhängigkeiten nur bei geänderter `package-lock.json`,
6. prüft alle JavaScript-Dateien,
7. führt die vollständigen Mock- und Integrationstests aus,
8. startet ausschließlich `ha-legacy-dashboard.service` neu,
9. prüft Dienst, APIs, Dashboard-Metadaten und Sicherheitsheader,
10. meldet die neue und die vorherige Revision.

Die persistierte Dashboardkonfiguration und ihr Backup werden beim Git-
Deployment weder gelöscht noch überschrieben. Ist noch keine Primärdatei
vorhanden, wird einmalig die validierte Standardkonfiguration erzeugt.

## Einzelne Prüfungen

Vor einem Neustart:

```bash
./deploy/check.sh
```

Produktiver read-only Health-Check:

```bash
./deploy/health-check.sh
```

Der Health-Check akzeptiert einen erreichbaren Gateway-Prozess auch dann, wenn
Home Assistant vorübergehend `offline` meldet. Dieser Zustand wird sichtbar
ausgegeben, aber nicht mit einem defekten Gateway verwechselt.

## Rollback

Ein Rollback benötigt immer eine explizite lokale Commit-ID oder einen Tag:

```bash
./deploy/rollback.sh <commit-oder-tag>
```

Das Skript verweigert lokale Änderungen, prüft die Zielrevision und wechselt
mit `git switch --detach` auf den gewünschten Stand. Dadurch wird kein Branch
zurückgesetzt oder überschrieben. Anschließend laufen dieselben Tests, der
Dienstneustart und der Health-Check.

Das nächste erfolgreiche `./deploy/deploy.sh` wechselt automatisch zurück auf
`main`.

## Manuelles Notfallverfahren

```bash
cd /home/dashboard/ha-legacy-dashboard
git status
git fetch origin main
git merge --ff-only origin/main
./deploy/check.sh
sudo systemctl restart ha-legacy-dashboard.service
./deploy/health-check.sh
```

## Release-Tags

Tags werden erst nach erfolgreicher Prüfung auf einem sauberen `main` erzeugt:

```bash
./deploy/check.sh
git tag -a vX.Y.Z -m "Release vX.Y.Z"
git push origin vX.Y.Z
```

Ein veröffentlichter Tag wird nicht nachträglich verschoben oder erzwungen.

## GitHub-CI

`.github/workflows/test.yml` führt bei Pushes und Pull Requests aus:

- `npm ci`
- Syntaxprüfung aller JavaScript-Dateien
- vollständige lokale Mock- und Integrationstests

Die CI benötigt keine Home-Assistant-Zugangsdaten.

## Wall-Display-Intervall

Ohne weitere Einstellung aktualisiert das Dashboard alle fünf Sekunden. Ein
anderes Intervall kann ausschließlich im Backend in `.env` gesetzt werden:

```ini
DASHBOARD_REFRESH_INTERVAL_MS=10000
```

Erlaubt sind 3000 bis 300000 Millisekunden. Ungültige Werte fallen auf 5000
Millisekunden zurück. Nach einer Änderung ist ein Dienstneustart erforderlich.
Der Browser erhält nur den validierten Zahlenwert, keine Zugangsdaten.
