# Sprint 17.4 – Focus Overlay Layout Stabilization

## Status
Planned

## Ziel

Sprint 17.4 behebt die Regression im Focus Overlay / Focus Mode aus Sprint 17.3.

Aktuelles Problem:
- Overlay öffnet korrekt
- Inhalte sind teilweise falsch angeordnet
- einzelne Widgettypen benötigen unnötiges Scrollen
- Controls können zu weit nach unten rutschen
- Viewport wird nicht robust genug genutzt

Verbindlicher Grundsatz:

> Kerninformationen und erlaubte Controls müssen im Focus Mode priorisiert und ohne unnötiges Scrollen erreichbar sein.

---

# Sicherheits- und Legacy-Grundsätze

Unverändert:
- HA-Token nur im Backend
- keine direkte Browser-Verbindung zu Home Assistant
- keine generische HA-Service-API
- keine neuen Schreibendpunkte
- Light-/Climate-Allowlists unverändert
- Focus erzeugt keine Schreibrechte
- unavailable/stale darf keine unsicheren aktiven Controls erhalten
- iOS 9.3.5 / Safari iOS 9 / ES5 kompatibel
- kein CSS Grid
- kein ResizeObserver
- keine Container Queries
- kein fetch / Promise / async-await / moderne JS-Syntax

---

# Informationshierarchie

## Priorität 1
Identity / Titel / Raum

## Priorität 2
Primärer Wert oder Zustand

## Priorität 3
Interaktive Controls

## Priorität 4
Sekundäre Zustandsinformation

## Priorität 5
Technische Details

Technische Details dürfen niemals Controls aus dem sichtbaren Bereich verdrängen.

---

# Viewport-basierte Focus-Geometrie

Focus Card muss sich am real sichtbaren Viewport orientieren.

Bevorzugt:

```text
maxWidth  = viewportWidth  - outerMargins
maxHeight = viewportHeight - outerMargins
```

Nicht ausschließlich auf `100vh` verlassen, da Safari iOS 9 bei Browserleisten problematisch sein kann.

Beispiel ES5-kompatibel:

```javascript
function getFocusViewportMetrics() {
    var width = window.innerWidth || document.documentElement.clientWidth;
    var height = window.innerHeight || document.documentElement.clientHeight;

    return {
        width: width,
        height: height
    };
}
```

Bestehende Legacy-Helfer bevorzugen, falls vorhanden.

---

# Focus-Struktur

Bevorzugt logisch trennen:

```text
focus-card
  focus-header
  focus-primary
  focus-controls
  focus-secondary
  focus-details
```

Header und Controls sollen möglichst nicht Teil eines großen gemeinsamen Scrollcontainers sein.

---

# Scroll-Policy

Scrollen ist nur akzeptabel, wenn der Inhalt nach sinnvoller Verdichtung tatsächlich höher als der verfügbare Viewport ist.

Nicht akzeptabel:
- Scrollen wegen zu großer Margins/Paddings
- Scrollen wegen falscher min-height
- Scrollen wegen dekorativ zu großer Icons
- technische Details vor Controls
- gesamte Focus Card scrollbar, obwohl nur Zusatzdetails zu lang sind

Bevorzugt:

```text
Header
Primary Content
Controls
----------------
sekundärer / technischer Detailbereich
(optional scrollbar)
```

---

# Hintergrund-Scroll

Beim Focus Mode:
- Hintergrund darf nicht unkontrolliert mitscrollen
- Dashboardposition soll nach Close möglichst erhalten bleiben
- kein Sprung an Seitenanfang
- Grid-Geometrie bleibt unverändert

---

# Sensor Focus

Ohne unnötiges Scrollen sichtbar:

```text
Identity
Icon
Value
Unit
```

Beispiel:

```text
┌───────────────────────┐
│ Badezimmer         ✕  │
│         🌡            │
│       21,8 °C         │
│ Temperatur            │
└───────────────────────┘
```

Technische Details darunter oder optional einklappbar.

---

# Binary Focus

Ohne unnötiges Scrollen sichtbar:

```text
Identity
State
Icon
```

Beispiel:

```text
┌───────────────────────┐
│ Fenster Küche      ✕  │
│         🪟            │
│        OFFEN          │
│ seit 12 Min.          │
└───────────────────────┘
```

---

# Light Focus

Ohne unnötiges Scrollen sichtbar:

```text
Identity
State
Power Control
```

Beispiel:

```text
┌───────────────────────┐
│ Esszimmer          ✕  │
│         💡            │
│         AN            │
│       [ ⏻ AUS ]       │
└───────────────────────┘
```

Power-Control bleibt ca. 44×44 px oder größer.

---

# Climate Focus

Besonders kritisch.

Ohne unnötiges Scrollen sichtbar:

```text
Identity
Current temperature
Target temperature
Minus
Plus
Power, wenn erlaubt
```

Beispiel Portrait:

```text
┌─────────────────────────────┐
│ Esszimmer                ✕  │
│           21,8 °C           │
│            aktuell          │
│          Soll 22,5 °C       │
│       [ − ]     [ + ]       │
│         [ ⏻ AUS ]           │
│ Heizt aktuell               │
└─────────────────────────────┘
```

Beispiel Landscape:

```text
┌────────────────────────────────────┐
│ Esszimmer                       ✕  │
│ Ist 21,8°     Soll 22,5°           │
│ [ − ] [ + ]      [ ⏻ AUS ]         │
│ Heizt aktuell                      │
└────────────────────────────────────┘
```

Landscape darf die Breite bewusst stärker nutzen.

---

# Controls

Für Climate:
- Minus sichtbar
- Plus sichtbar
- Power sichtbar, wenn Capability erlaubt
- Controls nicht unter technische Details verschieben
- Controls nicht abschneiden
- Controls nicht außerhalb Viewport rendern

Für Light:
- Power ohne unnötiges Scrollen erreichbar

---

# Details-Bereich

Optional empfohlen:

```text
Details anzeigen
```

Darin können stehen:

```text
Entity ID
Domain
Device Class
Integration
```

Für iOS 9 lieber ES5 Show/Hide statt zwingend `<details>`.

Default bevorzugt geschlossen.

---

# Spacing und Typografie

Focus Mode erhält eigene kompakte Spacing-Regeln.

Vermeiden:
- große Expanded-Card-Paddings ungeprüft wiederverwenden
- feste hohe min-height pro Abschnitt
- übergroße dekorative Icons

Werte klar lesbar, aber nicht überdimensioniert.
Identity deutlich, aber kompakt.
Sekundärinfos kleiner.
Technische Details klein/optional.

---

# Orientation Change

Wenn Focus offen ist und das iPad gedreht wird:
- Viewport neu messen
- Layout neu berechnen
- Focus nach Möglichkeit offen lassen
- keine doppelte Overlay-Struktur
- keine abgeschnittenen Controls

---

# State Refresh

Während Focus offen ist:
- Content aktualisieren
- Focus bleibt offen
- Busy-/Disabled-Zustände bleiben korrekt
- Layout nicht bei jedem Poll komplett neu initialisieren

Wenn Entity unavailable wird:
- Controls deaktivieren
- Status aktualisieren
- keine JS-Exception

---

# Theme

Bestehende Light-/Dark-Persistenz weiterverwenden.
Keine neue Theme-Logik.

---

# System-Dashboard-Abgrenzung

Sprint 17.4 verändert nicht die Business-Logik von:

```text
/system/summary
/system/errors
```

Nur gemeinsame CSS-Regressionsfixes, falls notwendig.

---

# Admin Preview

Wenn Sprint 17.3 bereits eine Focus-Preview im Admin besitzt:
- neues Focus-Layout dort nachziehen
- Preview bleibt read-only

Falls nicht vorhanden:
- keine neue Focus-Preview als Pflicht

---

# Root-Cause-Pflicht

Codex soll zuerst die tatsächliche Ursache identifizieren und im Abschlussbericht dokumentieren.

Beispiele:
- Expanded-Card `min-height` im Focus wiederverwendet
- Controls im falschen Scrollcontainer
- statische Viewport-Höhe
- zu große Margins/Paddings
- absolute Positionierung kollidiert mit Content
- Flex-Wrapping fehlerhaft

Nicht nur Symptome kaschieren.

---

# Tests

## Grundlayout
1. Sensor Focus öffnet
2. Binary Focus öffnet
3. Light Focus öffnet
4. Climate Focus öffnet
5. Close Button sichtbar
6. nur eine Focus Card
7. Grid unverändert
8. Focus überschreitet Viewport nicht
9. keine horizontale Scrollbar

## Scroll Policy
10. Sensor benötigt keinen Scroll
11. Binary benötigt keinen Scroll
12. Light Power ohne Scroll erreichbar
13. Climate Minus ohne Scroll erreichbar
14. Climate Plus ohne Scroll erreichbar
15. Climate Power ohne Scroll erreichbar
16. technische Details verdrängen Controls nicht
17. echte Überhöhe darf kontrolliert scrollen
18. sekundärer Detailbereich darf scrollen

## Portrait / Landscape
19. Sensor Portrait
20. Sensor Landscape
21. Binary Portrait
22. Binary Landscape
23. Light Portrait
24. Light Landscape
25. Climate Portrait
26. Climate Landscape
27. Rotation bei offenem Focus
28. keine abgeschnittenen Controls nach Rotation

## Controls / State
29. Light Power funktioniert
30. Climate Minus funktioniert
31. Climate Plus funktioniert
32. Climate Power funktioniert
33. Control-Tap öffnet Focus nicht erneut
34. Busy State sichtbar
35. unavailable deaktiviert Controls
36. State Refresh aktualisiert offenen Focus

## Scrollposition
37. Öffnen verändert Dashboardposition nicht unerwartet
38. Schließen springt nicht zum Seitenanfang
39. Overlay-Hintergrund scrollt nicht unkontrolliert

## Theme / Regression
40. Focus Light Theme
41. Focus Dark Theme
42. Theme-Persistenz unverändert
43. Admin Live Preview funktioniert
44. Unified Light Control funktioniert
45. Climate Power API unverändert
46. Compact Identity unverändert
47. proportionale Grid-Geometrie unverändert
48. `/system/summary` funktioniert
49. `/system/errors` funktioniert
50. Summary/Error Business Logic unverändert
51. HA-Token Backend-only
52. Write-Allowlists unverändert
53. keine neue Write-API

---

# Manuelle iPad-Abnahme

Auf iPad mini / iOS 9 zwingend prüfen:

## Portrait
- Sensor Focus
- Binary Focus
- Light Focus
- Climate Focus
- Close
- Tap outside
- Light Power
- Climate +/-
- Climate Power
- Dark Mode
- Light Mode

## Landscape
Dieselben Fälle.

Kritisch:

```text
Climate:
Identity + Ist + Soll + Minus + Plus + Power
```

müssen ohne unnötiges Scrollen erreichbar sein.

```text
Light:
Identity + State + Power
```

müssen ohne unnötiges Scrollen erreichbar sein.

---

# Performance

Focus Layout nur neu berechnen bei:
- Focus öffnen
- Orientation Change
- relevantem Viewport Resize
- echter Contentänderung, falls nötig

Nicht bei jedem Poll komplett neu vermessen.

---

# Voraussichtlich betroffene Dateien

Codex muss den tatsächlichen Stand prüfen.

Voraussichtlich:

```text
src/public/css/style.css
src/public/js/focus/
src/public/js/core/widget.js
src/public/js/core/dashboard.js
src/public/js/widgets/sensor.js
src/public/js/widgets/binary.js
src/public/js/widgets/light.js
src/public/js/widgets/climate.js
test/
README.de.md
README.en.md
docs/PROJECT_STATUS.md
docs/SPRINT_ROADMAP.md
```

---

# Screenshot-Pflege

Wenn Sprint D1 vorhanden:

```text
docs/screenshots/dashboards/focus-card.png
```

prüfen und bei sichtbarer Änderung neu aufnehmen.

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

---

# Nicht-Ziele

Nicht Bestandteil von Sprint 17.4:
- neue Widgettypen
- neue Write-Aktionen
- neue Summary-Regeln
- neue Error-Regeln
- Registry Enrichment
- Repairs
- Matter
- Automation Impact
- Home Assistant App
- HACS
- komplette Dashboard-Neugestaltung

---

# Definition of Done

Sprint 17.4 ist abgeschlossen, wenn:
- Focus Overlay korrekt öffnet
- Sensor/Binary/Light/Climate sauber strukturiert sind
- Kerninformationen priorisiert sind
- Controls vor technischen Details stehen
- unnötiges Scrollen beseitigt ist
- Light Power ohne unnötiges Scrollen erreichbar ist
- Climate +/- und Power ohne unnötiges Scrollen erreichbar sind
- Focus Card Viewport nicht überschreitet
- Portrait und Landscape funktionieren
- Rotation bei offenem Focus funktioniert
- Hintergrund nicht unkontrolliert mitscrollt
- Close Button immer erreichbar ist
- Theme funktioniert
- Summary/Error unverändert funktionieren
- keine Security Boundary verändert wurde
- iOS-9-/ES5-Kompatibilität erhalten bleibt
- alle Tests grün sind
- Root Cause dokumentiert wurde
- Screenshot-Review erfolgt ist
- `docs/PROJECT_STATUS.md` aktualisiert wurde

---

# Erwartetes Codex-Ergebnis

Codex berichtet:
1. Startcommit
2. tatsächlicher Repo-Stand
3. Root Cause
4. geänderte Dateien
5. neue Focus-Struktur
6. Viewport-Berechnung
7. Scroll-Policy
8. Sensor-Layout
9. Binary-Layout
10. Light-Layout
11. Climate-Layout
12. Portrait-/Landscape-Verhalten
13. Rotation-Verhalten
14. Body-/Overlay-Scroll-Verhalten
15. Testanzahl und Ergebnis
16. iPad-Abnahme
17. Theme-Regression
18. Summary-Regression
19. Error-Regression
20. Security-Regression
21. Screenshot-Review
22. verbleibende Einschränkungen
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
- docs/sprints/SPRINT-17.2.md
- docs/sprints/SPRINT-17.3.md
- docs/sprints/SPRINT-17.4.md
- docs/sprints/SPRINT-19.md
- docs/sprints/SPRINT-20.md
- docs/sprints/SPRINT-D1.md if present

Inspect the actual repository state first.

Implement Sprint 17.4 exactly as specified in
docs/sprints/SPRINT-17.4.md.

This is a focused regression fix for the Focus Overlay / Focus Card layout.

The popup still opens, but content arrangement is no longer reliable and some
widget types require unnecessary scrolling.

First identify and report the actual root cause.

Then fix the Focus layout so that core information and controls are prioritized.

Sensor must keep visible:
- identity
- value
- unit

Binary:
- identity
- state

Light:
- identity
- state
- power control

Climate:
- identity
- current temperature
- target temperature
- minus
- plus
- power control when authorized

These core elements must remain visible without unnecessary scrolling whenever
they can reasonably fit into the iPad mini viewport.

Do not put technical details above controls.

Use viewport-aware sizing rather than fixed heights or relying only on 100vh.

Account for Safari on iOS 9 viewport behavior.

Prefer:
- visible header
- visible primary content
- visible controls
- only secondary/details content scrollable when necessary

Do not resize or reflow the underlying dashboard grid.

Do not allow the overlay background to scroll uncontrollably.

Preserve dashboard scroll position on open/close where robustly possible.

Support portrait and landscape, including rotation while Focus is open.

Preserve all existing Home Assistant security boundaries.

Do not add any new write endpoints or capabilities.

Preserve:
- Light control security
- Climate temperature control
- Climate power control
- theme persistence
- compact-card identity
- proportional grid geometry
- Summary Dashboard behavior
- Error Dashboard behavior

Keep the wall display compatible with Safari on iOS 9 and ECMAScript 5.

Run the complete test suite and required syntax checks.

Manually verify Sensor, Binary, Light and Climate Focus Cards on the iPad mini
in portrait and landscape.

For Climate verify that current temperature, target temperature, minus, plus
and power are reachable without unnecessary scrolling.

For Light verify that power is reachable without unnecessary scrolling.

If Sprint D1 exists, review and update the Focus Card screenshot using a real
application/demo screenshot only.

Update README.de.md and README.en.md semantically in sync if needed.

Update docs/PROJECT_STATUS.md.

At the end report:
- root cause
- changed files
- viewport calculation
- scroll policy
- widget-specific layouts
- portrait/landscape behavior
- test results
- iPad verification
- Summary/Error regression
- security regression
- screenshot review
- remaining limitations

Do not commit or push unless explicitly instructed.
```
