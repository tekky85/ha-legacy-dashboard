# Sprint 17.7 – Legacy Safari Control Alignment Hardening

## Status

Planned

## Einordnung

Sprint 17.7 ist ein gezielter Legacy-Safari-Korrektursprint.

Trotz Sprint 17.6 bestehen auf realen iPads weiterhin sichtbare Alignment-Probleme:

```text
Normale Dashboard Cards:
Power Buttons sind linksbündig statt mittig.

Climate Focus:
Minus und Plus sind ebenfalls linksbündig.

Focus Power:
besser als im normalen Dashboard, aber weiterhin nicht vollständig sauber zentriert.
```

Das Verhalten tritt insbesondere auf Legacy-/Mobile-Safari auf und ist auf Desktop Safari nicht zuverlässig reproduzierbar.

Sprint 17.7 behandelt deshalb nicht nur:

```text
Icon Alignment
```

sondern die komplette Control-Struktur:

```text
Control Row
Control Cell
Button
Button Content
SVG/Icon
Label
```

---

# Ziel

Alle interaktiven Dashboard-Controls sollen auf iPad Safari zuverlässig horizontal und vertikal zentriert dargestellt werden.

Mindestens betroffen:

```text
Light Power auf normalen Cards
Climate Power auf normalen Cards
Climate Minus/Plus im Focus
Climate Power im Focus
Light Power im Focus
```

---

# Kernprinzip

> Nicht nur das Icon muss zentriert sein.  
> Die gesamte Control-Zelle muss korrekt ausgerichtet werden.

Ein korrekt zentriertes SVG innerhalb eines linksbündigen Containers löst das Problem nicht.

---

# Sicherheitsgrundsätze

Unverändert:

- HA-Token nur im Backend
- keine direkte Browser-Verbindung zu Home Assistant
- keine neuen Write APIs
- keine neuen Write Capabilities
- Light-Allowlist unverändert
- Climate-Allowlist unverändert
- unavailable/stale Controls bleiben geschützt
- keine Änderung an Rate Limits, Security Headern oder Payload Limits

Sprint 17.7 ist ausschließlich UI-/Presentation-orientiert.

---

# Legacy-Kompatibilität

Zielplattform bleibt:

```text
Apple iPad mini 1
iOS 9.3.5
Safari iOS 9
ECMAScript 5
```

Zusätzlicher Referenzfall:

```text
iPad Air 2
iPadOS 15.8.5
Safari
```

Desktop-Referenz:

```text
macOS Safari
```

Nicht verwenden:

- `let`
- `const`
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

# Teil A – Root Cause Audit

Codex muss zuerst die tatsächliche Ursache auf Mobile Safari identifizieren.

Explizit prüfen:

```text
display
display: flex
display: -webkit-flex
justify-content
-webkit-justify-content
align-items
-webkit-align-items
text-align
width
min-width
max-width
flex-basis
flex-grow
flex-shrink
-webkit-flex-basis
-webkit-flex-grow
-webkit-flex-shrink
margin-left
margin-right
padding
line-height
vertical-align
box-sizing
-webkit-appearance
button default styles
```

Zusätzlich prüfen:

```text
display: -webkit-box
-webkit-box-pack
-webkit-box-align
```

falls Legacy-Safari-Fallbacks im Projekt bereits verwendet werden.

---

# Kein Desktop-only Fix

Ein Fix gilt erst als erfolgreich, wenn er auf realem Mobile Safari geprüft wurde.

Nicht ausreichend:

```text
Chrome DevTools Device Emulation
Desktop Safari Responsive Design Mode
Desktop Browser Screenshot
```

Diese dürfen ergänzend verwendet werden, ersetzen aber nicht die reale iPad-Abnahme.

---

# Teil B – Control Layout Hierarchie

Bevorzugte Struktur:

```text
control-row
  control-cell
    button
      svg/icon
```

oder:

```text
control-row
  button
  button
  button
```

Entscheidend:

- `control-row` muss korrekt ausrichten
- Button selbst muss korrekte Maße besitzen
- Button-Inhalt muss separat zentriert sein

---

# Control Row

Für horizontale Controls:

```text
[ - ] [ + ]
```

oder:

```text
[ - ] [ + ] [ Power ]
```

muss die gesamte Row die Buttons im vorgesehenen verfügbaren Bereich zentrieren.

---

# Kein implizites left alignment

Folgende Situation ist nicht akzeptabel:

```text
┌────────────────────────────┐
│ [ - ][ + ]                 │
└────────────────────────────┘
```

Gewünscht:

```text
┌────────────────────────────┐
│       [ - ]   [ + ]        │
└────────────────────────────┘
```

---

# Teil C – Legacy Flexbox Hardening

Safari iOS 9 kann ältere Flexbox-Eigenheiten besitzen.

Codex soll die bestehende Browser-Kompatibilitätsstrategie des Projekts prüfen.

Wenn nötig, gezielte Präfixe verwenden:

```css
display: -webkit-flex;
display: flex;

-webkit-align-items: center;
align-items: center;

-webkit-justify-content: center;
justify-content: center;
```

Nur dort, wo tatsächlich erforderlich.

---

# Legacy Fallback

Falls Flexbox-Zentrierung auf iOS 9 in der konkreten Struktur weiterhin instabil ist, darf ein robusterer Fallback verwendet werden.

Beispiele:

```text
text-align: center
inline-block Controls
```

oder:

```text
table/table-cell
```

nur wenn dies im konkreten Fall robuster ist.

Wichtig:

Keine moderne Lösung erzwingen, wenn eine simplere Legacy-Lösung zuverlässiger ist.

---

# Teil D – Power Button auf normalen Cards

## Problem

Power-Control ist auf dem Dashboard sichtbar, aber linksbündig.

Das betrifft den Control-Container.

---

# Ziel

Beispiel Light:

```text
┌─────────────────────────┐
│ Esszimmer               │
│                         │
│           AN            │
│                         │
│         [  ⏻  ]         │
└─────────────────────────┘
```

Nicht:

```text
[ ⏻ ]
```

links am Card-Innenrand.

---

# Power Control Zone

Normale Card soll einen dedizierten Control-Bereich besitzen.

Beispiel:

```text
card-content
card-status
card-controls
```

`card-controls` erhält explizite Zentrierung.

---

# Keine Positionierung über zufällige Margins

Nicht primär lösen mit:

```css
margin-left: 37px;
```

oder gerätespezifischen Pixelwerten.

---

# Keine transform Hacks

Nicht primär:

```css
transform: translateX(...)
```

oder:

```css
translateY(...)
```

---

# Teil E – Climate Focus Minus/Plus

## Problem

Im Focus Mode erscheinen:

```text
[-] [+]
```

wieder linksbündig.

---

# Ziel

Portrait:

```text
┌────────────────────────────┐
│                            │
│       [ - ]   [ + ]        │
│                            │
│         [ Power ]          │
│                            │
└────────────────────────────┘
```

Landscape darf kompakter sein:

```text
┌─────────────────────────────────┐
│ [ Ist ]   [ - ] [ + ]   [Power]│
└─────────────────────────────────┘
```

aber die jeweilige Control Group bleibt intern korrekt zentriert.

---

# Climate Control Group

Bevorzugt:

```text
focus-climate-controls
focus-climate-temperature-controls
focus-climate-power-controls
```

oder äquivalente klare Struktur.

---

# Minus/Plus Mindestgröße

Mindestens:

```text
44 × 44 px
```

Bevorzugt im Focus:

```text
48–56 px
```

wenn Viewport dies erlaubt.

---

# Control-Abstand

Kein `gap`.

Stattdessen beispielsweise:

```text
margin-left / margin-right
```

symmetrisch.

---

# Teil F – Button Content Alignment

Sprint 17.6 Regeln bleiben erhalten.

Power Icon bevorzugt Inline SVG.

Button Content:

```text
horizontal center
vertical center
```

Zusätzlich:

```text
text-align: center
```

als defensiver Fallback, wenn sinnvoll.

---

# Icon + Label

Bei:

```text
[ ⏻ AUS ]
```

muss der gesamte Inhalt mittig sein.

Nicht:

```text
⏻ AUS
```

am linken Rand eines breiten Buttons.

---

# Teil G – Width Handling

Eine häufige Ursache für Linksorientierung ist:

```text
Button korrekt zentriert,
aber Parent ist nur so breit wie der Button.
```

Deshalb prüfen:

```text
control-row width
control-cell width
button width
```

Die Control Row muss den tatsächlich verfügbaren Card-Bereich einnehmen.

Bevorzugt:

```text
width: 100%
```

für die entsprechende Control Zone, sofern mit Card-Geometrie kompatibel.

---

# min-width: 0 Audit

Bei Flex-Containern prüfen, ob:

```text
min-width
```

unerwartete Layout-Effekte erzeugt.

Nicht blind überall `min-width:0` setzen.

---

# flex-basis Audit

Prüfen:

```text
flex: 1
flex-basis: auto
flex-basis: 0
```

Legacy Safari kann hier anders reagieren.

Keine unnötigen `flex:1` auf Icon-/Button-Elementen.

---

# Teil H – CSS Specificity

Codex muss prüfen, ob spätere Media Queries Zentrierungsregeln überschreiben.

Insbesondere:

```text
compact
tablet
mobile
portrait
landscape
focus
legacy
```

---

# Media Query Audit

Gesucht sind Regeln wie:

```css
@media (...) {
    .card-controls {
        justify-content: flex-start;
    }
}
```

oder:

```css
.button {
    text-align: left;
}
```

die Desktop-Regeln überschreiben.

---

# Teil I – Native Safari Button Styles

Prüfen:

```text
-webkit-appearance
font
line-height
padding
border
```

Falls nötig:

```css
-webkit-appearance: none;
```

gezielt nur für Dashboard Controls.

Nicht global alle Buttons verändern.

---

# Teil J – Shared Control Component

Sprint 17.6 gemeinsame Power-Komponente bleibt.

Sprint 17.7 erweitert zusätzlich eine gemeinsame Control-Layout-Basis.

Bevorzugt:

```text
dashboard-control-row
dashboard-control-group
dashboard-control
dashboard-control-power
dashboard-control-step
```

---

# Keine erneute Grid/Focus-Kopplung

Sprint 17.5 Trennung bleibt bestehen.

Gemeinsam:

```text
Control component
Icon
Button geometry
alignment primitives
```

Getrennt:

```text
Grid card layout
Focus layout
```

---

# Teil K – Debug Instrumentation

Optional während Entwicklung:

- Outline für Control Rows
- Outline für Buttons
- Log der gemessenen Client Width

Aber:

- Debug Styles vor Abschluss entfernen
- keine Debug Logs dauerhaft
- keine Sensitive Data

---

# Teil L – Tests Normal Dashboard

1. Light Compact Power horizontal zentriert
2. Light Compact Power vertikal zentriert
3. Light Normal Power horizontal zentriert
4. Light Normal Power vertikal zentriert
5. Climate Compact Power horizontal zentriert
6. Climate Normal Power horizontal zentriert
7. Controls bleiben bei langen Titeln mittig
8. Controls bleiben in 1/2/3 Card-Breiten mittig
9. unavailable verschiebt Layout nicht
10. busy verschiebt Layout nicht

---

# Tests Focus

11. Climate Minus/Plus Group horizontal zentriert
12. Climate Minus intern zentriert
13. Climate Plus intern zentriert
14. Climate Power horizontal zentriert
15. Climate Power intern zentriert
16. Light Focus Power zentriert
17. Portrait
18. Landscape
19. State Refresh verändert Alignment nicht
20. Rotation verändert Alignment nicht

---

# Tests Legacy Flex

21. `-webkit-flex` Fallback korrekt, falls benötigt
22. prefixed align-items korrekt
23. prefixed justify-content korrekt
24. keine CSS Grid Abhängigkeit
25. kein Flexbox gap
26. keine transform Alignment Hacks
27. keine fixe gerätespezifische Margin-Lösung

---

# Tests Browser Matrix

28. macOS Safari
29. iPad Air 2 / iPadOS 15.8.5 Safari
30. iPad mini / iOS 9.3.5 Safari, wenn verfügbar
31. Portrait
32. Landscape

---

# Tests Controls

33. Light Power on
34. Light Power off
35. Climate Power on
36. Climate Power off
37. Climate Minus
38. Climate Plus
39. busy
40. unavailable

---

# Regression Sprint 17.5/17.6

41. Focus Renderer bleibt getrennt
42. Inline SVG Power bleibt
43. Power Icon intern zentriert
44. Grid-Geometrie unverändert
45. Focus Viewport unverändert
46. Compact Identity unverändert
47. Theme Persistenz unverändert

---

# Regression System Dashboards

48. Summary funktioniert
49. Errors funktioniert
50. Summary Filter funktionieren
51. Error Severity/Status Filter funktionieren
52. 1/2/3 Spalten funktionieren
53. Device Groups funktionieren
54. Critical Device Detection Modes funktionieren

---

# Security Regression

55. HA-Token Backend-only
56. keine neue Write-API
57. Light-Allowlist unverändert
58. Climate-Allowlist unverändert
59. unavailable sendet keine Write-Aktion
60. UI-Alignment erzeugt keine Capability

---

# Manuelle Abnahme – iPad mini

Dies ist der wichtigste Test.

Gerät:

```text
iPad mini 1
iOS 9.3.5
Safari
```

Prüfen:

## Normales Dashboard

- Light Power
- Climate Power
- Compact Cards
- Normal Cards
- Portrait
- Landscape

Erwartung:

```text
Power Controls exakt mittig
```

---

# Manuelle Abnahme – Climate Focus

Prüfen:

```text
[-] [+]
```

Erwartung:

```text
Control Group mittig
Buttons selbst mittig
Icons/Text mittig
```

Zusätzlich:

```text
Power mittig
```

---

# Manuelle Abnahme – iPad Air 2

Gerät:

```text
iPad Air 2
iPadOS 15.8.5
Safari
```

Dieselben Fälle prüfen.

---

# Manuelle Abnahme – macOS Safari

Bestehendes Desktop-Verhalten darf nicht regressieren.

---

# Root Cause Pflicht

Abschlussbericht muss konkret benennen:

```text
welcher Parent war linksbündig?
welche Regel griff auf iOS?
welcher Selector überschrieben?
war flex-prefixing relevant?
war button appearance relevant?
war die Parent-Width falsch?
```

Nicht akzeptabel:

```text
"alignment fixed"
```

ohne Ursache.

---

# Akzeptanzkriterium

Visuell darf die Abweichung nicht nur „besser“ sein.

Die Controls sollen innerhalb des vorgesehenen Control-Bereichs eindeutig zentriert erscheinen.

---

# Keine optische Zentrierung durch Textspaces

Nicht:

```text
&nbsp;&nbsp;&nbsp;
```

oder Leerzeichen zur Positionierung.

---

# Screenshot-Pflege

Wenn Sprint D1 vorhanden:

Prüfen:

```text
docs/screenshots/dashboards/main-light.png
docs/screenshots/dashboards/main-dark.png
docs/screenshots/dashboards/focus-card.png
```

Nur aktualisieren, wenn relevante Controls sichtbar sind.

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

README-Sprachen synchron halten.

---

# Nicht-Ziele

Nicht Bestandteil:

- neue Controls
- neue Write-Endpunkte
- neue Light-Funktionen
- neue Climate Modes
- Focus-Neuentwicklung
- Grid-Neuentwicklung
- neue Summary-/Error-Regeln
- Label-Funktionen
- Home Assistant App
- HACS

---

# Definition of Done

Sprint 17.7 ist abgeschlossen, wenn:

- Power Controls auf normalen Cards auf iPad mini mittig sind
- Climate Minus/Plus im Focus auf iPad mini mittig sind
- Climate Power im Focus mittig ist
- Light Focus Power mittig ist
- komplette Control Row korrekt ausgerichtet ist
- Button-Inhalte ebenfalls zentriert sind
- Legacy Safari Flexbox-Regeln geprüft wurden
- relevante Prefixes nur gezielt ergänzt wurden
- keine Transform-/Margin-Hacks verwendet werden
- iPad Air 2 geprüft wurde
- macOS Safari nicht regressiert
- Focus/Grid-Architektur getrennt bleibt
- Sprint-21.3-System-Dashboard-Funktionen unverändert bleiben
- keine Security Boundary verändert wurde
- alle Tests grün sind
- Root Cause dokumentiert wurde
- Screenshot Review erfolgt ist
- docs/PROJECT_STATUS.md aktualisiert wurde

---

# Erwartetes Codex-Ergebnis

Codex berichtet:

1. Startcommit
2. tatsächlicher Repo-Stand
3. Root Cause
4. betroffene Parent-Container
5. CSS-Specificity-Fund
6. Mobile-Safari-/Prefix-Fund
7. geänderte Dateien
8. gemeinsame Control-Row-Architektur
9. Power Alignment
10. Climate Minus/Plus Alignment
11. Light Focus Ergebnis
12. Climate Focus Ergebnis
13. iPad mini Ergebnis
14. iPad Air 2 Ergebnis
15. macOS Safari Ergebnis
16. Portrait/Landscape
17. Tests
18. Summary/Error Regression
19. Sprint-21.3 Regression
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
- docs/sprints/SPRINT-17.5.md
- docs/sprints/SPRINT-17.6.md
- docs/sprints/SPRINT-17.7.md
- docs/sprints/SPRINT-21.2.md
- docs/sprints/SPRINT-21.3.md
- docs/sprints/SPRINT-D1.md if present

Inspect the actual repository state first.

Implement Sprint 17.7 exactly as specified in
docs/sprints/SPRINT-17.7.md.

Known real-device regressions:

1. On iPad mini / legacy Safari, Power buttons visible directly on normal
   dashboard cards are still left-aligned instead of centered.

2. In Climate Focus mode, Minus and Plus controls are again left-aligned.

3. Focus Power looks better but should also be verified for true centering.

Do not focus only on the SVG/icon.

Audit the entire hierarchy:

- control row
- control group/cell
- button
- button content
- icon/SVG
- label

First identify the actual root cause.

Explicitly inspect:

- justify-content
- align-items
- text-align
- width/min-width/max-width
- flex-basis/grow/shrink
- margins/padding
- line-height
- box-sizing
- -webkit-appearance
- Mobile Safari button defaults
- CSS specificity
- mobile/portrait/landscape media queries
- legacy Safari flexbox prefixes

Where required, use targeted legacy Safari prefixes such as:

- display: -webkit-flex
- -webkit-align-items
- -webkit-justify-content

Do not add prefixes blindly.

If Flexbox remains unreliable for a specific legacy layout, prefer a simpler
robust fallback such as centered inline-block controls rather than a
device-specific hack.

Do not use:
- transform/translate alignment hacks as the primary fix
- device-specific pixel margins
- text spaces for positioning
- CSS Grid
- Flexbox gap

Ensure the entire control zone uses the available card width where appropriate.

Normal dashboard:
- Light Power must be centered
- Climate Power must be centered

Focus:
- Climate Minus/Plus group must be centered
- each Minus/Plus button content must be centered
- Climate Power must be centered
- Light Power must be centered

Keep touch targets at least about 44x44 px.

Preserve:
- Sprint 17.5 Focus/Grid separation
- Sprint 17.6 SVG Power component
- Light/Climate write security
- theme persistence
- compact identity
- grid geometry
- Sprint 21.3 Error filtering and critical-device modes
- Summary Dashboard
- Error Dashboard

Do not add any new write capabilities.

Keep the wall display compatible with Safari on iOS 9 and ECMAScript 5.

The most important manual verification is on the real iPad mini / iOS 9
Safari. Also verify iPad Air 2 / iPadOS 15.8.5 and macOS Safari.

Test portrait and landscape.

At the end report:
- exact root cause
- parent/container issue
- CSS specificity findings
- Safari prefix findings
- changed files
- Power alignment result
- Climate +/- alignment result
- iPad mini result
- iPad Air 2 result
- macOS Safari result
- test results
- Summary/Error regression
- Sprint 21.3 regression
- security regression
- screenshot review
- remaining limitations

Do not commit or push unless explicitly instructed.
```
