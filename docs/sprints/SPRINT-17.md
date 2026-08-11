# Sprint 17 – Drag-and-Drop Grid Layout

## Status
Planned

## Abhängigkeit
Sprint 17 setzt Sprint 16 voraus. Codex muss zuerst prüfen, ob Multi-Dashboard, persistente Konfiguration, stabile Widget-IDs, Admin-UI und die Größen-Presets `compact`, `normal`, `wide`, `tall`, `large` tatsächlich vorhanden sind.

## Ziel
Ein grafischer Layouteditor im Admin-UI soll Widgets:
- per Drag-and-drop verschieben,
- an Rasterzellen einrasten,
- innerhalb definierter Grenzen vergrößern/verkleinern,
- ohne Überlappung speichern.

Das Legacy-Wall-Display rendert anschließend dieses Raster weiterhin kompatibel zu Safari unter iOS 9.

## Architekturentscheidung
Keine freie Pixelpositionierung. Gespeichert werden ausschließlich Integer-Rasterwerte:

```json
{
  "x": 0,
  "y": 1,
  "w": 2,
  "h": 1
}
```

Keine beliebigen CSS-Werte und keine überlappenden Kacheln.

## Layoutprofile
Mindestens zwei Profile:

```text
portrait
landscape
```

Bevorzugte Ausgangswerte:

```text
Portrait:  3 Spalten
Landscape: 6 Spalten
```

Codex darf die tatsächlichen Spaltenzahlen anhand des aktuellen iPad-Layouts anpassen.

Beispiel:

```json
{
  "layouts": {
    "portrait": {
      "columns": 3,
      "items": {
        "widget-1": {"x": 0, "y": 0, "w": 3, "h": 1}
      }
    },
    "landscape": {
      "columns": 6,
      "items": {
        "widget-1": {"x": 0, "y": 0, "w": 2, "h": 1}
      }
    }
  }
}
```

Layoutreferenzen müssen stabile Widget-IDs verwenden, nicht Entity-IDs.

## Verhältnis zu Sprint 16
Die Größen-Presets bleiben erhalten und dienen als Default/Fallback für die Erstplatzierung.

Empfohlenes Mapping:

```text
compact -> 1x1
normal  -> 1x1
wide    -> 2x1
tall    -> 1x2
large   -> 2x2
```

Explizite Rasterwerte haben Vorrang.

## Migration
Bestehende Dashboards ohne Rasterlayout müssen deterministisch migriert werden:
- Reihenfolge beibehalten,
- Größen-Presets berücksichtigen,
- keine Kollisionen,
- keine Widget-IDs ändern,
- keine Dashboard-IDs ändern,
- Sichtbarkeit und Inhalte erhalten.

## Auto-Placement
Für fehlende Positionen gilt deterministisch:
1. links nach rechts,
2. nächste freie Zeile,
3. Breite/Höhe berücksichtigen,
4. belegte Zellen überspringen.

Gleiche Eingabe muss dasselbe Ergebnis liefern.

## Validierung
Für sichtbare Layoutitems gilt:

```text
x >= 0
y >= 0
w >= 1
h >= 1
x + w <= columns
```

Zusätzlich:
- nur Integer,
- sinnvolle Maximalwerte,
- keine unbekannten Widget-IDs,
- keine Kollisionen,
- keine unbekannten Layoutprofile.

Ungültige Layoutdaten müssen kontrolliert mit HTTP 400 abgewiesen werden.

## Unsichtbare Widgets
`visible: false` blockiert keine Rasterzellen. Eine alte Position darf gespeichert bleiben. Beim erneuten Sichtbarmachen:
- alte Position verwenden, falls frei,
- sonst Auto-Placement.

## Admin Layout Editor
In der Dashboard-Bearbeitung neuer Bereich:

```text
Layout
[Portrait] [Landscape]
```

Rasterlinien im Admin sichtbar, im Wall-Display unsichtbar.

### Drag-and-drop
- Mausunterstützung,
- moderne Touch-/Pointer-Unterstützung,
- Raster-Snapping,
- Zielposition anzeigen,
- keine Drops außerhalb des Rasters,
- keine Überlappung.

### Resize
Resize-Griff bevorzugt unten rechts:
- nur ganze Rastereinheiten,
- Mindest-/Maximalgröße,
- Bounds beachten,
- Kollisionen verhindern.

### Speichern
Bestehendes Modell aus Sprint 15 beibehalten:

```text
[Speichern] [Verwerfen]
```

Drag/Resize aktualisiert zuerst nur den lokalen Entwurf.

### Accessibility
Zusätzlich zu Drag-and-drop eine Tastatur-/Buttonalternative anbieten, z. B.:

```text
Nach links
Nach rechts
Nach oben
Nach unten
Breiter
Schmaler
Höher
Niedriger
```

## Widget-spezifische Mindestgrößen
Codex soll sinnvolle Mindestgrößen definieren.

Orientierung:

```text
sensor:  minW 1 / minH 1
binary:  minW 1 / minH 1
light:   minW 1 / minH 1
climate: minW 2 im Landscape / minH 1
```

Climate darf nicht so klein werden, dass Plus/Minus oder Zieltemperatur unbrauchbar werden. Interaktive Touchziele bleiben mindestens etwa 44x44 px.

## Dashboard duplizieren
Beim Duplizieren:
- neue Widget-IDs erzeugen,
- Layoutreferenzen auf neue IDs umschreiben,
- Positionen und Größen beibehalten,
- keine alten Widget-IDs im Duplikat.

## Legacy Renderer
Kein CSS Grid.

Bevorzugte Strategie:
- Dashboardcontainer `position: relative`,
- Kacheln `position: absolute`,
- Position/Größe aus validierten Rasterwerten berechnen.

Sinngemäß:

```text
left   = x / columns * 100%
width  = w / columns * 100%
top    = y * rowHeight
height = h * rowHeight
```

Gutters/Margins müssen korrekt berücksichtigt werden.

Die Containerhöhe muss aus `max(y + h)` berechnet werden.

## Portrait/Landscape-Erkennung
Legacy-Frontend weiterhin ES5-kompatibel. Orientierung über vorhandene kompatible Browserlogik bestimmen, z. B. `window.innerWidth` und `window.innerHeight`.

Bei Rotation:
- Profil neu bestimmen,
- Layout neu anwenden,
- kein Datenverlust,
- Refreshlogik nicht beschädigen.

## Fallback
Fehlt das Layout für ein Profil:
- nicht blind inkompatible Koordinaten des anderen Profils übernehmen,
- sichere Auto-Placement-Logik verwenden,
- Größen-Presets als Basis nutzen.

## Public API
Die öffentliche Dashboardkonfiguration darf validierte Rasterdaten enthalten, aber keine Admin-Daten oder Secrets.

## Admin API
Bestehende Admin-API um Layoutdaten erweitern. Keine parallele API schaffen, wenn die vorhandene Konfigurations-API genügt.

Backend validiert:
- Profile,
- columns,
- Widgetreferenzen,
- Bounds,
- Kollisionen,
- Mindest-/Maximalgrößen.

## Sicherheit
Layoutdaten dürfen niemals:
- Write-Allowlists ändern,
- Home-Assistant-Services freischalten,
- beliebige CSS-Strings speichern,
- HTML oder JavaScript speichern.

Nur bekannte Profile und validierte Integerwerte.

## Nicht-Ziele
Nicht implementieren:
- freie Pixelpositionierung,
- überlappende Widgets,
- Rotation/Z-Index,
- CSS Grid im Legacy-Frontend,
- Home-Assistant-App,
- HACS,
- neue steuerbare Domains,
- automatische Änderung von Write-Allowlists,
- Multiuser-Live-Editing.

## Tests
Mindestens ergänzen:

### Migration
1. Sprint-16-Konfiguration ohne Layout migriert
2. Widget-IDs bleiben
3. Dashboard-IDs bleiben
4. Größen-Presets werden gemappt
5. Portraitlayout entsteht
6. Landscapelayout entsteht
7. keine Kollisionen
8. deterministische Ergebnisse

### Validierung
9. negative x/y abweisen
10. w/h = 0 abweisen
11. x+w außerhalb Raster abweisen
12. unbekannte Widget-ID abweisen
13. String statt Integer abweisen
14. Kollision abweisen
15. extreme Werte abweisen

### Auto-Placement
16. erste freie Zelle
17. Wide/Tall/Large korrekt
18. belegte Bereiche überspringen
19. unsichtbare Widgets blockieren nicht

### Admin UI
20. Portrait/ Landscape umschaltbar
21. Drag ändert lokale Position
22. Drop snappt
23. ungültiger Drop verhindert
24. Resize ändert w/h
25. Mindest-/Maximalgrenzen
26. Kollision verhindert
27. Speichern persistiert
28. Verwerfen setzt zurück
29. beforeunload erkennt Änderungen
30. Tastaturalternative funktioniert

### Duplikation
31. neue Widget-IDs
32. Layoutreferenzen remapped
33. Positionen erhalten
34. keine alten IDs

### Legacy Renderer
35. Portraitprofil angewendet
36. Landscapeprofil angewendet
37. Rotation wechselt Profil
38. Containerhöhe korrekt
39. Fallback funktioniert
40. kein horizontaler Overflow
41. Climate bedienbar
42. Light bedienbar

### Sicherheit
43. keine Allowlist-Änderung
44. keine CSS-Injection
45. keine Secrets in Public API

Der komplette bisherige Testsatz muss grün bleiben.

## Manuelle Abnahme
Admin:
- Drag links/rechts/oben/unten,
- Resize,
- Kollision,
- Rastergrenzen,
- Portrait/Landscape,
- Speichern/Verwerfen,
- Dashboard duplizieren.

iPad mini:
- Portrait,
- Landscape,
- Rotation Portrait -> Landscape -> Portrait,
- keine Überlappung,
- kein horizontaler Scroll,
- Climate Plus/Minus,
- Light,
- Sensor/Binary,
- Header/Uhr/Status.

## iOS-9-Regeln
Legacy-Code weiterhin ohne:
- `let`
- `const`
- arrow functions
- template literals
- classes
- `fetch`
- `Promise`
- `async/await`
- optional chaining
- nullish coalescing
- CSS Grid
- Flexbox `gap`

## Wartbarkeit
Rasterlogik nicht in monolithischen Dateien weiter aufblasen.

Bevorzugte neue Module, falls passend:

```text
src/services/layout.js
src/admin/js/layout.js
```

Backend: Validierung + Auto-Placement.
Admin: Editorinteraktion.
Legacy: reine Renderlogik.

## Cache
Wenn Legacy-CSS/JS geändert wird, Asset-Cache-Version in `src/public/index.html` konsistent erhöhen.

## Dokumentation
README sowie `docs/PROJECT_STATUS.md` aktualisieren.
`docs/SPRINT_ROADMAP.md` bei Bedarf anpassen.

## Definition of Done
Sprint 17 ist abgeschlossen, wenn:
- Drag-and-drop funktioniert,
- Raster-Snapping funktioniert,
- Resize funktioniert,
- Portrait- und Landscapelayout gespeichert werden,
- Kollisionen verhindert und backendseitig validiert werden,
- Bounds validiert werden,
- bestehende Größen-Presets als Fallback erhalten bleiben,
- Migration funktioniert,
- neue Widgets deterministisch platziert werden,
- Dashboardduplikate korrekt remapped werden,
- Legacy-Wall-Display das Raster ohne CSS Grid rendert,
- iOS-9-/ES5-Kompatibilität erhalten bleibt,
- Rotation funktioniert,
- Climate/Light unverändert funktionieren,
- keine CSS-Injection möglich ist,
- Write-Allowlists unverändert bleiben,
- alle Tests grün sind,
- `docs/PROJECT_STATUS.md` aktualisiert wurde.

## Erwartetes Codex-Ergebnis
Codex berichtet:
1. Startcommit
2. geprüfter Sprint-16-Status
3. finale Schemaänderung
4. Portrait-/Landscape-Spaltenzahl
5. Auto-Placement-Regeln
6. Kollisionserkennung
7. Mindest-/Maximalgrößen
8. Admin Drag-and-drop
9. Admin Resize
10. Tastaturalternative
11. Legacy-Rendering
12. Orientation-Verhalten
13. Migration
14. Testergebnis
15. Cache-Version
16. manuelle Tests
17. technische Schulden
18. Voraussetzungen für Sprint 18
19. Commit-Vorschlag
20. Deploymentbefehle

## Codex-Prompt

```text
Read:

- AGENTS.md
- README.md
- docs/CODEX_HANDOFF.md
- docs/SPRINT_ROADMAP.md
- docs/PROJECT_STATUS.md
- docs/sprints/SPRINT-15.md
- docs/sprints/SPRINT-16.md
- docs/sprints/SPRINT-17.md

Inspect the actual repository state and verify the completed Sprint 16 implementation first.

Implement Sprint 17 exactly as specified in docs/sprints/SPRINT-17.md.

Introduce a persistent drag-and-drop grid layout with separate portrait and landscape profiles.

Use integer x/y/w/h grid coordinates and stable widget IDs.
Preserve Sprint 16 size presets as migration defaults and fallbacks.

The Admin UI may use modern browser APIs.
The legacy wall-display must remain compatible with Safari on iOS 9 and ECMAScript 5.
Do not use CSS Grid in the legacy wall-display.

Implement:
- grid snapping,
- collision prevention,
- resize handles,
- bounds validation,
- deterministic auto-placement,
- portrait layout,
- landscape layout,
- keyboard-accessible movement/resize alternatives,
- safe schema migration,
- dashboard-duplicate layout remapping.

Do not implement:
- free pixel positioning,
- overlapping tiles,
- arbitrary CSS values,
- Home Assistant App packaging,
- HACS support,
- new writable Home Assistant domains,
- automatic write allowlist changes.

Preserve all existing Home Assistant security boundaries.
Use only local mock Home Assistant services for integration tests.
Run the complete test suite and all required syntax checks.

Manually verify the Admin layout editor and the iPad wall display in portrait, landscape and after rotation.

Update docs/PROJECT_STATUS.md when finished.

Do not commit or push unless explicitly instructed.
```
