# Sprint 17.5 – Native Focus Renderer & Mobile Safari Stabilization

## Status

Planned

## Einordnung

Sprint 17.5 behebt die verbleibende Focus-Mode-Regression, die nach Sprint 17.4 weiterhin auf iPad-Safari auftritt.

Beobachtetes Verhalten:

```text
macOS Safari:
Focus Overlay sieht korrekt aus.

iPad Air 2 / iPadOS 15.8.5:
Overlay öffnet,
Focus Card im Overlay ist jedoch zu klein,
Inhalte sind gestaucht,
Controls teilweise nicht sinnvoll bedienbar.
```

Das spricht dafür, dass die Focus Card weiterhin zu stark an die normale
Grid-Card-Architektur gekoppelt ist.

Sprint 17.5 ist daher ausdrücklich **kein weiterer CSS-Patch-Sprint**.

Der Focus Mode wird architektonisch vom Grid-Card-Renderer getrennt.

---

# Kernentscheidung

Verbindlich:

> Focus is not another card size.  
> Focus is a separate interaction view.

Eine Focus Card darf nicht einfach eine:

```text
compact
normal
expanded
```

Grid-Card sein, die im Overlay größer dargestellt wird.

---

# Zielarchitektur

## Bisher unerwünscht

```text
Grid Card
  ↓
clone / reuse
  ↓
Focus Overlay
```

Dadurch können Grid-spezifische:

```text
w
h
presentation classes
inline width
inline height
min-height
flex rules
media queries
```

weiterwirken.

## Neu

```text
Widget definition
+ current entity state
+ capabilities
      ↓
Focus View Model
      ↓
Dedicated Focus Renderer
      ↓
Focus Overlay
```

---

# Separate Renderer

Bevorzugte Architektur:

```text
renderGridWidget(...)
renderFocusWidget(...)
```

Focus-spezifisch mindestens:

```text
renderSensorFocus(...)
renderBinaryFocus(...)
renderLightFocus(...)
renderClimateFocus(...)
```

Die konkrete Dateistruktur darf an den tatsächlichen Code angepasst werden.

---

# Keine Grid-Geometrie im Focus

Focus Renderer darf keine persistente Dashboard-Geometrie als Layoutgrundlage verwenden.

Nicht übernehmen:

```text
x
y
w
h
gridRow
gridColumn
card-presentation-compact
card-presentation-normal
card-presentation-expanded
```

sofern diese Klassen/Attribute Grid-spezifische Größenregeln enthalten.

---

# Keine Grid Inline Styles übernehmen

Beim Öffnen des Focus Mode dürfen nicht von der Ursprungscard übernommen werden:

```text
style.width
style.height
style.left
style.top
style.transform
grid-derived min-height
grid-derived max-height
```

Focus erhält seine eigenen Maße.

---

# Focus View Model

Bevorzugt eine kleine reine Datenstruktur erzeugen.

Konzeptuell:

```javascript
{
    widgetId: "...",
    type: "climate",
    identity: "Esszimmer",
    icon: "...",
    state: "...",
    value: "...",
    currentTemperature: 21.8,
    targetTemperature: 22.5,
    canPowerOn: true,
    canPowerOff: true,
    canIncrease: true,
    canDecrease: true,
    unavailable: false,
    stale: false
}
```

Der Focus Renderer arbeitet auf diesem View Model.

Er soll nicht direkt den DOM der Grid Card klonen.

---

# Verbindliches DOM-Prinzip

Nicht:

```javascript
var clone = card.cloneNode(true);
```

als zentrale Focus-Implementierung.

Wenn aktuell geklont wird, soll dies ersetzt werden.

Focus DOM wird neu erzeugt.

---

# Focus CSS Namespace

Focus benötigt eigene Klassen.

Bevorzugt:

```text
focus-overlay
focus-panel
focus-widget
focus-widget-sensor
focus-widget-binary
focus-widget-light
focus-widget-climate

focus-header
focus-identity
focus-primary
focus-controls
focus-secondary
focus-details
```

Grid-spezifische Layoutklassen sollen nicht auf Focus-Elementen landen.

---

# Mobile-Safari-Stabilisierung

Sprint 17.5 muss explizit Mobile Safari behandeln.

Testplattformen:

```text
macOS Safari
iPadOS Safari
iOS 9 Safari / Legacy Zielplattform
```

Desktop Safari allein reicht nicht als Abnahme.

---

# iPad Air 2 Referenz

Bekannter reproduzierbarer Fehler:

```text
iPad Air 2
iPadOS 15.8.5
Safari
```

Dieses Gerät/Verhalten soll als Referenzfall in der manuellen Abnahme dokumentiert werden.

---

# Viewport-Messung

Focus-Geometrie soll auf tatsächlichen sichtbaren Viewportmaßen basieren.

Bevorzugt:

```javascript
function getViewportSize() {
    var doc = document.documentElement;

    return {
        width: window.innerWidth || (doc && doc.clientWidth) || 0,
        height: window.innerHeight || (doc && doc.clientHeight) || 0
    };
}
```

Bestehende kompatible Helper bevorzugen.

---

# Focus Panel Größe

Beispielhafte Regel:

```text
focusWidth =
  min(
      viewportWidth - horizontalMargins,
      configuredMaxWidth
  )

focusHeight =
  min(
      contentRequiredHeight,
      viewportHeight - verticalMargins
  )
```

Keine Grid-Breite verwenden.

---

# Mindestbreite / Mindesthöhe

Focus soll niemals auf mobile Safari durch Flexbox oder geerbte Styles auf winzige Dimensionen schrumpfen.

Prüfen und bei Bedarf explizit setzen:

```text
min-width
min-height
flex-shrink
box-sizing
```

---

# flex-shrink Audit

Besonders prüfen:

```text
focus-panel
focus-widget
focus-controls
dashboard-control
```

Interaktive Controls dürfen nicht ungewollt schrumpfen.

Bevorzugt für Control-Zeilen:

```css
flex-shrink: 0;
```

sofern dies zur realen Struktur passt.

---

# box-sizing

Focus-Komponenten sollen konsistente Box-Berechnung verwenden.

Bevorzugt:

```css
box-sizing: border-box;
```

für Focus Panel und wichtige Unterelemente.

---

# Keine transform-basierte Focus-Skalierung

Verbindlich nicht verwenden:

```css
transform: scale(...)
zoom: ...
```

um Focus größer zu machen.

Das Problem soll durch echte Layoutmaße gelöst werden.

---

# Media Query Audit

Codex soll sämtliche relevanten Media Queries prüfen.

Insbesondere:

```text
max-width
orientation
tablet/mobile
compact-card
legacy
```

Es muss geklärt werden, welche Regeln auf iPadOS greifen und Focus unbeabsichtigt verkleinern.

---

# CSS Specificity Audit

Prüfen, ob Grid-Regeln Focus überschreiben.

Beispiele:

```text
.card.compact ...
.dashboard-card ...
.widget-card ...
@media (...) .card ...
```

Focus muss durch eigenen Namespace geschützt sein.

---

# Focus Layout – Sensor

Eigenständiger Focus Renderer.

Beispiel:

```text
┌───────────────────────────┐
│ Badezimmer             ✕  │
│                           │
│            🌡             │
│          21,8 °C          │
│                           │
│ Temperatur                │
└───────────────────────────┘
```

Verbindlich:

- Identity
- Value
- Unit
- ausreichende Größe
- keine Grid-Presentation-Klasse

---

# Focus Layout – Binary

```text
┌───────────────────────────┐
│ Fenster Küche          ✕  │
│                           │
│            🪟             │
│           OFFEN           │
│                           │
│ seit 12 Min.              │
└───────────────────────────┘
```

Verbindlich:

- Identity
- State
- sinnvolle Icon-Größe
- keine Grid-Geometrie

---

# Focus Layout – Light

```text
┌───────────────────────────┐
│ Esszimmer              ✕  │
│                           │
│            💡             │
│            AN             │
│                           │
│         [ ⏻ AUS ]         │
└───────────────────────────┘
```

Power Control:

```text
min-width: sinnvoll
min-height: ca. 44–56 px
flex-shrink: 0
```

nicht gestaucht.

---

# Focus Layout – Climate

Portrait:

```text
┌──────────────────────────────┐
│ Esszimmer                 ✕  │
│                              │
│           21,8 °C            │
│            aktuell           │
│                              │
│          Soll 22,5 °C        │
│                              │
│      [  −  ]   [  +  ]       │
│                              │
│        [ ⏻ AUS ]             │
│                              │
│ Heizt aktuell                │
└──────────────────────────────┘
```

Landscape:

```text
┌────────────────────────────────────────────┐
│ Esszimmer                               ✕  │
│                                            │
│ Ist 21,8 °C         Soll 22,5 °C           │
│                                            │
│ [  −  ] [  +  ]          [ ⏻ AUS ]         │
│                                            │
│ Heizt aktuell                              │
└────────────────────────────────────────────┘
```

---

# Climate Controls Mindestgrößen

Mindestens:

```text
Minus: 44×44 px
Plus:  44×44 px
Power: 44 px Höhe
```

Im Focus Mode dürfen Controls bewusst größer sein.

Bevorzugter Bereich:

```text
48–56 px
```

wenn der Viewport dies erlaubt.

---

# Keine Compact-Vererbung

Harte Regel:

Wenn Focus DOM aktuell Klassen wie:

```text
card-presentation-compact
card-size-compact
widget-compact
```

erhält und diese die Focus-Dimensionen beeinflussen, müssen diese entfernt werden.

Focus kann eigene Varianten haben:

```text
focus-layout-portrait
focus-layout-landscape
focus-state-unavailable
focus-state-stale
```

---

# Focus Trigger

Tap auf nicht-interaktive Grid-Fläche bleibt.

Direkte Controls:

```text
Power
Minus
Plus
```

dürfen weiterhin nicht zusätzlich Focus öffnen.

---

# Focus State Binding

Focus soll aktuelle Entity-Daten nutzen.

Bei State Refresh:

- View Model aktualisieren
- Focus DOM gezielt aktualisieren
- keine neue Grid-Geometrie übernehmen
- Focus bleibt offen

---

# unavailable / stale

Bei unavailable:

- Focus bleibt korrekt groß
- Status sichtbar
- Controls disabled
- keine Write-Aktion

Bei stale:

- bestehende Sicherheitslogik erhalten
- Focus darf nicht in Compact zurückfallen

---

# Body / Overlay

Focus Overlay:

```text
position: fixed
top: 0
right: 0
bottom: 0
left: 0
```

oder kompatible äquivalente Lösung.

Panel wird innerhalb des Overlays zentriert oder passend positioniert.

---

# Mobile Safari Flexbox

Da Safari/iPad Flexbox-Eigenheiten zeigen kann, muss Codex prüfen:

- `flex: 1`
- `flex-basis`
- `flex-shrink`
- `min-height: 0`
- `min-width: 0`
- nested flex containers

Keine Desktop-only Annahmen.

---

# Scroll-Policy

Sprint 17.4 Scroll-Regeln bleiben bestehen.

Kernbereich:

```text
header
primary
controls
```

nicht unnötig scrollbar.

Nur:

```text
secondary/details
```

bei tatsächlichem Platzmangel.

---

# Native Focus Renderer – Dateien

Bevorzugte Struktur, falls passend:

```text
src/public/js/focus/
    focus.js
    renderer.js
    sensor.js
    binary.js
    light.js
    climate.js
```

Alternativ weniger Dateien, solange Trennung sauber bleibt.

Keine weitere Monolithisierung von `app.js`.

---

# Grid Renderer bleibt unangetastet

Compact/Normal/Expanded-Renderer bleiben für normale Cards zuständig.

Focus Renderer darf keine Grid-Card-Größe verändern.

---

# Admin Live Preview

Normale Admin Preview bleibt Grid-orientiert.

Wenn Focus Preview existiert:

- darf ebenfalls Native Focus Renderer verwenden
- bleibt read-only

Keine Pflicht, Focus Preview neu einzuführen.

---

# Root Cause Analyse

Codex muss vor Implementierung dokumentieren:

1. Wird DOM geklont?
2. Werden Grid-Klassen übernommen?
3. Werden Inline-Größen übernommen?
4. Welche Media Query greift auf iPad?
5. Welche Flex-Regel verursacht Shrink?
6. Welche CSS-Spezifität beeinflusst Focus?
7. Ist Viewport-Berechnung korrekt?

---

# Browser-Matrix

Mindestens manuell/visuell:

```text
macOS 13.7.8 Safari
iPad Air 2 / iPadOS 15.8.5 Safari
Legacy iPad / iOS 9 Safari, sofern verfügbar
```

---

# Tests – Renderer Separation

1. Focus nutzt eigenen Renderer
2. Focus klont Grid Card nicht als Hauptimplementierung
3. Focus erhält keine x/y/w/h Layoutstyles
4. Focus erhält keine Compact-Grid-Größen
5. Sensor Focus eigener DOM
6. Binary Focus eigener DOM
7. Light Focus eigener DOM
8. Climate Focus eigener DOM

---

# Tests – CSS Isolation

9. Grid Compact CSS verändert Focus nicht
10. Grid Normal CSS verändert Focus nicht
11. Grid Expanded CSS verändert Focus nicht
12. mobile Grid Media Query verändert Focus-Dimension nicht
13. Focus Controls schrumpfen nicht
14. Focus Panel hat korrektes box-sizing
15. kein transform scale
16. kein zoom

---

# Tests – Viewport

17. Desktop Viewport
18. Tablet Portrait
19. Tablet Landscape
20. kleine Legacy Viewport-Höhe
21. Focus Width sinnvoll
22. Focus Height sinnvoll
23. Focus überschreitet Viewport nicht
24. Focus wird nicht winzig

---

# Tests – Sensor

25. Identity sichtbar
26. Value sichtbar
27. Unit sichtbar
28. sinnvolle Font-/Icon-Größe

---

# Tests – Binary

29. Identity sichtbar
30. State sichtbar
31. keine Stauchung

---

# Tests – Light

32. Identity sichtbar
33. State sichtbar
34. Power sichtbar
35. Power Control >= Mindestgröße
36. Power funktioniert
37. unavailable deaktiviert

---

# Tests – Climate

38. Identity sichtbar
39. Current Temperature sichtbar
40. Target Temperature sichtbar
41. Minus sichtbar
42. Plus sichtbar
43. Power sichtbar, wenn erlaubt
44. Minus Mindestgröße
45. Plus Mindestgröße
46. Power Mindestgröße
47. Temperatursteuerung funktioniert
48. Power funktioniert
49. unavailable deaktiviert Controls

---

# Tests – Orientation / State

50. Focus Portrait
51. Focus Landscape
52. Rotation offen
53. State Refresh offen
54. Busy State
55. Stale State
56. unavailable State

---

# Regression – Sprint 17.4

57. Scroll-Policy bleibt erhalten
58. Hintergrund scrollt nicht unkontrolliert
59. Close Button sichtbar
60. Tap outside schließt
61. Dashboardscrollposition bleibt stabil

---

# Regression – Dashboard

62. Compact Cards funktionieren
63. Normal Cards funktionieren
64. Expanded Cards funktionieren
65. Drag/Resize funktioniert
66. Theme-Persistenz funktioniert
67. Admin Live Preview funktioniert

---

# Regression – System Dashboards

68. `/system/summary` funktioniert
69. `/system/errors` funktioniert
70. Summary Business Logic unverändert
71. Error Business Logic unverändert

---

# Security Regression

72. HA-Token Backend-only
73. Light-Allowlist unverändert
74. Climate-Allowlist unverändert
75. keine neue Write-API
76. Focus erzeugt keine Schreibberechtigung
77. unavailable sendet keine Writes

---

# Manuelle Abnahme – iPad Air 2

Zwingend auf:

```text
iPad Air 2
iPadOS 15.8.5
Safari
```

Prüfen:

## Sensor
- Focus groß genug
- Wert nicht gestaucht
- Identity sichtbar

## Binary
- Status lesbar
- keine Mini-Card im Overlay

## Light
- Power Control groß genug
- bedienbar
- keine gestauchte Darstellung

## Climate
- Focus nutzt Großteil des verfügbaren Viewports
- Isttemperatur lesbar
- Solltemperatur lesbar
- Minus bedienbar
- Plus bedienbar
- Power bedienbar
- Controls nicht gestaucht

Portrait und Landscape.

---

# Manuelle Abnahme – macOS Safari

Bestehendes gutes Verhalten darf nicht regressieren.

---

# Manuelle Abnahme – Legacy iOS 9

Wenn reales Gerät verfügbar:

- Sensor
- Binary
- Light
- Climate
- Portrait
- Landscape
- Controls
- Close
- Theme

---

# Screenshot-Pflege

Wenn Sprint D1 vorhanden:

```text
docs/screenshots/dashboards/focus-card.png
```

nach erfolgreicher Implementierung aktualisieren, falls sichtbar verändert.

Nur echter Screenshot aus Anwendung/Demo.

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

- Focus ist eigenständige Interaction View
- Focus verwendet keinen Grid-Renderer
- Mobile Safari wurde explizit berücksichtigt
- bekannte Browsermatrix

---

# Nicht-Ziele

Nicht Bestandteil von Sprint 17.5:

- neue Widgettypen
- neue Write-Domains
- neue Summary-Regeln
- neue Error-Regeln
- Registry Enrichment
- Repairs
- Matter
- Automation Impact
- Home Assistant App
- HACS
- Grid-Neuentwicklung

---

# Definition of Done

Sprint 17.5 ist abgeschlossen, wenn:

- Focus nicht mehr als Grid-Card-Größe behandelt wird
- Focus einen eigenständigen Renderer besitzt
- Grid-Geometrie nicht in Focus übernommen wird
- Grid-Presentation-Klassen Focus nicht verkleinern
- Sensor Focus korrekt groß ist
- Binary Focus korrekt groß ist
- Light Focus korrekt groß und bedienbar ist
- Climate Focus korrekt groß und bedienbar ist
- Controls auf iPadOS nicht gestaucht werden
- iPad Air 2 / iPadOS 15.8.5 manuell geprüft wurde
- macOS Safari nicht regressiert
- iOS-9-Kompatibilität erhalten bleibt
- Scroll-Policy aus 17.4 erhalten bleibt
- Summary/Errors unverändert funktionieren
- keine Security Boundary verändert wurde
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
4. wurde Grid DOM vorher geklont?
5. welche Grid-Klassen/Styles wirkten auf Focus?
6. welche Mobile-Safari-Regel war relevant?
7. geänderte Dateien
8. neue Focus-Renderer-Architektur
9. Focus View Model
10. CSS Isolation
11. Viewport-Berechnung
12. Flexbox-/Shrink-Fix
13. Sensor-Ergebnis
14. Binary-Ergebnis
15. Light-Ergebnis
16. Climate-Ergebnis
17. macOS Safari Ergebnis
18. iPad Air 2 Ergebnis
19. iOS-9-Ergebnis, falls verfügbar
20. Testanzahl und Ergebnis
21. Summary-/Error-Regression
22. Security-Regression
23. Screenshot-Review
24. verbleibende Einschränkungen
25. Commit-Vorschlag
26. Deploymentbefehle

---

# Codex-Prompt für Sprint 17.5

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
- docs/sprints/SPRINT-17.4.md
- docs/sprints/SPRINT-17.5.md
- docs/sprints/SPRINT-19.md
- docs/sprints/SPRINT-20.md
- docs/sprints/SPRINT-D1.md if present

Inspect the actual repository state first.

Implement Sprint 17.5 exactly as specified in
docs/sprints/SPRINT-17.5.md.

Known regression:

- Focus looks correct in Safari on macOS 13.7.8.
- On iPad Air 2 / iPadOS 15.8.5 Safari, the overlay opens but the card inside
  is very small, content is compressed and controls are not usable.

Do not apply another superficial CSS patch.

First identify the real root cause:

- Is the grid card DOM cloned?
- Are x/y/w/h or inline grid dimensions copied?
- Are compact/normal/expanded grid classes inherited?
- Which mobile/tablet media queries apply?
- Are nested flex containers shrinking the Focus content?
- Are min-width/min-height/box-sizing rules missing?
- Is any transform/scale/zoom involved?
- Is viewport sizing wrong on Mobile Safari?

Then architecturally separate Focus from Grid.

Focus is not another card size.
Focus is a separate interaction view.

Implement a dedicated Focus renderer and Focus View Model.

At minimum use dedicated renderers for:

- Sensor
- Binary
- Light
- Climate

Do not use the normal Grid Card DOM as the primary Focus DOM.

Do not copy grid geometry or grid presentation classes into Focus.

Use a Focus-specific CSS namespace.

Protect Focus controls from shrinking.

Light Focus must keep:
- identity
- state
- usable power button

Climate Focus must keep:
- identity
- current temperature
- target temperature
- usable minus button
- usable plus button
- usable power button when authorized

Controls should keep at least roughly 44x44 px touch targets, preferably larger
in Focus when the viewport permits.

Use actual viewport dimensions, not grid dimensions, to size Focus.

Preserve the Sprint 17.4 scroll policy:
- header visible
- primary content visible
- controls visible
- only secondary/details content scrolls when truly necessary

Explicitly test Mobile Safari behavior.

Manual verification is required on:
- macOS Safari
- iPad Air 2 / iPadOS 15.8.5 Safari
- legacy iOS 9 Safari when available

Preserve all existing Home Assistant security boundaries.

Do not add any new write APIs or automatically extend write allowlists.

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

Run the complete test suite and syntax checks.

If Sprint D1 is present, review/update the Focus screenshot using a real
application/demo screenshot only.

Update README.de.md and README.en.md semantically in sync if documentation
changes.

Update docs/PROJECT_STATUS.md.

At the end report:
- root cause
- grid inheritance/cloning findings
- mobile Safari findings
- dedicated Focus renderer architecture
- viewport sizing
- CSS isolation
- widget-specific results
- macOS Safari result
- iPad Air 2 result
- legacy iOS 9 result if available
- test results
- Summary/Error regression
- security regression
- screenshot review
- remaining limitations

Do not commit or push unless explicitly instructed.
```
