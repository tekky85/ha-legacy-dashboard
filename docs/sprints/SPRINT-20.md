# Sprint 20 – Error Dashboard MVP

## Status

Planned

## Einordnung

Sprint 20 implementiert das erste fachlich nutzbare feste dynamische Fehler-/Systemstatus-Dashboard.

Route:

```text
/system/errors
```

Der Sprint baut auf folgenden bereits umgesetzten beziehungsweise bis dahin umgesetzten Grundlagen auf:

- Sprint 18 – System Dashboard Foundation
- Sprint 19 – Summary Dashboard MVP
- Sprint 17.2 – Card Identity, Proportional Geometry & Theme Persistence

Codex muss vor Beginn den tatsächlichen Repository-Stand prüfen.

---

# Ziel

Das Fehler-Dashboard beantwortet:

> Was funktioniert aktuell nicht, ist nicht erreichbar oder ist sicherheitsrelevant beeinträchtigt?

Der MVP konzentriert sich auf eine robuste, verständliche und priorisierte
Auswertung von Entity-Verfügbarkeitsproblemen.

Mindestens unterscheiden:

```text
unavailable
unknown
```

Diese Zustände dürfen nicht gleichgesetzt werden.

---

# Verbindliche Sicherheitsgrundsätze

Unverändert:

- Home-Assistant-Token ausschließlich im Backend
- Browser kennt keinen HA-Token
- keine direkte Browser-Verbindung zu Home Assistant
- keine generische Home-Assistant-Service-API
- keine neuen Schreibaktionen in Sprint 20
- keine Reparaturaktionen
- keine Integration-Reload-Aktionen
- keine Reauthentifizierung
- keine Schnellaktionen
- bestehende Write-Allowlists bleiben unverändert
- Fehler-Dashboard-Sichtbarkeit erzeugt keine Schreibrechte
- Admin-Token bleibt getrennt
- keine Secrets in Browser, Logs oder Repository
- bestehende Rate Limits, Payload Limits, Security Header und Secret Redaction bleiben erhalten

Kurzform:

```text
Problem sichtbar
     !=
Aktion erlaubt
```

---

# Legacy-Kompatibilität

Das Fehler-Dashboard muss funktionieren auf:

```text
Apple iPad mini 1
iOS 9.3.5
Safari iOS 9
ECMAScript 5
```

Im Legacy-Frontend weiterhin nicht verwenden:

- `let`
- `const`
- arrow functions
- template literals
- classes
- `fetch`
- `Promise`
- `async`
- `await`
- optional chaining
- nullish coalescing
- CSS Grid
- Flexbox `gap`
- ResizeObserver
- Container Queries

Browserkommunikation ausschließlich über die bestehende
`Legacy.http`-/`XMLHttpRequest`-Schicht.

---

# Feste System-Dashboard-Eigenschaften

`/system/errors` ist:

- immer vorhanden
- nicht löschbar
- nicht umbenennbar über normalen Dashboardeditor
- nicht Teil von `/d/:dashboardId`
- nicht Teil des normalen Drag-and-drop-Rasters
- nicht frei mit normalen Widgets bestückbar
- dynamisch aus dem gemeinsamen System-Snapshot erzeugt

---

# Abgrenzung zu Summary

Verbindlich:

```text
Summary:
Was ist gerade aktiv?

Errors:
Was funktioniert nicht?
```

Beispiele:

```text
Fenster offen
-> Summary

Fenstersensor unavailable
-> Errors

Vacuum cleaning
-> Summary

Vacuum error/unavailable
-> Errors

Climate heating
-> Summary

Climate unavailable
-> Errors
```

Ein technischer Fehler darf nicht als normale Aktivität im Summary erscheinen.

---

# Fehlerquellen im Sprint-20-MVP

Sprint 20 konzentriert sich zunächst auf:

1. Entity State `unavailable`
2. Entity State `unknown`
3. vollständige Home-Assistant-Nichterreichbarkeit
4. Stale Snapshot
5. explizit sicherheitsrelevante Entities
6. Dauer eines Entity-Problems
7. grundlegende Severity-Klassifikation

Noch nicht:

- Repairs / Issues
- Config Entries
- Matter-Server
- Integrations-Setupfehler
- Entity Registry Orphans
- Device Registry
- Area Registry, sofern nicht bereits verfügbar
- Automationsanalyse
- Flapping
- Grace Periods
- Maintenance Mode
- Acknowledgement
- History

Diese folgen in späteren Sprints.

---

# Normalisiertes Issue-Modell

Sprint 20 soll das in Sprint 18 vorbereitete Issue Engine Interface fachlich füllen.

Konzeptuelles Modell:

```javascript
{
    id: "entity-unavailable-binary_sensor.rauchmelder_flur",
    source: "entity_state",
    severity: "critical",
    status: "active",
    title: "Rauchmelder Flur nicht erreichbar",
    description: "Die Entity meldet den Zustand unavailable.",
    startedAt: "2026-08-11T18:00:00Z",
    updatedAt: "2026-08-11T18:15:00Z",
    entityId: "binary_sensor.rauchmelder_flur",
    domain: "binary_sensor",
    deviceClass: "smoke",
    securityRelevant: true,
    metadata: {
        state: "unavailable"
    }
}
```

Die konkrete Feldbenennung darf an den bestehenden Projektstil angepasst werden.

---

# Mindestfelder pro Issue

Mindestens:

```text
id
source
severity
status
title
entityId
state
securityRelevant
```

Optional beziehungsweise soweit sicher verfügbar:

```text
description
startedAt
updatedAt
domain
deviceClass
area
device
integration
durationSeconds
metadata
```

Keine unnötigen Rohattribute weiterreichen.

---

# Severity-Modell

Verbindliche Stufen:

```text
critical
error
warning
info
```

---

# Severity-Grundregeln im MVP

## Critical

Mindestens:

- sicherheitsrelevante Entity `unavailable`
- sicherheitsrelevante Entity `unknown`, wenn dies laut Regelwerk als kritisch eingestuft wird
- vollständiger HA-Ausfall kann auf Systemebene `critical` oder `error` sein

Beispiel:

```text
Rauchmelder unavailable
-> critical
```

---

# Error

Mindestens:

- zentrale oder ausdrücklich als kritisch markierte nicht-sicherheitsbezogene Entity
- kompletter HA-Ausfall, falls nicht `critical`

Sprint 20 soll noch keine komplexe Integrationskritikalität erfinden.

---

# Warning

Standard für normale:

```text
unavailable
```

Entities.

Beispiel:

```text
sensor.badezimmer_temperatur unavailable
-> warning
```

---

# Info

Kann im MVP für:

```text
unknown
```

verwendet werden, wenn die Entity nicht sicherheitsrelevant ist und keine
höhere manuelle Priorität besitzt.

Alternativ `warning`, wenn dies zur aktuellen Produktlogik besser passt.

Die endgültige Entscheidung muss dokumentiert und konsistent getestet werden.

---

# Verbindliche Trennung unavailable / unknown

## `unavailable`

Bedeutung:

```text
Entity ist derzeit nicht verfügbar.
```

Nicht umdeuten als:

```text
off
closed
idle
```

## `unknown`

Bedeutung:

```text
aktueller Zustand ist nicht bekannt.
```

Nicht umdeuten als:

```text
unavailable
off
closed
```

UI muss diese Zustände sichtbar unterscheiden.

---

# HA-Verbindungsverlust

Wenn Home Assistant als Ganzes nicht erreichbar ist:

Nicht:

```text
Alle Entities unavailable
```

aus dem letzten Snapshot künstlich erzeugen.

Stattdessen:

```text
Home Assistant nicht erreichbar
Daten nicht aktuell
Letzte erfolgreiche Aktualisierung: ...
```

Die vorhandenen letzten Issues dürfen als stale sichtbar bleiben.

---

# Keine falsche Entwarnung

Verbindlich:

```text
HA offline
!=
Keine Fehler
```

und:

```text
keine neuen Daten
!=
Alles OK
```

---

# Stale-Semantik

Wenn ein letzter erfolgreicher Snapshot existiert:

- letzte Issues sichtbar halten
- `stale: true`
- letzten erfolgreichen Zeitpunkt anzeigen
- aktuellen Verbindungsstatus anzeigen

Wenn noch nie ein Snapshot erfolgreich war:

```text
Fehlerstatus noch nicht verfügbar
Home Assistant derzeit nicht erreichbar
```

---

# Sicherheitsrelevante Entities

Sprint 20 muss explizite Konfiguration unterstützen.

Beispiel:

```json
{
  "systemDashboards": {
    "errors": {
      "securityEntities": [
        "binary_sensor.rauchmelder_flur",
        "binary_sensor.wassermelder_keller",
        "alarm_control_panel.haus"
      ]
    }
  }
}
```

Die konkrete Struktur muss zur bestehenden Config-Architektur passen.

---

# Priorität der Sicherheitskennzeichnung

Im MVP verbindlich:

1. explizite Konfiguration in HA Legacy Dashboard
2. später erweiterbar um Labels / Registry / Heuristik

Sprint 20 soll keine unsichere Namensheuristik als alleinige Quelle verwenden.

Nicht:

```text
Entity enthält "rauch"
-> automatisch critical
```

als einzige Entscheidungsgrundlage.

---

# Security Entity Verhalten

Wenn explizit sicherheitsrelevant:

```text
unavailable
-> critical
```

Bei:

```text
unknown
```

mindestens:

```text
warning
```

oder höher, abhängig vom definierten Regelwerk.

Die Entscheidung muss zentral dokumentiert werden.

---

# Domain-/Device-Class-Heuristik

Sprint 20 darf unterstützend bekannte Device Classes erkennen, aber nur als
sekundäres Signal.

Beispiele:

```text
smoke
carbon_monoxide
gas
moisture
safety
```

Keine alleinige automatische Kritikalität ohne klare Produktentscheidung.

Bevorzugt:

- Hinweis auf potentiell sicherheitsrelevant
- explizite Admin-Markierung bleibt maßgeblich

---

# Ignore-Konfiguration

Mindestens eine Ignore-Liste unterstützen.

Beispiel:

```json
{
  "systemDashboards": {
    "errors": {
      "ignoredEntities": [
        "sensor.testgeraet_status"
      ]
    }
  }
}
```

Ignorierte Entities erscheinen nicht in der aktiven Fehlerliste.

---

# Keine Grace Period in Sprint 20

Wichtig:

Die Brainstorming-Anforderungen sehen Karenzzeiten vor.

Diese werden bewusst erst in Sprint 22 implementiert.

Sprint 20 darf daher zunächst Probleme unmittelbar anzeigen.

Dokumentieren:

```text
Grace periods not yet applied
```

damit Benutzer wissen, dass kurzzeitige Ausfälle noch sichtbar sein können.

---

# Dauer eines Problems

Wenn `last_changed` verfügbar ist:

```text
durationSeconds = now - last_changed
```

Anzeige z. B.:

```text
seit 12 Min.
```

Wichtig:

- keine Historie behaupten
- Dauer basiert nur auf aktuellem State
- bei Neustart/State-Neuanlage entsprechend vorsichtig interpretieren

---

# Titelbildung

Beispiele:

```text
Rauchmelder Flur nicht erreichbar
```

```text
Badezimmer Temperatur: Zustand unbekannt
```

Titel bevorzugt aus:

1. Widget-/Admin-Konfiguration, falls relevant
2. Friendly Name
3. Entity ID

Keine erfundenen Raumzuordnungen.

---

# Beschreibung

Kurz und verständlich.

Beispiel unavailable:

```text
Die Entity ist derzeit nicht verfügbar.
```

Beispiel unknown:

```text
Der aktuelle Zustand der Entity ist unbekannt.
```

Keine übertriebene Diagnosebehauptung.

---

# Sortierung

Standard:

1. `critical`
2. `error`
3. `warning`
4. `info`
5. securityRelevant
6. längste Dauer
7. Titel

Deterministisch.

---

# UI – Gesamtstatus

Kopfbereich mindestens:

```text
Systemstatus
Gesamtstatus: OK / Warnung / Kritisch / Daten nicht aktuell
```

Zusätzlich:

```text
kritische Probleme
Warnungen
unavailable
unknown
letzte Aktualisierung
```

---

# Gesamtstatuslogik

## OK

Nur wenn:

- aktueller Snapshot erfolgreich
- keine relevanten Issues

## Warning

Wenn:

- mindestens Warning
- kein Error/Critical

## Error

Wenn:

- mindestens Error
- kein Critical

## Critical

Wenn:

- mindestens Critical

## Stale / Unknown

Wenn:

- aktuelle Daten nicht zuverlässig geladen werden können

Kein grünes OK bei stale Daten.

---

# Status darf nicht nur Farbe sein

Zusätzlich immer:

- Text
- Symbol
- Severity

Farben allein reichen nicht.

---

# UI – Hauptbereiche

Bevorzugt:

```text
Kritisch
Fehler
Warnungen
Unbekannt
```

oder:

```text
Sicherheitsrelevant
Nicht erreichbar
Zustand unbekannt
```

Codex soll eine kompakte iOS-9-taugliche Darstellung wählen.

---

# UI – Einzelnes Issue

Mindestens anzeigen:

```text
Titel
Severity
Entity ID
State
Dauer
```

Optional:

```text
Device Class
Domain
Area
```

nur wenn verfügbar.

---

# Beispiel UI

```text
KRITISCH
────────────────────────
Rauchmelder Flur
nicht erreichbar
seit 12 Min.
binary_sensor.rauchmelder_flur

WARNUNG
────────────────────────
Badezimmer Temperatur
nicht erreichbar
seit 4 Min.
sensor.badezimmer_temperatur

UNBEKANNT
────────────────────────
Fenster Küche
Zustand unbekannt
binary_sensor.fenster_kueche
```

---

# Empty State

Nur bei aktuellem erfolgreichen Snapshot und ohne Issues:

```text
Keine aktiven Störungen erkannt.
```

Zusätzlich:

```text
Letzte Prüfung: ...
```

Nicht anzeigen, wenn Snapshot stale/offline ist.

---

# Offline State

Bei HA-Ausfall:

```text
Home Assistant nicht erreichbar.
Die angezeigten Fehlerdaten sind möglicherweise veraltet.
Letzte erfolgreiche Aktualisierung: ...
```

---

# Recovery

Nach HA-Wiederherstellung:

- neuer Snapshot
- Issues neu berechnen
- stale verschwindet
- UI aktualisiert sich automatisch
- behobene Issues verschwinden aus aktiver Liste

Noch keine History der behobenen Issues.

---

# Kein Resolved-History-MVP

Sprint 20 zeigt primär aktive Issues.

`resolved` darf im internen Modell vorgesehen bleiben, muss aber noch nicht
persistent historisiert werden.

---

# Issue Engine

Domain-/State-/Severity-Logik serverseitig.

Nicht im Legacy-Browser nachbauen.

Bevorzugte Funktionen sinngemäß:

```text
buildIssues(snapshot, config)
classifyEntityIssue(entity, config)
getIssueSeverity(entity, config)
sortIssues(issues)
```

---

# Keine Business-Logik im Router

Router soll nur:

- Service aufrufen
- Fehler mappen
- Antwort senden

Nicht:

- Severity bestimmen
- Entity States analysieren
- Security-Regeln enthalten

---

# Error API

Bevorzugte Antwort:

```json
{
  "issues": [
    {
      "id": "...",
      "severity": "critical",
      "title": "...",
      "entity_id": "...",
      "state": "unavailable",
      "security_relevant": true,
      "duration_seconds": 720
    }
  ],
  "summary": {
    "critical": 1,
    "error": 0,
    "warning": 2,
    "info": 1
  },
  "_meta": {
    "reachable": true,
    "stale": false,
    "last_successful_update": "..."
  }
}
```

Die tatsächliche Struktur soll zu Sprint 18 passen.

---

# Keine Rohstates in der API

Browser erhält nicht:

```text
komplette HA State Objects
```

sondern nur normalisierte Issue-Felder.

---

# Admin UI – Error Settings MVP

Unter:

```text
System Dashboards
  Fehler
```

mindestens konfigurieren:

```text
Security Entities
Ignored Entities
```

Optional:

```text
Severity Override
```

nur wenn ohne große Zusatzkomplexität möglich.

---

# Entity-Auswahl im Admin

Vorhandenes Entity-Inventar aus Sprint 14/15 wiederverwenden.

Keine neue direkte HA-Abfrage aus dem Browser.

---

# Admin – Security Markierung

Mindestens:

```text
[ ] Sicherheitsrelevant
```

für ausgewählte Entities.

Bevorzugt als Such-/Auswahlliste.

---

# Keine automatische Write-Berechtigung

Markierung:

```text
securityRelevant = true
```

ändert niemals:

```text
ALLOWED_LIGHT_ENTITIES
ALLOWED_CLIMATE_ENTITIES
```

oder andere Write-Allowlists.

Testpflicht.

---

# Performance

Issue Engine arbeitet ausschließlich auf dem gemeinsamen Sprint-18-Snapshot.

Keine zusätzliche HA-Abfrage pro Issue.

---

# Große Installationen

Mindestens Test mit:

```text
1000 Entities
```

davon:

- viele normale States
- 50 unavailable
- 20 unknown
- einige securityRelevant

Prüfen:

- Issue-Liste korrekt
- Sortierung deterministisch
- Browser-Payload reduziert
- keine Rohstate-Flut

Optional:

```text
3000 Entities
```

wenn praktikabel.

---

# Datenschutz / Datenreduktion

Nicht in Fehlerantworten:

- Tokens
- Authorization Header
- interne Pfade
- vollständige Rohattributes
- sensible Media-Metadaten
- Write-Allowlists
- Admin-Konfiguration außerhalb benötigter Flags

---

# Fehlerrobustheit

Eine Entity mit:

- fehlendem Friendly Name
- fehlender Device Class
- ungewöhnlichem State
- unvollständigen Attributen

darf nicht die gesamte Issue Engine zum Absturz bringen.

---

# Tests – unavailable

Mindestens:

1. normale Entity unavailable erzeugt Issue
2. State unavailable bleibt als unavailable erhalten
3. unavailable wird nicht zu off
4. unavailable wird nicht zu unknown
5. normale unavailable Entity erhält erwartete Severity
6. securityRelevant unavailable wird critical
7. ignored unavailable Entity erscheint nicht

---

# Tests – unknown

8. normale Entity unknown erzeugt Issue
9. unknown bleibt als unknown erhalten
10. unknown wird nicht zu unavailable
11. unknown wird nicht zu off
12. securityRelevant unknown erhält definierte erhöhte Severity
13. ignored unknown Entity erscheint nicht

---

# Tests – Security

14. explizite Security Entity erkannt
15. nicht markierte Entity bleibt normal
16. Security Markierung verändert keine Write-Allowlist
17. Light-Security-Markierung gibt keine Light-Schreibrechte
18. Climate-Security-Markierung gibt keine Climate-Schreibrechte

---

# Tests – Severity

19. Critical sortiert vor Error
20. Error vor Warning
21. Warning vor Info
22. gleiche Severity deterministisch sortiert
23. Security wird innerhalb gleicher Severity priorisiert
24. Dauer als Tie-Breaker korrekt

---

# Tests – Dauer

25. last_changed erzeugt duration
26. fehlendes last_changed bricht nicht
27. Dauer ist nicht negativ
28. Stale-Snapshot behauptet keine neue Startzeit

---

# Tests – Gesamtstatus

29. keine Issues + aktuelle Daten = OK
30. Warning = Warning
31. Error = Error
32. Critical = Critical
33. stale Snapshot ist nicht OK
34. HA offline ist nicht OK
35. kein Snapshot ist nicht OK

---

# Tests – Stale / Offline

36. HA-Ausfall nach Erfolg behält Issues
37. stale Flag gesetzt
38. lastSuccessfulUpdate erhalten
39. HA-Ausfall ohne Snapshot zeigt Offlinezustand
40. Recovery entfernt stale
41. Recovery berechnet Issues neu
42. behobene Entity verschwindet aus aktiver Liste

---

# Tests – API

43. Error API liefert normalisierte Issues
44. Error API liefert Counts
45. Error API liefert Meta
46. API enthält keine Rohstates
47. API enthält keine Tokens
48. API enthält keine Write-Allowlists
49. API liefert Cache-Control no-store beziehungsweise bestehenden sicheren Wert

---

# Tests – Admin

50. Error Settings sichtbar
51. Security Entity auswählbar
52. Security Entity gespeichert
53. Ignore Entity auswählbar
54. Ignore gespeichert
55. Reload behält Einstellungen
56. Änderung beeinflusst keine User-Dashboards
57. Änderung beeinflusst keine Write-Allowlists

---

# Tests – Legacy UI

58. `/system/errors` lädt
59. Loading State
60. Critical-Gruppe sichtbar
61. Warning-Gruppe sichtbar
62. unavailable sichtbar
63. unknown sichtbar unterscheidbar
64. Empty State korrekt
65. Stale State korrekt
66. Offline State korrekt
67. Recovery korrekt
68. Status nicht nur über Farbe
69. lange Namen zerstören Layout nicht
70. kein `fetch`
71. kein `Promise`
72. ES5-kompatibel

---

# Tests – Regression

73. `/system/summary` aus Sprint 19 funktioniert
74. Summary-Regeln unverändert
75. User-Dashboards funktionieren
76. Admin funktioniert
77. Grid aus Sprint 17.2 funktioniert
78. Dark Mode Persistenz funktioniert
79. Climate-Steuerung funktioniert
80. Light-Steuerung funktioniert
81. HA-Token Backend-only
82. Write-Allowlists unverändert

---

# Performance-Test

Mindestens:

```text
1000 Entities
```

Prüfen:

- 50 unavailable
- 20 unknown
- Security-Klassifikation
- Sortierung
- reduzierte Payload
- keine zusätzliche HA-Abfrage pro Issue

---

# Manuelle Abnahme – moderner Browser

Prüfen:

- keine Issues
- Warning
- Critical
- unavailable
- unknown
- Security Entity
- Ignore Entity
- HA offline
- Recovery
- Dark Mode
- Light Mode

---

# Manuelle Abnahme – iPad mini

## Portrait

Prüfen:

- Gesamtstatus
- Critical
- Warning
- unavailable
- unknown
- lange Namen
- Dauer
- Scrollen
- Stale
- Offline
- Theme
- keine horizontalen Scrollbars

## Landscape

Dieselben Prüfungen.

---

# UI-Leistung bei vielen Issues

Wenn sehr viele Issues existieren:

- kompakte Listen
- keine unnötigen großen Cards
- DOM begrenzen
- keine Animationen
- Gruppen nur anzeigen, wenn nicht leer

Optional:

```text
erste N anzeigen
weitere anzeigen
```

nur wenn auf iOS 9 notwendig.

---

# Logging

Optional:

```text
issues_build_started
issues_build_succeeded
issues_build_failed
issues_count
```

Keine unnötigen sensitiven Attribute loggen.

---

# Fehlercodes

Bevorzugt vorhandene Codes wiederverwenden.

Optional:

```text
issue_engine_failed
system_snapshot_unavailable
```

Keine Stacktraces an Browser.

---

# Verhältnis zu Sprint 21

Sprint 20 liefert den Entity-State-MVP.

Sprint 21 ergänzt:

- Entity Registry
- Device Registry
- Area Registry
- Config Entries
- Repairs / Issues
- Matter
- Integrationsstatus

Sprint 20 soll diese Datenquellen nicht vorwegnehmen.

---

# Verhältnis zu Sprint 22

Sprint 22 ergänzt:

- Grace Periods
- Ignorierregeln auf Geräte-/Gruppenebene
- erwartete Offlinezustände
- Flapping
- Device Aggregation
- Summary Rules

Sprint 20 zeigt Ausfälle zunächst unmittelbar.

---

# Verhältnis zu Sprint 23

Sprint 23 ergänzt:

- Automation Impact
- potenziell betroffene Trigger/Bedingungen/Aktionen
- Sicherheitsautomation-Analyse

Sprint 20 darf keine falschen Aussagen über Automation Impact erzeugen.

---

# Nicht-Ziele

Sprint 20 implementiert ausdrücklich noch nicht:

- Home Assistant Repairs
- Config Entry Setupfehler
- Matter-Server-Status
- Matter-Geräteaggregation
- Entity Registry Orphans
- Device Registry
- Area Registry, sofern nicht schon vorhanden
- Automation Impact
- Grace Periods
- Flapping-Erkennung
- Maintenance Mode
- Acknowledgement
- Historie
- Reparaturaktionen
- Reload-Aktionen
- Reauth
- Schnellaktionen
- neue Write-Endpunkte
- Home Assistant App
- HACS

---

# Dokumentation

Nach Umsetzung aktualisieren:

```text
README.md
docs/PROJECT_STATUS.md
docs/SPRINT_ROADMAP.md
```

Dokumentieren:

- Error Route
- unavailable/unknown Semantik
- Severity-Modell
- Security Entities
- Ignore-Konfiguration
- Stale-/Offline-Verhalten
- Abgrenzung zu Summary
- fehlende Grace Periods als bekannte Einschränkung
- Abgrenzung zu Sprint 21/22/23

---

# Cache-Version

Wenn Legacy-Assets geändert werden:

- aktuellen Wert aus Repository lesen
- konsistent erhöhen
- keine historische Version voraussetzen

---

# Voraussichtlich betroffene Dateien

Codex muss den realen Stand prüfen.

Voraussichtlich:

```text
src/services/issues/engine.js
src/services/issues/severity.js
src/services/system/
src/routes/system-dashboards.js

src/public/js/system/common.js
src/public/js/system/errors.js
src/public/css/

src/admin/
src/services/config-store.js

test/
README.md
docs/PROJECT_STATUS.md
docs/SPRINT_ROADMAP.md
```

Keine unnötige Logik in `app.js` oder großen Routern anhäufen.

---

# Definition of Done

Sprint 20 ist abgeschlossen, wenn:

- `/system/errors` fachlich nutzbar ist
- `unavailable` korrekt erkannt wird
- `unknown` separat korrekt erkannt wird
- beide Zustände sichtbar unterscheidbar sind
- normale unavailable Entities Issues erzeugen
- securityRelevant unavailable Entities critical werden
- Security Entities administrativ konfigurierbar sind
- Ignore-Liste funktioniert
- Severity-Modell funktioniert
- Gesamtstatus korrekt ist
- aktuelle fehlerfreie Daten `OK` ergeben
- stale Daten niemals `OK` ergeben
- HA-Ausfall niemals „keine Fehler“ ergibt
- letzte bekannte Issues bei HA-Ausfall sichtbar bleiben
- Recovery automatisch funktioniert
- Browser keine Rohstates erhält
- keine neuen Schreibaktionen existieren
- Write-Allowlists unverändert bleiben
- Summary aus Sprint 19 nicht beschädigt wird
- Theme-Persistenz aus Sprint 17.2 nicht beschädigt wird
- iOS-9-/ES5-Kompatibilität erhalten bleibt
- alle Tests grün sind
- `docs/PROJECT_STATUS.md` aktualisiert wurde

---

# Erwartetes Codex-Ergebnis

Codex soll berichten:

1. Startcommit
2. tatsächlicher Sprint-17.2-/Sprint-19-Status
3. geänderte Dateien
4. finale Issue-Struktur
5. unavailable-Regel
6. unknown-Regel
7. Severity-Regeln
8. Security-Entity-Konfiguration
9. Ignore-Konfiguration
10. Gesamtstatuslogik
11. Stale-/Offline-Verhalten
12. Legacy-UI-Struktur
13. Admin-Settings
14. Testanzahl und Ergebnis
15. Performance-Test
16. Asset-Cache-Version
17. manuelle iPad-Prüfung
18. Summary-Regression
19. Theme-Regression
20. verbleibende Einschränkungen
21. Voraussetzungen für Sprint 21
22. Commit-Vorschlag
23. Deploymentbefehle

---

# Codex-Prompt für Sprint 20

```text
Read:

- AGENTS.md
- README.md
- docs/CODEX_HANDOFF.md
- docs/SPRINT_ROADMAP.md
- docs/PROJECT_STATUS.md
- docs/sprints/SPRINT-17.2.md
- docs/sprints/SPRINT-18.md
- docs/sprints/SPRINT-19.md
- docs/sprints/SPRINT-20.md
- ha-legacy-dashboard_brainstorming_externe_system-dashboards.md if present

Inspect the actual repository state first.

Verify that:

- Sprint 18 provides the shared System Dashboard foundation,
- Sprint 19 provides the Summary Dashboard MVP,
- Sprint 17.2 provides the latest card/theme corrections.

Implement Sprint 20 exactly as specified in docs/sprints/SPRINT-20.md.

Goal:

Turn /system/errors into the first functional fixed dynamic Error Dashboard.

Implement server-side issue generation for at least:

- entity state unavailable,
- entity state unknown,
- explicit security-relevant entities,
- Home Assistant offline/stale state,
- deterministic severity classification.

Keep unavailable and unknown semantically distinct.

Implement severity levels:

- critical,
- error,
- warning,
- info.

Explicitly configured security entities must receive elevated severity, with
unavailable security entities treated as critical.

Implement:

- normalized server-side Issue objects,
- deterministic sorting,
- issue counts,
- overall status,
- ignored entities,
- security-entity configuration in Admin,
- stale/offline handling,
- compact ES5-compatible Error Dashboard UI.

Home Assistant offline must never render as "no errors" or green OK.

Use the shared Sprint 18 snapshot. Do not create a second Home Assistant polling
pipeline.

Do not expose raw Home Assistant state objects, tokens, admin secrets or write
allowlists to the browser.

Preserve all existing Home Assistant security boundaries.

Do not add any new write endpoints, repair actions, reload actions, generic
services or automatic write permissions.

Keep the wall-display fully compatible with Safari on iOS 9 and ECMAScript 5.

Do not implement yet:

- Repairs,
- Config Entry diagnostics,
- Matter diagnostics,
- registry enrichment,
- grace periods,
- flapping,
- maintenance mode,
- issue history,
- automation impact analysis.

Run the complete test suite and required syntax checks.

Manually verify /system/errors on the iPad mini in portrait and landscape,
including:

- critical issue,
- warning issue,
- unavailable,
- unknown,
- stale,
- offline,
- recovery,
- Dark Mode persistence.

Run regression tests for /system/summary and normal user dashboards.

Update docs/PROJECT_STATUS.md when finished.

At the end report:

- changed files,
- Issue schema,
- unavailable/unknown rules,
- severity rules,
- security entity behavior,
- ignored entity behavior,
- overall status logic,
- stale/offline behavior,
- test results,
- performance results,
- asset cache version,
- iPad verification,
- Summary regression,
- remaining limitations,
- exact prerequisites for Sprint 21.

Do not commit or push unless explicitly instructed.
```
