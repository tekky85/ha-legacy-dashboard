# Sprint 17.2 – Card Identity, Proportional Geometry & Theme Persistence

## Status
Planned

## Einordnung
Sprint 17.2 ist ein gezielter Korrektur-Sprint für die nach Sprint 17.1 noch bestehenden UX-Probleme. Er wird **nach dem aktuell laufenden Sprint 19** umgesetzt und vor Sprint 20 eingeschoben.

Reihenfolge:

```text
Sprint 19 – aktuell in Umsetzung
Sprint 17.2 – Card Identity, Proportional Geometry & Theme Persistence
Sprint 20 – Error Dashboard MVP
```

Sprint 19 soll nicht durch diese Korrekturen unterbrochen werden.

---

# Ausgangsprobleme

## 1. Compact Cards verlieren ihre Identität

Nach Sprint 17.1 kann eine kleine Card beispielsweise nur noch zeigen:

```text
[Icon]
21,8°
```

Damit ist nicht mehr erkennbar, ob der Wert zum Badezimmer, Esszimmer oder einem anderen Raum/Gerät gehört.

Verbindlicher Grundsatz:

> Jede sichtbare Card muss unabhängig von ihrer Größe immer eine eindeutige Identität behalten.

Kleine Cards dürfen sekundäre Informationen reduzieren, aber niemals alle Informationen entfernen, die Wert oder Zustand einer Entity, einem Raum oder Gerät zuordnen.

---

# Gewünschte Informationshierarchie

Für kleine Sensor-Cards bevorzugt:

```text
[Icon]   normale oder sinnvoll reduzierte Größe
[Value]  klar lesbare Größe
[Raum]   klein / mini / Untertitel
```

Beispiel:

```text
🌡
21,8°
Bad
```

oder:

```text
🌡 21,8°
Bad
```

Wichtig ist immer:

```text
Identity bleibt sichtbar.
```

---

# Identity-Konzept

Jede Card benötigt ein `identity label`, das auch im Compact Mode sichtbar bleibt.

Bevorzugte Quelle:

1. expliziter Widgettitel
2. vorhandener kurzer Titel / Raumname
3. Friendly Name
4. Entity ID als letzter technischer Fallback

Sprint 17.2 darf keine neue Registry-Abhängigkeit erzwingen.

---

# Compact-Mode-Regel

Compact darf reduzieren oder entfernen:

- langen Untertitel
- sekundäre Statusbeschreibung
- Zusatzmetadaten
- große dekorative Icons
- redundante Labels

Compact darf **nicht** entfernen:

- primären Wert oder Zustand
- eindeutige Identität
- notwendige Controls
- essenzielle Sicherheits-/Statusinformation

---

# Card Content Contract

## Sensor
Immer sichtbar:

```text
identity
value
```

Zusätzlich wenn Platz:

```text
icon
unit
subtitle
```

## Binary
Immer sichtbar:

```text
identity
state
```

Zusätzlich:

```text
icon
subtitle
```

## Light
Immer sichtbar:

```text
identity
state
control
```

Zusätzlich:

```text
icon
subtitle
```

## Climate
Immer sichtbar:

```text
identity
current temperature
target temperature
minus control
plus control
```

Zusätzlich:

```text
icon
hvac action
subtitle
```

---

# Beispiel Sensor

## Compact

```text
🌡
21,8°
Bad
```

## Normal

```text
Badezimmer
🌡 21,8 °C
Temperatur
```

## Expanded

```text
Badezimmer
Temperatur

🌡
21,8 °C
```

---

# Beispiel Binary

## Compact

```text
🪟
OFFEN
Küche
```

Status und Identität bleiben beide sichtbar.

---

# Beispiel Light

## Compact

```text
💡
AN
Esszimmer
[Control]
```

Identität darf nicht zugunsten des Controls verschwinden.

---

# Beispiel Climate

## Compact

Mindestens:

```text
Bad
21,8° → 22,5°
[ - ] [ + ]
```

oder:

```text
🔥 21,8°
Bad
[ - ] 22,5° [ + ]
```

Immer sichtbar:

- Identität
- Isttemperatur
- Solltemperatur
- Minus
- Plus

Touchziele weiterhin ca. 44×44 px.

---

# Problem 2 – Kartenhöhe ist nicht proportional zur Breite

Das feinere Raster aus Sprint 17.1 verbessert die horizontale Auflösung, die vertikale Geometrie wirkt jedoch weiterhin unproportional.

Eine kleine Card kann dadurch zu breit/flach oder optisch unausgewogen sein.

---

# Ziel – proportionale Rastergeometrie

Die Höhe einer Rastereinheit soll sinnvoll aus der tatsächlichen Spaltenbreite beziehungsweise Containerbreite abgeleitet werden.

Safari iOS 9 darf kein modernes `aspect-ratio` voraussetzen.

Bevorzugtes Konzept:

```text
columnWidth =
    verfügbare Dashboardbreite / columns

rowHeight =
    columnWidth * ROW_ASPECT_FACTOR
```

Beispiel:

```text
ROW_ASPECT_FACTOR = 0.75 bis 1.0
```

Der konkrete Wert muss visuell am iPad getestet werden.

Ziel:

- 1×1 wirkt annähernd proportional
- 2×1 wirkt sinnvoll breit
- 1×2 wirkt sinnvoll hoch
- kleine Cards sind nicht unnötig flach
- Controls passen zuverlässig

---

# Keine starre globale Pixelhöhe

Nicht bevorzugt:

```text
rowHeight = 100px
```

unabhängig von Portrait, Landscape, Containerbreite und Spaltenzahl.

Eine feste Pixelhöhe darf nur bleiben, wenn reale Tests nachweisen, dass sie die Proportionen korrekt erfüllt.

---

# Legacy-kompatible Berechnung

Beispielhaft:

```javascript
function calculateRowHeight(containerWidth, columns) {
    var columnWidth = containerWidth / columns;
    return Math.round(columnWidth * 0.85);
}
```

Der tatsächliche Faktor muss zentral definiert werden.

Gutters, Außenabstände und Container-Padding müssen berücksichtigt werden.

---

# Mindesthöhe

Trotz proportionaler Berechnung gelten Mindestgrößen.

Interaktive Cards dürfen nicht so niedrig werden, dass Touchziele nicht mehr passen.

Konzept:

```text
rowHeight = max(calculatedRowHeight, minimumUsableRowHeight)
```

---

# Resize / Orientation

Bei:

- Browserbreitenänderung
- Portrait → Landscape
- Landscape → Portrait

muss Geometrie neu berechnet werden.

Nicht bei jedem State-Poll neu rechnen.

---

# Presentation Modes erneut prüfen

Sprint 17.1 führte ein:

```text
compact
normal
expanded
```

Sprint 17.2 muss diese Regeln anhand der realen Fläche überarbeiten.

Bevorzugt berücksichtigen:

```text
widgetType
w
h
effectivePixelWidth
effectivePixelHeight
```

Die gewählte Presentation Mode muss tatsächlich genug Platz für ihren Content Contract besitzen.

---

# Raum-/Titelzeile

Für Compact Cards soll eine kleine Identitätszeile vorgesehen werden.

Bevorzugte CSS-Klasse:

```text
card-identity
```

Im Compact Mode:

- kleinere Schrift
- einzeilig
- Ellipsis
- trotzdem lesbar
- niemals pauschal `display:none`

---

# Titelkürzung

Für lange Titel bevorzugt den bereits konfigurierten Widgettitel verwenden.

Beispiel:

```text
Badezimmer Smart Indoor Module Temperatur
```

soll in Compact nicht vollständig dargestellt werden müssen.

Bevorzugt:

```text
Bad
```

oder:

```text
Badezimmer
```

Die Admin-Konfiguration bleibt die bevorzugte Stelle für kurze sinnvolle Titel.

---

# Icons und Schrift

## Icons
Abhängig von Presentation Mode:

```text
compact  -> klein
normal   -> mittel
expanded -> groß
```

Keine festen großen SVG-Abmessungen, die kleine Cards sprengen.

## Schrift
Darf abhängig vom Modus angepasst werden, muss aber auf dem iPad klar lesbar bleiben.

---

# Touchziele

Interaktive Elemente bleiben mindestens ungefähr:

```text
44 × 44 px
```

Wenn eine Card diese Controls nicht aufnehmen kann, muss ihre Mindestgröße größer sein.

---

# Problem 3 – Dark Mode wird nach Reload nicht wiederhergestellt

Wenn der Benutzer Dark Mode aktiviert und die Seite neu lädt, muss Dark Mode weiterhin aktiv sein.

Aktuell ist diese Persistenz offenbar regressiert.

---

# Theme Persistence – Sollverhalten

Beim Umschalten:

```text
Light → Dark
```

Auswahl persistent speichern.

Beim nächsten Laden:

```text
gespeicherte Auswahl lesen
→ Theme anwenden
```

Dasselbe gilt für Light Mode.

---

# Speicherstrategie

Die vorhandene Theme-Persistenz wiederverwenden.

Wenn bereits `localStorage` genutzt wird:

```text
localStorage
```

weiterverwenden.

Keine parallele zweite Theme-Persistenz einführen.

Codex muss bestehenden Storage-Key und bestehende Fallbacklogik prüfen.

---

# Storage-Fehlerrobustheit

Safari iOS 9 kann bei Storage-Zugriffen in bestimmten Modi Fehler werfen.

Daher:

- try/catch beziehungsweise bestehende sichere Wrapper beibehalten
- kein JS-Abbruch
- Default-Theme bei fehlendem Storage
- Toggle für aktuelle Session weiterhin nutzbar

---

# Theme möglichst früh anwenden

Gespeichertes Theme soll möglichst früh beim Laden angewendet werden, damit nicht sichtbar kurz Light Mode erscheint und danach Dark Mode.

Dabei:

- CSP nicht unnötig aufweichen
- keine unsichere neue Inline-Skript-Lösung
- bestehende Theme-Initialisierung reparieren

---

# Theme Scope

Persistiertes Legacy-Theme mindestens für:

```text
/
/d/:dashboardId
/system/summary
/system/errors
```

Admin-Theme darf separat bleiben.

---

# Admin-Layouteditor

Der Editor muss weiterhin:

- feines Raster
- Drag
- Resize
- Mindestgrößen
- Kollisionen
- Bounds

korrekt unterstützen.

Versuch unter Mindestgröße:
- lokal verhindern
- Backend validiert zusätzlich

---

# Backend-Validierung

Backend bleibt finale Autorität.

Prüfen:

- Spaltenzahl
- x/y/w/h Integer
- Bounds
- Kollisionen
- Mindestgröße je Widgettyp
- bekannte Widget-ID
- bekanntes Profil

Keine CSS-Injection und keine beliebigen Stylewerte.

---

# Tests – Identity

1. Compact Sensor zeigt Wert
2. Compact Sensor zeigt Identität
3. Compact Binary zeigt Status
4. Compact Binary zeigt Identität
5. Compact Light zeigt Status
6. Compact Light zeigt Identität
7. Compact Light zeigt Control
8. Compact Climate zeigt Identität
9. Compact Climate zeigt Isttemperatur
10. Compact Climate zeigt Solltemperatur
11. Compact Climate zeigt Minus
12. Compact Climate zeigt Plus
13. langer Titel zerstört Compact nicht
14. Identity wird nicht pauschal versteckt
15. fehlender expliziter Titel hat Fallback

---

# Tests – Proportionale Geometrie

16. Row Height wird aus realer Breite abgeleitet
17. Portrait verwendet passende Geometrie
18. Landscape verwendet passende Geometrie
19. 1×1 Card ist nicht unbrauchbar flach
20. 2×1 Card ist proportional breiter
21. 1×2 Card ist proportional höher
22. Gutters werden berücksichtigt
23. Mindesthöhe wird eingehalten
24. Orientation Change berechnet neu
25. State Refresh berechnet Geometrie nicht unnötig neu
26. kein horizontaler Overflow

---

# Tests – Presentation Modes

27. Presentation Mode berücksichtigt effektive Fläche
28. zu kleine Fläche wählt keinen unpassenden Modus
29. Climate unter Minimalfläche wird verhindert
30. Sensor Compact bleibt identifizierbar
31. Binary Compact bleibt identifizierbar
32. Light Compact bleibt identifizierbar
33. Climate Compact bleibt vollständig bedienbar

---

# Tests – Dark Mode

34. Default Theme lädt
35. Dark Mode aktivierbar
36. Dark Mode persistent gespeichert
37. Reload stellt Dark Mode wieder her
38. Light Mode persistent gespeichert
39. Reload stellt Light Mode wieder her
40. Storage-Fehler führt nicht zu JS-Abbruch
41. `/` übernimmt gespeichertes Theme
42. `/d/:dashboardId` übernimmt gespeichertes Theme
43. `/system/summary` übernimmt gespeichertes Theme
44. `/system/errors` übernimmt gespeichertes Theme
45. Theme-Persistenz verändert keine Admin-Authentifizierung

---

# Regression

46. Sprint-19-Summary funktioniert
47. Sprint-18-Error-Shell funktioniert
48. User-Dashboard-Raster funktioniert
49. Drag-and-drop funktioniert
50. Resize funktioniert
51. Config Store funktioniert
52. Admin funktioniert
53. Climate-Steuerung funktioniert
54. Light-Steuerung funktioniert
55. Write-Allowlists unverändert
56. HA-Token Backend-only
57. Legacy-JavaScript ES5-kompatibel

---

# Manuelle Abnahme – iPad mini

## Kleinste erlaubte Sensor-Card
Mindestens:

```text
Icon
Value
Raum/Titel
```

oder gleichwertige kompakte Darstellung.

## Kleinste Binary-Card
Mindestens:

```text
Status
Raum/Titel
```

## Kleinste Light-Card
Mindestens:

```text
Status
Raum/Titel
Control
```

## Kleinste Climate-Card
Mindestens:

```text
Raum/Titel
Ist
Soll
-
+
```

---

# Manuelle Abnahme – Proportionen

Portrait und Landscape prüfen:

```text
1×1
2×1
3×1
1×2
2×2
```

Ziel:
- nachvollziehbare Proportionen
- keine extrem flachen Cards
- keine unnötig hohen Cards
- Fläche wird sinnvoll genutzt

---

# Manuelle Abnahme – Theme

Auf dem iPad:

1. Seite laden
2. Dark Mode aktivieren
3. Seite neu laden
4. Dark Mode muss weiterhin aktiv sein
5. Browser vollständig schließen
6. Seite erneut öffnen
7. Dark Mode bleibt aktiv, sofern Storage verfügbar
8. dasselbe mit Light Mode testen

---

# Keine globale Inhalts-Skalierung

Weiterhin keine Komplettlösung via:

```css
transform: scale(...)
zoom: ...
```

Inhalte reagieren über Layout, Typografie und Informationshierarchie.

---

# Performance

Proportionale Geometrie nur neu berechnen bei:

- initialem Render
- Orientation Change
- relevantem Resize
- Layoutwechsel

Nicht bei jedem Polling-Zyklus.

---

# System-Dashboards

Sprint 17.2 darf Sprint 18/19 fachlich nicht umbauen.

`/system/summary` und `/system/errors` bleiben feste Systemansichten und werden nicht in das User-Grid aufgenommen.

Nur gemeinsame Theme-/Basis-CSS-Regressionen reparieren.

---

# Voraussichtlich betroffene Dateien

Codex muss den realen Stand nach Sprint 19 prüfen.

Voraussichtlich:

```text
src/public/css/style.css
src/public/js/core/theme.js
src/public/js/core/dashboard.js
src/public/js/core/widget.js
src/public/js/widgets/sensor.js
src/public/js/widgets/binary.js
src/public/js/widgets/light.js
src/public/js/widgets/climate.js
src/services/layout.js
src/admin/js/layout.js
test/
README.md
docs/PROJECT_STATUS.md
docs/SPRINT_ROADMAP.md
```

---

# Wartbarkeit

Bevorzugte zentrale Funktionen:

```text
calculateGridGeometry(...)
getCardPresentationMode(...)
getCardIdentity(...)
```

Keine verstreuten widersprüchlichen Sonderregeln pro Route.

---

# Dokumentation

Nach Umsetzung aktualisieren:

```text
README.md
docs/PROJECT_STATUS.md
docs/SPRINT_ROADMAP.md
```

Dokumentieren:

- Compact Card Identity Contract
- proportionale Row-Height-Berechnung
- Presentation-Mode-Regeln
- Theme-Persistenz
- iOS-9-Einschränkungen

---

# Nicht-Ziele

Nicht Bestandteil von Sprint 17.2:

- neue Summary-Fachregeln
- Error-Dashboard-Fachlogik
- Repairs
- Matter
- Registry-Enrichment
- neue Schreibaktionen
- Home Assistant App
- HACS
- freie Pixelpositionierung
- CSS Grid
- Container Queries

---

# Definition of Done

Sprint 17.2 ist abgeschlossen, wenn:

- jede Compact Card eine eindeutige Identität zeigt
- Sensor Compact mindestens Wert + Identität zeigt
- Binary Compact mindestens Status + Identität zeigt
- Light Compact Identität + Status + Control zeigt
- Climate Compact Identität + Ist + Soll + Plus/Minus zeigt
- Cards nicht mehr unproportional flach wirken
- Row Height sinnvoll aus realer Rasterbreite abgeleitet wird
- Portrait und Landscape proportional funktionieren
- Presentation Modes zur realen verfügbaren Fläche passen
- Dark Mode nach Reload erhalten bleibt
- Light Mode nach Reload erhalten bleibt
- Storage-Fehler keine Seite zerstören
- `/system/summary` weiterhin funktioniert
- `/system/errors` weiterhin funktioniert
- Drag/Resize weiterhin funktionieren
- Write-Allowlists unverändert bleiben
- iOS-9-/ES5-Kompatibilität erhalten bleibt
- alle Tests grün sind
- `docs/PROJECT_STATUS.md` aktualisiert wurde

---

# Erwartetes Codex-Ergebnis

Codex soll berichten:

1. Startcommit
2. tatsächlicher Sprint-19-Status
3. geänderte Dateien
4. Identity-Fallback-Regeln
5. Compact-Darstellung je Widgettyp
6. alte Row-Height-Logik
7. neue proportionale Geometrieformel
8. Portrait-/Landscape-Verhalten
9. Presentation-Mode-Regeln
10. Theme-Storage-Key
11. Theme-Initialisierung
12. Testanzahl und Ergebnis
13. Asset-Cache-Version
14. iPad-Abnahme
15. Dark-Mode-Reload-Test
16. Summary-Regression
17. Error-Regression
18. verbleibende Einschränkungen
19. Commit-Vorschlag
20. Deploymentbefehle

---

# Codex-Prompt

```text
Read:

- AGENTS.md
- README.md
- docs/CODEX_HANDOFF.md
- docs/SPRINT_ROADMAP.md
- docs/PROJECT_STATUS.md
- docs/sprints/SPRINT-17.md
- docs/sprints/SPRINT-17.1.md
- docs/sprints/SPRINT-18.md
- docs/sprints/SPRINT-19.md
- docs/sprints/SPRINT-17.2.md

Sprint 19 is implemented before this corrective sprint.
Inspect the actual completed Sprint 19 repository state first.

Implement Sprint 17.2 exactly as specified in docs/sprints/SPRINT-17.2.md.

Fix three concrete UX regressions:

1. Compact cards must never lose their identity.
2. Card height must be visually proportional to card width/grid geometry.
3. The selected Dark/Light theme must survive a page reload.

For compact cards preserve at least:

Sensor:
- value
- identity/title/room

Binary:
- state
- identity/title/room

Light:
- state
- identity/title/room
- control

Climate:
- identity/title/room
- current temperature
- target temperature
- minus
- plus

Use a small identity line rather than removing all identifying text.

Do not solve compact rendering using global CSS transform/zoom.

Refine grid geometry so row height is derived from actual available column
width/container width, with a centrally defined proportional factor and
minimum usable height.

Keep touch targets around 44x44 pixels where required.

Repair the existing theme persistence instead of introducing a parallel theme
system. Reuse the existing storage key/strategy where possible.

Dark Mode must remain Dark after reload.
Light Mode must remain Light after reload.

Keep Storage access resilient for Safari on iOS 9.

Preserve all existing Home Assistant security boundaries.

Do not change write allowlists or add any new write capabilities.

Keep the wall-display fully compatible with Safari on iOS 9 and ECMAScript 5.

Do not modify the functional Summary/Error System Dashboard architecture.
Run regression tests for /system/summary and /system/errors.

Run the complete test suite and all required syntax checks.

Manually verify the smallest allowed card for each widget type on the iPad
mini in portrait and landscape, and verify theme persistence across reloads.

Update docs/PROJECT_STATUS.md when finished.

Do not commit or push unless explicitly instructed.
```
