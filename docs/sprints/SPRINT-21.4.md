# Sprint 21.4 – System Dashboard Configuration & Header Simplification

## Status

Planned

## Einordnung

Sprint 21.4 baut auf folgenden Ständen auf:

- Sprint 19 – Summary Dashboard MVP
- Sprint 20 – Error Dashboard MVP
- Sprint 21 – Registry & Diagnostic Enrichment
- Sprint 21.1 – Error Dashboard Device Aggregation & Navigation
- Sprint 21.2 – System Dashboard Filters, Column Views & Risk Severity
- Sprint 21.3 – Error Filtering & Critical Device Detection Modes

Ziel ist es, zwei UX-Probleme zu beheben:

1. Die Entity-Konfiguration im Admin-Bereich ist mit großen Dropdown-Menüs bei vielen Entities nicht mehr komfortabel.
2. Summary- und Error-Dashboard zeigen dieselben Gesamtinformationen mehrfach.

Sprint 21.4 verbessert daher:

- Admin-Konfiguration für Entity-Regeln
- Informationsarchitektur der System-Dashboard-Header
- gemeinsame UI-Strukturen für Summary und Errors

---

# Hauptziele

Sprint 21.4 implementiert:

1. einen durchsuchbaren Entity Rule Manager
2. drei Entity-Regeln in einer gemeinsamen Verwaltungsansicht
3. Area-/Domain-/Device-Filter
4. Filter auf nur konfigurierte Entities
5. Batch-Speichern statt sofortigem Speichern je Klick
6. vereinfachten Summary Header
7. vereinfachten Error Header
8. Entfernung redundanter Counts
9. gemeinsame Header-/Filter-Struktur für beide System-Dashboards

---

# Betroffene Entity-Regeln

Mindestens:

```text
Summary ignorieren
Sicherheitsrelevant
In Errors ignorieren
```

Aktuelle große Dropdown-Menüs für diese Funktionen sollen ersetzt werden.

---

# Sicherheitsgrundsätze

Unverändert:

- HA-Token ausschließlich im Backend
- keine direkte Browser-Verbindung zu Home Assistant
- keine generische Service-API
- keine Registry-Writes
- keine Label-Writes
- keine Repairs-/Config-Entry-/Matter-Writes
- Entity Rule Manager verändert nur Dashboard-/Gateway-Konfiguration
- das Markieren als sicherheitsrelevant erzeugt keine HA-Schreibrechte
- Ignore-Regeln erzeugen keine HA-Schreibrechte
- bestehende Light-/Climate-Allowlists unverändert
- bestehende Rate Limits, Security Header, Payload Limits und Secret Redaction bleiben erhalten

---

# Legacy-Kompatibilität

Weiterhin kompatibel mit:

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

# Teil A – Entity Rule Manager

## Problem

Bei vielen Entities sind Dropdown-Menüs ungeeignet.

Beispiel aktueller UX:

```text
Entity in Summary ignorieren:
[ sehr langes Dropdown ]

Sicherheitsrelevante Entity:
[ sehr langes Dropdown ]

Entity in Fehlern ignorieren:
[ sehr langes Dropdown ]
```

Bei mehreren hundert oder tausend Entities ist das unübersichtlich und langsam.

---

# Neue Struktur

Ein gemeinsamer Entity Rule Manager.

Beispiel:

```text
Entity Rules

[Suchen: __________________________]

Area:   [ Alle ▼ ]
Domain: [ Alle ▼ ]
Device: [ Alle ▼ ]

[ Alle ] [ Nur konfigurierte ]

────────────────────────────────────────────
Fenster Kinderzimmer
binary_sensor.fenster_kinderzimmer
Kinderzimmer · Fensterkontakt

[ ] Summary ignorieren
[x] Sicherheitsrelevant
[ ] In Errors ignorieren
────────────────────────────────────────────

Temperatur Wohnzimmer
sensor.temperatur_wohnzimmer
Wohnzimmer · Thermostat

[x] Summary ignorieren
[ ] Sicherheitsrelevant
[ ] In Errors ignorieren
────────────────────────────────────────────
```

---

# Eine Entity = eine Zeile/Card

Jede Entity erscheint nur einmal.

Die drei relevanten Regeln werden direkt an dieser Entity bearbeitet.

Nicht mehr:

```text
Entity separat in drei verschiedenen Dropdowns suchen
```

---

# Suchfunktion

Die Suche muss mindestens matchen auf:

```text
Friendly Name
Entity ID
Device Name
Area Name
Domain
```

Beispiele:

```text
fenster
kinderzimmer
binary_sensor
thermostat
wohnzimmer
```

---

# Suchverhalten

- ES5-kompatibel
- kein Server-Request pro Tastendruck
- vorhandene Admin-Daten clientseitig filtern
- optional debounce, falls bereits Legacy-kompatibler Helper vorhanden
- Suche case-insensitive
- Leerstring zeigt alle aktuellen Filtertreffer

---

# Area Filter

Kleine Auswahlliste:

```text
Area:
[ Alle ]
[ Wohnzimmer ]
[ Küche ]
[ Schlafzimmer ]
```

Area-Daten aus Sprint 21 wiederverwenden.

Keine Area-Heuristik.

---

# Domain Filter

Beispiel:

```text
Domain:
[ Alle ]
[ binary_sensor ]
[ sensor ]
[ light ]
[ climate ]
[ cover ]
```

Nur tatsächlich vorhandene Domains anbieten.

---

# Device Filter

Optional aber verbindlich, wenn bereits sauber aus Registry-Metadaten ableitbar.

Beispiel:

```text
Device:
[ Alle ]
[ Thermostat Wohnzimmer ]
[ Fensterkontakt Kinderzimmer ]
```

Bei sehr vielen Devices muss auch dieser Filter nicht als riesiges unbrauchbares Dropdown umgesetzt werden.

Wenn Device-Liste zu groß ist, bevorzugt:

```text
Device Search / Autocomplete
```

oder kleiner zusätzlicher Suchfilter.

Kein zweites Problem-Dropdown erzeugen.

---

# Filter kombinierbar

Beispiel:

```text
Search = fenster
Area = Kinderzimmer
Domain = binary_sensor
```

zeigt nur passende Entities.

---

# Nur konfigurierte Entities

Zusätzlicher Modus:

```text
[ Alle ]
[ Nur konfigurierte ]
```

Eine Entity gilt als konfiguriert, wenn mindestens eine Regel aktiv ist:

```text
Summary Ignore
Security Relevant
Error Ignore
```

---

# Optional feinere Filter

Wenn mit geringem Aufwand möglich:

```text
[ Summary ignoriert ]
[ Sicherheitsrelevant ]
[ Error ignoriert ]
```

aber kein Pflichtpunkt.

---

# Teil B – Entity Darstellung

Jede Entity-Zeile/Card zeigt kompakt:

```text
Friendly Name
Entity ID
Area · Device
Domain optional
```

Beispiel:

```text
Fenster Kinderzimmer
binary_sensor.fenster_kinderzimmer
Kinderzimmer · Aqara Fensterkontakt
```

---

# Kein Raw Registry Dump

Nicht anzeigen:

```text
raw config_entry_id
raw device connections
MAC
serial
identifiers
```

---

# Unavailable / Unknown in Admin

Optional aktueller State:

```text
State: unavailable
```

darf angezeigt werden.

Er ist aber nicht notwendig, um die Regeln zu bearbeiten.

---

# Teil C – Rule Controls

Pro Entity:

```text
[ ] Summary ignorieren
[ ] Sicherheitsrelevant
[ ] In Errors ignorieren
```

---

# Touch Targets

Checkbox/Toggle inklusive Label muss auf Touch-Geräten gut bedienbar sein.

Ziel mindestens:

```text
44 px Touchhöhe
```

---

# Kein iOS-Style-Switch-Zwang

Nicht wieder das aus früheren Sprints problematische iOS-Switch-Design verwenden.

Bevorzugt:

- normale Checkbox
- dashboard-native Toggle-Zeile
- klarer aktiver Status

Legacy Safari kompatibel.

---

# Teil D – Änderungspuffer / Batch Save

Regeländerungen werden zunächst lokal im Admin-Formular gehalten.

Unten:

```text
[ Änderungen verwerfen ]   [ Speichern ]
```

---

# Warum Batch Save

Nicht bei jedem Checkbox-Klick sofort Backend schreiben.

Vorteile:

- mehrere Regeln in Ruhe ändern
- weniger Requests
- Änderungen kontrollierbar
- versehentliche Klicks können verworfen werden

---

# Dirty State

Sobald eine Änderung vorliegt:

```text
Ungespeicherte Änderungen
```

sichtbar anzeigen.

---

# Navigation bei Dirty State

Wenn Benutzer Admin-Seite verlässt:

- wenn bestehende Admin-UX bereits Dirty-State-Warnung besitzt, wiederverwenden
- andernfalls optional einfache Warnung

Kein komplexes modernes Browser-API voraussetzen.

---

# Save

Speichern soll alle geänderten Entity-Regeln gesammelt übertragen.

Bevorzugt bestehende Admin-Konfigurations-API erweitern.

Keine neue generische Config-Write-API.

---

# Payload

Nur explizit benötigte Konfiguration.

Konzeptuell:

```javascript
{
    summaryIgnoredEntities: [...],
    securityEntities: [...],
    errorIgnoredEntities: [...]
}
```

Bestehende reale Feldnamen beibehalten.

---

# Keine semantische Migration ohne Not

Wenn die drei Listen bereits persistiert werden:

- bestehende Datenstruktur möglichst weiterverwenden
- keine unnötige neue Datenbank-/Dateistruktur einführen
- UI darüber verbessern

---

# Backward Compatibility

Bestehende Konfiguration muss nach Upgrade weiterhin funktionieren.

---

# Teil E – Performance Entity Rule Manager

Test mindestens:

```text
3000 Entities
500 Devices
50 Areas
```

Prüfen:

- initiales Rendering
- Suche
- Area Filter
- Domain Filter
- Nur konfigurierte
- Checkbox Änderungen

---

# DOM-Größe

Nicht zwingend alle 3000 vollständigen Entity Cards gleichzeitig rendern, wenn dies Legacy Safari belastet.

Mögliche Legacy-kompatible Strategien:

```text
Pagination
"Mehr anzeigen"
begrenzte Trefferliste
```

Virtual Scrolling ist kein Pflichtpunkt und kann auf iOS 9 unnötig komplex sein.

---

# Bevorzugte Begrenzung

Bei leerer Suche und tausenden Entities darf beispielsweise:

```text
Erste 100 Ergebnisse
```

mit Hinweis erscheinen:

```text
Zu viele Treffer. Suche oder Filter verwenden.
```

Dies kann auf Legacy-Hardware deutlich robuster sein.

---

# Teil F – Summary Header Simplification

## Aktuelles Problem

Beispiel:

```text
29 aktive Zustände
29 aktiv
Alle 29
```

Die gleiche Gesamtinformation erscheint mehrfach.

---

# Neue Regel

> Eine Gesamtzahl wird im Header genau einmal dargestellt.

---

# Ziel Summary

Bevorzugt:

```text
SUMMARY · 29 aktive Zustände

[ Alle ] [ Offen 8 ] [ Licht 7 ] [ Klima 4 ] [ Medien 2 ]
```

Nicht:

```text
29 aktive Zustände
29 aktiv
Alle 29
```

---

# Filter Counts Summary

Gesamtzahl steht im Header.

Der `Alle` Button muss die Gesamtzahl nicht erneut anzeigen.

Bevorzugt:

```text
[ Alle ]
```

statt:

```text
[ Alle 29 ]
```

Teilfilter dürfen Counts zeigen:

```text
[ Offen 8 ]
[ Licht 7 ]
```

---

# Alternative

Falls die vorhandene UI-Struktur `Alle 29` stark bevorzugt:

dann darf der Header nur:

```text
SUMMARY
```

anzeigen.

Aber die Gesamtzahl darf nicht an drei Stellen wiederholt werden.

---

# Verbindliche UX-Regel

Maximal eine dominante Gesamtsumme.

---

# Summary Statuszeile

Zusätzliche Zeilen wie:

```text
29 aktiv
```

entfernen, wenn sie keine zusätzliche Information liefern.

---

# Stale / Offline

Nicht entfernen.

Beispiele:

```text
STALE
Letztes erfolgreiches Update ...
```

oder:

```text
Home Assistant nicht erreichbar
```

bleiben sichtbar.

---

# Teil G – Error Header Simplification

## Aktuelles Problem

Analog zu Summary:

```text
12 Probleme
12 Fehler
Alle 12
```

oder ähnliche redundante Counts.

---

# Ziel Errors

Bevorzugt:

```text
ERRORS · 12 Probleme
```

Darunter:

```text
Kritikalität
[ Alle ] [ Kritisch 3 ] [ Fehler 2 ] [ Warnung 5 ] [ Info 2 ]

Status
[ Alle ] [ Unavailable 8 ] [ Unknown 4 ]
```

---

# Error Gesamtzahl

Nur einmal prominent.

---

# Severity Filter

`Alle` muss Gesamtzahl nicht wiederholen.

Bevorzugt:

```text
[ Alle ]
[ Kritisch 3 ]
[ Fehler 2 ]
[ Warnung 5 ]
[ Info 2 ]
```

---

# Status Filter

Counts bleiben sinnvoll, weil sie eine andere Dimension darstellen:

```text
[ Unavailable 8 ]
[ Unknown 4 ]
```

---

# Unterschiedliche Dimensionen

Es ist korrekt, dass:

```text
Critical 4
Unknown 7
```

sich überschneiden.

Keine künstliche Summengleichheit suggerieren.

---

# Teil H – Gemeinsame System Header Architektur

Bevorzugt gemeinsame Struktur:

```text
system-dashboard-header
system-dashboard-title
system-dashboard-total
system-dashboard-toolbar
system-dashboard-filter-section
system-dashboard-column-switch
```

---

# Summary

```text
Title + Total
Filter
Column Switch
```

---

# Errors

```text
Title + Total
Severity Filter
Status Filter
Column Switch
```

---

# Column Switch

Sprint 21.2 bleibt erhalten:

```text
Ansicht [1] [2] [3]
```

Soll visuell in die Toolbar integriert werden.

Keine zusätzliche redundante Zeile, wenn vermeidbar.

---

# Desktop Layout

Beispiel Summary:

```text
SUMMARY · 29 aktive Zustände                          Ansicht [1][2][3]

[Alle] [Offen 8] [Licht 7] [Klima 4] [Medien 2]
```

---

# Desktop Layout Errors

```text
ERRORS · 12 Probleme                                 Ansicht [1][2][3]

Kritikalität
[Alle] [Kritisch 3] [Fehler 2] [Warnung 5] [Info 2]

Status
[Alle] [Unavailable 8] [Unknown 4]
```

---

# Mobile / iPad

Toolbar darf umbrechen.

Keine horizontale Scrollbar.

---

# Teil I – Empty States

## Summary

Wenn wirklich keine aktiven Items:

```text
Keine aktiven Zustände.
```

Gesamtzahl:

```text
0
```

nicht mehrfach wiederholen.

---

# Errors

Wenn keine Issues:

```text
Keine aktuellen Probleme.
```

Status:

```text
OK
```

darf als qualitativer Zustand angezeigt werden.

Nicht zusätzlich:

```text
0 Probleme
0 Fehler
Alle 0
```

---

# Teil J – Accessibility / Bedienung

- echte Labels für Checkboxen
- Buttons mit verständlichen Namen
- aktive Filter nicht nur über Farbe
- Fokuszustände sichtbar
- Suchfeld mit Label
- Touch Targets ausreichend groß

---

# Tests – Entity Rule Manager

1. Entity-Liste lädt
2. Friendly Name sichtbar
3. Entity ID sichtbar
4. Area sichtbar
5. Device sichtbar
6. Suche Friendly Name
7. Suche Entity ID
8. Suche Device Name
9. Suche Area
10. Suche Domain
11. Area Filter
12. Domain Filter
13. Device Filter / Search
14. kombinierte Filter
15. Nur konfigurierte
16. Summary Ignore setzen
17. Summary Ignore entfernen
18. Security Relevant setzen
19. Security Relevant entfernen
20. Error Ignore setzen
21. Error Ignore entfernen

---

# Tests – Batch Save

22. Änderung erzeugt Dirty State
23. mehrere Änderungen lokal
24. Speichern überträgt gesammelt
25. Verwerfen setzt zurück
26. Save Fehler zeigt Fehler
27. Retry möglich
28. bestehende Konfiguration bleibt kompatibel
29. keine HA Write API
30. keine einzelne Write-Anfrage pro Checkbox

---

# Tests – Performance

31. 3000 Entities
32. 500 Devices
33. 50 Areas
34. Suche schnell
35. Filter schnell
36. Legacy DOM nicht überladen
37. Trefferbegrenzung funktioniert, falls implementiert
38. kein O(n²)-Filtering

---

# Tests – Summary Header

39. Gesamtzahl nur einmal dominant
40. redundante "aktiv"-Zeile entfernt
41. Alle Button wiederholt Gesamtcount nicht
42. Teilfilter Counts korrekt
43. Stale Banner bleibt
44. Offline Banner bleibt
45. Empty State korrekt
46. 1/2/3 Columns bleiben

---

# Tests – Error Header

47. Gesamtzahl nur einmal dominant
48. redundante Gesamtzeile entfernt
49. Severity All wiederholt Gesamtcount nicht
50. Severity Counts korrekt
51. Status Counts korrekt
52. Severity/Status Filter kombinierbar
53. Info Filter bleibt
54. Unknown bleibt Status
55. Device Groups bleiben
56. 1/2/3 Columns bleiben

---

# Regression Sprint 21.3

57. Device-Class-Modus funktioniert
58. HA-Label-Modus funktioniert
59. Critical Label Auswahl funktioniert
60. Label Read-only
61. Risk Severity unverändert
62. Unknown/Unavailable Semantik unverändert

---

# Regression übrige Anwendung

63. User Dashboards funktionieren
64. Admin Navigation funktioniert
65. Focus Cards funktionieren
66. Light Controls funktionieren
67. Climate Controls funktionieren
68. Theme Persistenz funktioniert

---

# Security Regression

69. HA-Token Backend-only
70. keine neue HA Write API
71. keine Registry Writes
72. keine Label Writes
73. keine generische Config Write API
74. Entity Rule Manager schreibt nur erlaubte Dashboard-Konfiguration
75. Security Relevant erzeugt keine HA Capability

---

# Manuelle Abnahme Admin

## Desktop

Prüfen:

- Suche
- Area
- Domain
- Device
- Nur konfigurierte
- drei Regeln pro Entity
- Dirty State
- Save
- Discard

## iPad

Prüfen:

- Suchfeld bedienbar
- Checkbox-/Rule-Zeilen bedienbar
- keine riesigen Dropdowns
- keine horizontale Scrollbar
- 44px Touch Targets
- große Entity-Menge bleibt nutzbar

---

# Manuelle Abnahme Summary

Prüfen:

```text
kein dreifacher Gesamtcount
Header kompakt
Filter verständlich
Columns verständlich
```

---

# Manuelle Abnahme Errors

Prüfen:

```text
kein mehrfacher Gesamtcount
Severity und Status klar getrennt
Columns verständlich
Device Groups gut scanbar
```

---

# Screenshot-Pflege

Wenn Sprint D1 vorhanden:

Mindestens prüfen/aktualisieren:

```text
docs/screenshots/admin/dashboard-management.png
docs/screenshots/system/summary.png
docs/screenshots/system/errors.png
```

Optional:

```text
docs/screenshots/admin/entity-rules.png
```

Nur echte Produkt-/Demo-Screenshots.

---

# Dokumentation

Aktualisieren:

```text
README.de.md
README.en.md
docs/PROJECT_STATUS.md
docs/SPRINT_ROADMAP.md
```

Dokumentieren:

- Entity Rule Manager
- Such-/Filtermöglichkeiten
- Batch Save
- Summary Header Simplification
- Error Header Simplification
- Count-Regel
- bestehende Severity-/Status-Filter

README-Sprachen semantisch synchron halten.

---

# Nicht-Ziele

Nicht Bestandteil:

- eigenes Tag-System
- neue HA Labels schreiben
- neue Risk Rules
- neue Summary Activity Rules
- neue Error Detection Rules
- Grace Periods
- Flapping
- Maintenance Mode
- Automation Impact
- Home Assistant App
- HACS
- vollständige Admin-Neuentwicklung

---

# Definition of Done

Sprint 21.4 ist abgeschlossen, wenn:

- große Entity-Dropdowns für die drei Regeln ersetzt wurden
- Entity Rule Manager existiert
- Suche Friendly Name/Entity ID/Device/Area/Domain unterstützt
- Area-/Domain-/Device-Filter sinnvoll funktionieren
- Nur konfigurierte Entities filterbar sind
- Summary Ignore direkt an Entity konfigurierbar ist
- Security Relevant direkt an Entity konfigurierbar ist
- Error Ignore direkt an Entity konfigurierbar ist
- Änderungen gesammelt gespeichert werden
- bestehende Konfigurationsdaten kompatibel bleiben
- große Entity-Mengen auf Legacy-Hardware nutzbar bleiben
- Summary Gesamtcount nicht mehrfach erscheint
- Error Gesamtcount nicht mehrfach erscheint
- Summary Filter Counts weiterhin korrekt sind
- Error Severity-/Status-Counts weiterhin korrekt sind
- 1/2/3-Spaltenansichten erhalten bleiben
- Sprint-21.3-Risk-/Label-Modi erhalten bleiben
- keine Security Boundary verändert wurde
- iOS-9-/ES5-Kompatibilität erhalten bleibt
- alle Tests grün sind
- Screenshots geprüft/aktualisiert wurden
- docs/PROJECT_STATUS.md aktualisiert wurde

---

# Erwartetes Codex-Ergebnis

Codex berichtet:

1. Startcommit
2. tatsächlicher Repo-Stand
3. geänderte Dateien
4. alter Dropdown-Ansatz
5. neue Entity-Rule-Manager-Architektur
6. Suchindex/Filterlogik
7. Area-/Domain-/Device-Filter
8. Nur-konfigurierte-Logik
9. Batch-Save-Architektur
10. Backward Compatibility
11. große-Datenmengen-Verhalten
12. Summary Header Änderung
13. Error Header Änderung
14. Count-Semantik
15. Filter Regression
16. Column Regression
17. Sprint-21.3 Regression
18. iPad-Abnahme
19. Tests/Performance
20. Security Regression
21. Screenshot Review
22. verbleibende Einschränkungen
23. Voraussetzungen für Sprint 22
24. Commit-Vorschlag
25. Deploymentbefehle

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
- docs/sprints/SPRINT-19.md
- docs/sprints/SPRINT-20.md
- docs/sprints/SPRINT-21.md
- docs/sprints/SPRINT-21.1.md
- docs/sprints/SPRINT-21.2.md
- docs/sprints/SPRINT-21.3.md
- docs/sprints/SPRINT-21.4.md
- docs/sprints/SPRINT-D1.md if present

Inspect the actual repository state first.

Implement Sprint 21.4 exactly as specified in
docs/sprints/SPRINT-21.4.md.

Two UX problems must be solved.

1. Admin entity configuration

The existing dropdown-based configuration for:
- Summary ignored entities
- Security-relevant entities
- Error ignored entities

does not scale to hundreds or thousands of entities.

Replace those large entity dropdown workflows with one searchable Entity Rule
Manager.

Each entity should appear once and expose the three rules directly:

- Ignore in Summary
- Security Relevant
- Ignore in Errors

Search must match at least:
- friendly name
- entity ID
- device name
- area name
- domain

Add practical filters for:
- area
- domain
- device where usable
- configured entities only

Avoid replacing one huge entity dropdown with another huge device dropdown.
If the device list is too large, use a search/autocomplete-style solution or a
smaller filter strategy.

Use Sprint 21 registry metadata already available.

Do not issue HA requests on every search keystroke.

Support batch editing:
- local dirty state
- Save
- Discard

Do not write on every checkbox click.

Preserve existing stored configuration fields where practical so existing
configuration remains backward compatible.

For very large entity sets, avoid rendering thousands of heavy rows at once on
legacy Safari. A simple result limit, pagination or "show more" is acceptable
and preferred over complex virtualization.

2. System Dashboard header simplification

Summary currently repeats the same total information multiple times, for
example:
- 29 active states
- 29 active
- All 29

Errors has similar duplication.

Introduce the rule:
A dashboard total should be shown prominently only once.

Preferred Summary structure:

SUMMARY · 29 active states
[ All ] [ Open 8 ] [ Light 7 ] [ Climate 4 ] ...

Do not repeat the total again in a redundant status line and All-button count.

Preferred Error structure:

ERRORS · 12 issues

Severity:
[ All ] [ Critical 3 ] [ Error 2 ] [ Warning 5 ] [ Info 2 ]

State:
[ All ] [ Unavailable 8 ] [ Unknown 4 ]

Keep Sprint 21.3's separation between Severity and State.

Keep Sprint 21.2's 1/2/3-column controls.

Stale/offline banners remain visible and must not be removed as redundancy.

Use shared system-dashboard header/filter primitives where practical.

Preserve:
- Sprint 21.1 device grouping
- Sprint 21.2 column selection
- Sprint 21.3 Device-Class/HA-Label critical detection modes
- Summary business logic
- Error business logic
- all security boundaries
- Safari iOS 9 / ES5 compatibility

Do not add any new Home Assistant write APIs or permissions.

Run large-data tests with at least:
- 3000 entities
- 500 devices
- 50 areas

Run complete regressions for:
- Summary filters
- Error severity/state filters
- 1/2/3 columns
- Device Groups
- Label mode
- Device-Class mode
- stale/offline
- Admin
- Focus
- Light/Climate controls
- all write-security boundaries

Manually verify the new Entity Rule Manager and both System Dashboard headers
on iPad.

If Sprint D1 exists, update real Admin/Summary/Error screenshots.

Update README.de.md and README.en.md semantically in sync.
Update docs/PROJECT_STATUS.md.

At the end report:
- changed files
- Entity Rule Manager architecture
- search/filter implementation
- batch-save behavior
- backward compatibility
- large-data behavior
- Summary header changes
- Error header changes
- count semantics
- test/performance results
- iPad verification
- regression results
- security regression
- screenshot review
- remaining limitations

Do not commit or push unless explicitly instructed.
```
