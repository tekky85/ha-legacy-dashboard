# Sprint 21.1 – Error Dashboard Device Aggregation & Navigation

## Status
Planned

## Ziel

Sprint 21.1 verbessert die Informationsarchitektur des bereits vorhandenen Error Dashboards auf Basis der in Sprint 21 eingeführten Device-/Area-/Config-Entry-Metadaten.

Der Sprint implementiert:

1. Kategorie-Navigation / Filter
2. Device-basierte Issue-Gruppierung
3. eingeklappte Child-Entity-Details
4. responsives Zwei-Spalten-Layout
5. unveränderte Error-/Severity-/Security-Semantik

---

# Voraussetzungen

Bereits vorhanden:

- Sprint 20 – Error Dashboard MVP
- Sprint 21 – Registry & Diagnostic Enrichment
- `device_id`
- Device Name
- Area
- Integration / Config Entry
- bestehende Issue Severity
- bestehende stale/offline-Logik

Sprint 21.1 darf keine neue Home-Assistant-Abfrage nur für diese Darstellung einführen.

---

# Sicherheitsgrundsätze

Unverändert:

- HA-Token nur im Backend
- keine direkte Browser-Verbindung zu HA
- keine neue Write-API
- keine Repair-Aktionen
- keine Config-Entry-Aktionen
- keine Registry-Writes
- bestehende Write-Allowlists unverändert
- Device Group erzeugt keine Schreibrechte
- Child Details erzeugen keine Schreibrechte

Sprint 21.1 ist read-only.

---

# Legacy-Kompatibilität

Weiterhin:

```text
Apple iPad mini 1
iOS 9.3.5
Safari iOS 9
ECMAScript 5
```

Nicht verwenden:

- `let`
- `const`
- arrow functions
- template literals
- `fetch`
- `Promise`
- `async` / `await`
- optional chaining
- nullish coalescing
- CSS Grid
- Flexbox `gap`
- ResizeObserver
- Container Queries

---

# Teil A – Kategorie-Navigation

Die Kategorien/Counts im Kopfbereich werden interaktiv.

Beispiel:

```text
[ Alle 26 ]
[ Kritisch 3 ]
[ Fehler 7 ]
[ Warnungen 12 ]
[ Unknown 4 ]
```

Verhalten:

```text
Tap Kritisch
→ nur Gruppen/Issues mit critical

Tap Warning
→ nur warning

Tap Unknown
→ nur Issues/Groups mit unknown Child-Issue

Tap Alle
→ Filter zurücksetzen
```

Nur ein Filter gleichzeitig nötig.

Keinen komplexen SPA-Router einführen.

Optional URL-Hash:

```text
/system/errors#critical
```

nur wenn robust.

Aktiver Filter muss auch ohne Farbe erkennbar sein.

---

# Unknown ist State-Filter

`unknown` ist nicht zwingend eine Severity.

Codex soll vorhandene Sprint-20-Struktur beachten.

UX-Ziel:

```text
Unknown
```

muss direkt filterbar sein.

Optional später zusätzlich:

```text
Nicht erreichbar
```

für `unavailable`, aber kein Pflichtpunkt dieses Sprints.

---

# Teil B – Device-basierte Gruppierung

Mehrere Entity-Issues mit derselben echten `device_id` werden zu einer Device Group zusammengefasst.

Verbindlich nur:

```text
device_id
```

als Gruppierungsquelle verwenden.

Nicht gruppieren nach:

- Entity Name
- Friendly Name
- Domain
- Area
- Präfix
- Integration

---

# Device Group Modell

Konzeptuell:

```javascript
{
    id: "device-abc123",
    type: "device",
    deviceId: "abc123",
    title: "Thermostat Wohnzimmer",
    areaName: "Wohnzimmer",
    integration: "Zigbee",
    severity: "critical",
    securityRelevant: true,
    issueCount: 4,
    durationSeconds: 1080,
    counts: {
        critical: 1,
        error: 0,
        warning: 2,
        info: 1,
        unknown: 1
    },
    issues: [...]
}
```

---

# Severity Aggregation

Höchste Child-Severity bestimmt die Group Severity:

```text
critical
error
warning
info
```

Beispiel:

```text
warning
info
critical
warning

=> Device Group = critical
```

---

# Security-Relevant Aggregation

Wenn mindestens ein Child-Issue:

```text
securityRelevant = true
```

dann auch die Device Group.

---

# Dauer der Device Group

Bevorzugt:

```text
ältester noch aktiver Child-Issue-Start
```

Keine Durchschnittsbildung.

---

# Device Group Titel

Priorität:

1. `name_by_user`
2. Device Name
3. sinnvoller Friendly-Name-Fallback
4. technische Fallback-Bezeichnung

Nicht standardmäßig `device_id` als Titel.

---

# Area / Integration

Wenn vorhanden kompakt anzeigen:

```text
Wohnzimmer · Zigbee
```

Keine Heuristik.

---

# Entities ohne device_id

Müssen sichtbar bleiben.

Sie werden als Standalone Issues dargestellt.

---

# Nicht-Entity-/System-Issues

Nicht in Device Groups zwingen:

- Home Assistant offline
- stale system issue
- Config Entry setup_error
- Repairs
- generische Integration Issues
- Matter-Komponenten-Issues ohne eindeutiges Device
- Gateway/System Issues

Diese bleiben Standalone.

---

# Keine fachliche Deduplizierung

Device Grouping ist primär Presentation Aggregation.

Nicht blind Child-Issues löschen.

Bevorzugt:

```text
normalized issues
    ↓
presentation aggregation
    ↓
device groups + standalone issues
```

---

# Teil C – Collapsed Device Cards

Default:

```text
collapsed
```

Beispiel:

```text
Rauchmelder Flur               KRITISCH
3 Entitäten betroffen

Flur · ZHA
seit 18 Min.

[ Details anzeigen ]
```

Nicht alle Entity IDs sofort anzeigen.

---

# Details geöffnet

Beispiel:

```text
▼ Betroffene Entitäten

binary_sensor.rauchmelder
unavailable · critical

sensor.rauchmelder_batterie
unknown · warning

sensor.rauchmelder_signal
unavailable · warning
```

Pro Child mindestens:

- Friendly Name oder Entity ID
- State
- Severity
- Dauer, wenn vorhanden

Keine Raw Registry Objekte.

---

# ES5 Details Toggle

Bevorzugt:

```text
Button + CSS-Klasse + Show/Hide
```

Nicht zwingend `<details>` verwenden.

---

# Teil D – Zwei-Spalten-Layout

Auf breiteren Viewports zwei Spalten.

Beispiel:

```text
┌──────────────────┐ ┌──────────────────┐
│ Device A         │ │ Device B         │
│ 3 Issues         │ │ 1 Issue          │
└──────────────────┘ └──────────────────┘

┌──────────────────┐ ┌──────────────────┐
│ Device C         │ │ Device D         │
└──────────────────┘ └──────────────────┘
```

Legacy-kompatibel per Flexbox + `flex-wrap`.

Kein CSS Grid.

Kein Flexbox `gap`.

---

# Responsive Zielmatrix

```text
kleines Portrait:
1 Spalte

iPad Portrait:
1 oder 2 Spalten je nach realer Breite

iPad Landscape:
2 Spalten

Desktop:
2 Spalten
```

Mehr als 2 Spalten nicht nötig.

---

# Layout-Regeln

- keine horizontale Scrollbar
- keine Überlappung
- Breiten inklusive Margins/Padding berechnen
- keine starren Desktop-Pixelbreiten
- Collapsed Cards kompakt
- Expanded Cards dürfen höher werden
- keine künstlich riesige Mindesthöhe

---

# Expanded Card

Bevorzugt:

```text
Card bleibt in ihrer Spalte und wächst nach unten
```

Nur wenn dies auf Legacy Safari instabil ist, darf Expanded temporär volle Zeilenbreite verwenden.

Keine Masonry-Logik.

---

# Teil E – Header / Filter

Beispiel:

```text
Systemstatus: KRITISCH

[ Alle 12 ] [ Kritisch 2 ] [ Fehler 3 ]
[ Warnungen 5 ] [ Unknown 2 ]
```

Bestehende Terminologie beibehalten.

Counts bevorzugt serverseitig oder aus bereits normalisierten Daten.

Keine doppelte HA-Business-Logik im Browser.

---

# Teil F – Sortierung

Device Groups:

1. Severity
2. securityRelevant
3. längste Dauer
4. Device Name

Standalone Issues nach bestehender Sprint-20-Sortierung.

Deterministisch.

---

# Teil G – Presentation View Model

Bevorzugt:

```javascript
{
    groups: [
        {
            type: "device",
            id: "...",
            severity: "critical",
            title: "...",
            issueCount: 4,
            issues: [...]
        },
        {
            type: "standalone",
            ...
        }
    ],
    filters: {
        all: 26,
        critical: 3,
        error: 7,
        warning: 12,
        unknown: 4
    }
}
```

Keine Business-Logik quer über Router und Browser verteilen.

---

# Browser Payload

Nur normalisierte benötigte Felder.

Keine Raw:

- Entity Registry
- Device Registry
- Config Entry Objekte
- HA State Objects

---

# Admin

Keine neue Admin-Konfiguration erforderlich.

Nicht in Scope:

- Gruppierung ein/aus
- Spaltenzahl konfigurierbar
- Default Expanded

---

# Summary Dashboard

Nicht verändern.

```text
/system/summary
```

bleibt unverändert.

---

# Error Business Logic

Nicht verändern:

- unavailable
- unknown
- Security Severity
- Ignore
- stale/offline
- Config Entry Issues
- Repairs
- Matter Diagnostic Issues

Nur Aggregation, Navigation und Darstellung.

---

# Tests – Navigation

1. Alle zeigt alle
2. Critical Filter
3. Error Filter
4. Warning Filter
5. Unknown Filter
6. aktiver Filter sichtbar
7. Filter zurück auf Alle
8. Counts korrekt
9. Empty State bei 0 Treffern
10. kein Reload nötig

---

# Tests – Device Aggregation

11. gleiche device_id => eine Group
12. vier Issues gleiche device_id => eine Group
13. verschiedene device_id => getrennt
14. ohne device_id => sichtbar standalone
15. System Issue => standalone
16. Config Entry Issue => standalone
17. Repair => standalone
18. Matter System Issue ohne Device => standalone
19. keine Gruppierung über Namen
20. keine Gruppierung über Area

---

# Tests – Severity / Counts

21. höchste Severity bestimmt Group
22. critical vor error
23. error vor warning
24. warning vor info
25. securityRelevant propagiert
26. älteste Dauer genutzt
27. Sortierung deterministisch
28. issueCount korrekt
29. Severity Counts korrekt
30. unknown Count korrekt

---

# Tests – Details

31. default collapsed
32. Details Button sichtbar
33. öffnen
34. schließen
35. Child Entity sichtbar
36. Child State sichtbar
37. Child Severity sichtbar
38. Child Dauer sichtbar, wenn vorhanden
39. keine Raw Registry Daten
40. lange Entity-Namen zerstören Layout nicht

---

# Tests – Layout

41. schmales Portrait = 1 Spalte
42. iPad Landscape = 2 Spalten
43. Desktop = 2 Spalten
44. keine horizontale Scrollbar
45. keine Überlappung
46. unterschiedliche Card-Höhen funktionieren
47. Expanded Details stabil
48. kein CSS Grid
49. kein Flexbox gap

---

# Tests – Legacy

50. ES5 Syntax
51. kein fetch
52. kein Promise
53. Safari-iOS-9 Event Handling
54. Details ohne modernes HTML-Feature als Voraussetzung

---

# Regression – Sprint 20/21

55. unavailable unverändert
56. unknown unverändert
57. Security Severity unverändert
58. Ignore unverändert
59. stale/offline unverändert
60. Device-/Area-Enrichment sichtbar
61. Config Entry Diagnostics sichtbar
62. Repairs sichtbar
63. Matter Diagnostics unverändert
64. Partial Failure unverändert

---

# Regression – übrige Anwendung

65. `/system/summary` funktioniert
66. User Dashboards funktionieren
67. Admin funktioniert
68. Focus Cards funktionieren
69. Light Control funktioniert
70. Climate Control funktioniert
71. Theme Persistenz funktioniert

---

# Security Regression

72. HA-Token Backend-only
73. keine neue Write-API
74. Write-Allowlists unverändert
75. Device Group erzeugt keine Schreibrechte
76. Child Details erzeugen keine Schreibrechte
77. keine Raw Registries im Browser

---

# Performance

Mock-Test mindestens:

```text
3000 Entities
500 Devices
200 aktive Entity Issues
```

Prüfen:

- Gruppierung effizient per Map
- keine O(n²)-Suche
- Filter schnell
- DOM kleiner/übersichtlicher als flache Entity-Card-Liste
- keine zusätzliche HA-Abfrage

Bevorzugt intern:

```text
issuesByDeviceId
standaloneIssues
```

---

# UI-Beispiel

```text
SYSTEMSTATUS: KRITISCH

[ Alle 12 ] [ Kritisch 2 ] [ Fehler 3 ] [ Warnungen 5 ] [ Unknown 2 ]

┌──────────────────────────┐  ┌──────────────────────────┐
│ Rauchmelder Flur         │  │ Thermostat Wohnzimmer    │
│ KRITISCH                 │  │ WARNUNG                  │
│                          │  │                          │
│ 3 Entitäten betroffen    │  │ 4 Entitäten betroffen    │
│ Flur · ZHA               │  │ Wohnzimmer · Zigbee      │
│ seit 18 Min.             │  │ seit 6 Min.              │
│                          │  │                          │
│ [ Details anzeigen ]     │  │ [ Details anzeigen ]     │
└──────────────────────────┘  └──────────────────────────┘
```

---

# Manuelle Abnahme

## Desktop
- 2 Spalten
- Filter
- Device Groups
- Details
- Standalone Issues
- Dark/Light

## iPad Portrait
- 1 oder 2 Spalten passend zur Breite
- keine horizontale Scrollbar
- Filter bedienbar
- Details bedienbar

## iPad Landscape
- 2 Spalten
- übersichtliches Scannen
- lange Namen
- Details
- Dark/Light

## Legacy iOS 9, wenn verfügbar
- Navigation
- Device Group
- Details Toggle
- Scrollen
- Theme

---

# Screenshot-Pflege

Wenn Sprint D1 vorhanden, mindestens aktualisieren/prüfen:

```text
docs/screenshots/system/errors.png
```

Das Error Dashboard ändert sich sichtbar stark.

Nur echter Produkt-/Demo-Screenshot.

---

# Dokumentation

Aktualisieren:

```text
README.de.md
README.en.md
docs/PROJECT_STATUS.md
docs/SPRINT_ROADMAP.md
```

README-Sprachen synchron halten.

Dokumentieren:

- Device Grouping
- Kategorie-Navigation
- Two-column Layout
- Standalone Issues
- Collapsed Details

---

# Nicht-Ziele

Nicht Bestandteil:

- neue Error-Erkennungsregeln
- neue Severity-Regeln
- neue Registry-Abfragen
- neue Repairs-/Matter-Funktionen
- Grace Periods
- Flapping
- Maintenance Mode
- Automation Impact
- neue Write-Aktionen
- CSS Grid
- komplexe Mehrfachfilter
- konfigurierbare Spaltenzahl

---

# Definition of Done

Sprint 21.1 ist abgeschlossen, wenn:

- Kategorien/Counts als Navigation funktionieren
- Alle/Critical/Error/Warning/Unknown filterbar sind
- Issues zuverlässig nach echter `device_id` gruppiert werden
- mehrere Entity-Issues eines Geräts eine Device Group bilden
- höchste Severity Group Severity bestimmt
- securityRelevant propagiert wird
- Device Name, Area, Integration kompakt sichtbar sind
- Child Entities standardmäßig eingeklappt sind
- Details ES5-kompatibel funktionieren
- Entities ohne device_id sichtbar bleiben
- System-/ConfigEntry-/Repair-/Matter-Issues standalone bleiben
- breitere Viewports 2 Spalten nutzen
- schmale Viewports sauber 1 Spalte nutzen
- keine horizontale Scrollbar entsteht
- keine zusätzliche HA-Abfrage nötig ist
- bestehende Error Business Logic unverändert bleibt
- Summary unverändert funktioniert
- Security Boundaries unverändert bleiben
- iOS-9-/ES5-Kompatibilität erhalten bleibt
- alle Tests grün sind
- Error Screenshot geprüft/aktualisiert wurde
- `docs/PROJECT_STATUS.md` aktualisiert wurde

---

# Erwartetes Codex-Ergebnis

Codex berichtet:

1. Startcommit
2. tatsächlicher Repo-Stand
3. geänderte Dateien
4. Aggregationsarchitektur
5. Device-Group-Modell
6. Standalone-Issue-Regeln
7. Severity-Aggregation
8. Filter-/Navigation-Verhalten
9. Unknown-Filter-Semantik
10. Details-Toggle
11. Zwei-Spalten-Layout
12. responsive Regeln
13. ES5-/iOS-9-Prüfung
14. Testanzahl und Ergebnis
15. Performance-Ergebnis
16. iPad-Abnahme
17. Error-Regression
18. Summary-Regression
19. Security-Regression
20. Screenshot-Review
21. verbleibende Einschränkungen
22. Voraussetzungen für Sprint 22
23. Commit-Vorschlag
24. Deploymentbefehle

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
- docs/sprints/SPRINT-20.md
- docs/sprints/SPRINT-21.md
- docs/sprints/SPRINT-21.1.md
- docs/sprints/SPRINT-D1.md if present

Sprint 21 is already complete.

Inspect the actual repository state first.

Implement Sprint 21.1 exactly as specified in
docs/sprints/SPRINT-21.1.md.

Make the Error Dashboard easier to scan and navigate using the device metadata
already introduced in Sprint 21.

Implement:

1. clickable/filterable category counters,
2. grouping of multiple entity issues by real device_id,
3. collapsed child-entity details,
4. a responsive two-column layout on wider viewports.

Navigation must support at least:

- All
- Critical
- Error
- Warning
- Unknown

Do not introduce a complex SPA router.

Group only by actual device_id.
Never group by entity name, friendly name, area or domain.

The highest child severity becomes the device-group severity.
securityRelevant propagates to the group.
Use the oldest active child issue as group duration.

Entities without device_id remain visible as standalone issues.

Do not force system, HA connectivity, Config Entry, Repairs or non-device
Matter issues into device groups.

Device groups must be collapsed by default.

Collapsed cards should show:
- device name
- severity
- affected entity count
- area when available
- integration when available
- duration

Use an ES5-compatible Details toggle.

Layout:
- legacy-compatible Flexbox/wrapping
- no CSS Grid
- no Flexbox gap
- two columns on sufficiently wide tablet/desktop views
- clean fallback to one column
- no horizontal scrolling

Do not change Sprint 20/21 Error detection or severity business logic.

Do not add any new HA calls solely for this view.

Preserve all Home Assistant security boundaries.
Do not add any write capability.

Keep the wall display compatible with Safari on iOS 9 and ECMAScript 5.

Run regression tests for:
- unavailable
- unknown
- security severity
- ignored entities
- stale/offline
- Config Entry diagnostics
- Repairs
- Matter diagnostics
- /system/summary
- normal user dashboards
- Admin
- Focus Cards
- Light/Climate controls
- theme persistence
- all write-security boundaries

Run a large mock test with many devices and entity issues.

If Sprint D1 is present, update the real Error Dashboard screenshot because the
UI changes significantly.

Update README.de.md and README.en.md semantically in sync.

Update docs/PROJECT_STATUS.md.

At the end report:
- changed files
- aggregation architecture
- device-group model
- standalone issue rules
- filter/navigation behavior
- unknown filter semantics
- two-column responsive behavior
- test/performance results
- iPad verification
- Summary/Error regression
- security regression
- screenshot review
- remaining limitations

Do not commit or push unless explicitly instructed.
```
