# Sprint 17.1 – Grid Refinement + Responsive Card Content

## Status
Planned

## Einordnung
Sprint 17.1 ist ein gezielter Korrektursprint für die in Sprint 16/17 eingeführten Kachelgrößen und Rasterlayouts. Er wird **nach Abschluss von Sprint 18** umgesetzt, damit die laufende Sprint-18-Implementierung nicht vermischt wird.

Reihenfolge:

```text
Sprint 17
Sprint 18 – aktuell in Umsetzung
Sprint 17.1 – Grid Refinement + Responsive Card Content
Sprint 19 – Summary Dashboard MVP
```

Sprint 17.1 darf die funktionale System-Dashboard-Architektur aus Sprint 18 nicht verändern.

---

# Ausgangsprobleme

## 1. Raster zu grob
Das aktuelle Raster erlaubt Drag-and-drop und Resize, ist aber zu grob abgestuft. Beispielhaft wurden 3 Spalten in Portrait und 6 Spalten in Landscape verwendet.

## 2. Karteninhalt passt sich kleinen Cards nicht an
Cards können verkleinert werden, aber Text, Icons, Werte und Controls skalieren beziehungsweise verdichten sich nicht ausreichend. Dadurch werden Inhalte abgeschnitten oder überlagert.

Verbindlicher Grundsatz:

> Jede vom Editor erlaubte Kartengröße muss vollständig und sinnvoll darstellbar sein. Wenn ein Widgettyp eine bestimmte Größe nicht sinnvoll unterstützt, muss diese Größe im Editor und Backend verhindert werden.

---

# Verbindliche Grundsätze

## Sicherheit
- Home-Assistant-Token ausschließlich im Backend
- keine direkte Browser-Verbindung zu Home Assistant
- keine neuen Schreibendpunkte
- keine Änderung der Write-Allowlists
- Sichtbarkeit und Layout erzeugen keine Schreibrechte
- Admin-Token und HA-Token bleiben getrennt
- keine Secrets in Browser, Logs oder Repository

## Legacy-Kompatibilität
Wall-Display weiterhin kompatibel mit:
- Apple iPad mini 1
- iOS 9.3.5
- Safari iOS 9
- ECMAScript 5

Im Legacy-Frontend nicht verwenden:
- `let`
- `const`
- arrow functions
- template literals
- classes
- `fetch`
- `Promise`
- `async` / `await`
- optional chaining
- nullish coalescing
- CSS Grid
- Flexbox `gap`
- ResizeObserver
- Container Queries

Admin-UI darf moderne Browsertechnologie verwenden.

---

# Ziel

Sprint 17.1 führt zwei Verbesserungen ein:

1. **Feineres Raster**
2. **Responsive Card Content**

Architektur:

```text
Grid Geometry
x / y / w / h
```

bestimmt den verfügbaren Platz.

```text
Presentation Mode
compact / normal / expanded
```

bestimmt, wie Inhalte innerhalb dieses Platzes dargestellt werden.

---

# Teil A – Grid Refinement

## Bevorzugte neue Rasterung

```text
Portrait:   6 Spalten
Landscape: 12 Spalten
```

Codex muss zuerst die tatsächlich implementierten Werte aus Sprint 17 prüfen. Wenn andere Werte vorliegen, basiert die Migration auf dem realen Stand.

## Motivation
6/12 bietet:
- feinere Größenänderungen
- feinere Positionierung
- weiterhin überschaubare Komplexität
- einfache Migration bei Verdopplung von 3→6 und 6→12
- gute Basis für kleine und mittlere Cards

## Migration bestehender Layouts
Wenn die horizontale Auflösung verdoppelt wird:

```text
x_neu = x_alt * 2
w_neu = w_alt * 2
```

`y` und `h` bleiben unverändert, sofern die vertikale Rasterauflösung nicht verändert wird.

Beispiel:

```json
Alt:
{"x":1,"y":0,"w":1,"h":1}

Neu:
{"x":2,"y":0,"w":2,"h":1}
```

## Anforderungen
- Migration deterministisch
- keine Widget-ID ändern
- keine Dashboard-ID ändern
- bestehende Layouts optisch möglichst erhalten
- keine Kollisionen nach Migration
- Bounds erneut validieren
- bereits migrierte Config nicht doppelt skalieren
- bestehende Config-Migrationsarchitektur verwenden

---

# Optional feinere vertikale Rasterung

Codex soll prüfen, ob die Row-Height aus Sprint 17 ebenfalls zu grob ist.

Eine Änderung ist erlaubt, wenn:
- sie sauber migriert wird
- Touchziele erhalten bleiben
- Inhalte nicht abgeschnitten werden
- Layout deterministisch bleibt

Keine willkürliche Änderung ohne Migration.

---

# Teil B – Responsive Card Content

## Keine globale Skalierung
Nicht als Hauptlösung verwenden:

```css
transform: scale(...)
zoom: ...
```

Stattdessen muss das interne Widgetlayout abhängig von verfügbarer Fläche umgebaut werden.

## Presentation Modes
Mindestens:

```text
compact
normal
expanded
```

Optional `micro` nur, wenn ein Widgettyp wirklich sinnvoll so klein darstellbar ist.

## Ableitung
Presentation Mode wird aus mindestens diesen Faktoren bestimmt:

```text
widget type
w
h
```

Beispielhaft ES5-kompatibel:

```javascript
function getCardPresentationMode(widgetType, width, height) {
    if (widgetType === "sensor" && width <= 2 && height <= 1) {
        return "compact";
    }

    if (width >= 5 || height >= 2) {
        return "expanded";
    }

    return "normal";
}
```

Die realen Grenzwerte müssen anhand des tatsächlich implementierten Rasters festgelegt werden.

## CSS-Klassen
Bevorzugt:

```text
card-presentation-compact
card-presentation-normal
card-presentation-expanded
```

Keine unvalidierten dynamischen CSS-Klassen.

---

# Responsive Inhalt statt Abschneiden

Nicht akzeptabel:

```text
kleine Card
+ gleicher großer Inhalt
+ overflow:hidden
```

Essenzielle Informationen müssen tatsächlich neu angeordnet, verdichtet oder in ihrer visuellen Hierarchie angepasst werden.

`overflow: hidden` darf nicht verwendet werden, um unpassende Widget-Inhalte einfach zu kaschieren.

---

# Widget-spezifische Darstellungslogik

Mindestens für:
- sensor
- binary
- light
- climate

Weitere tatsächlich vorhandene Widgettypen sind zu prüfen.

---

# Sensor Widget

## Expanded
```text
Badezimmer
Temperatur

[ großes Icon ]
21,8 °C
```

## Normal
```text
Badezimmer
🌡 21,8 °C
```

## Compact
```text
🌡 21,8°
```

oder eine gleichwertige kompakte Variante.

## Anforderungen
- Messwert bleibt primär
- Einheit sinnvoll verdichten
- redundante Untertitel in Compact ausblendbar
- Icon kleiner
- keine abgeschnittenen Werte
- lange Namen sinnvoll kürzen/ausblenden

---

# Binary Widget

## Expanded
```text
Fenster Küche rechts
[ großes Icon ]
OFFEN
```

## Normal
```text
Fenster Küche
🪟 OFFEN
```

## Compact
```text
🪟 OFFEN
```

## Anforderungen
- Status bleibt eindeutig
- Status nicht nur über Farbe
- unnötige Untertitel dürfen in Compact entfallen
- keine abgeschnittenen Zustände

---

# Light Widget

## Expanded
```text
Esszimmer Licht
[ Icon ]
AN
[ Schalter ]
```

## Normal
```text
💡 Esszimmer
AN       [Schalter]
```

## Compact
Eine kompakte, aber vollständig bedienbare Variante.

## Anforderungen
- bestehende Light-Steuerlogik unverändert
- Control mindestens ca. 44×44 px
- Status sichtbar
- keine Text-/Control-Überlappung
- keine automatische Änderung des Bedienkonzepts auf „ganze Card klickbar“, sofern nicht bereits bewusst vorgesehen

---

# Climate Widget

Climate benötigt besondere Mindestgrößen.

## Grundsatz
Climate darf nicht kleiner werden, als es Plus/Minus, Ist- und Solltemperatur ergonomisch zulassen.

## Expanded
```text
Esszimmer Heizung
Heizen
Ist: 21,8 °C

[ - ] 22,5 °C [ + ]
```

## Normal
```text
Esszimmer
21,8°  Heizen
[ - ] 22,5° [ + ]
```

## Compact
```text
🔥 21,8°
[ - ] 22,5° [ + ]
```

oder eine gleichwertige, getestete Variante.

## Anforderungen
- Plus/Minus weiterhin exakt zentriert
- Touchziele mindestens ca. 44×44 px
- Isttemperatur sichtbar
- Solltemperatur sichtbar
- HVAC-Text darf in Compact gekürzt/verdichtet werden
- kein abgeschnittener Text
- keine überlappenden Controls
- optimistische Update-Logik unverändert
- Refreshschutz unverändert
- Climate-Allowlist unverändert

---

# Mindestgrößen pro Widgettyp

Der Editor darf unbrauchbare Größen nicht zulassen.

Beispielhafte Orientierung bei 6/12 Raster:

```text
sensor:
  minW: 2
  minH: 1

binary:
  minW: 2
  minH: 1

light:
  minW: 2
  minH: 1

climate:
  minW: 3
  minH: 1
```

Die realen Werte müssen visuell geprüft und ggf. angepasst werden.

Mindestgrößen dürfen profilabhängig sein, wenn erforderlich.

---

# Admin-Layouteditor

Der Editor muss das feinere Raster vollständig unterstützen:

- Drag-Snapping
- Resize-Snapping
- feinere Rasterlinien
- Portrait
- Landscape
- Mindestgrößen
- Kollisionserkennung
- Bounds

Beim Versuch, unter die Mindestgröße zu verkleinern:
- Resize an Grenze stoppen
- keine ungültige Konfiguration erzeugen
- Backend validiert zusätzlich

Optional kann der Editor Mindestgrößen anzeigen.

---

# Verhältnis zu Sprint-16-Presets

Bestehende Presets:

```text
compact
normal
wide
tall
large
```

dürfen weiterhin als Initialgrößen/Fallbacks dienen.

Wichtig: zwei Konzepte klar trennen.

Bevorzugte Terminologie:

```text
sizePreset
```

für persistente Presetgröße und

```text
presentationMode
```

für die zur Laufzeit aus `w/h/type` abgeleitete Darstellung.

Presentation Mode soll nicht unnötig persistent gespeichert werden.

---

# Text und Icons

## Text
Lange Titel:
- kürzen
- Ellipsis
- einzeilig
- in Compact ggf. ausblenden

Kerninformation darf nicht verloren gehen.

## Icons
Icon-Größe abhängig vom Presentation Mode:
- compact → klein
- normal → mittel
- expanded → groß

Keine festen großen SVG-Abmessungen, die kleine Cards sprengen.

## Schrift
Darf abhängig vom Modus angepasst werden, muss auf dem iPad lesbar bleiben.

---

# Touchziele

Interaktive Controls bleiben mindestens ungefähr:

```text
44 × 44 px
```

Falls eine Card diese Controls nicht aufnehmen kann, muss ihre Mindestgröße größer sein.

---

# Legacy Renderer

Presentation Mode neu bestimmen bei:
- Dashboard-Laden
- Layoutprofil-Wechsel
- Orientation Change

Nicht bei jedem State-Refresh neu berechnen, wenn `w/h/type` unverändert sind.

Bei Orientation Change:
- Profil wechseln
- Geometrie neu anwenden
- Presentation Mode neu bestimmen
- State nicht unnötig neu laden

---

# Auto-Placement

Auto-Placement muss das feinere Raster unterstützen.

Beispielhafte Mapping-Idee für Landscape 12 Spalten:

```text
compact -> 2x1
normal  -> 3x1
wide    -> 6x1
tall    -> 3x2
large   -> 6x2
```

Nur Orientierung. Die realen Werte müssen zum tatsächlichen Design passen.

---

# System-Dashboards aus Sprint 18

Sprint 17.1 darf nicht:
- `/system/summary` in das freie Grid integrieren
- `/system/errors` in das freie Grid integrieren
- deren fachliche Architektur verändern

Regressionstests für beide Routen sind Pflicht.

---

# Backend-Validierung

Backend bleibt finale Autorität und prüft:
- Spaltenzahl
- `x/y/w/h` Integer
- Bounds
- Kollisionen
- Mindestgröße je Widgettyp
- bekannte Widget-ID
- bekanntes Layoutprofil

Keine CSS-Injection und keine beliebigen Stylewerte.

---

# Persistenz

Nach Migration und Speichern:
- neue Rasterdaten persistent
- Neustart erhält Layout
- Backupmechanismus bleibt
- Atomic Write bleibt
- Dashboardduplikate funktionieren
- Widget-ID-Remapping bleibt korrekt

---

# Tests

## Rastermigration
1. Portraitlayout migriert
2. Landscapelayout migriert
3. `x` korrekt skaliert
4. `w` korrekt skaliert
5. `y/h` bleiben korrekt, falls vertikale Auflösung unverändert
6. keine Kollisionen
7. Bounds gültig
8. IDs unverändert
9. Migration deterministisch
10. keine Doppel-Migration

## Presentation Mode
11. Sensor klein → compact
12. Sensor mittel → normal
13. Sensor groß → expanded
14. Binary klein → compact
15. Light klein → gültiger kompakter Modus
16. Climate unter Mindestgröße verhindert
17. Climate Mindestgröße vollständig nutzbar
18. Climate groß → expanded
19. Orientation Change berechnet Modus neu
20. State Refresh verursacht keine unnötige Neuberechnung

## Inhalte
21. Sensorwert in Compact nicht abgeschnitten
22. Einheit sinnvoll sichtbar
23. Binary-Status sichtbar
24. Light-Control sichtbar
25. Climate Isttemperatur sichtbar
26. Climate Solltemperatur sichtbar
27. Climate Plus sichtbar
28. Climate Minus sichtbar
29. Plus/Minus zentriert
30. lange Titel zerstören Compact nicht
31. Icons skalieren passend
32. kein horizontaler Overflow

## Mindestgrößen
33. Sensor nicht unter Minimum
34. Binary nicht unter Minimum
35. Light nicht unter Minimum
36. Climate nicht unter Minimum
37. Backend lehnt ungültige Geometrie ab
38. Admin verhindert Resize lokal

## Admin
39. feineres Portraitraster sichtbar
40. feineres Landscaperaster sichtbar
41. Drag snappt fein
42. Resize snappt fein
43. Kollisionserkennung funktioniert
44. Speichern funktioniert
45. Verwerfen funktioniert
46. Dashboard-Duplikation funktioniert

## Regression
47. Climate-Steuerung funktioniert
48. Light-Steuerung funktioniert
49. Multi-Dashboard funktioniert
50. Admin funktioniert
51. Config Store funktioniert
52. `/system/summary` aus Sprint 18 funktioniert
53. `/system/errors` aus Sprint 18 funktioniert
54. System-Snapshot-API unverändert
55. Write-Allowlists unverändert
56. HA-Token Backend-only
57. Legacy-Frontend ES5-kompatibel

---

# Manuelle Abnahme – iPad mini

Zwingend in Portrait und Landscape prüfen:

- kleinster erlaubter Sensor
- kleinster erlaubter Binary Sensor
- kleinster erlaubter Light-Widget
- kleinster erlaubter Climate-Widget
- Normalgrößen
- große Größen
- Rotation Portrait → Landscape → Portrait

Keine:
- Überlappung
- abgeschnittenen essenziellen Inhalte
- unsichtbaren Controls
- horizontalen Scrollbars
- falschen Presentation Modes

---

# Visuelle Akzeptanz

## Sensor Compact
- deutlich kleiner als Normal
- Wert sofort lesbar
- Icon passend klein
- keine große Leerfläche
- kein übergroßer Titelblock

## Climate Compact
- Isttemperatur sichtbar
- Solltemperatur sichtbar
- `-` zentriert
- `+` zentriert
- beide Touchflächen bedienbar
- kein abgeschnittener Text
- klar kompakter als Normal

---

# Performance

Feineres Raster darf nicht zu einem DOM-Element pro Rasterzelle führen.

Nicht:

```text
12 Spalten × 50 Zeilen = 600 leere Grid-DIVs
```

im Legacy-Wall-Display.

Der Legacy-Renderer berechnet Positionen mathematisch; DOM besteht primär aus Cards.

---

# Voraussichtlich betroffene Dateien

Codex muss den realen Stand nach Sprint 18 prüfen.

Voraussichtlich:

```text
src/services/layout.js
src/config/
src/services/config-store.js
src/routes/admin.js
src/public/css/style.css
src/public/js/core/dashboard.js
src/public/js/core/widget.js
src/public/js/widgets/sensor.js
src/public/js/widgets/binary.js
src/public/js/widgets/light.js
src/public/js/widgets/climate.js
src/admin/js/layout.js
src/admin/
test/
README.md
docs/PROJECT_STATUS.md
docs/SPRINT_ROADMAP.md
```

Keine unnötige Logik in `app.js` oder Routern anhäufen.

---

# Wartbarkeit

Bevorzugt zentrale Definition der Widget-Layoutgrenzen, z. B.:

```javascript
{
    sensor: { minW: 2, minH: 1 },
    binary: { minW: 2, minH: 1 },
    light: { minW: 2, minH: 1 },
    climate: { minW: 3, minH: 1 }
}
```

Backend und Admin sollen dieselben fachlichen Grenzen verwenden, soweit die bestehende Architektur dies sauber erlaubt.

---

# Dokumentation

Nach Umsetzung aktualisieren:

```text
README.md
docs/PROJECT_STATUS.md
docs/SPRINT_ROADMAP.md
```

Dokumentieren:
- neue Rasterauflösung
- Migration
- Mindestgrößen
- Presentation Modes
- Unterschied Size Preset / Presentation Mode
- iOS-9-Beschränkungen

---

# Nicht-Ziele

Nicht Bestandteil von Sprint 17.1:
- freie Pixelpositionierung
- CSS Grid
- Container Queries
- ResizeObserver im Legacy-Frontend
- Summary-Business-Logik
- Error-Business-Logik
- Repairs
- Matter
- Registry-Enrichment
- Home Assistant App
- HACS
- neue Schreibaktionen
- neue steuerbare Domains

---

# Definition of Done

Sprint 17.1 ist abgeschlossen, wenn:
- Raster deutlich feiner ist
- bestehende Layouts korrekt migriert werden
- Drag/Resize auf feinem Raster funktionieren
- jeder Widgettyp Mindestgrößen besitzt
- Editor und Backend zu kleine Größen verhindern
- Sensor/Binary/Light/Climate kleine Cards sinnvoll darstellen
- Climate Plus/Minus weiterhin zentriert und bedienbar sind
- Touchziele ausreichend groß bleiben
- Icons passend skalieren
- lange Texte Layout nicht zerstören
- essenzielle Daten nicht durch Overflow kaschiert werden
- Presentation Mode aus Geometrie + Widgettyp abgeleitet wird
- Orientation Change korrekt funktioniert
- Sprint-18-System-Dashboards nicht beschädigt werden
- Write-Allowlists unverändert bleiben
- iOS-9-/ES5-Kompatibilität erhalten bleibt
- alle Tests grün sind
- `docs/PROJECT_STATUS.md` aktualisiert wurde

---

# Erwartetes Codex-Ergebnis

Codex berichtet:
1. Startcommit
2. tatsächlicher Sprint-18-Status
3. alte Rasterauflösung
4. neue Rasterauflösung
5. Migrationsformel
6. Schema-Version vor/nach Migration
7. Mindestgröße je Widgettyp
8. Presentation-Mode-Regeln
9. Änderungen je Widgettyp
10. Admin-Editor-Änderungen
11. Backendvalidierung
12. Legacy-Renderer-Änderungen
13. Testanzahl und Ergebnis
14. Asset-Cache-Version
15. manuelle iPad-Abnahme
16. Regression `/system/summary`
17. Regression `/system/errors`
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
- docs/sprints/SPRINT-16.md
- docs/sprints/SPRINT-17.md
- docs/sprints/SPRINT-18.md
- docs/sprints/SPRINT-17.1.md

Sprint 18 is implemented before this corrective sprint.
Inspect the actual completed Sprint 18 repository state before making changes.

Implement Sprint 17.1 exactly as specified in docs/sprints/SPRINT-17.1.md.

Fix two concrete problems:

1. The Sprint 17 layout grid is too coarse.
2. Small cards do not adapt their internal content to their available size.

Refine the grid, preferably from 3/6 columns to 6/12 columns if that matches
the actual Sprint 17 implementation.

Migrate existing layouts deterministically so their visual placement is
preserved as closely as possible.

Introduce responsive widget presentation modes derived from:

- widget type,
- grid width,
- grid height.

At minimum support:

- compact,
- normal,
- expanded.

Do not solve the problem with global CSS transform/zoom.

Implement widget-specific responsive layouts for:

- sensor,
- binary,
- light,
- climate.

Every size allowed by the Admin layout editor must be fully usable in the
legacy wall display.

If a widget cannot be displayed correctly below a certain size, enforce a
minimum grid size in both Admin UI and backend validation.

Climate controls must retain approximately 44x44 pixel touch targets, and plus
and minus must remain centered.

Preserve all existing Home Assistant security boundaries.

Do not change write allowlists or add any new write capabilities.

Keep the wall-display frontend fully compatible with Safari on iOS 9 and
ECMAScript 5.

Do not use:

- CSS Grid,
- container queries,
- ResizeObserver in the legacy frontend,
- fetch,
- Promise,
- modern JavaScript syntax in the legacy frontend.

Do not modify the functional System Dashboard architecture introduced by
Sprint 18. Run regression tests for /system/summary and /system/errors.

Run the complete test suite and all required syntax checks.

Manually verify the smallest allowed card size for every widget type on the
iPad mini in portrait and landscape.

Update docs/PROJECT_STATUS.md when finished.

At the end report:

- old and new grid dimensions,
- migration behavior,
- minimum widget sizes,
- presentation-mode rules,
- widget-specific UI changes,
- test results,
- cache version,
- iPad visual verification,
- System Dashboard regression results.

Do not commit or push unless explicitly instructed.
```
