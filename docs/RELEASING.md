# Release und Distribution

Dieses Dokument ist die verbindliche Anleitung für Release Candidates und
stabile Releases von HA Legacy Dashboard. Release-Artefakte werden nur aus
einem unveränderlichen Git-Tag auf `main` erzeugt. Die Automation verändert
keine Home-Assistant-Instanz und liest keine Produktionskonfiguration.

## Release-Modell

Die Versionsquelle ist die gemeinsam geprüfte SemVer-Version in:

- `package.json` und `package-lock.json`
- `ha_legacy_dashboard/config.yaml`
- `release/metadata.json`
- `CHANGELOG.md`
- `ha_legacy_dashboard/CHANGELOG.md`
- Git-Tag `v<version>`

`release/check-version.js` bricht bei jeder Abweichung ab. Der erste geplante
Release ist `1.0.0-rc.1`; im Repository existierte davor kein Release-Tag.

Release Candidate:

```text
1.0.0-rc.1 -> v1.0.0-rc.1 -> GitHub Prerelease
```

Stable:

```text
1.0.0 -> v1.0.0 -> GitHub Release + latest
```

Ein RC aktualisiert niemals `latest`. Ein Stable-Release aktualisiert `latest`
erst nach Tests, beiden Architektur-Builds, Manifestprüfung und Smoke Test.

## Artefakte

Ein Release erzeugt:

- `ghcr.io/tekky85/ha-legacy-dashboard:<version>` als Multi-Arch-Manifest
- interne Architekturtags `<version>-amd64` und `<version>-aarch64`
- bei Stable zusätzlich `ghcr.io/tekky85/ha-legacy-dashboard:latest`
- `ha-legacy-dashboard-<version>.tar.gz`
- `SHA256SUMS`
- automatisch erzeugte GitHub-Quellarchive
- BuildKit-Provenance und SBOM für die Architektur-Images

Das Standalone-Archiv enthält ausschließlich Laufzeitcode, Lockfile,
Beispielkonfiguration, systemd-Unit, Installationsdokumentation, Lizenz,
Changelog und `VERSION`. Es enthält weder `node_modules`, Tests, `.env`, Daten,
Git-Metadaten noch Screenshots.

## Unterstützte Plattformen

- Standalone: Node.js 22 oder neuer auf amd64/aarch64 Linux; der mitgelieferte
  systemd-Pfad ist für Debian-basierte LXC-/VM-Systeme dokumentiert.
- Home Assistant App: amd64 und aarch64 auf Home Assistant OS mit Supervisor
  und `homeassistant_api`-Core-Proxy. Eine konkrete minimale HAOS-Version wird
  erst nach der RC-Testmatrix festgeschrieben und derzeit nicht behauptet.
- Wall Display: Safari auf iOS 9 bleibt das verbindliche Legacy-Ziel; moderne
  Browser werden zusätzlich geprüft.

Die direkten Runtime-Abhängigkeiten Axios (MIT), dotenv (BSD-2-Clause) und
Express (MIT) sind mit der ISC-Distribution vereinbar. Das Lockfile und der
Produktionsaudit bleiben Teil jedes Release Gates.

## Pipeline

`.github/workflows/test.yml` läuft bei Push und Pull Request mit nur
`contents: read`:

1. `npm ci`
2. Syntaxprüfungen für JavaScript und Shell
3. Versions- und Secret-Prüfung
4. vollständige Mock-/Integrationstests
5. `npm audit --omit=dev --audit-level=high`
6. reproduzierbares Standalone-Archiv samt Checksum
7. Docker-BuildKit-Build für `linux/amd64` und `linux/arm64`, ohne Push

`.github/workflows/release.yml` wird ausschließlich durch passende `v*`-Tags
ausgelöst:

1. exakten Tag auschecken und Zugehörigkeit zu `main` prüfen
2. vollständiges Test Gate ausführen
3. Standalone-Artefakte erzeugen
4. amd64 und aarch64 getrennt mit BuildKit bauen und pushen
5. erst nach beiden Erfolgen das versionierte Multi-Arch-Manifest erzeugen
6. Manifest auf amd64 und arm64 prüfen
7. Image gegen einen lokalen Supervisor-/HA-Mock starten
8. `/health`, `/api/status` und statische Assets prüfen
9. bei Stable erst jetzt `latest` erzeugen
10. GitHub Release erstellen und Standalone-Artefakte anhängen

Die Pipeline verwendet `github.token`; ein Registry-PAT ist nicht erforderlich.
Nur Image-Jobs erhalten `packages: write`, erst der letzte Release-Job erhält
`contents: write`. CI enthält keine echte HA-URL und nutzt ausschließlich das
feste Fake-Credential `ci-supervisor-token` im isolierten Docker-Netz.

## Dockerfile als Build-Quelle

`ha_legacy_dashboard/Dockerfile` ist die einzige Container-Builddefinition.
Der frühere `build.yaml`-Pfad wird nicht mehr verwendet. Release und CI bauen
mit Docker Buildx/BuildKit aus dem Repository-Root:

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --file ha_legacy_dashboard/Dockerfile \
  --build-arg APP_SOURCE_PATH=ha_legacy_dashboard \
  --build-arg BUILD_VERSION=1.0.0-rc.1 \
  .
```

Das Lockfile wird über `npm ci --omit=dev` verwendet. OCI-Labels enthalten
Version, Revision, Erstellzeit, Source, Titel, Beschreibung und Lizenz.

## Release vorbereiten

1. `main` aktualisieren und einen sauberen Arbeitsbaum sicherstellen.
2. Nächste SemVer-Version bestimmen.
3. Alle oben genannten Versionsdateien synchron aktualisieren.
4. Nutzerorientierte Changelogs und `release/notes/<version>.md` ergänzen.
5. `release/metadata.json` auf Version, Kanal, Notiz und Artefaktnamen setzen.
6. beide README-Sprachen semantisch synchron halten.
7. vollständige lokale Prüfung ausführen:

```bash
npm ci
./release/test-gate.sh v1.0.0-rc.1
node release/create-standalone-bundle.js dist
```

Wenn Docker/Buildx lokal verfügbar ist, zusätzlich beide Plattformen bauen.
Die CI-Buildprüfung bleibt unabhängig davon verbindlich.

## Release Candidate erstellen

Nach Review und erfolgreicher CI:

```bash
git tag -a v1.0.0-rc.1 -m "Release v1.0.0-rc.1"
git push origin v1.0.0-rc.1
```

Der Tag startet den Workflow. Erst dessen letzter Job erzeugt das GitHub
Prerelease. Einen fehlgeschlagenen oder teilweise veröffentlichten Tag nicht
verschieben. Fehler korrigieren und einen neuen RC, beispielsweise `rc.2`,
vorbereiten.

RC-Abnahme:

- Custom App Repository wird von Test-HAOS erkannt
- Installation und Start auf amd64 oder aarch64
- REST und Backend-WebSocket funktionieren
- direkte LAN-WebUI und Neustart funktionieren
- `/data` bleibt nach Update erhalten
- Standalone-Fresh-Install und Upgrade funktionieren
- physischer iOS-9-Safari-Test
- moderner Safari und Admin UI
- Logs bleiben secret-frei

## Stable Release erstellen

RC-Feedback zuerst in einem neuen Commit beheben. RC-Artefakte werden nicht
nachträglich als Stable umgetaggt. Danach Version und Release-Metadaten auf die
stabile Version ändern, Changelog abschließen und erneut alle Gates ausführen:

```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

`latest` entsteht ausschließlich im letzten Job nach bestandenem Smoke Test.
Die konkrete Version bleibt immer die bevorzugte unveränderliche Referenz.

## Container und Manifest prüfen

```bash
docker buildx imagetools inspect \
  ghcr.io/tekky85/ha-legacy-dashboard:1.0.0-rc.1

docker pull --platform linux/amd64 \
  ghcr.io/tekky85/ha-legacy-dashboard:1.0.0-rc.1
```

Das Manifest muss `linux/amd64` und `linux/arm64` enthalten. Das GHCR-Paket
muss für eine öffentlich installierbare Custom App auf `public` stehen; diese
Repository-Einstellung ist einmalig auf GitHub zu kontrollieren.

## Home Assistant App: Fresh Install

Das Repository ist ein benutzerdefiniertes App Repository, keine offizielle
Home-Assistant-App. Repository hinzufügen, App Store aktualisieren, App
installieren, direkten Host-Port prüfen, starten, Logs prüfen und die Web UI
über die LAN-Adresse öffnen. `admin_api_enabled` bleibt standardmäßig `false`.

## Home Assistant App: Upgrade und Rollback

Vor jedem Upgrade ein Home-Assistant-Backup einschließlich der App-Daten
erstellen. App-Updates verwenden weiterhin `/data/dashboards.json` und dessen
Backup. Die automatisierte Persistenzprüfung lädt dieselbe vollständige
Konfiguration vor und nach dem simulierten Versionswechsel.

Für eine Rückkehr zu einer älteren Version ist ein zuvor getestetes Backup die
verlässliche Grundlage. Dieses Projekt behauptet keinen Supervisor-
Rollbackmechanismus, der nicht auf der Zielversion geprüft wurde. Eine
Standalone-Konfiguration wird nicht automatisch in den App-Datenbereich
importiert.

## Standalone: Fresh Install

1. Release-Archiv und `SHA256SUMS` herunterladen.
2. `sha256sum --check SHA256SUMS` ausführen.
3. in ein neues Zielverzeichnis entpacken.
4. `.env.example` als serverseitige `.env` kopieren, echte Werte setzen und
   Dateimodus `0600` verwenden.
5. `npm ci --omit=dev` ausführen.
6. systemd-Unit an den tatsächlichen Benutzer/Pfad anpassen und installieren.
7. Dienst starten und `/health` sowie `/api/status` prüfen.

## Standalone: Upgrade und Rollback

Vor einem Upgrade `.env` und den vollständigen `data`-Ordner sichern. Den
Dienst stoppen, Release in ein neues Verzeichnis entpacken, `.env` und `data`
unverändert übernehmen, `npm ci --omit=dev` ausführen und den Dienst starten.
Erst nach erfolgreichem Health Check die vorherige Runtime-Version entfernen.

Für Rollback Dienst stoppen, das alte Release-Verzeichnis und das passende
Konfigurationsbackup aktivieren, danach erneut Health Check durchführen. Eine
Schema-Migration darf niemals ohne vorherige Sicherung und validierten
Rückweg durchgeführt werden.

## Security Gate

Ein Release wird abgebrochen bei:

- inkonsistenter Version oder falschem Tag
- nicht auf `main` enthaltenem Release-Commit
- fehlgeschlagenem Test, Audit, Build, Manifest oder Smoke Test
- verfolgter `.env`, privatem Schlüssel oder bekannten Tokenmustern
- `.env`, Daten oder `node_modules` im Standalone-Archiv
- fehlender amd64- oder arm64-Plattform

Home-Assistant-, Supervisor- und Admin-Secrets werden weder als Build-Argument
noch als GitHub Secret benötigt. Es gibt keine Telemetrie, Analytics,
Crash-Uploads oder andere Phone-Home-Funktion.

## Manuelle Stable-Checkliste

- [ ] iPad mini / iOS 9: Standard- und Custom-Dashboard
- [ ] Focus und Light-/Climate-Power-Controls
- [ ] Summary, Errors und globaler Health-Indikator
- [ ] Admin und Entity Rule Manager
- [ ] Light/Dark Theme
- [ ] Test-HAOS erkennt das Custom App Repository
- [ ] App installiert und startet auf unterstützter Architektur
- [ ] REST/WebSocket und direkte LAN-WebUI
- [ ] App-Neustart und Update erhalten `/data`
- [ ] Standalone-Upgrade und Rollback erhalten Konfiguration
- [ ] Logs und Screenshots sind secret-frei
- [ ] GHCR-Manifest enthält amd64 und arm64 und Paket ist öffentlich

## Fehlerbehandlung

Wenn nur ein Architekturbild erfolgreich ist, wird kein versioniertes
Multi-Arch-Manifest erzeugt. Wenn Manifest oder Smoke Test fehlschlägt, werden
weder `latest` noch GitHub Release veröffentlicht. Bereits vorhandene interne
Architekturtags bleiben zur Diagnose bestehen; versionierte Images werden
nicht aggressiv gelöscht oder überschrieben.
