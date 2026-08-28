# Sprint 25.4 – RC CheckUp & Home Assistant App Installation Validation

## Status
Planned

## Charakter des Sprints

Sprint 25.4 ist kein Feature-Sprint.

Er ist ein gezielter:

```text
RC Preflight
+
Home Assistant App Installation Check
+
Runtime Acceptance Test
```

Ziel ist festzustellen, ob der aktuelle Stand tatsächlich als Release Candidate
in beiden vorgesehenen Betriebsarten geeignet ist:

```text
1. Standalone / LXC
2. Home Assistant App / Home Assistant OS
```

---

# Voraussetzungen

Dieser CheckUp setzt voraus, dass mindestens folgende Sprints implementiert sind:

```text
Sprint 24   – Home Assistant App Packaging
Sprint 25   – Release & Distribution
Sprint 25.1 – Theme & Filter Correctness
Sprint 25.2 – HomeScreen Navigation Correctness
Sprint 25.3 – Background Images & Full-Height Layout
```

Codex muss den tatsächlichen Repository-Stand prüfen und darf nicht nur davon
ausgehen, dass die Sprint-Dateien vorhanden sind.

---

# Hauptziele

Sprint 25.4 prüft:

1. Repository-Struktur
2. App Repository Metadata
3. App config.yaml
4. Versionskonsistenz
5. Container-Image-Verfügbarkeit
6. Multi-Architecture-Support
7. Home Assistant App Permissions
8. Token-/Secret-Sicherheit
9. App Installation
10. App Startup
11. Logs
12. direkten LAN-Port
13. Home Assistant REST-Verbindung
14. Home Assistant WebSocket-Verbindung
15. Default Dashboard
16. Custom Dashboards
17. Summary
18. Errors
19. Dark-Mode-Persistenz
20. Exact Error Filtering
21. HomeScreen Same-Window Navigation
22. Background Images
23. Full-Height Layout / Footer
24. App Restart Persistenz
25. Home Assistant Restart Verhalten
26. Standalone/LXC Regression
27. RC-Freigabeentscheidung

---

# Grundsatz

Keine neuen Funktionen implementieren, solange ein fehlgeschlagener Check nicht
eindeutig einen Bug beziehungsweise Packaging-Fehler zeigt.

Dieser Sprint soll prüfen und nur notwendige Korrekturen für RC-Readiness
durchführen.

---

# Teil A – Repository Preflight

Prüfen:

```text
repository.yaml
Home Assistant App Verzeichnis
config.yaml
Dockerfile
run.sh / Entry Point
README / DOCS
CHANGELOG
package.json
package-lock.json
```

Codex dokumentiert die tatsächliche Struktur.

---

# Check A1 – repository.yaml

Prüfen:

```text
Datei vorhanden
YAML valide
Name vorhanden
URL vorhanden
Maintainer vorhanden
keine Platzhalter
keine internen URLs
```

---

# Check A2 – App config.yaml

Prüfen mindestens:

```text
name
version
slug
description
arch
image
startup
boot
homeassistant_api
ports
ports_description
webui
options
schema
stage
url
```

nur soweit tatsächlich erforderlich.

---

# Check A3 – Architecture

Mindestens:

```text
amd64
aarch64
```

---

# Check A4 – Image Reference

Bevorzugt generisch:

```text
ghcr.io/tekky85/ha-legacy-dashboard
```

oder tatsächlich verwendeter Repository-/Image-Name.

---

# Teil B – Versionskonsistenz

Prüfen:

```text
package.json version
App config.yaml version
Git Tag / geplante RC-Version
CHANGELOG
Image Tag
```

Codex darf nicht blind `1.0.0-rc.1` setzen.

Tatsächliche aktuelle Versionshistorie prüfen.

Wenn:

```text
package.json != app config version
```

oder:

```text
App version != verfügbares Image
```

→ RC Blocker.

---

# Teil C – Container Image Check

Prüfen, ob für die App-Version ein passendes Image existiert.

Mindestens:

```text
versioned tag
amd64
arm64
multi-arch manifest
```

Wenn Image noch nicht veröffentlicht ist:

```text
RC App Installation BLOCKED
Reason: required container image not published
```

Codex soll exakt die nötigen Build/Publish-Schritte nennen.

Sprint 25.4 darf ohne ausdrückliche Freigabe keinen Git Tag, GitHub Release,
GHCR Publish, Commit oder Push ausführen.

---

# Teil D – Image Inspection

Wenn lokal gebautes Image verfügbar:

Prüfen:

```text
keine .env
keine echten HA Tokens
kein SUPERVISOR_TOKEN
keine privaten Keys
keine Testcredentials
```

---

# Teil E – App Permissions Check

Erwartet:

```text
homeassistant_api: true
```

Nicht erwartet ohne begründeten Bedarf:

```text
full_access
docker_api
host_pid
host_network
privileged
homeassistant_config:rw
hassio_role: admin
```

Unnötige breite Privilegien gelten als RC Blocker.

---

# Teil F – Token Handling Check

App-Modus:

```text
SUPERVISOR_TOKEN
```

muss ausschließlich serverseitig bleiben.

Token darf nicht erscheinen in:

```text
Browser Payload
HTML
JavaScript Config
Logs
Error Response
Persistent Dashboard Config
Background Config
Debug Dump
```

Standalone HA Long-Lived Access Token bleibt ebenfalls backend-only.

---

# Teil G – App Options Check

Prüfen:

```text
keine HA_TOKEN Option im App-Modus
keine Default-Passwörter
keine Default-Admin-Secrets
keine unnötigen Optionen
```

---

# Teil H – Installierbarkeit des App Repository

Auf Test-Home-Assistant OS:

```text
Settings
→ Apps
→ App store
→ Repositories
→ Repository hinzufügen
```

Prüfen:

1. Repository wird akzeptiert
2. App Store lädt Repository
3. HA Legacy Dashboard erscheint
4. Icon/Name/Description korrekt
5. keine YAML-/Metadata-Fehler

---

# Teil I – Installation

App installieren.

Prüfen:

```text
Image Pull erfolgreich
Architecture korrekt
Installation erfolgreich
keine Permission Errors
```

Fehler klassifizieren als:

```text
repository metadata
image missing
architecture missing
registry permission
config validation
container startup
runtime error
```

---

# Teil J – App Konfiguration vor Start

Vor Start prüfen:

```text
Netzwerk-Port
Optionen
Berechtigungen
WebUI
```

Kein HA Long-Lived Access Token notwendig.

---

# Teil K – First Startup

App starten.

Erwartete Logs konzeptionell:

```text
HA Legacy Dashboard starting
Runtime mode: Home Assistant App
Version: ...
Home Assistant API: Supervisor proxy
Listening on ...
```

Nicht akzeptabel:

```text
SUPERVISOR_TOKEN=...
Authorization: Bearer ...
HA_TOKEN=...
Admin Secret=...
```

---

# Teil L – Healthcheck

Prüfen:

```text
GET /health
```

oder tatsächlichen Health Endpoint.

HA temporär unerreichbar darf nicht automatisch Container-Crashloop bedeuten.

---

# Teil M – REST Verbindung zu Home Assistant

Im App-Modus prüfen:

```text
States werden geladen
Entity State Snapshot funktioniert
Summary erhält Daten
Errors erhält Daten
```

Kein manuell gesetzter HA Token.

---

# Teil N – WebSocket Verbindung

Prüfen, dass serverseitige Registry-/Diagnostic-Metadaten funktionieren,
soweit vom aktuellen Repo benötigt:

```text
Entity Registry
Device Registry
Area Registry
Config Entries
Repairs
Labels
Automation metadata
```

capability-driven.

Kein Browser-WebSocket direkt zu HA.

---

# Teil O – Direct LAN Access

Entscheidender Legacy-Pfad:

```text
http://<HA-IP>:<configured-port>/
```

Dashboard muss direkt öffnen.

Keine Abhängigkeit vom modernen Home Assistant Frontend.

Ingress darf optional funktionieren, ist aber nicht Haupt-RC-Kriterium.

---

# Teil P – Default Dashboard Test

Prüfen:

```text
Dashboard lädt
Cards laden
States aktualisieren
Footer korrekt
Theme korrekt
Summary Navigation
Error Navigation
```

---

# Teil Q – Custom Dashboard Test

Mindestens ein Custom Dashboard.

Prüfen:

```text
Route lädt
Cards korrekt
Return Navigation
Background korrekt
Theme korrekt
```

---

# Teil R – Dark Mode RC Check

Realgerät iPad mini:

```text
Dark aktivieren
Refresh
Summary
Back
Errors
Back
Custom Dashboard
Refresh
```

Erwartung:

```text
Dark bleibt überall aktiv.
```

Fehlschlag:

```text
RC FAIL
```

---

# Teil S – Error Filter RC Check

Test mit:

```text
critical
error
warning
info
unknown
unavailable
```

Exakt:

```text
Critical -> nur Critical
Error -> nur Error
Warning -> nur Warning
Info -> nur Info
```

Combined:

```text
Info + Unknown
Warning + Unavailable
Critical + Unknown
```

Match muss auf demselben Child Issue liegen.

Falsche Severity:

```text
RC FAIL
```

---

# Teil T – HomeScreen Navigation RC Check

Auf iPad mini:

```text
Dashboard über HomeScreen Icon starten
Summary
Back
Errors
Back
```

Erwartung:

```text
kein Safari UI
kein neuer Tab
gleiche Fullscreen Web-App
```

Auch von Custom Dashboard testen.

Wenn normaler Safari geöffnet wird:

```text
RC FAIL
```

---

# Teil U – Background RC Check

Mindestens:

```text
Default Background A
Custom Dashboard Background B
```

Prüfen:

```text
Upload
Persistenz
Reload
Portrait
Landscape
Dark
Light
Titel an
Titel aus
```

Upload Security:

```text
JPEG
PNG
SVG rejected
invalid MIME rejected
oversize rejected
path traversal rejected
```

---

# Teil V – Full-Height Layout / Footer Check

Auf iPad mini testen:

```text
0 Cards
1 Card
wenige Cards
viele Cards
```

Bei wenig Inhalt:

```text
Header oben
Main füllt Rest
Footer unten
```

Bei viel Inhalt:

```text
normales Scrollen
Footer nach Content
kein Overlay
```

Normaler Dashboard-Footer:

```text
eine Zeile
Update-Zeitpunkt mittig
keine Versionsnummer
```

Version muss stattdessen auffindbar sein in:

```text
Admin
Summary
Errors
```

---

# Teil W – Focus Regression

Prüfen:

```text
Sensor Focus
Binary Focus
Light Focus
Climate Focus
```

Background darf Focus nicht beeinträchtigen.

---

# Teil X – Write Controls Regression

Nur bestehende explizite Write Controls.

Prüfen:

```text
Light Power
Climate Power
Climate +/- falls vorhanden
```

Keine neue generische Write API.

---

# Teil Y – App Restart Persistenz

Konfiguration setzen:

```text
Theme
Dashboard
Entity Rules
Critical Mode
Grace Rules
Background
showTitle
```

Dann:

```text
App Restart
```

Alles Persistente muss erhalten bleiben.

---

# Teil Z – Home Assistant Restart

Home Assistant neu starten.

Prüfen:

```text
App Verhalten
Reconnect
Dashboard Recovery
System Dashboard Recovery
```

Kein manueller Token-Reset.

---

# Teil AA – Host Reboot optional

Wenn Testsystem verfügbar:

```text
HAOS Host Reboot
```

Danach App Auto-Start prüfen.

---

# Teil AB – Standalone/LXC Regression

Prüfen auf bestehender Standalone-/Testumgebung:

```text
Startup
HA REST
HA WebSocket metadata
Default Dashboard
Custom Dashboard
Summary
Errors
Dark Mode
HomeScreen
Background
Footer
```

Standalone startet ohne SUPERVISOR_TOKEN.

App startet ohne HA_TOKEN.

Wenn beide Credentials gleichzeitig zwingend erforderlich sind:

```text
RC FAIL
```

---

# Teil AC – Logs Check

App Logs und Standalone Logs prüfen auf:

```text
Secrets
Stack Traces
Unhandled Errors
Repeated reconnect loops
Noisy warnings
```

HA temporär offline:

```text
verständlicher Zustand
kein Secret Leak
kein Crash Loop
```

---

# Teil AD – Performance Smoke Check

Prüfen:

```text
Dashboard initial load
Summary load
Errors load
Background load
Admin load
```

Keine harte Performance-Regression auf dem iPad mini.

---

# Teil AE – Backup Check

Home Assistant App:

```text
/data
```

muss enthalten beziehungsweise persistieren:

```text
Dashboard config
Rules
Settings
Backgrounds
```

README/DOCS sollen Backup vor Update empfehlen.

---

# Teil AF – Upgrade Check

Wenn zwei Testversionen vorhanden:

```text
RC-N
→ RC-N+1
```

Persistenz muss erhalten bleiben.

---

# Teil AG – App Store Display Check

Prüfen:

```text
Name
Description
Version
Icon
Documentation
Source URL
```

Keine Platzhalter.

---

# Teil AH – README Check

README.de.md und README.en.md müssen klar trennen:

```text
Home Assistant App
Standalone / LXC
```

App-Dokumentation mindestens:

```text
Repository hinzufügen
App installieren
Port konfigurieren
Starten
Logs prüfen
direkte LAN-URL
```

---

# Teil AI – No Telemetry Check

Prüfen, dass keine:

```text
Analytics
Crash Upload
Tracking
Phone Home
```

hinzugefügt wurden.

---

# Teil AJ – RC Result Matrix

Am Ende muss eine Matrix geliefert werden.

Beispiel:

| Bereich | Status | Blocker |
|---|---|---|
| Standalone/LXC | PASS | - |
| Home Assistant App Packaging | PASS | - |
| Repository Install | PASS | - |
| App Startup | PASS | - |
| Supervisor REST | PASS | - |
| Supervisor WebSocket | PASS | - |
| Direct LAN UI | PASS | - |
| iPad mini | PASS | - |
| Dark Mode | PASS | - |
| Error Filters | PASS | - |
| HomeScreen Navigation | PASS | - |
| Backgrounds | PASS | - |
| Full-height/Footer | PASS | - |
| Persistence | PASS | - |
| Security | PASS | - |

Nur diese Statuswerte:

```text
PASS
FAIL
BLOCKED
NOT TESTED
```

Nicht getestete reale HAOS-/iPad-Punkte niemals künstlich als PASS markieren.

---

# Teil AK – RC Freigabekriterien

RC kann empfohlen werden, wenn:

```text
keine FAILs
keine sicherheitsrelevanten BLOCKEDs
Standalone PASS
App Installation PASS
App Startup PASS
Direct LAN PASS
iPad Core Tests PASS
Theme PASS
Filters PASS
HomeScreen Navigation PASS
Persistence PASS
Security PASS
```

Optional nicht blockierend, wenn sauber dokumentiert:

```text
Ingress nicht getestet
aarch64 Runtime nicht real getestet, Build/Manifest aber PASS
Host Reboot nicht getestet
```

---

# Teil AL – RC Blocker Liste

Am Ende explizit:

```text
RC BLOCKERS
```

Wenn keine:

```text
None
```

---

# Teil AM – Manual Test Sheet

Empfohlen:

```text
docs/RC_CHECKLIST.md
```

Home Assistant App:

```text
[ ] Repository hinzugefügt
[ ] App erscheint
[ ] Installation erfolgreich
[ ] Start erfolgreich
[ ] Logs secret-free
[ ] Direct LAN URL funktioniert
[ ] REST Daten funktionieren
[ ] WebSocket Metadaten funktionieren
[ ] App Restart erfolgreich
[ ] HA Restart erfolgreich
```

iPad mini:

```text
[ ] Default Dashboard
[ ] Custom Dashboard
[ ] Dark persistent
[ ] Summary
[ ] Errors
[ ] Info Filter
[ ] Warning Filter
[ ] Error Filter
[ ] Critical Filter
[ ] HomeScreen Summary same-window
[ ] HomeScreen Errors same-window
[ ] Background Default
[ ] Background Custom
[ ] Title off
[ ] Footer bottom
[ ] Portrait
[ ] Landscape
[ ] Focus
```

---

# Dokumentation

Aktualisieren:

```text
docs/PROJECT_STATUS.md
docs/SPRINT_ROADMAP.md
docs/RC_CHECKLIST.md
```

Nur bei tatsächlich erfolgreichen Pflichtprüfungen darf dokumentiert werden:

```text
RC candidate validated
```

---

# Nicht-Ziele

Nicht Bestandteil:

- neue Features
- neues UI Design
- neue Automationsfunktionen
- neue Write APIs
- automatisches Stable Release
- automatischer Git Tag
- automatischer GHCR Publish ohne Freigabe
- HACS
- offizielle Aufnahme ins Home Assistant Repository

---

# Definition of Done

Sprint 25.4 ist abgeschlossen, wenn:

- Repository Preflight durchgeführt wurde
- App Metadata validiert wurde
- Versionskonsistenz geprüft wurde
- Image-Verfügbarkeit geprüft wurde
- Multi-Arch geprüft wurde
- App Permissions geprüft wurden
- Token Handling geprüft wurde
- Repository in HAOS getestet oder klar BLOCKED markiert wurde
- Installation getestet oder klar BLOCKED markiert wurde
- Startup getestet oder klar BLOCKED markiert wurde
- Direct LAN Access getestet wurde
- REST getestet wurde
- WebSocket getestet wurde
- Dark Mode auf iPad mini getestet wurde
- Error Filters auf iPad mini getestet wurden
- HomeScreen Navigation auf iPad mini getestet wurde
- Background/Title getestet wurden
- Full-height/Footer getestet wurde
- App Restart Persistenz getestet wurde
- HA Restart Verhalten getestet wurde
- Standalone Regression geprüft wurde
- Security Check durchgeführt wurde
- RC Result Matrix erstellt wurde
- RC Blocker Liste erstellt wurde
- Manual Checklist erstellt wurde
- keine nicht getesteten Punkte fälschlich als PASS markiert wurden
- docs/PROJECT_STATUS.md aktualisiert wurde

---

# Erwartetes Codex-Ergebnis

Codex berichtet:

1. Startcommit
2. tatsächlicher Repo-Stand
3. aktuelle Version
4. vorgeschlagene RC-Version
5. repository.yaml Ergebnis
6. config.yaml Ergebnis
7. Versionskonsistenz
8. Image Reference
9. Image-Verfügbarkeit
10. Multi-Arch Ergebnis
11. App Permissions
12. Token-/Secret-Prüfung
13. Installierbarkeit Repository
14. App Installation
15. Startup Logs
16. Healthcheck
17. Supervisor REST
18. Supervisor WebSocket
19. Direct LAN Access
20. Default Dashboard
21. Custom Dashboard
22. Dark Mode
23. Error Filter
24. HomeScreen Navigation
25. Backgrounds
26. Full-height/Footer
27. Focus/Controls
28. App Restart Persistenz
29. HA Restart
30. Standalone/LXC Regression
31. Security Regression
32. Dokumentationsprüfung
33. RC Result Matrix
34. RC Blockers
35. NOT TESTED / BLOCKED Punkte
36. RC Empfehlung
37. notwendige nächste Schritte
38. Commit-Vorschlag
39. Install-/Testbefehle

---

# Codex-Prompt

```text
Read:

- AGENTS.md
- README.md
- README.de.md
- README.en.md
- CHANGELOG.md if present
- repository.yaml
- package.json
- package-lock.json
- Home Assistant App config.yaml
- Home Assistant App Dockerfile
- Home Assistant App startup script
- docs/CODEX_HANDOFF.md
- docs/SPRINT_ROADMAP.md
- docs/PROJECT_STATUS.md
- docs/sprints/SPRINT-24.md
- docs/sprints/SPRINT-25.md
- docs/sprints/SPRINT-25.1.md
- docs/sprints/SPRINT-25.2.md
- docs/sprints/SPRINT-25.3.md
- docs/sprints/SPRINT-25.4.md
- docs/sprints/SPRINT-D1.md if present

Inspect the actual repository state first.

Execute Sprint 25.4 exactly as specified in
docs/sprints/SPRINT-25.4.md.

This is an RC CheckUp / validation sprint, not a feature sprint.

Validate both deployment modes:
1. Standalone/LXC
2. Home Assistant App / Home Assistant OS

Perform repository, version, image, multi-arch, permission and secret checks.

If the required App image is not published, mark App installation BLOCKED and
report the exact publish steps. Do not publish it without explicit approval.

Verify minimum App permissions and backend-only token handling.

For real HAOS testing validate:
- repository add
- app discovery
- installation
- startup
- secret-free logs
- health
- Supervisor REST
- Supervisor WebSocket
- direct LAN UI

Then validate on the real iPad mini:
- Dark persistence
- exact Severity filters
- combined Severity/Status filters
- HomeScreen Summary same-window
- HomeScreen Errors same-window
- Back same-window
- per-dashboard backgrounds
- showTitle
- full-height layout
- footer behavior
- Focus and controls

Test App restart persistence and Home Assistant restart/reconnect.

Run Standalone/LXC regression.

Use only:
PASS
FAIL
BLOCKED
NOT TESTED

Never mark unavailable real-device/runtime checks as PASS.

Produce:
- docs/RC_CHECKLIST.md
- RC Result Matrix
- explicit RC BLOCKERS
- final RC recommendation

Update docs/PROJECT_STATUS.md and docs/SPRINT_ROADMAP.md.

Do not create tags, releases, publish images, commit or push until I review the
result.
```
