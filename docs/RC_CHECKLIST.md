# RC Checklist – 1.0.0-rc.1

Stand: 28. August 2026

Diese Checkliste dokumentiert die Release-Candidate-Abnahme aus Sprint 25.4.
Sie trennt statische Prüfungen, automatisierte Tests und tatsächlich verfügbare
Laufzeitumgebungen. Nicht verfügbare reale HAOS- und iPad-Prüfungen werden
ausdrücklich nicht aus Simulationen oder Quellcodeprüfungen abgeleitet.

## Geprüfter Stand

| Merkmal | Wert |
| --- | --- |
| Branch | `main` |
| Quell-Commit des RC | `741bba41d8ffc34cba4c7643f2e2b777f2e6501e` |
| Git-Tag | `v1.0.0-rc.1` |
| Paketversion | `1.0.0-rc.1` |
| App-Version | `1.0.0-rc.1` |
| Image | `ghcr.io/tekky85/ha-legacy-dashboard:1.0.0-rc.1` |
| Release-Workflow | GitHub Actions Run `33203376391` |
| Test-Workflow | GitHub Actions Run `33203376334` |
| Standalone-Ziel | LXC `ha-legacy-dashboard` |

## Repository, Version und Distribution

| Prüfung | Status | Nachweis |
| --- | --- | --- |
| Arbeitsbaum vor der RC-Prüfung sauber | PASS | `main`, `origin/main` und LXC standen auf `741bba4`; keine lokalen oder deployten Änderungen. |
| Repository-Metadaten | PASS | `repository.yaml` enthält Repository-URL und Maintainer; App-Metadaten enthalten Name, Beschreibung, URLs und Icon. |
| Version über Paket, App, Release-Metadaten und Changelogs konsistent | PASS | `release/check-version.js --tag v1.0.0-rc.1`. |
| App-Icon und Logo valide | PASS | PNG-Dateien vorhanden, lesbar und mit erwarteten Dateirechten. |
| Minimalberechtigungen der Home Assistant App | PASS | `homeassistant_api: true`, AppArmor aktiv; kein Host-, Docker-, Config-, Geräte- oder Privileged-Zugriff. |
| Dockerfile ist Build-Quelle | PASS | Release-Workflow baut beide Architekturen aus dem Root-`Dockerfile` mit BuildKit/Buildx. |
| Vollständiges Release Gate | PASS | 275 Tests, 0 Fehler; JavaScript-/Shell-Syntax, Versionscheck und Secret Scan enthalten. |
| Dependency-Audit | PASS | `npm audit --omit=dev --audit-level=high`: 0 Schwachstellen. |
| GitHub Test-Workflow | PASS | Run `33203376334`, Abschluss `success`. |
| GitHub Release-Workflow | PASS | Run `33203376391`; Validate, beide Builds, Manifest, Smoke-Test und Release abgeschlossen. |
| RC-Tag veröffentlicht | PASS | `v1.0.0-rc.1` zeigt auf den geprüften Commit `741bba4`. |
| GitHub-Prerelease veröffentlicht | PASS | Prerelease, kein Draft; Bundle und `SHA256SUMS` vorhanden. |
| Release-Bundle öffentlich herunterladbar | PASS | `ha-legacy-dashboard-1.0.0-rc.1.tar.gz`, 204389 Bytes. |
| Release-Prüfsumme gültig | PASS | SHA256 `c7db4e1874334195aaf00147f5a58e6d46b31cc3c14cfbb04c93c3c96880d984` verifiziert. |
| Standalone-Bundle reproduzierbar | PASS | Zwei lokale Builds mit identischem `SOURCE_DATE_EPOCH` waren bytegleich; Bundle-Inhalt ist deterministisch sortiert. |
| Bundle frei von Laufzeit-Secrets und persistierten Daten | PASS | Keine `.env`, Tokens, Schlüssel oder `data`-Inhalte enthalten; `.env.example` ist die einzige Umgebungsdatei. |
| GHCR-Image anonym verfügbar | PASS | Anonymer Registry-Token und Manifest-Abruf antworten mit HTTP 200. |
| Multi-Arch-Manifest | PASS | OCI-Index enthält `linux/amd64` und `linux/arm64`; zusätzliche `unknown/unknown`-Einträge sind Build-Attestierungen. |
| Stable-Tag bleibt unverändert | PASS | Der RC-Workflow veröffentlicht keinen `latest`-Tag für eine Prerelease-Version. |

## Standalone / LXC

| Prüfung | Status | Nachweis |
| --- | --- | --- |
| LXC verwendet geprüften Commit | PASS | Branch `main`, HEAD und `origin/main` waren vor der Veröffentlichung identisch auf `741bba4`. |
| LXC-Arbeitsbaum sauber | PASS | `git status --porcelain` leer. |
| Node.js-Runtime | PASS | Node.js `v22.23.1`. |
| systemd-Prozess läuft als unprivilegierter Benutzer | PASS | Dienstbenutzer und -gruppe `dashboard`; Zustand `active/running`. |
| `.env` geschützt | PASS | Modus 0600, Eigentümer `dashboard:dashboard`; Inhalt wurde nicht ausgegeben. |
| Standalone-Credentials getrennt | PASS | HA-Token vorhanden, kein `SUPERVISOR_TOKEN`, kein App-Modus; Werte wurden nicht ausgegeben. |
| Admin-Token vom HA-Token getrennt | PASS | Admin API aktiviert, beide Werte vorhanden und ungleich; Werte wurden nicht ausgegeben. |
| Admin API ohne Bearer-Token geschützt | PASS | `GET /api/admin/config` antwortet mit HTTP 401. |
| Vollständiger Deployment-Check auf dem LXC | PASS | 275 Tests, 0 Fehler; Syntax-, Mock-, Integrations- und Security-Checks enthalten. |
| Startup und Health | PASS | Dienstneustart, danach `/health` HTTP 200 und Dienst `active/running`. |
| Home Assistant REST | PASS | `/api/status` und Dashboard-State liefern HTTP 200 gegen die reale Backend-Verbindung. |
| Home Assistant WebSocket nur im Backend | PASS | Geschützte Diagnose meldet Registry-, Config-Entry-, Repairs- und Automation-Quellen verfügbar; Browser erhält weder Credentials noch generische WS-Kommandos. |
| Matter Capability | PASS | Reale HA-Verbindung meldet Matter-Diagnostik kontrolliert als nicht unterstützt. |
| Default Dashboard | PASS | HTML, Konfiguration und State erreichbar; fünf Cards im Browser-Smoke-Test. |
| Custom Dashboard | PASS | `/d/esszimmer` erreichbar; zwei Cards sowie Summary- und Health-Navigation vorhanden. |
| Summary Dashboard | PASS | Seite und API erreichbar; Same-Origin-Rückziel bleibt erhalten. |
| Error Dashboard | PASS | Seite und API erreichbar; Live-Daten werden ohne Browserfehler gerendert. |
| Exakte Severity-Filter | PASS | Live-Prüfung zeigte ausschließlich `critical`, `warning` beziehungsweise `info`; `error` hatte aktuell 0 Treffer. |
| Severity und Status auf demselben Child Issue | PASS | `critical + unavailable` zeigte nur kritische Cards und nur `unavailable`-Children; automatisierte Cross-Child-Regression ebenfalls bestanden. |
| Globaler Health-State unabhängig von UI-Filtern | PASS | Automatisierte Sprint-25.1-Regression im vollständigen Gate bestanden. |
| Dark-/Light-Persistenz zwischen Routen | PASS | Theme-Wechsel blieb über Summary, Errors und Rücknavigation zum Custom Dashboard erhalten. |
| Same-Window-/Same-Origin-Navigation | PASS | Summary, Errors und Back blieben auf demselben Origin; keine `_blank`-Links; manipuliertes externes `returnTo` wurde entfernt. |
| Focus Sensor, Binary, Light und Climate | PASS | Alle vier nativen Focus-Renderer öffneten sichtbar und mit eigener Focus-Geometrie; keine Konsolenfehler. |
| Full-Height und Footer | PASS | Bei 1280 × 720 blieb die Dokumenthöhe 720 px, der statische Footer unten, ohne Versionsnummer; Version in Summary und Admin vorhanden. |
| Persistente Dashboard-Konfiguration nach Dienstneustart | PASS | SHA256 der 0600-Konfiguration vor und nach Restart identisch. |
| Persistente Background-Dateien nach Dienstneustart | BLOCKED | Auf dem realen LXC ist aktuell kein Dashboard-Hintergrund konfiguriert; ein echter Upload/Replace/Remove-Zyklus wurde nicht in Produktionsdaten erzwungen. |
| Default Background A und Custom Background B | BLOCKED | Benötigt zwei reale freigegebene Bilder und visuelle Abnahme in beiden Dashboards. |
| JPEG-/PNG-Upload und Ablehnung von SVG, MIME-Fehlern, Oversize und Traversal | PASS | Isolierte Admin-API-, Parser-, Speicher- und Security-Tests im vollständigen Gate bestanden. |
| HomeScreen-Verhalten auf realem Legacy-Gerät | BLOCKED | Kein steuerbarer iPad-HomeScreen-Lauf in dieser Abnahme verfügbar. |
| Bestehende Light-/Climate-Schreibsteuerung gegen reale Geräte | NOT TESTED | Physische Geräte wurden während der RC-Prüfung nicht geschaltet. |
| Verhalten bei absichtlich abgeschaltetem Home Assistant | NOT TESTED | Die reale Home-Assistant-Verbindung wurde nicht absichtlich unterbrochen. |
| Logs ohne Secrets, Stacktraces und Reconnect-Schleifen | PASS | Letzte 100 systemd-Zeilen: 0 Secret-Muster, 0 Unhandled-/Stack-Muster, 0 Reconnect-Schleifen. |
| HTTP-Performance-Smoke-Test | PASS | Öffentliche Kernseiten lagen im LAN bei 0,006–0,166 s; keine Konsolenfehler. |
| LXC-/Host-Neustart | NOT TESTED | Dienstneustart wurde geprüft; ein kompletter LXC-/Host-Neustart war nicht Teil der Abnahme. |

## Home Assistant App / HAOS

| Prüfung | Status | Nachweis |
| --- | --- | --- |
| Repository-Struktur für Custom Apps | PASS | Root-`repository.yaml`, App-Verzeichnis, `config.yaml`, Dokumentation, Icon und Logo vorhanden. |
| App-Paket nutzt veröffentlichtes generisches Image | PASS | `image: ghcr.io/tekky85/ha-legacy-dashboard`; Version `1.0.0-rc.1`; anonymes Multi-Arch-Manifest verfügbar. |
| App-Start ohne manuelles `HA_TOKEN` in Simulation | PASS | Lokaler Supervisor-Mock und Container-Smoke-Test des Release-Workflows bestanden. |
| Supervisor REST-Proxy in Simulation | PASS | Isolierter Sprint-24-Test gegen lokalen Supervisor-Mock bestanden. |
| Supervisor WebSocket-Proxy in Simulation | PASS | Authentifizierung und normalisierte Registry-Metadaten im isolierten Mock-Test bestanden. |
| `/data` als App-Datenpfad in Simulation | PASS | Persistenz- und Upgrade-Tests für Konfiguration und Assets im vollständigen Gate bestanden. |
| Repository in realem HAOS hinzufügen | BLOCKED | Keine freigegebene HAOS-Testinstanz beziehungsweise Supervisor-Oberfläche verfügbar. |
| App aus Repository auf realem HAOS installieren | BLOCKED | Abhängig von einer realen HAOS-Testinstanz. |
| App auf realem HAOS starten | BLOCKED | Abhängig von einer realen HAOS-Testinstanz. |
| Direkter LAN-Zugriff auf App-Port 3000 | BLOCKED | Kein real installierter App-Container mit freigegebenem LAN-Port verfügbar. |
| Supervisor Core REST in realem App-Container | BLOCKED | Kein Zugriff auf eine reale HAOS-App-Laufzeit. |
| Supervisor Core WebSocket in realem App-Container | BLOCKED | Kein Zugriff auf eine reale HAOS-App-Laufzeit. |
| Reale App startet ohne `HA_TOKEN` | BLOCKED | Nur Mock- und Container-Smoke-Test verfügbar; reale Supervisor-Injektion nicht geprüft. |
| App-Dateirechte unter `/data` | BLOCKED | Reales `/data` eines installierten App-Containers nicht verfügbar. |
| App Restart Persistenz | BLOCKED | Theme, Dashboards, Rules, Critical Mode, Grace Rules, Background und `showTitle` müssen auf realem HAOS gesetzt und nach App-Restart geprüft werden. |
| Home-Assistant-Restart und Recovery | BLOCKED | Kein freigegebener HAOS-Testhost für den erforderlichen Restart. |
| App-Logs ohne Secrets oder Crash-/Reconnect-Schleifen | BLOCKED | Keine realen App-Logs verfügbar. |
| Home-Assistant-Backup enthält `/data` | BLOCKED | Reales Backup/Restore einer installierten App nicht verfügbar. |
| Upgrade von zwei real installierten RC-Versionen | NOT TESTED | Keine zweite veröffentlichte und installierte RC-Version vorhanden. |
| Reale `aarch64`-Laufzeit | NOT TESTED | Manifest ist vorhanden; kein reales aarch64-HAOS-Testgerät verfügbar. |
| Ingress | NOT TESTED | Ingress ist optional und für den direkten LAN-Zugriff nicht erforderlich. |
| HAOS Host Reboot und Auto-Start | NOT TESTED | Optionaler Host-Reboot wurde nicht durchgeführt. |

## Reale iPad- und Safari-Abnahme

| Prüfung | Status | Nachweis |
| --- | --- | --- |
| iPad mini / iOS 9 – Default Dashboard Portrait | BLOCKED | Kein steuerbarer Realgerätelauf verfügbar. |
| iPad mini / iOS 9 – Default Dashboard Landscape und Rotation | BLOCKED | Kein steuerbarer Realgerätelauf verfügbar. |
| iPad mini / iOS 9 – Custom Dashboard | BLOCKED | Kein steuerbarer Realgerätelauf verfügbar. |
| iPad mini / iOS 9 – Theme über Reload, Summary, Errors und Back | BLOCKED | Kein steuerbarer Realgerätelauf verfügbar. |
| iPad mini / iOS 9 – exakte Severity-/Statusfilter | BLOCKED | Kein steuerbarer Realgerätelauf verfügbar. |
| iPad mini / iOS 9 – HomeScreen ohne Safari-UI oder neuen Tab | BLOCKED | Kein steuerbarer HomeScreen-Lauf verfügbar. |
| iPad mini / iOS 9 – Default/Custom Background, Titel, Dark/Light | BLOCKED | Reale Bilder und Realgerätelauf fehlen. |
| iPad mini / iOS 9 – Full-Height, 0/1/wenige/viele Cards, Footer | BLOCKED | Kein steuerbarer Realgerätelauf verfügbar. |
| iPad mini / iOS 9 – Sensor/Binary/Light/Climate Focus | BLOCKED | Kein steuerbarer Realgerätelauf verfügbar. |
| iPad mini / iOS 9 – Power und Climate Minus/Plus | BLOCKED | Kein steuerbarer Realgerätelauf verfügbar. |
| iPad mini / iOS 9 – Performance | BLOCKED | Keine reale Messung auf dem Zielgerät verfügbar. |
| iPad Air 2 / iPadOS 15 – Focus und HomeScreen Regression | NOT TESTED | Optionales zweites Realgerät wurde nicht ausgeführt. |
| macOS Safari – vollständiger manueller RC-Lauf | NOT TESTED | Automatisiert wurde der Codex-In-App-Browser genutzt, nicht Safari. |

## RC Result Matrix

| Bereich | Status | Blocker/Nachweis |
| --- | --- | --- |
| Repository-Metadaten | PASS | Vollständig und konsistent. |
| Versionen | PASS | `1.0.0-rc.1` in allen Release-Quellen. |
| Tests und Syntax | PASS | 275/275 lokal, auf LXC und in GitHub Actions. |
| Secret Scan und Dependency Audit | PASS | Keine Release-Secrets, 0 bekannte npm-Schwachstellen. |
| GitHub Release und Checksummen | PASS | Prerelease und zwei verifizierte Assets veröffentlicht. |
| GHCR Image Availability | PASS | Anonym abrufbar. |
| Multi-Arch | PASS | `linux/amd64` und `linux/arm64`. |
| Standalone/LXC | PASS | Startup, REST, backendseitiges WS, Dashboards, Systemseiten und Restart geprüft. |
| Standalone-Persistenz | PASS | Dashboard-Konfiguration bleibt nach Service-Restart unverändert. |
| Standalone-Backgrounds | BLOCKED | Keine zwei real konfigurierten Backgrounds für Runtime-/Restart-Abnahme. |
| Home Assistant App Packaging | PASS | Statisch, mit Mock und im veröffentlichten Container-Smoke-Test geprüft. |
| Home Assistant App auf HAOS | BLOCKED | Keine reale HAOS-Testinstanz verfügbar. |
| Supervisor REST/WebSocket real | BLOCKED | Kein realer App-Container verfügbar. |
| Direkter LAN-Zugriff auf HAOS-App | BLOCKED | Kein realer App-Container verfügbar. |
| App-Persistenz und Backup | BLOCKED | Kein reales `/data`, Restart oder Backup/Restore verfügbar. |
| Legacy-Security-Grenzen | PASS | Keine neue Write-Fläche; HA-/Supervisor-Tokens bleiben backend-only. |
| Browser-Navigation und Filter im Desktop-Smoke-Test | PASS | Same-Origin, Theme und exakte Filter live geprüft. |
| iPad mini / iOS 9 | BLOCKED | Pflicht-Realgerätelauf fehlt. |
| HomeScreen-Navigation | BLOCKED | Pflicht-Realgerätelauf fehlt. |
| Focus und Controls auf iPad | BLOCKED | Pflicht-Realgerätelauf fehlt. |
| Logs Standalone | PASS | Keine Secret-, Crash- oder Reconnect-Muster. |
| Logs Home Assistant App | BLOCKED | Keine reale App-Laufzeit verfügbar. |
| Upgrade von RC zu RC | NOT TESTED | Keine zweite reale RC-Installation. |
| RC-Empfehlung | BLOCKED | Pflichtprüfungen auf realem HAOS und iPad mini fehlen. |

## RC BLOCKERS

1. Die veröffentlichte Home Assistant App muss auf einer realen HAOS-
   Testinstanz aus dem GitHub-Repository installiert und gestartet werden.
2. Direkter LAN-Zugriff, Supervisor REST, Supervisor WebSocket, App-Logs und
   der Start ohne manuelles `HA_TOKEN` müssen im realen App-Container geprüft
   werden.
3. Die vollständige App-Konfiguration einschließlich zweier Backgrounds muss
   unter `/data` einen App-Restart überstehen; anschließend sind HA-Restart und
   Backup/Restore zu prüfen.
4. Auf einem iPad mini mit iOS 9 müssen Portrait, Landscape, Rotation,
   Theme-Persistenz, exakte Error-Filter, HomeScreen-Navigation, Backgrounds,
   `showTitle`, Full-Height/Footer, alle Focus-Typen und bestehende Controls
   geprüft werden.
5. Auf dem Standalone-LXC müssen zwei freigegebene reale Backgrounds für
   Default und Custom Dashboard visuell sowie über Reload und Restart geprüft
   werden, sofern dieser Lauf nicht vollständig auf HAOS erfolgt.

Solange mindestens einer dieser Pflichtpunkte offen ist, lautet die
RC-Empfehlung `BLOCKED`. Automatisierte Mock-, Quellcode- oder Desktop-
Browsertests ersetzen diese realen Laufzeit- und Geräteprüfungen nicht.

## Manuelle Abschlussreihenfolge

1. Repository in HAOS hinzufügen, App installieren und starten.
2. Direkten LAN-Zugriff auf Port 3000 sowie REST-/WebSocket-Diagnose prüfen.
3. Default Background A und Custom Background B setzen; Position, Cover/
   Contain, Overlay, Titel, Dark/Light, Portrait und Landscape prüfen.
4. Theme, Entity Rules, Critical Mode, Grace Rules, Background und `showTitle`
   speichern; App neu starten und alle Werte erneut prüfen.
5. Home Assistant neu starten und Recovery prüfen; danach Backup/Restore.
6. Den vollständigen iPad-mini-HomeScreen-Lauf durchführen und die Statuswerte
   dieser Checkliste aktualisieren.

