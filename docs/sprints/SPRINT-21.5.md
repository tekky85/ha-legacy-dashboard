# Sprint 21.5 – System Dashboard Navigation & Global Health Indicator

## Status
Planned

## Ziel

Sprint 21.5 integriert die System-Dashboards in den normalen Dashboard-Workflow.

Bisher sind:

```text
/system/summary
/system/errors
```

praktisch nur per direkter URL erreichbar.

Künftig soll der Benutzer aus dem Default-Dashboard und jedem Custom Dashboard direkt zu Summary und Errors wechseln können und zuverlässig wieder zum aufrufenden Dashboard zurückkehren.

---

# Hauptziele

1. globaler Summary-Navigationsbutton
2. globaler Error/Health Indicator
3. Severity-basierte Darstellung des Health Indicators
4. Indicator nur bei Warning/Error/Critical
5. Stale/Unknown-Status ohne falsche Entwarnung
6. sicherer Return-to-Dashboard-Mechanismus
7. Back-Navigation in Summary und Errors
8. Nutzung des bestehenden kleinen System-Status
9. keine vollständige Error-/Summary-Abfrage nur für den Header
10. Safari iOS 9 / ES5 kompatibel

---

# Sicherheit

Unverändert:

- HA-Token nur im Backend
- keine direkte Browser-Verbindung zu HA
- keine neue Write API
- keine neue Service API
- keine generische Browser-WebSocket-Verbindung zu HA
- Navigation erzeugt keine Schreibrechte
- Health Indicator erzeugt keine Schreibrechte
- bestehende Security Header, Rate Limits und Payload Limits bleiben

---

# Legacy-Kompatibilität

Weiterhin:

```text
iPad mini 1
iOS 9.3.5
Safari iOS 9
ECMAScript 5
```

Nicht verwenden:

- let / const
- arrow functions
- template literals
- fetch
- Promise
- async/await
- optional chaining
- nullish coalescing
- CSS Grid
- Flexbox gap
- ResizeObserver
- Container Queries

---

# Teil A – Globale System-Navigation

Jedes normale Dashboard erhält einen kleinen globalen Navigationsbereich.

Bevorzugt im Header.

Beispiel:

```text
┌──────────────────────────────────────────────┐
│ Wohnzimmer             [ Summary ]       ●  │
└──────────────────────────────────────────────┘
```

Gilt für:

- Default Dashboard
- alle Custom Dashboards

---

# Summary Button

Der Summary-Button ist grundsätzlich sichtbar.

```text
[ Summary ]
```

Tap:

```text
aktuelles Dashboard als Return Target merken
↓
/system/summary öffnen
```

Summary ist kein Alarmzustand.

Daher nicht konditional verstecken.

---

# Error / Health Indicator

Der Indicator ist nur sichtbar, wenn mindestens ein relevantes Problem vorhanden ist.

Relevante Severities:

```text
warning
error
critical
```

Nur `info` allein erzeugt keinen Alarmindikator.

---

# Healthy

Wenn:

```text
critical = 0
error = 0
warning = 0
```

und der Health-Status fresh/zuverlässig ist:

```text
kein Error Indicator
```

---

# Warning

Bevorzugt:

```text
gelb/orangefarbener statischer Punkt
```

---

# Error

Bevorzugt:

```text
rot/orangefarbener statischer Punkt
```

---

# Critical

Bevorzugt:

```text
roter Punkt
langsames dezentes Pulsieren
```

Kein hektisches Blinken.

Wenn Animation auf Legacy Safari nicht zuverlässig ist, statischer Critical Indicator.

---

# Keine reine Farbcodierung

Zusätzlich:

- `title`
- `aria-label`
- optional Count

Beispiel:

```text
aria-label="3 aktuelle Probleme öffnen"
```

---

# Touch Target

Der sichtbare Punkt darf klein sein.

Die klickbare Fläche muss ungefähr:

```text
44 × 44 px
```

betragen.

---

# Teil B – Stale / Unknown Health

## Grundregel

Kein sichtbarer Indicator darf nur dann bedeuten:

```text
alles OK
```

wenn der Status fresh und zuverlässig ist.

Wenn Health-Status stale/unknown ist, darf der Indicator nicht einfach verschwinden.

---

# Stale

Bevorzugt:

```text
?
```

oder grauer Statuspunkt.

Beschriftung:

```text
Systemstatus nicht aktuell
```

Tap öffnet `/system/errors`.

---

# No Initial Status

Wenn noch nie ein gültiger Health Status verfügbar war:

```text
Status unbekannt
```

sichtbar machen.

Keine falsche Entwarnung.

---

# Last-known Problem

Beispiel:

```text
last known = critical
current status = stale
```

Das Problem darf nicht einfach verschwinden.

Bevorzugt kombinierter Critical/Stale-Zustand.

---

# Teil C – Status-Datenquelle

Normale Dashboards dürfen nicht die vollständige Error-Liste laden, nur um den kleinen Indicator anzuzeigen.

Bevorzugt bestehenden Status-Endpunkt wiederverwenden:

```text
GET /api/system-dashboards/status
```

Codex muss den tatsächlichen aktuellen Endpoint prüfen.

Konzeptuelles Schema:

```javascript
{
    summary: {
        active: 29
    },
    errors: {
        total: 12,
        critical: 2,
        error: 3,
        warning: 7,
        info: 4,
        highestSeverity: "critical"
    },
    stale: false,
    reachable: true,
    lastSuccessfulAt: "..."
}
```

Bestehendes reales Schema bevorzugen.

Keine unnötige API-Neuerfindung.

---

# Status Payload

Klein und normalisiert.

Keine:

- vollständige Entity-Liste
- vollständige Error-Liste
- Raw HA States
- Raw Registries
- Repair Details

---

# Refresh

Keinen zweiten großen Polling-Loop erzeugen.

Nicht:

```text
Dashboard Poll
+ Error Poll
+ Summary Poll
```

nur wegen des Headers.

Bevorzugt:

- vorhandenen Refresh-Mechanismus nutzen
- kleinen gecachten Systemstatus abrufen
- bestehende Snapshot-/Issue-Engine wiederverwenden

---

# Teil D – Return-to-Dashboard

## Ziel

Beispiele:

```text
/
↓
/system/errors
↓
Zurück
↓
/
```

und:

```text
/d/kitchen
↓
/system/errors
↓
Zurück
↓
/d/kitchen
```

sowie:

```text
/d/kitchen
↓
/system/summary
↓
Zurück
↓
/d/kitchen
```

---

# Return Target

Beim Öffnen von Summary/Errors aktuellen internen Dashboard-Pfad merken.

Bevorzugt:

```text
expliziter interner Return Target
+
History Fallback
```

Nicht nur `document.referrer`.

Nicht nur `history.back()`.

---

# Erlaubte Ziele

Nur interne Dashboard-Routen.

Beispielsweise:

```text
/
/d/<valid-dashboard-id>
```

---

# Open Redirect Schutz

Nicht akzeptieren:

```text
https://external.example
//external.example
javascript:...
data:...
beliebige unbekannte Pfade
```

Falls `returnTo` als Query Parameter verwendet wird, strikt validieren.

---

# Direkter System-Dashboard-Aufruf

Wenn kein gültiger Return Target existiert:

```text
Zurück
→ /
```

oder:

```text
Zum Dashboard
→ /
```

---

# Reload

Codex soll prüfen, ob der Return Target einen Reload auf `/system/errors` oder `/system/summary` überlebt.

Bevorzugt ja, sofern sicher über bestehende Session-/Legacy-Storage-Strategie möglich.

---

# Teil E – Back Button

Summary:

```text
[ ← Zurück ]  SUMMARY · 29 aktive Zustände
```

Errors:

```text
[ ← Zurück ]  ERRORS · 12 Probleme
```

Back-Priorität:

1. gültiger gespeicherter Return Target
2. sicherer interner History-Fallback
3. `/`

---

# Teil F – Summary Workflow

Summary beantwortet:

```text
Was ist gerade aktiv?
```

Nicht:

```text
Ist etwas kaputt?
```

Darum:

```text
Summary Button immer sichtbar
```

Kein pulsierender Summary-Indikator.

Kein Pflicht-Count im normalen Dashboard-Header.

Bevorzugt:

```text
[ Summary ]
```

statt:

```text
[ Summary 29 ]
```

um den Header ruhig zu halten.

---

# Teil G – Header Integration

## Healthy

```text
Wohnzimmer                       [ Summary ]
```

## Warning

```text
Wohnzimmer                       [ Summary ]  ●
```

## Critical

```text
Wohnzimmer                       [ Summary ]  ●
```

mit optional langsamem Pulsieren.

---

# Gemeinsame Header-Komponente

Default und Custom Dashboards sollen dieselbe globale System-Navigation verwenden.

Keine duplizierte Implementierung pro Dashboard.

---

# Footer Fallback

Nur wenn ein bestimmtes Legacy-Header-Layout objektiv keinen Platz bietet, darf ein Footer-Fallback verwendet werden.

Nicht Header und Footer gleichzeitig.

---

# Teil H – Theme / Accessibility

- Light/Dark Theme unterstützen
- Indicator auch ohne reine Farbcodierung verständlich
- sichtbare Focus States
- echte Buttons/Links
- `aria-label`
- Touch Target ca. 44×44 px

---

# Teil I – Tests Health Indicator

1. healthy -> kein Indicator
2. info only -> kein Alarmindikator
3. warning -> sichtbar
4. error -> sichtbar
5. critical -> sichtbar
6. highestSeverity korrekt
7. warning Darstellung
8. error Darstellung
9. critical Darstellung
10. Pulsieren ohne Layout Shift
11. stale healthy -> stale Indicator
12. stale critical -> Problem bleibt sichtbar
13. no initial status -> unknown Indicator

---

# Tests Navigation

14. Default -> Summary
15. Default -> Errors
16. Custom -> Summary
17. Custom -> Errors
18. Summary Back -> Default
19. Errors Back -> Default
20. Summary Back -> Custom
21. Errors Back -> Custom
22. Reload Summary -> Return Target, sofern vorgesehen
23. Reload Errors -> Return Target, sofern vorgesehen
24. Direct Summary -> `/`
25. Direct Errors -> `/`

---

# Tests Return Security

26. externe URL abgelehnt
27. protocol-relative URL abgelehnt
28. javascript URL abgelehnt
29. data URL abgelehnt
30. ungültige Dashboard ID fällt sicher zurück
31. `/` erlaubt
32. gültige `/d/...` Route erlaubt
33. kein Open Redirect

---

# Tests Refresh

34. Status Endpoint klein
35. keine vollständige Error-Liste für Indicator
36. keine vollständige Summary-Liste für Navigation
37. bestehender Cache wiederverwendet
38. keine unnötige zusätzliche HA-Abfrage
39. Problem verschwindet -> Indicator verschwindet
40. Warning -> Critical aktualisiert ohne Reload

---

# Legacy Tests

41. ES5 Syntax
42. Legacy.http/XMLHttpRequest
43. kein fetch
44. kein Promise
45. iOS-9-kompatible Events
46. kein CSS Grid
47. kein Flexbox gap
48. Touch Targets ausreichend

---

# Regression Sprint 21.1–21.4

49. Error Device Groups
50. Error Severity Filter
51. Error Status Filter
52. Critical Device Modes
53. HA Label Mode
54. Device-Class Mode
55. 1/2/3 Columns
56. Summary Filters
57. Entity Rule Manager
58. Header Count Simplification
59. stale/offline Semantik

---

# Regression normale Dashboards

60. Default Dashboard
61. Custom Dashboards
62. Grid
63. Focus
64. Light Controls
65. Climate Controls
66. Theme Persistenz
67. Sprint 17.7 Control Alignment

---

# Security Regression

68. HA-Token Backend-only
69. keine neue Write API
70. keine generische HA Service API
71. keine generische HA WS API
72. Return Target nur intern
73. Navigation erzeugt keine Schreibrechte

---

# Performance

Test mindestens:

```text
1000+ Entity State Snapshot
200 aktive Error Issues
200 Summary Items
```

Prüfen:

- Status Endpoint klein
- Indicator Update schnell
- keine zusätzliche große Pipeline
- Header nicht komplett pro Poll neu rendern
- keine Memory Leaks bei langem Wall-Display-Betrieb

---

# Manuelle Abnahme

## iPad mini / iOS 9

Healthy:

```text
Summary sichtbar
kein Error Indicator
```

Warning:

```text
Warning Indicator sichtbar
Tap -> Errors
Back -> ursprüngliches Dashboard
```

Critical:

```text
Critical Indicator sichtbar
Tap funktioniert
```

Stale:

```text
kein falsches healthy
```

## Custom Dashboard

```text
/d/kitchen -> Summary -> Back -> /d/kitchen
/d/kitchen -> Errors -> Back -> /d/kitchen
```

## iPad Air 2 / iPadOS 15.8.5

Portrait und Landscape prüfen.

## macOS Safari

Desktop darf nicht regressieren.

---

# Screenshot-Pflege

Wenn Sprint D1 vorhanden:

```text
docs/screenshots/dashboards/main-light.png
docs/screenshots/dashboards/main-dark.png
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

- Summary Navigation
- Health Indicator
- Severity-Verhalten
- info-only erzeugt keinen Alarmindikator
- stale/unknown Verhalten
- Return-to-Dashboard
- Default und Custom Dashboards

README-Sprachen synchron halten.

---

# Nicht-Ziele

Nicht Bestandteil:

- neue Error Detection Rules
- neue Summary Activity Rules
- neue Write-Aktionen
- neue HA Labels
- konfigurierbare Indicator Position
- komplexes System-Menü
- Browser Push Notifications
- Audio Alarm
- Automation Impact
- Home Assistant App
- HACS

---

# Definition of Done

Sprint 21.5 ist abgeschlossen, wenn:

- Summary von jedem normalen Dashboard erreichbar ist
- Errors von jedem normalen Dashboard erreichbar ist
- Summary Button immer verfügbar ist
- Error Indicator nur bei warning/error/critical sichtbar ist
- info-only keinen Alarmindikator erzeugt
- höchste Severity Indicator bestimmt
- Critical optional dezent pulsiert
- stale/unknown nicht wie healthy aussieht
- Tap auf Indicator Errors öffnet
- ursprünglicher Dashboard-Pfad sicher gespeichert wird
- Summary Back korrekt zurückführt
- Errors Back korrekt zurückführt
- direkter System-URL-Aufruf sicher auf Default zurückfällt
- kein Open Redirect möglich ist
- keine vollständige Error-/Summary-Abfrage nur für Navigation entsteht
- bestehender kleiner Status-Endpoint wiederverwendet wird
- Default Dashboard funktioniert
- Custom Dashboards funktionieren
- iOS-9-/ES5-Kompatibilität erhalten bleibt
- Sprint-21.1–21.4-Funktionen erhalten bleiben
- keine Security Boundary verändert wurde
- alle Tests grün sind
- Screenshots geprüft/aktualisiert wurden
- docs/PROJECT_STATUS.md aktualisiert wurde

---

# Erwartetes Codex-Ergebnis

Codex berichtet:

1. Startcommit
2. tatsächlicher Repo-Stand
3. geänderte Dateien
4. gemeinsame Header-Navigation
5. Summary Button
6. Health Indicator
7. Severity-Darstellung
8. stale/unknown Darstellung
9. verwendeter Status Endpoint
10. Refresh-/Cache-Verhalten
11. Return-Target-Architektur
12. Open-Redirect-Schutz
13. Default Dashboard Ergebnis
14. Custom Dashboard Ergebnis
15. Summary Back Navigation
16. Error Back Navigation
17. iPad mini Ergebnis
18. iPad Air 2 Ergebnis
19. macOS Safari Ergebnis
20. Tests/Performance
21. Sprint-21.1–21.4 Regression
22. Sprint-17.7 Regression
23. Security Regression
24. Screenshot Review
25. verbleibende Einschränkungen
26. Voraussetzungen für Sprint 22
27. Commit-Vorschlag
28. Deploymentbefehle

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
- docs/sprints/SPRINT-21.5.md
- docs/sprints/SPRINT-17.7.md
- docs/sprints/SPRINT-D1.md if present

Inspect the actual repository state first.

Implement Sprint 21.5 exactly as specified in
docs/sprints/SPRINT-21.5.md.

Every default/custom dashboard must provide:
1. an always-available neutral Summary navigation control,
2. a conditional global Error/Health indicator.

The Health indicator:
- hidden only when health is fresh and there are no warning/error/critical issues,
- info-only must not show the alarm indicator,
- warning/error/critical must show an indicator,
- critical may pulse slowly if reliable on legacy Safari,
- stale/unknown health must never look like healthy/no-problem state.

Use the existing small System Dashboard status data.
Do not fetch the complete Error or Summary payload just for the header.
Do not create a second full polling pipeline.

When opening Summary or Errors, preserve the exact internal dashboard route as
a validated return target.

Examples:
/ -> /system/errors -> back -> /
/d/kitchen -> /system/errors -> back -> /d/kitchen
/d/kitchen -> /system/summary -> back -> /d/kitchen

Do not rely only on document.referrer or history.back().

Prevent open redirects.
Only valid internal dashboard targets may be used.

If a System Dashboard is opened directly and no valid return target exists,
fall back safely to `/`.

Use shared dashboard-header/navigation code where practical.

Keep touch targets about 44x44 px.

Preserve Sprint 21.1 Device Groups, Sprint 21.2 columns, Sprint 21.3
Severity/State filters and critical-device modes, Sprint 21.4 Entity Rule
Manager/header cleanup, Sprint 17.7 control alignment, and all Home Assistant
security boundaries.

Do not add any new HA write APIs, service calls or browser-side HA WebSocket
access.

Keep Safari iOS 9 / ES5 compatibility.

Run complete regression tests and manually verify on:
- iPad mini / iOS 9 Safari
- iPad Air 2 / iPadOS 15.8.5 Safari
- macOS Safari

Test healthy, warning, error, critical, info-only, stale, unknown/no initial
health, default/custom dashboards, Summary return, Error return, portrait and
landscape.

If Sprint D1 exists, review/update real screenshots.

Update README.de.md and README.en.md semantically in sync.
Update docs/PROJECT_STATUS.md.

Do not commit or push unless explicitly instructed.
```
