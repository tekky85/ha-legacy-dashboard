# Sprint 17.6 – Power Control Alignment & Icon Stabilization

## Status

Planned

## Einordnung

Sprint 17.6 ist ein gezielter UI-Korrektursprint für die gemeinsamen Power-Controls in normalen Dashboard-Cards und im Focus Mode.

Beobachtetes Problem:

- Power-/Ein-Aus-Control ist in normalen Cards optisch nicht mittig
- im Focus Mode ist die Darstellung besser, aber ebenfalls nicht vollständig zentriert
- das Problem kann zwischen Desktop Safari und Mobile Safari unterschiedlich stark sichtbar sein
- ein fontabhängiges Unicode-Power-Symbol kann je nach Safari-/Font-Version optisch unterschiedlich sitzen

Sprint 17.6 stabilisiert daher nicht nur einzelne CSS-Werte, sondern vereinheitlicht die Power-Control-Geometrie und Icon-Darstellung.

---

# Ziel

Das Power-Control soll in allen relevanten Darstellungen konsistent und exakt zentriert sein.

Betroffen mindestens:

```text
Light Compact Card
Light Normal Card
Light Expanded Card, falls vorhanden
Light Focus Card

Climate Compact Card
Climate Normal Card
Climate Expanded Card, falls vorhanden
Climate Focus Card
```

---

# Kernentscheidung

Bevorzugt:

> Power Icon nicht als fontabhängiges Unicode-Zeichen rendern, sondern als eigenes Inline-SVG.

Statt:

```text
⏻
```

bevorzugt:

```text
button
  └── inline SVG
```

Dadurch werden:

- Glyph-Metriken
- Font Baseline
- Safari-Fontabweichungen
- unterschiedliche line-height-Berechnung

als Fehlerquelle reduziert.

---

# Sicherheitsgrundsätze

Unverändert:

- HA-Token nur im Backend
- keine direkte Browser-Verbindung zu Home Assistant
- keine neue Write-API
- keine neuen Schreibrechte
- bestehende Light-Allowlist unverändert
- bestehende Climate-Allowlist unverändert
- Power-Control-Design erzeugt keine Capability
- Focus Mode erzeugt keine Schreibrechte
- unavailable/stale Zustände bleiben geschützt

Sprint 17.6 ist rein UI-/Presentation-orientiert.

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
- fetch
- Promise
- async/await
- optional chaining
- nullish coalescing
- CSS Grid
- Flexbox gap
- ResizeObserver
- Container Queries

Inline-SVG muss in Safari iOS 9 funktionieren.

---

# Teil A – Gemeinsame Power-Control-Komponente

## Ziel

Light und Climate sollen dieselbe Power-Control-Basis verwenden.

Nicht:

```text
Light Power CSS A
Climate Power CSS B
Focus Power CSS C
```

sondern möglichst:

```text
dashboard-control
dashboard-control-power
```

mit nur wenigen kontextabhängigen Modifikatoren.

---

# Gemeinsame Zustände

Mindestens:

```text
on
off
busy
disabled
unavailable
error
```

Die optische Zentrierung muss in allen Zuständen identisch bleiben.

---

# Button als echtes Element

Power-Control soll als echtes:

```html
<button>
```

gerendert werden.

Nicht als:

```text
div
span
```

mit Click Handler, sofern vermeidbar.

---

# Teil B – Inline-SVG Power Icon

## Ziel

Power-Symbol unabhängig von Font-Metriken machen.

Bevorzugte Struktur:

```html
<button class="dashboard-control dashboard-control-power">
    <svg class="dashboard-control-power-icon" ...>
        ...
    </svg>
</button>
```

---

# SVG-Regeln

Verbindlich:

- feste `viewBox`
- Breite/Höhe über CSS oder Attribute kontrolliert
- kein externes SVG-Asset erforderlich
- keine Font-Abhängigkeit
- `display: block` oder äquivalente robuste Zentrierung
- `pointer-events` so behandeln, dass Button-Click zuverlässig bleibt
- keine unnötige Animation

---

# SVG-Geometrie

Das Symbol soll optisch, nicht nur mathematisch, zentriert wirken.

Falls der Kreis-/Strich-Aufbau visuell leicht asymmetrisch ist, darf der SVG-Pfad selbst korrigiert werden.

Nicht versuchen, die Asymmetrie über zufällige Button-Paddings zu kompensieren.

---

# Kein Unicode-Fallback als Hauptpfad

Ein Unicode-`⏻` darf höchstens als Fallback existieren.

Standardpfad soll SVG sein.

---

# Teil C – Zentrierung

## Button-Inhalt

Bevorzugt:

```css
display: flex;
align-items: center;
justify-content: center;
```

oder eine nachweislich robustere Legacy-kompatible Alternative, falls Mobile Safari Probleme zeigt.

---

# line-height

Explizit prüfen:

```text
line-height
```

Power Button soll nicht von geerbter Text-Line-Height verschoben werden.

Bevorzugt für Icon-only Button:

```text
line-height: 1
```

oder neutralisierte Text-Baseline.

---

# Padding

Icon-only Power-Control braucht keine textartige asymmetrische Paddingstruktur.

Prüfen:

```text
padding-top
padding-bottom
padding-left
padding-right
```

Bevorzugt symmetrisch.

---

# Width / Height

Power Button soll klar definierte Maße besitzen.

Beispiel:

```text
Compact:
44 × 44 px

Normal:
44–48 × 44–48 px

Focus:
48–56 × 48–56 px
```

Tatsächliche Werte anhand bestehender Card-Geometrie bestimmen.

---

# box-sizing

Verbindlich prüfen:

```css
box-sizing: border-box;
```

für Power Button.

---

# border

Unterschiedliche Border-Breiten dürfen die visuelle Zentrierung nicht verändern.

Active/Busy/Disabled States sollen keine andere Boxgröße erzeugen.

---

# Teil D – Light Cards

## Compact

Power Button muss:

- vertikal mittig
- horizontal mittig
- nicht an Cardkante kleben
- nicht Identity überdecken
- nicht Status verschieben

Beispiel:

```text
┌────────────────────┐
│ 💡 AN        [⏻]   │
│ Esszimmer          │
└────────────────────┘
```

---

# Light Normal

Beispiel:

```text
┌─────────────────────┐
│ 💡 Esszimmer        │
│                     │
│         AN          │
│        [ ⏻ ]        │
└─────────────────────┘
```

Power Button innerhalb des vorgesehenen Control-Bereichs zentriert.

---

# Light Focus

Focus Renderer aus Sprint 17.5 bleibt eigenständig.

Power-Control muss dort dieselbe gemeinsame Icon-/Button-Komponente verwenden.

Keine zweite Focus-spezifische SVG-Implementierung.

---

# Teil E – Climate Cards

## Compact

Wenn Power im Compact-Modus sichtbar:

```text
┌─────────────────────┐
│ 🔥 21,8°       [⏻]  │
│ Esszimmer           │
└─────────────────────┘
```

Icon exakt im Button zentriert.

---

# Climate Normal

Bei:

```text
[ − ] [ + ] [ ⏻ ]
```

sollen alle Controls optisch dieselbe Baseline und ähnliche visuelle Größe besitzen.

Power darf nicht höher/tiefer wirken.

---

# Climate Focus

Beispiel:

```text
[  −  ]   [  +  ]

     [ ⏻ AUS ]
```

Wenn Text im Power Button vorhanden ist:

```text
Icon + Label
```

muss das Gesamtelement sauber zentriert sein.

---

# Icon-only vs Icon+Label

Die gemeinsame Komponente soll beide Varianten unterstützen.

## Icon-only

```text
[ ⏻ ]
```

## Icon + Label

```text
[ ⏻ AUS ]
```

oder:

```text
[ ⏻ Einschalten ]
```

---

# Icon+Label Layout

Bevorzugt:

```text
display: flex
align-items: center
justify-content: center
```

Icon und Text mit explizitem Abstand.

Kein Flexbox `gap`.

Abstand über Margin.

---

# Teil F – Mobile Safari Audit

Codex muss gezielt prüfen:

- geerbte line-height
- `-webkit-appearance`
- Button default padding
- Button default font
- Button baseline
- SVG inline baseline
- flex centering
- `box-sizing`
- border width
- min-width/min-height
- transform
- vertical-align
- appearance differences between desktop/mobile Safari

---

# Native Button Appearance

Prüfen, ob Safari das Button-Rendering durch native Appearance beeinflusst.

Falls nötig:

```css
-webkit-appearance: none;
appearance: none;
```

nur wenn auf iOS 9 sicher und im bestehenden Stil passend.

Nicht unreflektiert global auf alle Buttons anwenden.

---

# Teil G – Gemeinsame Control-Geometrie

Power, Minus und Plus sollen dieselbe geometrische Sprache haben.

Mindestens:

```text
gleiche Höhe
vergleichbare Border
gleiche Radiuslogik
gleiche Vertical Alignment
```

Power Icon darf visuell nicht „hoch“ oder „tief“ sitzen.

---

# Kein Transform-Hack

Nicht lösen mit:

```css
transform: translateY(...)
```

als primäre Lösung.

Ein kleiner optischer SVG-internen Offset ist zulässig, wenn das Symbol geometrisch selbst korrigiert wird.

---

# Keine absolute Positionierung nur für Icon

Bevorzugt normale Layoutzentrierung.

Absolute Positionierung nur, wenn bestehende Struktur dies zwingend erfordert und robust getestet ist.

---

# Teil H – Focus Renderer Integration

Sprint 17.5 hat Focus vom Grid getrennt.

Sprint 17.6 darf diese Trennung nicht wieder aufheben.

Gemeinsam wiederverwenden:

```text
Power Control Renderer
Power Icon
Control State Styling
```

Nicht gemeinsam wiederverwenden:

```text
Grid Card Geometry
Focus Card Geometry
```

---

# Teil I – Tests Power Component

1. Power Button ist echtes Button-Element
2. SVG vorhanden
3. Unicode-Glyph nicht Hauptpfad
4. SVG viewBox stabil
5. Icon horizontal zentriert
6. Icon vertikal zentriert
7. border verändert Größe nicht
8. busy verändert Größe nicht
9. disabled verändert Größe nicht
10. unavailable verändert Größe nicht

---

# Tests Light

11. Light Compact Power zentriert
12. Light Normal Power zentriert
13. Light Focus Power zentriert
14. Light on funktioniert
15. Light off funktioniert
16. Light busy funktioniert
17. Light unavailable disabled
18. Compact Identity bleibt sichtbar

---

# Tests Climate

19. Climate Compact Power zentriert
20. Climate Normal Power zentriert
21. Climate Focus Power zentriert
22. Minus/Plus/Power gleiche Baseline
23. Climate Power on funktioniert
24. Climate Power off funktioniert
25. Climate +/- funktioniert
26. unavailable deaktiviert Controls

---

# Tests Icon+Label

27. Icon-only zentriert
28. Icon+Label zentriert
29. langer Labeltext zerstört Button nicht
30. Text und Icon vertikal mittig

---

# Tests Theme

31. Light Theme
32. Dark Theme
33. Active State
34. Disabled State
35. Busy State

---

# Tests Browser Matrix

36. macOS Safari
37. iPadOS Safari
38. Legacy iOS 9 Safari, falls verfügbar
39. Portrait
40. Landscape

---

# Regression Sprint 17.5

41. Focus Renderer bleibt eigenständig
42. Focus Card Größe korrekt
43. keine Grid-Geometrie in Focus
44. Focus Scroll-Policy unverändert
45. Focus Controls weiterhin bedienbar

---

# Regression normale Cards

46. Compact Cards korrekt
47. Normal Cards korrekt
48. Expanded Cards korrekt
49. Grid-Geometrie unverändert
50. Card Identity unverändert

---

# Regression System Dashboards

51. Summary funktioniert
52. Errors funktioniert
53. 1/2/3 Spalten funktionieren
54. Filter funktionieren
55. Risk Severity unverändert

---

# Security Regression

56. HA-Token Backend-only
57. Light-Allowlist unverändert
58. Climate-Allowlist unverändert
59. keine neue Write-API
60. Power UI erzeugt keine Schreibrechte
61. unavailable sendet keine Write-Aktion

---

# Manuelle Abnahme – macOS Safari

Prüfen:

- Light Compact
- Light Normal
- Light Focus
- Climate Compact
- Climate Normal
- Climate Focus
- Icon-only
- Icon+Label
- Dark/Light

---

# Manuelle Abnahme – iPad Air 2

Referenzgerät:

```text
iPad Air 2
iPadOS 15.8.5
Safari
```

Prüfen:

- Power Icon exakt zentriert
- keine Verschiebung nach oben/unten
- keine unterschiedliche Größe zwischen on/off
- Light Card
- Light Focus
- Climate Card
- Climate Focus
- Portrait
- Landscape

---

# Manuelle Abnahme – Legacy iOS 9

Wenn verfügbar:

```text
iPad mini 1
iOS 9.3.5
Safari
```

Prüfen:

- SVG sichtbar
- SVG nicht abgeschnitten
- Button zentriert
- Button reagiert
- Focus zentriert
- keine Layoutregression

---

# Root Cause Pflicht

Codex soll dokumentieren, wodurch die bisherige Fehlausrichtung entstand.

Mögliche Ursachen:

- Unicode Glyph Baseline
- line-height
- Safari native button appearance
- asymmetrisches padding
- unterschiedliche Button width/height
- geerbte font metrics
- Focus-spezifische Override-Regel
- Flexbox alignment
- border sizing

Nicht nur optisch korrigieren, Ursache benennen.

---

# Screenshot-Pflege

Wenn Sprint D1 vorhanden:

Prüfen:

```text
docs/screenshots/dashboards/main-light.png
docs/screenshots/dashboards/main-dark.png
docs/screenshots/dashboards/focus-card.png
```

Nur aktualisieren, wenn Power-Control dort sichtbar und die Änderung relevant ist.

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

Dokumentieren:

- gemeinsames Power-Control
- SVG-basierte Icon-Darstellung
- Browser-Stabilisierung

---

# Nicht-Ziele

Nicht Bestandteil:

- neue Write-Funktionen
- neue Dashboardtypen
- neue Summary-Regeln
- neue Error-Regeln
- neue Registry-/Diagnostic-Funktionen
- Helligkeitssteuerung
- neue Climate Modes
- Focus-Neuentwicklung
- Grid-Neuentwicklung
- Home Assistant App
- HACS

---

# Definition of Done

Sprint 17.6 ist abgeschlossen, wenn:

- Power-Control gemeinsame Komponente besitzt
- Power-Symbol bevorzugt als Inline-SVG gerendert wird
- Unicode-Power-Glyph nicht mehr Hauptpfad ist
- Icon horizontal zentriert ist
- Icon vertikal zentriert ist
- Light Compact korrekt ist
- Light Normal korrekt ist
- Light Focus korrekt ist
- Climate Compact korrekt ist
- Climate Normal korrekt ist
- Climate Focus korrekt ist
- Minus/Plus/Power optisch konsistent sind
- Mobile Safari native Button-Effekte kontrolliert sind
- iPad Air 2 manuell geprüft wurde
- macOS Safari nicht regressiert
- iOS-9-Kompatibilität erhalten bleibt
- Focus Renderer aus 17.5 getrennt bleibt
- Summary/Errors unverändert funktionieren
- keine Security Boundary verändert wurde
- alle Tests grün sind
- Root Cause dokumentiert wurde
- Screenshot Review erfolgt ist
- `docs/PROJECT_STATUS.md` aktualisiert wurde

---

# Erwartetes Codex-Ergebnis

Codex berichtet:

1. Startcommit
2. tatsächlicher Repo-Stand
3. Root Cause
4. verwendete Power-Control-Komponente
5. SVG-Aufbau
6. Button-Geometrie
7. line-height/padding/appearance Änderungen
8. Light Compact Ergebnis
9. Light Normal Ergebnis
10. Light Focus Ergebnis
11. Climate Compact Ergebnis
12. Climate Normal Ergebnis
13. Climate Focus Ergebnis
14. macOS Safari Ergebnis
15. iPad Air 2 Ergebnis
16. iOS-9-Ergebnis, falls verfügbar
17. Testanzahl und Ergebnis
18. Summary-/Error-Regression
19. Security-Regression
20. Screenshot Review
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
- docs/sprints/SPRINT-17.3.md
- docs/sprints/SPRINT-17.4.md
- docs/sprints/SPRINT-17.5.md
- docs/sprints/SPRINT-17.6.md
- docs/sprints/SPRINT-21.1.md
- docs/sprints/SPRINT-21.2.md
- docs/sprints/SPRINT-D1.md if present

Inspect the actual repository state first.

Implement Sprint 17.6 exactly as specified in
docs/sprints/SPRINT-17.6.md.

Known problem:

The Power control is not optically centered in normal dashboard cards.
It looks better in Focus mode but is still not fully centered.

First identify the real root cause.

Audit:

- Unicode power glyph/font metrics
- line-height
- padding
- width/height
- box-sizing
- border sizing
- native Safari button appearance
- flex alignment
- Focus-specific overrides

Prefer replacing the font-dependent Unicode power glyph with a dedicated
inline SVG power icon.

Use a shared Power Control component for Light and Climate.

The same control/icon implementation should be reused in:
- Light Compact
- Light Normal
- Light Focus
- Climate Compact
- Climate Normal
- Climate Focus

Do not merge Grid and Focus geometry.
Sprint 17.5 Focus rendering must remain architecturally separate.

Power buttons must be truly centered horizontally and vertically.

Protect controls against native Mobile Safari button styling where necessary,
while keeping Safari iOS 9 compatibility.

Keep interactive touch targets at least roughly 44x44 px.

Do not use transform/translate hacks as the primary alignment solution.

Preserve:
- Light write security
- Climate write security
- Climate +/- controls
- Focus renderer architecture
- Compact identity
- grid geometry
- theme persistence
- Summary Dashboard
- Error Dashboard
- Sprint 21.2 filters/column/risk behavior

Do not add any new Home Assistant write APIs or permissions.

Keep the wall display compatible with Safari on iOS 9 and ECMAScript 5.

Run the complete test suite and syntax checks.

Manually verify at least:
- macOS Safari
- iPad Air 2 / iPadOS 15.8.5 Safari
- iOS 9 Safari if available

Verify Portrait and Landscape.

If Sprint D1 exists, review relevant real screenshots.

Update README.de.md and README.en.md semantically in sync if needed.
Update docs/PROJECT_STATUS.md.

At the end report:
- root cause
- changed files
- shared control architecture
- SVG implementation
- CSS geometry changes
- browser-specific findings
- macOS Safari result
- iPad Air 2 result
- iOS 9 result if available
- test results
- Summary/Error regression
- security regression
- screenshot review
- remaining limitations

Do not commit or push unless explicitly instructed.
```
