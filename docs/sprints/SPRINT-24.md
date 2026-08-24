# Sprint 24 – Home Assistant App Packaging

## Status

Planned

## Einordnung

Sprint 24 verpackt HA Legacy Dashboard zusätzlich als **Home Assistant App**
(früher: Add-on).

Wichtig:

> HA Legacy Dashboard bleibt weiterhin eine eigenständige externe
> Node.js/Express-Anwendung.

Die Home-Assistant-App ist ein zusätzlicher Deployment-Modus und ersetzt die
bestehende Standalone-/LXC-Installation nicht.

Unterstützte Betriebsarten nach Sprint 24:

```text
1. Standalone
   Node.js / LXC / VM / Docker
   ↓
   Home Assistant REST/WebSocket API
   ↓
   Long-Lived Access Token im Backend

2. Home Assistant App
   Home Assistant OS
   ↓
   App Container
   ↓
   Supervisor Core API Proxy
   ↓
   SUPERVISOR_TOKEN serverseitig
```

Der Browser erhält in beiden Varianten niemals Home-Assistant-Zugangsdaten.

---

# Aktuelle Home-Assistant-Terminologie

Seit Home Assistant 2026.2 werden Add-ons offiziell als **Apps** bezeichnet.

Apps:

- sind eigenständige Anwendungen
- laufen neben Home Assistant
- werden vom Home Assistant Supervisor verwaltet
- sind über `Settings > Apps` installierbar
- sind nur bei Home Assistant OS verfügbar

Die Repository-/Dateiformate verwenden teilweise weiterhin historisch
entstandene Add-on-Begriffe beziehungsweise Pfade.

Sprint 24 verwendet in Benutzeroberfläche und Dokumentation den Begriff:

```text
Home Assistant App
```

---

# Hauptziele

Sprint 24 implementiert:

1. Home-Assistant-App-Paket
2. App Repository Metadata
3. Multi-Architecture-Containerstrategie
4. `amd64` und `aarch64`
5. App-spezifischen Startup Wrapper
6. Home-Assistant-Core-API-Zugriff über Supervisor Proxy
7. automatische Auswahl des Authentication/Connection Mode
8. persistente App-Konfiguration
9. persistente Dashboard-Konfiguration
10. direkte LAN-WebUI für Legacy-Endgeräte
11. optionalen Home-Assistant-WebUI-Einstieg, soweit sinnvoll
12. App Healthcheck
13. App Logging
14. Backup-/Restore-Kompatibilität
15. lokale App-Build-/Installationsprüfung
16. Erhalt des Standalone-Betriebs

---

# Nicht-Ziel: HA-internes Dashboard

Auch als Home Assistant App bleibt HA Legacy Dashboard:

```text
eine separate Webanwendung
```

Es wird ausdrücklich nicht:

- Lovelace Dashboard
- HA Custom Panel
- Frontend Integration
- Custom Card
- iframe-only Dashboard
- Home-Assistant-Core-Komponente

---

# Offizielle HA-App-Grundlage

Eine Home Assistant App besitzt typischerweise:

```text
config.yaml
Dockerfile
run.sh
README.md
DOCS.md
CHANGELOG.md
icon.png
logo.png
translations/
apparmor.txt
```

Ein App Repository besitzt am Repository-Root:

```text
repository.yaml
```

Sprint 24 soll sich an der aktuellen offiziellen Home-Assistant-App-
Dokumentation orientieren.

---

# Teil A – Repository-Struktur

Codex muss zuerst die tatsächliche Repository-Struktur prüfen.

Bevorzugte Zielstruktur ohne unnötige Quellcode-Duplikation:

```text
/
├── src/
├── package.json
├── ...
├── repository.yaml
├── home-assistant-app/
│   ├── config.yaml
│   ├── README.md
│   ├── DOCS.md
│   ├── CHANGELOG.md
│   ├── icon.png
│   ├── logo.png
│   ├── translations/
│   │   ├── en.yaml
│   │   └── de.yaml
│   └── ...
└── .github/
```

Der tatsächliche App-Ordnername muss mit der Home-Assistant-Repository-
Konvention kompatibel sein.

Falls Home Assistant zwingend einen App-Ordner direkt unter Repository-Root
erwartet, darf die Struktur entsprechend angepasst werden.

Wichtig:

```text
keine zweite vollständige Kopie von src/
```

im App-Verzeichnis.

---

# Teil B – Containerstrategie

## Ziel

Dieselbe Anwendung soll in beiden Betriebsarten laufen.

Bevorzugt ein gemeinsames Runtime-Image beziehungsweise ein gemeinsamer
Anwendungscode.

Nicht zwei divergierende Implementierungen:

```text
Standalone Code
Home Assistant App Code
```

---

# Runtime Modes

Ein zentraler Runtime Mode:

```text
standalone
home_assistant_app
```

oder äquivalente interne Benennung.

---

# Auto Detection

App-Modus darf zuverlässig anhand der App-Umgebung erkannt werden, zum Beispiel
durch vorhandene Supervisor-Umgebungsinformationen.

Trotzdem bevorzugt explizite interne Konfiguration statt fragiler Heuristik.

---

# Teil C – Home Assistant API im App-Modus

## Grundsatz

Im Home-Assistant-App-Modus soll kein Benutzer einen Long-Lived Access Token
manuell erzeugen und in App Options eintragen müssen.

Die App erhält serverseitig Zugriff auf Home Assistant Core über den
Supervisor-Proxy.

Konzept:

```text
HA Legacy Dashboard App
      |
      | Authorization: Bearer SUPERVISOR_TOKEN
      v
http://supervisor/core/api/
```

WebSocket entsprechend über den Supervisor Core WebSocket Proxy.

---

# App Capability

App-Konfiguration benötigt nur die minimal erforderliche Berechtigung:

```text
homeassistant_api: true
```

Keine unnötigen Supervisor-Rechte.

---

# Kein unnötiges hassio_api

Nicht:

```text
hassio_api: true
hassio_role: admin
```

nur aus Bequemlichkeit.

Falls Supervisor API für einen konkreten App-Lifecycle-Zweck benötigt wird:

- separat begründen
- minimalen Scope verwenden
- dokumentieren

Standardziel:

```text
homeassistant_api: true
```

und sonst keine erweiterten Supervisor-Rechte.

---

# SUPERVISOR_TOKEN

Verbindlich:

- nur serverseitig lesen
- niemals Browser senden
- niemals in Config persistieren
- niemals loggen
- niemals in Error Payload aufnehmen
- Secret Redaction erweitern

---

# Teil D – HA Client Abstraction

Bestehenden Home-Assistant-Client nicht duplizieren.

Bevorzugt:

```text
HA Client
├── Standalone Transport
└── Supervisor Proxy Transport
```

oder:

```text
resolveHomeAssistantConnection()
```

---

# Standalone

Bestehendes Verhalten erhalten:

```text
HA_BASE_URL
HA_TOKEN
```

oder tatsächliche vorhandene Variablennamen.

---

# App Mode

Automatisch:

```text
REST base:
http://supervisor/core/api

WebSocket:
ws://supervisor/core/websocket

Bearer:
SUPERVISOR_TOKEN
```

Tatsächliche Pfadbehandlung anhand offizieller HA-App-API prüfen.

---

# Keine Browser-Unterschiede

Frontend darf nicht wissen, ob Backend:

```text
Standalone
oder App
```

ist.

Alle bestehenden Gateway APIs bleiben gleich.

---

# Teil E – App config.yaml

Mindestens:

```text
name
version
slug
description
arch
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

nur soweit sinnvoll.

---

# Architektur

Sprint 24 unterstützt mindestens:

```text
amd64
aarch64
```

---

# Keine unnötigen Privilegien

Nicht aktivieren, sofern nicht zwingend notwendig:

```text
host_network
host_pid
host_dbus
docker_api
full_access
privileged
usb
uart
gpio
udev
```

---

# AppArmor

AppArmor nicht ohne Grund deaktivieren.

Wenn Custom AppArmor Profil notwendig:

```text
minimal benötigte Regeln
```

ansonsten offizielle Default-/Standardstrategie verwenden.

---

# Teil F – Netzwerk / Legacy Browser Access

## Wesentliche Anforderung

Das primäre Zielgerät ist ein Legacy Browser.

Der Benutzer muss HA Legacy Dashboard direkt im lokalen Netzwerk öffnen können.

Beispiel:

```text
http://homeassistant.local:3000/
```

oder:

```text
http://192.168.1.x:3000/
```

abhängig von der Home-Assistant-App-Portkonfiguration.

---

# Direkter Port

App soll den Dashboard-Port explizit bereitstellen.

Bevorzugter interner Port:

```text
3000/tcp
```

wenn dies der bestehenden Anwendung entspricht.

---

# Konfigurierbarer Host Port

Home Assistant App `ports`/Network Configuration verwenden.

Keine feste Annahme, dass Host-Port 3000 immer frei ist.

---

# Kein Ingress-only Betrieb

Ingress darf nicht die einzige Zugriffsmöglichkeit sein.

Grund:

- Legacy iPad soll Dashboard direkt öffnen können
- Dashboard ist bewusst externe WebUI
- HA-Frontend-/Ingress-Pfad soll keine Voraussetzung für das Wall Display sein

---

# Optionaler Ingress

Ingress kann zusätzlich geprüft werden für:

```text
Admin-/Desktop-Zugriff aus Home Assistant
```

aber nur wenn:

- Routing sauber funktioniert
- relative Assets funktionieren
- Return Navigation nicht bricht
- Security sauber bleibt

Ingress ist in Sprint 24 kein Pflichtbestandteil für den Legacy-Wall-Display-
Workflow.

---

# webui

Bevorzugt eine direkte WebUI-Verknüpfung über App `webui`, damit der Benutzer
aus `Settings > Apps` die Anwendung öffnen kann.

---

# Teil G – Bind Address

Standalone kann bestehendes Bind-Verhalten behalten.

Im App Container muss Express auf einer Container-erreichbaren Adresse lauschen.

Typischerweise:

```text
0.0.0.0
```

innerhalb des Containers.

Das ist nicht gleichbedeutend mit unkontrollierter Host-Freigabe; die
Portfreigabe wird durch die App-Netzwerkkonfiguration gesteuert.

---

# Teil H – App Options

App-Konfiguration nur für tatsächlich notwendige Deployment-Optionen.

Beispiele:

```text
log_level
admin_token
port-related behavior, falls erforderlich
```

Aber:

```text
HA_TOKEN
```

ist im App-Modus keine Benutzeroption.

---

# Admin Token

Falls das bestehende Dashboard einen separaten Admin Token verwendet:

- als App Option zulassen oder beim ersten Start sicher erzeugen
- nie in Logs
- nie als HA Token missverstehen
- bestehende Auth-Semantik erhalten

Bevorzugte Strategie anhand aktueller Repository-Implementierung wählen.

---

# Secret Options

Keine Default-Secrets wie:

```text
changeme
admin
password
```

ausliefern.

---

# Teil I – Persistenz

Home Assistant Apps erhalten persistente App-Daten.

Alle persistenten HA Legacy Dashboard Daten müssen gezielt dort gespeichert
werden.

Mindestens prüfen:

```text
Dashboard configuration
Entity Rules
Theme/settings
Critical Detection settings
Grace/Flapping rules
Admin settings
```

---

# /data

Bevorzugt App-persistente Runtime-Daten unter:

```text
/data
```

---

# Keine Persistenz im Container-Filesystem

Nicht dauerhaft unter:

```text
/app
/usr/src/app
/tmp
```

speichern.

Diese Daten können bei Update verloren gehen.

---

# Config Path Abstraction

Bestehende Anwendung soll zentralen Data/Config-Pfad unterstützen.

Beispiel:

```text
DATA_DIR
```

Standalone Default:

```text
bestehender aktueller Pfad
```

App Default:

```text
/data
```

---

# Migration

Bestehende Standalone-Konfiguration nicht automatisch aus LXC übernehmen.

Dokumentieren:

```text
Standalone → HA App Migration
```

als separaten manuellen/optional späteren Prozess.

Keine versteckte Migration.

---

# Teil J – Backup / Restore

App-persistente Daten müssen in Home Assistant Backups enthalten sein, soweit
die Standard-App-Datenstrategie dies vorsieht.

Prüfen:

```text
backup mode
/data
```

Keine unnötigen großen Cache-/Log-Dateien in Backups aufnehmen.

---

# Cache

Caches wie:

```text
Registry Cache
Trace Cache
Flapping In-Memory History
```

müssen nicht zwingend persistiert werden.

---

# Teil K – Startup Wrapper

`run.sh` oder äquivalenter App Entry Point:

1. Runtime Mode setzen
2. Options sicher lesen
3. Environment setzen
4. Data Directory vorbereiten
5. keine Secrets ausgeben
6. Node Prozess mit `exec` starten
7. Signale korrekt weitergeben

---

# PID 1 / Shutdown

Container muss sauber auf SIGTERM reagieren.

Keine Zombie-Prozesse.

---

# Teil L – Logging

Home Assistant App Logs sollen verständlich sein.

Startup:

```text
HA Legacy Dashboard starting
Runtime mode: Home Assistant App
Version: x.y.z
Port: 3000
Home Assistant API: Supervisor proxy
```

Nicht loggen:

```text
SUPERVISOR_TOKEN
Admin Token
HA Token
Authorization Header
```

---

# Log Level

Optional:

```text
info
warning
error
debug
```

Debug darf keine Secrets ausgeben.

---

# Teil M – Healthcheck

Container-/App-Healthcheck gegen kleinen lokalen Endpoint.

Bevorzugt bestehend oder neu:

```text
GET /health
```

Antwort klein:

```javascript
{
  status: "ok"
}
```

Keine Registry-/Entity-Daten.

---

# Healthcheck vs HA Connectivity

Container Health und HA Connectivity unterscheiden.

Beispiel:

```text
App process healthy
HA temporarily unreachable
```

Container nicht unnötig restart-loopen.

---

# Teil N – Container Image

## Ziel

Kleines, reproduzierbares Node Runtime Image.

Prüfen:

- Produktionsdependencies
- keine Dev Dependencies im finalen Image
- kein `.env`
- keine Tests/temporären Artefakte
- non-root soweit mit HA-App-Konvention praktikabel
- definierte Node-Version

---

# Multi-stage Build

Bevorzugt, wenn sinnvoll.

---

# .dockerignore

Mindestens ausschließen:

```text
.git
node_modules
.env
.env.*
coverage
test artifacts
screenshots not required at runtime
docs not required at runtime
```

Keine Secrets ins Image.

---

# Teil O – Versionierung

Eine eindeutige Version Source of Truth definieren.

Abgleichen:

```text
package.json
App config.yaml
Docker image tag
README/version docs
```

Sprint 24 soll die bereits bekannte Version-Mismatch-Technikschuld nicht
verschärfen.

---

# Version Strategy

Bevorzugt semantische Version:

```text
X.Y.Z
```

App `config.yaml version` muss zum veröffentlichten Image Tag passen.

---

# Teil P – App Repository Metadata

Repository Root:

```text
repository.yaml
```

Mindestens:

```text
name
url
maintainer
```

Aktuelle offizielle HA-Spezifikation verwenden.

---

# Sprint 24 vs Sprint 25

Sprint 24:

```text
Packaging
Local installation
Buildability
Runtime correctness
App metadata
```

Sprint 25:

```text
Release
Public distribution
Release workflow
Install button
Upgrade policy
Release notes
Distribution documentation
```

Sprint 24 soll Sprint 25 vorbereiten, aber noch keinen produktiven Release
erzwingen.

---

# Teil Q – Image Publishing Vorbereitung

Die App-Konfiguration darf bereits eine zukünftige GHCR-Image-Referenz
vorbereiten:

```text
ghcr.io/tekky85/ha-legacy-dashboard
```

Tatsächliche Repository-/Owner-Namen anhand Repo prüfen.

---

# Multi-Arch Manifest

Aktuelle HA-App-Publishing-Konvention unterstützt ein generisches
Multi-Architecture-Image.

Sprint 24 soll Build-Struktur so vorbereiten, dass Sprint 25:

```text
amd64
aarch64
multi-arch manifest
```

veröffentlichen kann.

---

# Teil R – Local Development / Test App

Dokumentieren, wie die App lokal in Home Assistant OS getestet wird.

Bevorzugt:

```text
local app repository / local addons/apps development
```

aktuelle HA-Dokumentation beachten.

---

# Kein Production HA Risiko

Tests nicht ungefragt auf realem Produktions-HA durchführen.

Codex darf:

- Docker lokal bauen
- Mock HA API verwenden
- statische App-Konfiguration validieren

Reale App-Installation muss vom Benutzer kontrolliert erfolgen.

---

# Teil S – Mock Supervisor Mode

Automatisierte Tests benötigen einen lokalen Mock für:

```text
http://supervisor/core/api
ws://supervisor/core/websocket
```

Keine Verbindung zum echten Home Assistant.

---

# Test Token

Nur Dummy:

```text
SUPERVISOR_TOKEN=test-token
```

niemals echte Credentials.

---

# Teil T – Connection Adapter Tests

1. standalone mode uses configured HA URL
2. standalone mode uses backend HA token
3. app mode uses Supervisor Core API proxy
4. app mode uses SUPERVISOR_TOKEN
5. app mode does not require HA_TOKEN
6. browser never receives SUPERVISOR_TOKEN
7. WebSocket metadata works through proxy
8. REST state collection works through proxy
9. reconnect behavior
10. API unavailable behavior

---

# Teil U – App Config Tests

11. `config.yaml` valid
12. name/slug/version present
13. amd64 declared
14. aarch64 declared
15. homeassistant_api enabled
16. no unnecessary privileged access
17. no docker_api
18. no host_pid
19. no full_access
20. port declared
21. webui valid
22. options/schema valid
23. no HA token option
24. stage appropriate

---

# Teil V – Persistenz Tests

25. App mode DATA_DIR=/data
26. dashboard config persists
27. entity rules persist
28. theme/settings persist
29. critical mode persists
30. Sprint 22 rule config persists
31. restart preserves config
32. cache loss does not break app

---

# Teil W – Container Tests

33. image builds amd64
34. image structure supports aarch64 build
35. startup succeeds
36. SIGTERM clean
37. no `.env` in image
38. no test credentials in image
39. health endpoint works
40. HA outage does not crash-loop unnecessarily
41. production dependencies only where practical

---

# Teil X – Legacy Browser Regression

42. Default Dashboard
43. Custom Dashboards
44. Summary
45. Errors
46. Global Health Indicator
47. Return Navigation
48. Focus
49. Light Controls
50. Climate Controls
51. Admin
52. iOS 9 ES5 syntax

---

# Sprint 22/23 Regression

53. Grace Periods
54. Expected Offline
55. Flapping
56. Recovery
57. Device Aggregation
58. Automation Impact
59. Advanced Diagnostics
60. Trace Capability handling

---

# Security Regression

61. HA token backend-only standalone
62. SUPERVISOR_TOKEN backend-only app mode
63. no token in browser payload
64. no token in logs
65. no token in image
66. no generic service proxy
67. no generic WS proxy
68. existing write allowlists preserved
69. no unnecessary Supervisor privilege
70. no HA config mount required

---

# Kein Home Assistant Config Mount

Bevorzugt:

```text
kein homeassistant_config mount
```

HA Legacy Dashboard benötigt für seinen normalen Betrieb keinen direkten Zugriff
auf `configuration.yaml`, `secrets.yaml` oder andere HA-Dateien.

Das reduziert Berechtigungen.

---

# Kein /config Secrets Zugriff

Nicht nur aus Bequemlichkeit:

```text
map:
  - homeassistant_config:rw
```

verwenden.

---

# Teil Y – Direct Port Security

Da der Legacy Browser direkt auf die App zugreift:

- bestehende Gateway-Sicherheitsmechanismen bleiben aktiv
- Admin Security bleibt aktiv
- HA Credentials bleiben serverseitig
- keine Annahme, dass Ingress Auth den direkten Port schützt

---

# Admin Zugriff

Falls Admin aktuell separat geschützt ist, diesen Schutz auch im App-Modus
beibehalten.

Ingress darf diesen Schutz nicht versehentlich umgehen.

---

# Teil Z – Dokumentation Installation

README.de.md / README.en.md erhalten zwei klar getrennte Wege:

```text
Installation A – Home Assistant App
Installation B – Standalone
```

---

# App Installation

Sprint 24 dokumentiert zunächst Development/Local Installation.

Öffentliche Repository-Installation folgt Sprint 25.

---

# Standalone

Bestehende LXC-/Node-/Docker-Dokumentation darf nicht entfernt werden.

---

# Migration Hinweis

Dokumentieren:

```text
Die Home Assistant App verwendet einen eigenen persistenten Datenbereich.
Eine bestehende Standalone-Konfiguration wird nicht automatisch übernommen.
```

---

# Manuelle Abnahme – Home Assistant OS

Wenn Testsystem verfügbar:

1. App wird erkannt
2. App lässt sich installieren
3. App startet
4. Logs enthalten keine Secrets
5. WebUI öffnet
6. direkter LAN-Port öffnet
7. HA REST funktioniert
8. HA WebSocket Metadata funktioniert
9. Summary funktioniert
10. Errors funktioniert
11. Admin funktioniert
12. Restart erhält Konfiguration
13. HA Restart wird verkraftet
14. App Restart wird verkraftet

---

# Manuelle Abnahme – iPad

Direkte App-URL auf:

```text
iPad mini / iOS 9.3.5
```

prüfen.

Keine Abhängigkeit vom modernen Home-Assistant-Frontend für den
Wall-Display-Betrieb.

---

# Screenshot-Pflege

Wenn Sprint D1 vorhanden:

Produkt-Screenshots müssen nicht allein wegen Packaging aktualisiert werden,
sofern die sichtbare Dashboard-UI unverändert bleibt.

Optional später:

```text
docs/screenshots/installation/home-assistant-app.png
```

nur echter HA-App-Screenshot.

---

# Dokumentation

Aktualisieren:

```text
README.md
README.de.md
README.en.md
docs/PROJECT_STATUS.md
docs/SPRINT_ROADMAP.md
```

Zusätzlich App-spezifisch:

```text
DOCS.md
CHANGELOG.md
```

---

# Nicht-Ziele

Nicht Bestandteil:

- Veröffentlichung im offiziellen HA App Repository
- produktiver GHCR Release
- HACS
- Home Assistant Integration
- Lovelace Custom Card
- Custom Panel
- automatische Standalone→App Migration
- HA Config File Zugriff
- neue Dashboard-Funktionen
- neue Write-Funktionen
- Automation Trigger/Edit
- öffentliche Release-Automation

Diese Themen gehören insbesondere in Sprint 25 oder spätere Sprints.

---

# Definition of Done

Sprint 24 ist abgeschlossen, wenn:

- Home Assistant App Package vorhanden ist
- aktuelle App-Terminologie verwendet wird
- repository.yaml vorhanden und valide ist
- config.yaml valide ist
- amd64 unterstützt wird
- aarch64 unterstützt wird
- App ohne unnötige Privilegien auskommt
- `homeassistant_api: true` minimal verwendet wird
- App Mode Supervisor Core API Proxy verwendet
- SUPERVISOR_TOKEN nur serverseitig bleibt
- Standalone Mode weiterhin HA URL/Token unterstützt
- Browser API unverändert funktioniert
- direkter LAN-WebUI-Zugriff möglich ist
- Ingress keine Voraussetzung für Legacy Browser ist
- persistente Daten unter App-Datenbereich liegen
- Container Update Konfiguration nicht verliert
- Healthcheck existiert
- sauberes SIGTERM funktioniert
- kein `.env`/Secret im Image enthalten ist
- Multi-Arch-Buildstrategie vorbereitet ist
- lokale App-Installation dokumentiert ist
- Standalone-Installation dokumentiert bleibt
- alle Sprint-21–23-Funktionen regressionsfrei bleiben
- Safari iOS 9 / ES5 erhalten bleibt
- alle Tests grün sind
- docs/PROJECT_STATUS.md aktualisiert wurde

---

# Erwartetes Codex-Ergebnis

Codex berichtet:

1. Startcommit
2. tatsächlicher Repository-Stand
3. finale App-Verzeichnisstruktur
4. geänderte Dateien
5. Runtime-Mode-Architektur
6. Standalone HA Client Verhalten
7. App HA Client Verhalten
8. Supervisor Proxy REST URL
9. Supervisor Proxy WebSocket URL
10. Token Handling
11. App config.yaml Berechtigungen
12. Netzwerk-/Portkonzept
13. WebUI-Konzept
14. Ingress Entscheidung
15. Persistenz/Data Directory
16. Backup-Verhalten
17. Container Build
18. Multi-Arch-Strategie
19. Healthcheck
20. Startup/Shutdown
21. Tests
22. lokaler Mock-Supervisor-Test
23. HA-OS-Test, falls verfügbar
24. iPad-Test, falls verfügbar
25. Sprint-21–23 Regression
26. Security Regression
27. Dokumentationsänderungen
28. verbleibende Einschränkungen
29. Voraussetzungen für Sprint 25
30. Commit-Vorschlag
31. Deployment-/Testbefehle

---

# Codex-Prompt

```text
Read:

- AGENTS.md
- README.md
- README.de.md
- README.en.md
- docs/CODEX_HANDOFF.md
- docs/SPRINT_ROADMAP.md
- docs/PROJECT_STATUS.md
- docs/sprints/SPRINT-21.md
- docs/sprints/SPRINT-21.5.md
- docs/sprints/SPRINT-22.md
- docs/sprints/SPRINT-23.md
- docs/sprints/SPRINT-24.md
- docs/sprints/SPRINT-D1.md if present

Inspect the actual repository state first.

Implement Sprint 24 exactly as specified in docs/sprints/SPRINT-24.md.

Package HA Legacy Dashboard as a Home Assistant App while preserving the
existing standalone deployment.

This is an additional deployment mode, not a conversion into Lovelace,
a custom panel, or a Home Assistant frontend component.

Implement two backend connection modes:

Standalone:
- existing HA base URL
- existing backend-only HA token

Home Assistant App:
- Home Assistant Core REST through the Supervisor proxy
- Home Assistant Core WebSocket through the Supervisor proxy
- backend-only SUPERVISOR_TOKEN
- no manually configured Long-Lived HA token

Use the minimum Home Assistant App permissions required.

Prefer:
- homeassistant_api: true

Do not enable broad Supervisor/admin privileges unless a concrete requirement
is proven and documented.

Do not request:
- full_access
- docker_api
- host_pid
- privileged access
- Home Assistant config directory access

unless absolutely required. The expected implementation should not need them.

SUPERVISOR_TOKEN must:
- never reach the browser
- never be persisted as dashboard config
- never be logged
- never be included in error payloads

Keep the existing browser-facing Gateway APIs independent of deployment mode.

Provide direct LAN access to the dashboard through the Home Assistant App
network/port configuration. Ingress must not be the only wall-display access
method because legacy iPads need to open the dashboard directly without
depending on the modern Home Assistant frontend.

Evaluate optional Ingress only as an additional desktop/admin convenience and
only if routing and security remain correct.

Persist application configuration in the Home Assistant App persistent data
area, preferably /data.

Do not store persistent configuration only in the container filesystem.

Preserve existing standalone config paths via a central data-directory
abstraction.

Create/validate the required Home Assistant App packaging metadata, including
the current official App terminology and repository metadata.

Support at least:
- amd64
- aarch64

Prepare a clean multi-architecture image strategy for Sprint 25.

Do not perform a public production release in this sprint.

Add a small local healthcheck that tests the app process, not full Home
Assistant availability.

A temporary HA outage must not cause an unnecessary container crash loop.

Use a secure startup wrapper:
- read App options safely
- set App runtime mode
- prepare persistent data directory
- do not print secrets
- exec the Node process
- handle SIGTERM correctly

Do not duplicate the application source just for the App package.

Run local-only tests with a mock Supervisor/Core REST and WebSocket endpoint.
Do not contact the real Home Assistant instance.
Do not use production .env or real credentials.

Run complete regressions for Sprint 21 through Sprint 23 and all existing
write-security boundaries.

Keep Safari iOS 9 / ECMAScript 5 compatibility.

Update README.md, README.de.md and README.en.md so Home Assistant App and
Standalone installation are clearly separate supported deployment methods.

Update docs/PROJECT_STATUS.md and docs/SPRINT_ROADMAP.md.

At the end report:
- repository/app structure
- runtime mode architecture
- Supervisor proxy integration
- REST/WebSocket behavior
- token handling
- App permissions
- network/direct-port behavior
- Ingress decision
- persistence/backup behavior
- image/multi-arch strategy
- healthcheck/startup/shutdown
- tests
- security regression
- remaining limitations
- exact prerequisites for Sprint 25

Do not commit or push unless explicitly instructed.
```
