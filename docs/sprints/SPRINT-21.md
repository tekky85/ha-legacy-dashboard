# Sprint 21 – Registry & Diagnostic Enrichment

## Status
Planned

## Einordnung
Sprint 21 erweitert die bereits vorhandenen System-Dashboards um Home-Assistant-Metadaten und diagnostische Quellen.

Vorausgesetzt werden:
- Sprint 18 – System Dashboard Foundation
- Sprint 19 – Summary Dashboard MVP
- Sprint 20 – Error Dashboard MVP
- Sprint 17.3 – Live Card Preview, Unified Controls & Focus Mode
- Sprint D1, sofern bereits umgesetzt

Sprint 21 bleibt für alle neu angebundenen Home-Assistant-Datenquellen **read-only**.

---

# Ziel

Bisher kennt das System-Dashboard primär Entity-State-Daten. Sprint 21 ergänzt – soweit über unterstützte Home-Assistant-Schnittstellen verfügbar – Informationen aus:

```text
Entity Registry
Device Registry
Area Registry
Config Entries
Repairs / Issues
Matter-Diagnostik (nur capability-gesteuert)
```

Beispiel:

```text
Vorher:
binary_sensor.rauchmelder_flur unavailable

Nachher:
Rauchmelder Flur
Gerät: Rauchmelder Flur
Raum: Flur
Integration: ZHA
nicht erreichbar seit 14 Min.
```

---

# Sicherheitsgrundsätze

Unverändert:
- HA-Token ausschließlich im Backend
- kein HA-Token im Browser
- keine direkte Browser-Verbindung zu Home Assistant
- keine generische HA-Service-API
- keine Registry-Schreibaktionen
- keine Config-Entry-Reload-/Update-Aktionen
- keine Repair-/Reauth-Aktionen
- keine Matter-Schreibaktionen
- bestehende Write-Allowlists unverändert
- bestehende Rate Limits, Payload Limits, Security Header und Secret Redaction bleiben erhalten

```text
Diagnostic sichtbar != Aktion erlaubt
```

---

# Backend-WebSocket für Metadaten

Sprint 21 darf einen **serverseitigen** Home-Assistant-WebSocket-Client für Metadaten und Diagnostik einführen.

```text
Legacy Browser
      |
      | HTTP
      v
Gateway
      |
      | serverseitig: /api/websocket
      v
Home Assistant
```

Der Legacy-Browser verbindet sich niemals direkt mit Home Assistant.

Der bestehende REST-/State-Collector aus Sprint 18 bleibt bestehen, sofern die reale Architektur keinen zwingenden Grund für eine Änderung liefert.

---

# WebSocket Client Anforderungen

Der Backend-WebSocket-Client muss:
- HA-WebSocket-Authentifizierung korrekt durchführen
- eindeutige Request-IDs verwalten
- Antworten zuverlässig Requests zuordnen
- Timeouts besitzen
- Disconnect/Reconnect kontrolliert behandeln
- begrenztes Backoff verwenden
- keine Tight Loop erzeugen
- keine Tokens loggen
- Fehler pro Quelle isolieren

Ein WebSocket-Ausfall darf normale Dashboards, Summary oder das bestehende Error-MVP nicht zerstören.

---

# Capability-gesteuerte Architektur

Nicht voraussetzen, dass jede HA-Version jede diagnostische API bereitstellt.

Konzeptuell:

```javascript
{
  entityRegistry: true,
  deviceRegistry: true,
  areaRegistry: true,
  configEntries: true,
  repairs: true,
  matterDiagnostics: false
}
```

Fehlende Capability bedeutet:

```text
unsupported
```

nicht:

```text
system broken
```

Keine Versionsprüfung allein als Wahrheit verwenden. Bevorzugt echten kontrollierten Command-Probe beziehungsweise saubere Fehlerbehandlung.

---

# Teil A – Entity Registry

Mindestens relevante Metadaten, soweit vorhanden:

```text
entity_id
device_id
area_id
config_entry_id
platform
disabled_by
hidden_by
entity_category
name
original_name
icon
```

## Entity Category

Besonders relevant:

```text
config
diagnostic
```

Diese Kategorien sollen künftig besser von Primär-Entities unterscheidbar sein.

Sprint 21 soll die Metadaten bereitstellen und in Summary/Error sinnvoll berücksichtigen.

## Disabled / Hidden

Verbindlich unterscheiden:

```text
disabled
hidden
unavailable
unknown
```

`disabled_by != null` ist **kein unavailable-Fehler**.

`hidden_by != null` erzeugt ebenfalls nicht automatisch ein Issue.

## Registry-only

Ein Registry-Eintrag ohne aktuellen State darf nicht pauschal als „orphaned“ klassifiziert werden.

Optional intern:

```text
registryOnly: true
```

Eine echte Orphan-Klassifikation ist erst erlaubt, wenn dafür eine belastbare Regel existiert.

---

# Teil B – Device Registry

Mindestens relevante Felder, soweit vorhanden:

```text
device_id
name
name_by_user
area_id
manufacturer
model
model_id
sw_version
hw_version
config_entry_id
config_subentry_id
via_device_id
```

## Name

Anzeige-Priorität:

1. `name_by_user`
2. `name`
3. Entity Friendly Name
4. Entity ID

## Sensible Identifier

Nicht ungefiltert an Browser ausgeben:
- MAC-Adressen
- Seriennummern
- raw identifiers
- raw connections

Nur serverintern verwenden, falls wirklich für Korrelation erforderlich.

## Home Assistant 2026.8

Die aktuelle Device-Registry-Semantik mit genau einem Config Entry pro Device berücksichtigen.

Bevorzugtes internes Modell:

```text
configEntryId
configSubentryId
```

Mit defensivem Fallback für ältere Antwortformen.

---

# Teil C – Area Registry

Area-Auflösung:

1. Entity Registry `area_id`
2. Device Registry `area_id`
3. keine Area

Keine Raumheuristik aus Entity-Namen.

Beispiel UI:

```text
Raum: Badezimmer
```

Floor-Unterstützung darf vorbereitet werden, ist aber kein DoD-Pflichtpunkt.

---

# Teil D – Config Entries

Read-only Metadaten:

```text
entry_id
domain
title
state
source
disabled_by
```

Unbekannte neue States defensiv behandeln.

Klar problematische States dürfen diagnostische Issues erzeugen, z. B.:

```text
setup_error
migration_error
failed_unload
```

`loaded` erzeugt kein Issue.

`setup_retry` kontrolliert klassifizieren und nicht automatisch überdramatisieren.

Keine Aktionen:
- reload
- disable
- enable
- delete
- update
- reauth

---

# Teil E – Repairs / Home Assistant Issues

Wenn die read-only Repairs-API unterstützt wird, Home-Assistant-Issues in das bestehende `DashboardIssue`-Modell normalisieren.

Konzept:

```javascript
{
  id: "ha-repair-domain-issue",
  source: "home_assistant_repair",
  severity: "warning",
  title: "...",
  description: "...",
  domain: "...",
  fixable: true
}
```

Severity Mapping bevorzugt:

```text
HA CRITICAL -> critical
HA ERROR    -> error
HA WARNING  -> warning
```

Unbekannte Werte defensiv behandeln.

`fixable == true` bedeutet nur:

```text
In Home Assistant reparierbar
```

Kein Fix-Button in Sprint 21.

Keine Repair-Flows starten, keine Issues ignorieren/dismiss.

---

# Teil F – Matter Diagnostic Adapter

Matter wird als Adapter in die generische Issue Engine integriert, nicht als separates Fehlersystem.

Nur read-only und capability-gesteuert.

Mögliche Ausgabe:

```text
Matter-Komponente beeinträchtigt
3 Geräte betroffen
8 Entities betroffen
```

Nur aggregieren, wenn Korrelation zuverlässig ist.

Keine Matter-Schreibaktionen:
- Commissioning
- Fabric Management
- Open Commissioning Window
- Wi-Fi-/Thread-Credentials setzen
- Remove Fabric
- sonstige Schreibcommands

Nie an Browser weiterreichen:
- Wi-Fi Credentials
- Thread Credentials
- Fabric Secrets
- private keys
- Zertifikate
- Pairing Codes
- Commissioning-Daten

Wenn read-only Matter-Diagnostik nicht unterstützt wird:

```text
matterDiagnostics = unsupported
```

ohne Fehlerflut.

---

# Enriched System Snapshot

Bestehenden Sprint-18-Snapshot erweitern, nicht ersetzen.

Konzeptuell:

```javascript
{
  entities: [...],
  metadata: {
    entities: {...},
    devices: {...},
    areas: {...},
    configEntries: {...}
  },
  diagnostics: {
    repairs: [...],
    matter: [...]
  },
  capabilities: {
    entityRegistry: true,
    deviceRegistry: true,
    areaRegistry: true,
    configEntries: true,
    repairs: true,
    matterDiagnostics: false
  },
  sources: {
    states: {...},
    entityRegistry: {...},
    deviceRegistry: {...},
    areaRegistry: {...},
    configEntries: {...},
    repairs: {...},
    matter: {...}
  }
}
```

Jede Quelle braucht intern mindestens:

```text
supported
ok
stale
lastSuccessfulAt
errorCode
```

---

# Partial Failure

Beispiel:

```text
States             OK
Entity Registry    OK
Device Registry    OK
Area Registry      FAILED
Config Entries     OK
Repairs            UNSUPPORTED
Matter             UNSUPPORTED
```

Dann:
- State-basierte Summary/Error-Logik läuft weiter
- Device-/Integration-Enrichment bleibt, soweit vorhanden
- Area fehlt
- kein kompletter API-500
- optional „Metadaten teilweise verfügbar“

---

# Caching

Registry-/Diagnostic-Daten serverseitig cachen.

Orientierung:

```text
States:            1–5 Sekunden
Registry Metadata: 30–120 Sekunden
Config Entries:    15–60 Sekunden
Repairs:           15–60 Sekunden
Matter:            konservativ / 30–60 Sekunden / on-demand
```

Reale bestehende Refresh-Architektur ist maßgeblich.

Verbindlich:

```text
kein Registry-Fetch bei jedem Browser-Poll
```

Parallele Refreshes nach Möglichkeit deduplizieren.

---

# Error Dashboard Enrichment

Bestehende Entity-Issues aus Sprint 20 erhalten, soweit verfügbar:

```text
deviceName
areaName
integration
platform
entityCategory
disabledBy
```

Beispiel:

```text
KRITISCH
────────────────────────
Rauchmelder Flur
nicht erreichbar seit 14 Min.

Raum: Flur
Gerät: Rauchmelder Flur
Integration: ZHA
Entity: binary_sensor.rauchmelder_flur
```

Config-Entry-Issue Beispiel:

```text
FEHLER
────────────────────────
Zigbee Home Automation
Integration konnte nicht geladen werden

Status: setup_error
```

Repair-Issue Beispiel:

```text
WARNUNG
────────────────────────
Home Assistant Repair
Integration benötigt Aufmerksamkeit
In Home Assistant reparierbar
```

Keine aktive Repair-Schaltfläche.

---

# Summary Dashboard Enrichment

Keine neuen Sprint-22-Aktivitätsregeln vorziehen.

Erlaubt:
- bessere Area-Zuordnung
- bessere Device-Namen
- `entity_category=diagnostic/config` standardmäßig aus Summary herausfiltern
- Integration-Metadaten intern verfügbar machen

Normale Summary-Regeln bleiben unverändert.

---

# Admin – Diagnostic Capabilities

Im Admin-Systembereich read-only anzeigen:

```text
Diagnostic Sources

Entity Registry       verfügbar
Device Registry       verfügbar
Area Registry         verfügbar
Config Entries        verfügbar
Repairs               verfügbar / unsupported
Matter Diagnostics    verfügbar / unsupported
```

Keine Registry-/Config-Entry-Bearbeitung.

Optional enger Admin-Endpunkt:

```text
GET /api/admin/system-diagnostics/status
```

Keine öffentliche Raw-Registry-API.

---

# Keine generische WebSocket-Proxy-API

Explizit verboten:

```text
POST /api/admin/ws-command
{
  "type": "anything"
}
```

Nur fest codierte interne Source-Adapter.

---

# Fehlercodes

Beispielhafte interne Codes:

```text
ha_websocket_unavailable
ha_websocket_auth_failed
ha_websocket_timeout
ha_command_unsupported
registry_fetch_failed
repairs_fetch_failed
matter_diagnostics_failed
```

Keine Stacktraces im Browser.

---

# Tests – WebSocket Client

Mindestens:

1. `auth_required` verarbeitet
2. Auth gesendet
3. `auth_ok` verarbeitet
4. `auth_invalid` kontrolliert
5. Request IDs eindeutig
6. Antworten korrekt zugeordnet
7. Timeout kontrolliert
8. Disconnect kontrolliert
9. Reconnect funktioniert
10. Token nicht in Logs
11. Token nicht in Browser-Payloads

---

# Tests – Entity Registry

12. Registry-Daten geladen
13. device_id angereichert
14. area_id angereichert
15. platform übernommen
16. diagnostic Entity erkannt
17. config Entity erkannt
18. disabled_by übernommen
19. hidden_by übernommen
20. disabled Entity nicht automatisch unavailable
21. Registry-only nicht automatisch orphaned

---

# Tests – Device Registry

22. Device Name aufgelöst
23. name_by_user priorisiert
24. Hersteller/Modell intern vorhanden
25. sensible Identifier nicht öffentlich
26. Device Area wird genutzt, wenn Entity Area fehlt
27. Entity Area hat Vorrang
28. Config Entry Zuordnung korrekt
29. Single-Config-Entry-Modell unterstützt
30. ältere Antwortform defensiv behandelt

---

# Tests – Area Registry

31. area_id -> Name
32. fehlende Area kein Fehler
33. unbekannte area_id kein Crash
34. keine Area-Heuristik aus Namen

---

# Tests – Config Entries

35. Config Entries gelesen
36. loaded erzeugt kein Issue
37. setup_error erzeugt Issue
38. setup_retry kontrolliert
39. unbekannter State kein Crash
40. Integration mit Entity/Device korreliert
41. keine Config Entry Write-Aktion

---

# Tests – Repairs

42. Capability erkannt
43. unsupported kontrolliert
44. Repair normalisiert
45. Critical Mapping
46. Error Mapping
47. Warning Mapping
48. fixable bleibt read-only
49. kein Repair-Fix-Aufruf
50. Payload sanitisiert

---

# Tests – Matter

51. Adapter read-only
52. unsupported kontrolliert
53. Diagnosefehler crashen nicht
54. Credentials nie öffentlich
55. betroffene Devices gezählt, wenn unterstützt
56. betroffene Entities gezählt, wenn unterstützt
57. Aggregation deterministisch
58. keine Matter-Schreibcommands

---

# Tests – Cache / Partial Failure

59. Registry Cache wiederverwendet
60. TTL aktualisiert Daten
61. parallele Requests dedupliziert, falls implementiert
62. Area Failure zerstört Device-Enrichment nicht
63. Repairs Failure zerstört Error-MVP nicht
64. WebSocket Failure zerstört REST-State-Snapshot nicht
65. letzter Metadata Snapshot kann stale bleiben
66. Recovery aktualisiert Metadaten

---

# Regression – Summary / Error / Sprint 17.3

67. Summary funktioniert
68. Summary-Regeln unverändert
69. diagnostic/config Entities stören Summary nicht
70. Area Enrichment funktioniert
71. unavailable funktioniert
72. unknown funktioniert
73. Security Severity funktioniert
74. Ignore funktioniert
75. stale/offline funktioniert
76. disabled != unavailable
77. Admin Live Preview funktioniert
78. Focus Cards funktionieren
79. Light Control funktioniert
80. Climate Temperatur funktioniert
81. Climate Power funktioniert
82. Dark Mode Persistenz funktioniert
83. iOS-9-/ES5-Prüfung grün

---

# Security Regression

84. keine generische WS-Command API
85. HA-Token Backend-only
86. Admin-Token geschützt
87. Registries read-only
88. Config Entries read-only
89. Repairs read-only
90. Matter read-only
91. bestehende Write-Allowlists unverändert
92. Browser bestimmt keine WS-Command-Typen
93. sensible Device-Identifier sanitisiert

---

# Performance

Mock-/Synthetiktest mindestens:

```text
3000 Entities
500 Devices
50 Areas
100 Config Entries
100 Repairs
```

Prüfen:
- effiziente Joins über Maps/Indexes
- keine unnötigen O(n²)-Suchen
- Browser-Payload klein
- keine ungefilterten Registry-Dumps
- kein Metadatenfetch pro Browser-Poll

Bevorzugte interne Maps:

```text
entitiesByEntityId
devicesById
areasById
configEntriesById
```

---

# Logging

Sinnvolle strukturierte Events:

```text
ha_ws_connected
ha_ws_disconnected
ha_ws_auth_failed
registry_refresh_started
registry_refresh_succeeded
registry_refresh_failed
config_entries_refresh_succeeded
repairs_refresh_succeeded
matter_diagnostics_refresh_succeeded
```

Keine Tokens, Raw Diagnostic Dumps oder sensitiven Identifier loggen.

---

# Manuelle Abnahme

## Error Dashboard
Prüfen:
- Device Name
- Area
- Integration
- disabled Entity
- unknown
- unavailable
- Config Entry setup error
- Repair, falls unterstützt
- Partial Failure
- HA offline
- Recovery
- Dark/Light
- Portrait/Landscape

## Summary
Prüfen:
- Area-Namen
- diagnostic/config Entities nicht störend
- normale Summary Items unverändert
- keine spürbare Performanceverschlechterung

## Admin
Prüfen:

```text
System Diagnostics
Entity Registry
Device Registry
Area Registry
Config Entries
Repairs
Matter
```

Status jeweils:

```text
Available
Unsupported
Stale
Error
```

---

# Screenshot-Pflege

Wenn Sprint D1 vorhanden ist, Screenshot-Review durchführen.

Mindestens prüfen:

```text
docs/screenshots/system/errors.png
docs/screenshots/system/summary.png
```

Bei sichtbarer Error-Enrichment-Änderung `errors.png` neu aufnehmen.

Optional bei neuem Admin Diagnostic Bereich:

```text
docs/screenshots/admin/system-diagnostics.png
```

Nur echte Produkt-/Demo-Screenshots, keine generierten Mockups.

---

# Dokumentation

Aktualisieren:

```text
README.de.md
README.en.md
docs/PROJECT_STATUS.md
docs/SPRINT_ROADMAP.md
```

Beide README-Sprachen semantisch synchron halten.

Dokumentieren:
- Backend WebSocket nur für Metadata/Diagnostics
- Capability-gesteuerte Quellen
- Registry Enrichment
- Config Entry Read-only Diagnostics
- Repairs read-only
- Matter capability-dependent/read-only
- Partial Failure
- Sanitization
- aktuelle Device-Registry-Semantik

---

# Nicht-Ziele

Nicht Bestandteil von Sprint 21:

- Registry Writes
- Device Delete
- Area Änderungen
- Config Entry Reload/Enable/Disable/Delete/Update
- Reauthentication
- Repair Flow
- Repair Ignore/Dismiss
- Matter Commissioning
- Matter Fabric Management
- Matter Credential Changes
- Automation Impact
- Grace Periods
- Flapping
- Maintenance Mode
- Sprint-22-Device-Aggregation-Rules
- Home Assistant App Packaging
- HACS

---

# Definition of Done

Sprint 21 ist abgeschlossen, wenn:

- sicherer Backend-HA-WebSocket-Client vorhanden ist
- Entity Registry read-only angebunden ist
- Device Registry read-only angebunden ist
- Area Registry read-only angebunden ist
- Config Entries read-only angebunden sind
- Quellen capability-gesteuert sind
- Repairs read-only angebunden sind, wenn unterstützt
- Matter nur capability-gesteuert/read-only arbeitet
- System Snapshot Metadata/Source Status enthält
- Entity Issues Device-/Area-/Integrationskontext erhalten
- disabled von unavailable unterschieden wird
- diagnostic/config Entities identifiziert werden
- Config Entry Setup-Probleme sichtbar werden
- Repairs in DashboardIssue normalisiert werden
- Partial Failure bestehende Dashboards nicht zerstört
- Metadaten gecacht werden
- keine Registry-Abfrage pro Browser-Poll erfolgt
- keine neuen Schreibaktionen existieren
- keine generische WebSocket-Command-API existiert
- Browser keine Raw Registries erhält
- sensible Device-Identifier sanitisiert sind
- Summary/Error/Sprint-17.3-Regressions grün sind
- iOS-9-/ES5-Kompatibilität erhalten bleibt
- README.de.md und README.en.md synchron aktualisiert sind
- `docs/PROJECT_STATUS.md` aktualisiert ist

---

# Erwartetes Codex-Ergebnis

Codex berichtet:

1. Startcommit
2. tatsächlicher Repo-/Produktionsstand
3. geänderte Dateien
4. Backend-WebSocket-Architektur
5. tatsächlich verwendete HA-WebSocket-Commands
6. Capability-Probe
7. Entity-Registry-Modell
8. Device-Registry-Modell
9. Area-Auflösung
10. Config-Entry-Modell
11. Repairs-Unterstützung
12. Matter-Unterstützung / Unsupported-Verhalten
13. Partial-Failure-Modell
14. Cache-TTLs
15. Sanitization
16. Error-Enrichment-Felder
17. Summary-Auswirkungen
18. Testanzahl und Ergebnis
19. Performance-Test
20. iPad-Abnahme
21. Screenshot-Review
22. Security-Regression
23. verbleibende Einschränkungen
24. Voraussetzungen für Sprint 22
25. Commit-Vorschlag
26. Deploymentbefehle

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
- docs/sprints/SPRINT-17.3.md
- docs/sprints/SPRINT-18.md
- docs/sprints/SPRINT-19.md
- docs/sprints/SPRINT-20.md
- docs/sprints/SPRINT-21.md
- docs/sprints/SPRINT-D1.md if present

Inspect the actual repository state first.

Implement Sprint 21 exactly as specified in docs/sprints/SPRINT-21.md.

Goal:

Enrich the existing Summary/Error System Dashboards with read-only Home
Assistant registry and diagnostic metadata.

Add a backend-only Home Assistant WebSocket client for metadata/diagnostics.
Never expose Home Assistant WebSocket access or credentials to the browser.

Implement capability-driven read-only adapters for:

- Entity Registry
- Device Registry
- Area Registry
- Config Entries
- Repairs when supported
- Matter diagnostics only when safely supported

Use fixed internal command adapters. Do not create a generic WebSocket command
proxy.

Preserve the existing REST/state collector unless the actual repository
architecture provides a compelling reason to change it.

Entity Registry:
- enrich device_id, area_id, config entry, platform, entity category,
  disabled/hidden metadata
- distinguish disabled from unavailable
- do not classify registry-only entries as orphaned without stronger evidence

Device Registry:
- enrich device name, area, manufacturer/model where appropriate
- do not expose raw identifiers, MAC addresses, serial numbers or connections
- support the current single-config-entry device model with defensive
  compatibility for older response shapes

Area Registry:
- entity area first
- device area second
- never infer area from names

Config Entries:
- read state/domain/title
- create diagnostic issues only for clearly problematic states
- no reload/disable/delete/update/reauth actions

Repairs:
- capability-probe the read-only list API
- normalize supported repairs into DashboardIssue
- keep fixable issues read-only
- do not start repair flows or dismiss issues

Matter:
- adapter inside the generic Issue Engine
- read-only only
- never expose credentials/fabric secrets/pairing data
- no commissioning or write commands
- aggregate affected devices/entities only when correlation is reliable

Implement source-level status, caching and partial-failure behavior.

Registry/diagnostic failures must never break the existing State-based
Summary/Error functionality.

Do not refetch all registries on every browser poll.

Preserve all existing Home Assistant security boundaries and write allowlists.

Keep the wall display compatible with Safari on iOS 9 and ECMAScript 5.

Run the complete test suite, syntax checks, performance tests and regressions
for Summary, Errors, stale/offline, Live Preview, Focus Cards, Light, Climate,
theme persistence and all write-security boundaries.

If Sprint D1 exists:
- update README.de.md and README.en.md semantically in sync
- review Summary/Error/Admin screenshots
- never invent product screenshots

Update docs/PROJECT_STATUS.md.

At the end report:
- changed files
- exact HA WebSocket commands used
- capability results
- registry enrichment model
- config-entry diagnostics
- repairs support
- Matter support
- partial-failure behavior
- cache TTLs
- sanitization
- test/performance results
- iPad verification
- screenshot review
- remaining limitations
- exact prerequisites for Sprint 22

Do not commit or push unless explicitly instructed.
```
