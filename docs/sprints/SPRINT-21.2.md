# Sprint 21.2 – System Dashboard Filters, Column Views & Risk Severity

## Status
Planned

## Einordnung

Sprint 21.2 baut auf Sprint 19, 20, 21 und 21.1 auf.

Ziel ist eine gemeinsame, konsistente UX für:

```text
/system/summary
/system/errors
```

Zusätzlich wird die bisher zu schwache Severity-Klassifikation sicherheits- und
schadensrelevanter Sensoren korrigiert.

---

# Hauptziele

1. Filter-Navigation im Summary Dashboard
2. gemeinsame Filter-UX für Summary und Errors
3. umschaltbare 1-/2-/3-Spaltenansicht für beide System-Dashboards
4. getrennte persistente Spaltenpräferenzen
5. zentrale Risk-Class-Klassifikation
6. kritische Bewertung von `unknown`/`unavailable` bei sicherheits- und schadensrelevanten Sensoren
7. Regression der Device-Gruppierung aus Sprint 21.1

---

# Sicherheitsgrundsätze

Unverändert:

- HA-Token ausschließlich im Backend
- keine direkte Browser-Verbindung zu Home Assistant
- keine generische Service-API
- keine neuen Schreibendpunkte
- keine Repair-/Config-Entry-/Registry-/Matter-Writes
- Filter und Spaltenansichten erzeugen keine Schreibrechte
- Risk Class erzeugt keine Schreibrechte
- bestehende Light-/Climate-Allowlists unverändert
- bestehende Rate Limits, Payload Limits, Security Header und Secret Redaction bleiben erhalten

Sprint 21.2 ist für Summary/Errors vollständig read-only.

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

Spaltenlayout weiterhin mit Legacy-kompatiblem Flexbox/Width/Wrap.

---

# Teil A – Summary Dashboard Filter

Das Summary Dashboard erhält eine Filterleiste analog zum Error Dashboard.

Beispiel:

```text
[ Alle 18 ]
[ Offen 5 ]
[ Licht 4 ]
[ Aktiv 3 ]
[ Klima 2 ]
[ Medien 1 ]
[ Sicherheit 3 ]
```

Codex muss die tatsächlichen Sprint-19-Kategorien wiederverwenden.

Bevorzugt vorhandene normalisierte Kategorien, beispielsweise:

```text
open
powered
running
cleaning
climate
media
security
```

Keine parallele zweite Kategorie-Definition im Frontend.

---

# Summary Filter Verhalten

Nur ein Filter gleichzeitig.

Beispiel:

```text
Alle
→ alle Summary Items

Offen
→ offene/relevante Items der vorhandenen open-Kategorie

Klima
→ aktive Climate Items

Medien
→ aktive Media Items
```

Filterwechsel ohne Page Reload.

---

# Filter Empty State

Wenn nur der aktive Filter leer ist:

```text
Keine passenden aktiven Zustände.
```

Nicht:

```text
Keine Aktivität.
```

wenn andere Kategorien weiterhin Items enthalten.

---

# Summary Filter und Stale/Offline

Stale-/Offline-Semantik bleibt immer sichtbar.

Wenn HA offline/stale:

- Stale/Offline Banner bleibt sichtbar
- Filter darf keine falsche Entwarnung erzeugen
- gefilterte leere Liste darf nicht als „alles ruhig“ erscheinen

---

# Teil B – Gemeinsame Filter-Komponente

Summary und Errors sollen möglichst dieselbe visuelle Filter-Komponente verwenden.

Konzeptuell:

```text
system-filter-bar
system-filter-button
system-filter-button-active
system-filter-count
```

Aktiver Filter muss auch ohne Farbe erkennbar sein.

---

# Error Dashboard Filter

Sprint-21.1-Filter bleiben erhalten:

```text
Alle
Kritisch
Fehler
Warnungen
Unknown
```

Optional zusätzlich:

```text
Unavailable
```

nur wenn die Leiste dadurch nicht überladen wird.

---

# Teil C – 1 / 2 / 3 Spalten

Summary und Errors erhalten jeweils:

```text
Ansicht: [ 1 ] [ 2 ] [ 3 ]
```

---

# Getrennte Präferenzen

Persistenz getrennt:

```text
systemSummaryColumns
systemErrorsColumns
```

Beispiel:

```text
Summary = 3
Errors  = 2
```

---

# Persistenz

Bestehende sichere Legacy-Storage-Schicht wiederverwenden.

Verhalten:

```text
2 Spalten wählen
→ Reload
→ weiterhin 2 Spalten
```

Bei Storage Failure:

- Dashboard funktioniert weiter
- Default verwenden
- keine JS-Exception

---

# Default / Auto

Wenn kein expliziter Wert gespeichert ist, bevorzugt:

```text
kleines Portrait: 1
Tablet Portrait:  2
Landscape:        2
Desktop:          2
```

Optional `Auto`, aber kein Pflichtpunkt.

---

# 3-Spaltenansicht

Drei Spalten sind erlaubt, aber nicht um jeden Preis.

Wenn Viewport zu schmal:

- 3-Spalten-Button deaktivieren
- oder kontrolliert auf 2 Spalten zurückfallen

Keine winzigen unlesbaren Cards.

---

# Kein CSS Grid

Verbindlich Flexbox/Wrapping.

Konzeptionell:

```text
1 column -> ca. 100%
2 columns -> ca. 50% minus margins
3 columns -> ca. 33.333% minus margins
```

Keine horizontale Scrollbar.

---

# Gemeinsame Column-Helper

Bevorzugt:

```text
getSystemDashboardColumnPreference(type)
setSystemDashboardColumnPreference(type, count)
applySystemDashboardColumns(container, count)
```

ES5-kompatibel.

---

# Column Switch UI

Buttons:

- echte Button-Elemente
- active state
- disabled state
- aria-label
- geeignetes Touchziel

---

# Teil D – Risk Classification

## Problem

Bisher kann auftreten:

```text
Fenstersensor unknown -> info
Türsensor unknown     -> info
Leak Sensor unknown   -> info
```

Das ist fachlich zu schwach.

Bei solchen Sensoren bedeutet `unknown` oder `unavailable`, dass ein sicherheits-
oder schadensrelevanter Zustand nicht zuverlässig bestimmt werden kann.

---

# Zentrale Risk Class

Neue zentrale Klassifikation:

```text
safety
security
normal
diagnostic
```

Optional intern feiner:

```text
critical_safety
critical_security
normal
diagnostic
```

---

# Safety

Mindestens anhand zuverlässiger Device-Class-/Registry-Metadaten:

```text
smoke
carbon_monoxide
gas
moisture
```

Ein äquivalenter Leak-/Water-Typ darf berücksichtigt werden, wenn die reale HA-Metadatenquelle ihn liefert.

Keine Namensheuristik als primäre Quelle.

---

# Safety Severity

Für `safety` standardmäßig:

```text
unknown     -> critical
unavailable -> critical
```

Beispiele:

```text
Rauchmelder unknown
→ critical

Wassermelder unknown
→ critical

CO-Melder unavailable
→ critical
```

---

# Security / Gebäudehülle

Mindestens:

```text
door
window
opening
garage_door
lock
```

soweit zuverlässig aus den vorhandenen Metadaten ableitbar.

---

# Security Severity

Standard:

```text
unknown     -> critical
unavailable -> critical
```

Begründung:

Das System kann dann nicht zuverlässig feststellen, ob Tür/Fenster/Schloss in sicherem Zustand ist.

---

# Normal

Beispiele:

```text
temperature
humidity
power
energy
battery
signal strength
```

Für normale Sensoren bestehende mildere Regeln beibehalten.

Nicht alle `unknown`/`unavailable` pauschal critical machen.

---

# Diagnostic

Registry:

```text
entity_category = diagnostic
```

ist ein zusätzliches Signal.

Diagnostic wird nicht automatisch critical.

---

# Priorität der Severity-Regeln

Verbindlich:

```text
1. explizite Benutzer-/Admin-Severity-Override-Regel, falls vorhanden
2. explizite securityEntities / Security-Konfiguration
3. Risk Class aus zuverlässigen Metadaten
4. bestehende Domain-/State-Regel
5. allgemeiner Fallback
```

---

# Keine Name-only-Heuristik

Nicht:

```text
entity_id enthält "leak"
→ critical
```

als alleinige Entscheidungsgrundlage.

---

# Risk Class im Issue

Konzeptuell:

```javascript
{
    severity: "critical",
    riskClass: "safety",
    state: "unknown",
    securityRelevant: true
}
```

---

# Device Group Severity

Sprint-21.1-Regel bleibt:

```text
höchste Child-Severity bestimmt Device Group Severity
```

Beispiel:

```text
window unknown -> critical
battery unknown -> info
signal unavailable -> warning

Device Group -> critical
```

Counts müssen nach der neuen Severity korrekt neu berechnet werden.

---

# Filter und neue Severity

Error Filter:

```text
Kritisch
```

muss die neu critical klassifizierten Window/Door/Leak/Safety Issues enthalten.

---

# Tests – Summary Filter

1. Alle
2. Offen
3. Light/Powered
4. Running/Active
5. Climate
6. Media
7. Security
8. Counts korrekt
9. aktiver Filter sichtbar
10. Empty State korrekt
11. Stale Banner bleibt
12. Offline erzeugt keine falsche Entwarnung

---

# Tests – Summary Columns

13. 1 Spalte
14. 2 Spalten
15. 3 Spalten
16. Persistenz
17. Reload
18. Storage Failure
19. keine horizontale Scrollbar
20. lange Namen
21. Portrait
22. Landscape

---

# Tests – Error Columns

23. 1 Spalte
24. 2 Spalten
25. 3 Spalten
26. Persistenz
27. Reload
28. Device Groups korrekt
29. Expanded Child Details korrekt
30. keine horizontale Scrollbar
31. Portrait
32. Landscape

---

# Tests – Safety Risk

33. smoke unknown -> critical
34. smoke unavailable -> critical
35. carbon_monoxide unknown -> critical
36. carbon_monoxide unavailable -> critical
37. gas unknown -> critical
38. gas unavailable -> critical
39. moisture/leak unknown -> critical
40. moisture/leak unavailable -> critical

---

# Tests – Security Risk

41. window unknown -> critical
42. window unavailable -> critical
43. door unknown -> critical
44. door unavailable -> critical
45. opening unknown -> critical
46. opening unavailable -> critical
47. garage_door unknown -> critical
48. garage_door unavailable -> critical
49. lock unknown/unavailable nach definierter Regel critical

---

# Tests – Normal Sensors

50. temperature unknown nicht automatisch critical
51. humidity unknown nicht automatisch critical
52. battery unknown nicht automatisch critical
53. normal unavailable folgt bestehender Regel
54. diagnostic Entity nicht automatisch critical

---

# Tests – Overrides

55. explizite Konfiguration hat Priorität
56. securityEntities weiterhin wirksam
57. bewusste Override-Regel wird nicht überschrieben
58. keine Name-only-Heuristik
59. unbekannte Device Class crasht nicht

---

# Tests – Device Groups

60. critical Child -> Group critical
61. Window unknown -> Group critical
62. Leak unknown -> Group critical
63. Counts korrekt
64. Critical Filter zeigt Group
65. Child Details zeigen tatsächlichen State

---

# Regression Summary

66. bestehende Aktivitätsregeln unverändert
67. Climate Summary unverändert
68. Light Summary unverändert
69. Vacuum Summary unverändert
70. keine Numeric-Sensor-Autoaktivität
71. diagnostic/config Filterung bleibt

---

# Regression Errors

72. unavailable/unknown bleiben getrennt
73. Ignore funktioniert
74. stale/offline funktioniert
75. Config Entry Issues funktionieren
76. Repairs funktionieren
77. Matter Diagnostics funktionieren
78. Device Aggregation aus 21.1 funktioniert
79. Standalone Issues bleiben sichtbar

---

# Regression übrige Anwendung

80. User Dashboards
81. Admin
82. Focus Mode
83. Light Control
84. Climate Control
85. Theme Persistenz

---

# Security Regression

86. HA-Token Backend-only
87. keine neue Write-API
88. Write-Allowlists unverändert
89. Filter erzeugt keine Schreibrechte
90. Column View erzeugt keine Schreibrechte
91. Risk Class erzeugt keine Schreibrechte
92. keine Raw Registries im Browser

---

# Performance

Test mindestens:

```text
3000 Entities
500 Devices
200 aktive Error Issues
200 Summary Items
```

Prüfen:

- Filterwechsel schnell
- Spaltenwechsel ohne HA-Abfrage
- Severity-Klassifikation effizient
- keine komplette State-Pipeline bei UI-Wechsel neu starten

---

# Manuelle Abnahme – Summary

## iPad Portrait
- Filter
- 1/2/3 Spalten
- keine horizontale Scrollbar
- Dark/Light

## iPad Landscape
- Filter
- 1/2/3 Spalten
- Lesbarkeit
- Scrollverhalten

---

# Manuelle Abnahme – Errors

Prüfen:

- 1/2/3 Spalten
- Device Groups
- Child Details
- Critical Filter
- Unknown Filter
- Window unknown
- Door unknown
- Leak/Moisture unknown
- stale/offline

---

# Akzeptanzbeispiele

```text
Fenster Kinderzimmer
UNKNOWN
CRITICAL
```

```text
Haustür
UNAVAILABLE
CRITICAL
```

```text
Wassermelder Keller
UNKNOWN
CRITICAL
```

Temperatursensor:

```text
Temperatur Badezimmer
UNKNOWN
INFO/WARNING
```

gemäß bestehender Normalregel, aber nicht automatisch critical.

---

# Screenshot-Pflege

Wenn Sprint D1 vorhanden:

```text
docs/screenshots/system/summary.png
docs/screenshots/system/errors.png
```

prüfen/aktualisieren.

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

- Summary Filter
- Error Filter
- 1-/2-/3-Spaltenansicht
- persistente View Preference
- Risk-Class-Konzept
- Safety/Security unknown/unavailable = critical

README-Sprachen synchron halten.

---

# Nicht-Ziele

Nicht Bestandteil:

- neue Write-Aktionen
- komplexe Mehrfachfilter
- freie Spaltenbreiten
- Drag-and-drop in System Dashboards
- neue Sprint-22-Summary-Regeln
- Grace Periods
- Flapping
- Maintenance Mode
- Automation Impact
- Home Assistant App
- HACS

---

# Definition of Done

Sprint 21.2 ist abgeschlossen, wenn:

- Summary Filter besitzt
- Summary Kategorien direkt filterbar sind
- Error Filter weiterhin funktionieren
- Summary 1/2/3 Spalten unterstützt
- Errors 1/2/3 Spalten unterstützt
- beide Präferenzen getrennt gespeichert werden
- Reload Auswahl beibehält
- schmale Viewports sauber bleiben
- kein CSS Grid verwendet wird
- Safety Risk Class funktioniert
- Security Risk Class funktioniert
- Window/Door/Opening/Garage unknown/unavailable critical werden
- Leak/Moisture/Smoke/CO/Gas unknown/unavailable critical werden
- normale Sensoren nicht pauschal critical werden
- explizite Konfiguration Priorität behält
- Device Group höchste Severity übernimmt
- Sprint-21.1-Gruppierung unverändert funktioniert
- Summary Business Logic unverändert bleibt
- keine neuen HA-Abfragen für Filter/Spaltenwechsel entstehen
- keine neue Write-Funktion entsteht
- iOS-9-/ES5-Kompatibilität erhalten bleibt
- alle Tests grün sind
- Screenshots geprüft/aktualisiert wurden
- `docs/PROJECT_STATUS.md` aktualisiert wurde

---

# Erwartetes Codex-Ergebnis

Codex berichtet:

1. Startcommit
2. tatsächlicher Repo-Stand
3. geänderte Dateien
4. Summary Filter Architektur
5. gemeinsame Filter-Komponente
6. 1/2/3 Column Architektur
7. Storage/Persistenz
8. Responsive Regeln
9. Risk-Class-Modell
10. Safety-Regeln
11. Security-Regeln
12. Override-Priorität
13. Device-Group-Auswirkung
14. Testanzahl und Ergebnis
15. Performance
16. iPad-Abnahme Summary
17. iPad-Abnahme Errors
18. Summary Regression
19. Error Regression
20. Security Regression
21. Screenshot Review
22. verbleibende Einschränkungen
23. Voraussetzungen für Sprint 17.6 / Sprint 22
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
- docs/sprints/SPRINT-D1.md if present

Inspect the actual repository state first.

Implement Sprint 21.2 exactly as specified in
docs/sprints/SPRINT-21.2.md.

Goals:

1. Add useful category filters to /system/summary.
2. Keep and visually unify the /system/errors filters.
3. Add persistent 1/2/3-column view selection independently for Summary and Errors.
4. Correct risk severity for safety/security-relevant entities.

Summary filters must use the existing normalized Sprint-19 categories.
Do not create duplicate Summary business logic in the browser.

Column view:
- support 1, 2 and 3 columns,
- persist Summary and Error preferences separately,
- reuse the existing safe storage layer,
- use legacy-compatible Flexbox/wrapping,
- no CSS Grid,
- no Flexbox gap,
- never create horizontal scrolling,
- gracefully prevent/fallback from 3 columns when the viewport is too narrow.

Risk classification:
introduce a central risk class such as:
- safety
- security
- normal
- diagnostic

For reliable safety/security metadata:
- unknown must default to critical
- unavailable must default to critical

A window, door or leak sensor whose state cannot be determined must not appear
as mere informational status.

Normal sensors such as temperature, humidity, battery or signal must not all
become critical.

Severity priority:
1. explicit configured override, if supported
2. explicit securityEntities / security configuration
3. risk class from reliable metadata
4. existing domain/state rule
5. fallback

Do not use entity-name matching as the primary risk classifier.

Preserve Sprint 21.1 device grouping:
the highest child severity must continue to determine device-group severity.

Do not conflate unavailable and unknown.

Do not add new Home Assistant calls for filter or column switching.

Preserve all existing Home Assistant security boundaries.
Do not add write capabilities or change write allowlists.

Keep the wall display compatible with Safari on iOS 9 and ECMAScript 5.

Run complete tests and regressions for Summary, Error device grouping,
unavailable/unknown, stale/offline, Config Entry diagnostics, Repairs, Matter,
user dashboards, Admin, Focus Cards, Light/Climate controls, theme persistence
and all write-security boundaries.

Manually verify Summary and Errors on iPad in portrait and landscape with
1/2/3 columns.

Explicitly verify:
- window unknown -> critical
- door unknown -> critical
- moisture/leak unknown -> critical
- corresponding unavailable states -> critical
- normal temperature unknown does not automatically become critical

If Sprint D1 exists, update real Summary/Error screenshots.

Update README.de.md and README.en.md semantically in sync.
Update docs/PROJECT_STATUS.md.

Do not commit or push unless explicitly instructed.
```
