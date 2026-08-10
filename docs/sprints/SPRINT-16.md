# Sprint 16 – Configurable Tile Sizes

## Status

Completed

## Abhängigkeit

Sprint 16 setzt die erfolgreiche Umsetzung von Sprint 15 voraus.

Codex muss vor Beginn prüfen, ob tatsächlich vorhanden sind:

- Multi-Dashboard-Unterstützung
- persistente Dashboard-Konfiguration
- stabile Widget-IDs
- Admin-API
- grafische Admin-Oberfläche unter `/admin`
- Widget-Bearbeitung
- persistentes Speichern
- weiterhin getrennte Home-Assistant-Schreib-Allowlisten
- funktionierendes Legacy-Wall-Display unter iOS 9

Falls Sprint 15 nur teilweise umgesetzt wurde, darf Codex keine parallele
zweite Konfigurationslogik einführen.

---

# Ziel

Sprint 16 führt konfigurierbare Kachelgrößen ein.

Ein Administrator soll für jedes Widget über `/admin` eine vordefinierte
Kachelgröße auswählen können.

Die Größen werden persistent gespeichert und im Wall-Display berücksichtigt.

Dieser Sprint verwendet bewusst **Größen-Presets** statt frei definierbarer
Pixel-, Spalten- oder Zeilenwerte.

Damit bleibt das Layout:

- robust,
- iOS-9-kompatibel,
- einfach validierbar,
- einfach administrierbar,
- kompatibel mit dem späteren Drag-and-drop-Raster aus Sprint 17.

---

# Größenmodell

Jedes Widget erhält ein neues Feld:

```text
size
```

Erlaubte Werte:

```text
compact
normal
wide
tall
large
```

## Bedeutung

### `compact`

Für kleine reine Status- oder Sensoranzeigen.

Ziel:

- möglichst wenig Höhe
- normale Breite
- weiterhin gute Lesbarkeit
- keine Reduzierung kritischer Touch-Ziele unter 44 Pixel

### `normal`

Standardgröße.

Entspricht möglichst genau dem aktuellen Verhalten nach Sprint 12.

### `wide`

Breitere Kachel.

Desktop-/Landscape-Ziel:

- ungefähr zwei normale Spalten breit

Auf schmalen Displays:

- automatisch volle verfügbare Breite

### `tall`

Normale Breite mit zusätzlicher vertikaler Fläche.

Geeignet für Widgets, die mehr Statusinformationen benötigen.

### `large`

Breit und höher.

Desktop-/Landscape-Ziel:

- ungefähr zwei normale Spalten breit
- zusätzliche Höhe

---

# Nicht-Ziele

Nicht Bestandteil dieses Sprints:

- kein Drag-and-drop
- keine X-/Y-Koordinaten
- keine frei eingegebene Breite
- keine frei eingegebene Höhe
- keine Pixelwerte pro Widget
- keine frei definierbaren Spalten-Spans
- keine Layout-Handles
- kein Resizing mit Maus oder Touch
- keine getrennten Portrait-/Landscape-Werte
- kein CSS Grid
- kein Masonry-Framework
- keine Home-Assistant-App
- keine HACS-Integration
- keine neuen Widget-Domänen
- keine Änderung der Write-Allowlists
- kein WYSIWYG-Layouteditor

Sprint 17 baut später auf diesem Größenmodell auf.

---

# Konfigurationsschema

Das persistente Widgetmodell wird um `size` erweitert.

Beispiel:

```json
{
  "id": "widget-123",
  "entity": "climate.esszimmer_thermostate",
  "type": "climate",
  "title": "Esszimmer",
  "subtitle": "Heizung",
  "icon": "heating",
  "order": 40,
  "visible": true,
  "size": "wide"
}
```

---

# Schema-Versionierung

Codex muss das aktuelle Konfigurationsschema aus Sprint 14/15 prüfen.

Wenn die Einführung von `size` eine neue Schema-Version erfordert, soll eine
saubere Migration implementiert werden.

Beispiel:

```text
schemaVersion: 1
```

wird zu:

```text
schemaVersion: 2
```

Nur erhöhen, wenn dies zur bestehenden Schema-Strategie passt.

---

# Migration bestehender Widgets

Bestehende Widgets besitzen noch kein `size`.

Diese Widgets müssen automatisch erhalten:

```text
size: "normal"
```

Die Migration darf:

- keine Widget-ID verändern
- keine Entity-ID verändern
- keine Dashboard-ID verändern
- keine Reihenfolge verändern
- keine Sichtbarkeit verändern
- keine Titel oder Icons verändern
- keine Write-Allowlist verändern

---

# Backend-Validierung

Das Backend bleibt finale Autorität.

Erlaubte Werte ausschließlich:

```text
compact
normal
wide
tall
large
```

Nicht erlaubt:

```text
huge
50%
300px
2fr
auto
javascript:...
```

Ungültige Größe:

```text
HTTP 400
```

mit kontrolliertem Fehlercode, beispielsweise:

```text
invalid_widget_size
```

---

# Default

Falls intern aus irgendeinem Grund kein Größenwert vorhanden ist, muss der
Renderer sicher auf:

```text
normal
```

zurückfallen.

Unbekannte Werte dürfen niemals ungefiltert als CSS-Klassen oder Styles
übernommen werden.

---

# Public Dashboard API

Die öffentliche Dashboard-Konfiguration darf das validierte Größen-Preset
enthalten.

Beispiel:

```json
{
  "id": "widget-123",
  "entity": "sensor.badezimmer_temperatur",
  "type": "sensor",
  "title": "Badezimmer",
  "size": "compact"
}
```

Es werden keine frei eingegebenen CSS-Werte ausgeliefert.

---

# Legacy-Frontend

## Ziel

Das iOS-9-kompatible Wall-Display muss die Größe aus der Dashboardkonfiguration
anwenden.

Bevorzugte CSS-Klassen:

```text
card-size-compact
card-size-normal
card-size-wide
card-size-tall
card-size-large
```

Beispiel:

```html
<div class="card card-sensor card-size-compact">
```

---

# Sicherheit der CSS-Klasse

Die Klasse darf nicht einfach aus beliebigem Servertext zusammengesetzt
werden.

Frontend oder Backend müssen gewährleisten, dass ausschließlich die bekannten
Presets verwendet werden.

Bevorzugt:

```javascript
function normalizeCardSize(value) {
    if (
        value === "compact" ||
        value === "wide" ||
        value === "tall" ||
        value === "large"
    ) {
        return value;
    }

    return "normal";
}
```

Frontendcode muss ECMAScript 5 bleiben.

---

# CSS-Strategie

Das Wall-Display darf weiterhin kein CSS Grid verwenden.

Basis bleibt:

```text
Flexbox
```

Erforderliche iOS-9-Präfixe müssen beibehalten oder ergänzt werden.

---

# Verhalten nach Breakpoint

Codex muss die aktuellen Breakpoints zuerst prüfen.

Der bekannte historische Stand verwendet ungefähr:

```text
< 600 px
>= 600 px
>= 900 px
```

Die tatsächlichen Werte im aktuellen Repository sind maßgeblich.

---

# Schmale Displays

Auf schmalen Displays soll die Breite praktisch aller Karten auf die verfügbare
Breite zurückfallen.

Ziel:

```text
compact -> volle Zeilenbreite
normal  -> volle Zeilenbreite
wide    -> volle Zeilenbreite
tall    -> volle Zeilenbreite
large   -> volle Zeilenbreite
```

Unterschiede entstehen dort vor allem über Höhe und interne Kompaktheit.

Keine horizontale Überbreite und kein Scrollen wegen `wide` oder `large`.

---

# Mittlere Displays

Wenn aktuell zwei normale Kacheln pro Zeile vorgesehen sind:

```text
compact -> normale Spaltenbreite
normal  -> normale Spaltenbreite
wide    -> volle Zeilenbreite
tall    -> normale Spaltenbreite
large   -> volle Zeilenbreite
```

---

# Große Displays

Wenn aktuell drei normale Kacheln pro Zeile vorgesehen sind:

```text
compact -> 1 Spalte
normal  -> 1 Spalte
wide    -> ungefähr 2 Spalten
tall    -> 1 Spalte
large   -> ungefähr 2 Spalten
```

Eine einzelne `wide`- oder `large`-Kachel darf nicht durch Rundungsfehler
ungewollt in die nächste Zeile gedrückt werden.

Vorhandene Margin-/Flex-Basis-Berechnungen sind entsprechend zu prüfen.

---

# Höhen

Keine festen Höhen verwenden, wenn Inhalte dadurch abgeschnitten werden
könnten.

Bevorzugt:

```text
min-height
```

statt:

```text
height
```

## `compact`

Soll vorhandene unnötige Mindesthöhen reduzieren.

## `normal`

Soll möglichst dem aktuellen Standard entsprechen.

## `tall`

Soll zusätzliche Mindesthöhe besitzen.

## `large`

Soll zusätzliche Mindesthöhe und breite Darstellung kombinieren.

---

# Widget-spezifische Grenzen

Nicht jedes Größen-Preset muss für jeden Widget-Typ gleich sinnvoll sein.

Sprint 16 soll dennoch möglichst ein einheitliches Modell verwenden.

Codex darf sinnvolle typabhängige Mindestwerte definieren.

Beispiel:

- Climate `compact` darf nicht so klein werden, dass Plus/Minus abgeschnitten
  werden.
- Light `compact` muss weiterhin einen 44-Pixel-Schalter ermöglichen.
- Sensor `compact` kann stärker verkleinert werden.
- Binary `compact` kann stärker verkleinert werden.

---

# Climate-Widget

Das in Sprint 12 kompakter gestaltete Climate-Widget darf nicht wieder
unnötig groß werden.

Größenbeispiele:

```text
compact
normal
wide
large
```

`tall` darf ebenfalls funktionieren, auch wenn es für Climate weniger häufig
benötigt wird.

Plus-/Minus-Touchziele bleiben mindestens 44 × 44 Pixel.

---

# Light-Widget

Der Light-Schalter muss unabhängig vom Größen-Preset gut bedienbar bleiben.

Keine Größe darf:

- Toggle abschneiden
- Text überlagern
- Touchziel unter die Mindestgröße reduzieren

---

# Sensor- und Binary-Widgets

Diese Widgets profitieren besonders von:

```text
compact
```

Ziel ist eine deutlich platzsparendere Darstellung für einfache Mess- oder
Statuswerte.

---

# Admin UI

In der Widget-Bearbeitung wird ein neues Feld ergänzt:

```text
Kachelgröße
```

Auswahl:

```text
Kompakt
Normal
Breit
Hoch
Groß
```

Interne Werte:

```text
compact
normal
wide
tall
large
```

---

# Admin-UI-Auswahl

Bevorzugt als:

```html
<select>
```

Keine freie Texteingabe.

Dadurch kann der Benutzer keine ungültigen CSS-Werte eingeben.

---

# Anzeige in der Widgetliste

Die aktuelle Größe soll in der Admin-Widgetliste sichtbar sein.

Beispiel:

```text
Badezimmer Temperatur
sensor.badezimmer...
Größe: Kompakt
```

---

# Neue Widgets

Beim Hinzufügen eines Widgets gilt standardmäßig:

```text
normal
```

Codex darf optional sichere typabhängige Vorschläge machen:

```text
sensor -> compact
binary -> compact
light -> normal
climate -> wide
```

Aber:

Der tatsächlich gespeicherte Default muss eindeutig definiert und getestet
sein.

Bevorzugt für Vorhersagbarkeit:

```text
normal
```

für alle neuen Widgets.

---

# Dashboard duplizieren

Beim Duplizieren eines Dashboards müssen die Größen-Presets jedes Widgets
übernommen werden.

Neue Widget-IDs bleiben weiterhin erforderlich.

---

# Widget duplizieren

Falls Sprint 15 bereits Widget-Duplizieren unterstützt, soll `size`
mitkopiert werden.

Falls diese Funktion nicht existiert, nicht neu in Sprint 16 einführen.

---

# Sichtbarkeit und Größe

`visible: false` und `size` bleiben unabhängige Eigenschaften.

Ein unsichtbares Widget darf seine konfigurierte Größe behalten.

Wenn es später wieder sichtbar wird, soll die vorige Größe wieder gelten.

---

# Reihenfolge

`order` bleibt vollständig erhalten.

Sprint 16 verändert keine Reihenfolgelogik.

Die Kombination:

```text
order + size
```

bestimmt vorerst den Flexbox-Fluss.

---

# Layout-Erwartung

Sprint 16 garantiert keine pixelgenaue Position.

Beispiel:

```text
normal | normal | normal
wide          | normal
compact | tall | compact
large         | normal
```

Der Browser darf aufgrund des Flexbox-Flows Zeilen umbrechen.

Die exakte Rasterposition folgt erst in Sprint 17.

---

# Vorschau im Admin UI

Eine vollständige Live-Vorschau ist nicht erforderlich.

Mindestens sinnvoll:

- Größenname anzeigen
- optional kleine schematische Vorschau

Kein iframe-basierter WYSIWYG-Editor notwendig.

---

# API

Bestehende Admin-API wird um `size` erweitert.

Alle relevanten Schreiboperationen müssen `size` validieren.

Beispiele:

```text
POST /api/admin/dashboards/:id/widgets
PUT /api/admin/dashboards/:id/widgets/:widgetId
PUT /api/admin/config
```

Die tatsächlich vorhandenen Sprint-14-/15-Routen sind maßgeblich.

Keine parallele alternative Admin-API einführen.

---

# Fehlerfälle

Admin UI soll verständlich behandeln:

```text
invalid_widget_size
```

oder den tatsächlich gewählten Backend-Fehlercode.

Bei Fehler:

- lokale Formulardaten behalten
- keine Konfiguration teilweise speichern
- verständliche Meldung anzeigen

---

# Persistenz

Das Größenfeld muss in der bestehenden persistenten Konfiguration gespeichert
werden.

Nach:

```text
Service restart
```

muss die Größe unverändert erhalten bleiben.

Backup- und Atomic-Write-Verhalten aus Sprint 14 bleiben erhalten.

---

# Rollback / Migration

Eine bestehende Konfigurationsdatei ohne Größenwerte muss weiter lesbar sein.

Migration darf nicht verlangen, dass der Benutzer alle Widgets erneut
konfiguriert.

Wenn ein Rollback auf eine ältere Softwareversion geplant oder bereits
unterstützt wird, soll Codex dokumentieren, ob die zusätzliche `size`-
Eigenschaft dort ignoriert werden kann.

Keine komplexe Downgrade-Migration in diesem Sprint, sofern nicht notwendig.

---

# Tests – Konfigurationsschema

Mindestens testen:

1. bestehendes Widget ohne `size` wird zu `normal`
2. `compact` wird akzeptiert
3. `normal` wird akzeptiert
4. `wide` wird akzeptiert
5. `tall` wird akzeptiert
6. `large` wird akzeptiert
7. unbekannter Wert wird abgewiesen
8. leere Größe wird kontrolliert behandelt
9. Dashboardmigration verändert keine Widget-ID
10. Dashboardmigration verändert keine Reihenfolge
11. Dashboardduplikat übernimmt Größen

---

# Tests – Admin API

12. Widget mit `normal` anlegen
13. Widgetgröße auf `compact` ändern
14. Widgetgröße auf `wide` ändern
15. Widgetgröße auf `tall` ändern
16. Widgetgröße auf `large` ändern
17. ungültige Größe liefert 400
18. ungültige Größe verändert persistierte Konfiguration nicht
19. Admin-Token-Schutz bleibt aktiv
20. Größenänderung verändert keine Write-Allowlist

---

# Tests – Public API

21. öffentliche Dashboardconfig enthält `size`
22. nur validierte Größen werden ausgeliefert
23. Legacy-Dashboard-Endpunkt enthält kompatible Größeninformation
24. unbekannte oder alte Werte führen nicht zu injizierten CSS-Klassen

---

# Tests – Admin UI

25. Größen-Select wird angezeigt
26. bestehende Widgetgröße wird korrekt ausgewählt
27. neue Widgets starten mit definiertem Default
28. Größenänderung wird gespeichert
29. Verwerfen stellt ursprüngliche Größe wieder her
30. Dashboardduplikat zeigt übernommene Größen

---

# Tests – Legacy Frontend

31. `card-size-compact` wird angewendet
32. `card-size-normal` wird angewendet
33. `card-size-wide` wird angewendet
34. `card-size-tall` wird angewendet
35. `card-size-large` wird angewendet
36. unbekannte Größe fällt auf `normal` zurück
37. keine freie CSS-Klasse aus unvalidiertem Text
38. Climate-Steuerung bleibt funktional
39. Light-Steuerung bleibt funktional
40. bestehender Refresh bleibt funktional

---

# Regression

Der komplette bestehende Testsatz muss grün bleiben.

Codex soll den tatsächlichen Referenzstand vor Änderungen feststellen.

Keine historische Testzahl voraussetzen.

---

# Manuelle Layoutprüfung

## Admin

Prüfen:

- Größenfeld sichtbar
- Größenwechsel verständlich
- Speichern
- Verwerfen
- Persistenz nach Reload
- Dashboardduplikat

## Wall-Display

Mindestens testen:

### iPad mini Portrait

- compact
- normal
- wide
- tall
- large

### iPad mini Landscape

- compact
- normal
- wide
- tall
- large

### Light Mode

alle Presets

### Dark Mode

alle Presets

---

# Besonders visuell prüfen

- keine horizontalen Scrollbars
- keine abgeschnittenen Werte
- keine überlappenden Buttons
- Plus/Minus weiterhin zentriert
- Light-Schalter weiterhin bedienbar
- Textumbrüche sinnvoll
- breite Kacheln nutzen tatsächlich mehr Breite
- kompakte Sensoren sparen sichtbar Platz
- große Kacheln bleiben responsiv
- Header bleibt unverändert kompakt

---

# iOS-9-Anforderungen

Der Wall-Display-Code bleibt ECMAScript 5.

Nicht verwenden:

- `let`
- `const`
- arrow functions
- template literals
- classes
- `fetch`
- `Promise`
- `async`
- `await`
- optional chaining
- nullish coalescing

CSS weiterhin ohne:

- CSS Grid
- Flexbox `gap`
- Container Queries
- moderne Layoutfunktionen ohne iOS-9-Support

---

# Admin-Frontend

Das moderne Admin-Frontend darf moderne JavaScript-Syntax verwenden, sofern
Sprint 15 dies bereits so aufgebaut hat.

Keine Modernisierung des Legacy-Frontends im Rahmen dieses Sprints.

---

# Keine CSS-Injection

Wichtig:

`size` darf niemals direkt als beliebiger Stylewert verwendet werden.

Nicht:

```javascript
element.style.width = config.size;
```

Nicht:

```html
style="width: USER_VALUE"
```

Stattdessen ausschließlich Mapping bekannter Presets auf bekannte Klassen.

---

# Mögliche CSS-Struktur

Nur als Orientierung:

```css
.card-size-compact {
    /* normale Spaltenbreite, reduzierte Mindesthöhe */
}

.card-size-normal {
    /* bisherige Standarddarstellung */
}

.card-size-wide {
    /* breiter Flex-Basis-Wert */
}

.card-size-tall {
    /* normale Breite, erhöhte Mindesthöhe */
}

.card-size-large {
    /* breite Flex-Basis + erhöhte Mindesthöhe */
}
```

Codex muss bestehende Klassen und Breakpoints wiederverwenden statt parallele
Layoutsysteme aufzubauen.

---

# Cache-Version

Da das Legacy-CSS und voraussichtlich Legacy-JavaScript geändert werden, muss
die Asset-Cache-Version in `src/public/index.html` erhöht werden.

Codex muss den tatsächlichen Ausgangswert aus dem Repository lesen.

Alle geänderten versionierten Legacy-Assets konsistent aktualisieren.

---

# Voraussichtlich betroffene Dateien

Codex muss den tatsächlichen Sprint-15-Stand prüfen.

Voraussichtlich:

```text
src/config/
src/services/config-store.js
src/routes/admin.js
src/public/js/core/dashboard.js
src/public/js/core/widget.js
src/public/css/style.css
src/admin/
test/
README.md
docs/PROJECT_STATUS.md
docs/SPRINT_ROADMAP.md
```

Die tatsächlichen Dateinamen aus Sprint 14/15 sind maßgeblich.

Keine unnötige Parallelstruktur hinzufügen.

---

# Dokumentation

README ergänzen um:

- verfügbare Kachelgrößen
- Bedeutung der Presets
- Konfiguration über `/admin`
- responsive Einschränkungen

`docs/PROJECT_STATUS.md` aktualisieren.

`docs/SPRINT_ROADMAP.md` aktualisieren, wenn notwendig.

---

# Definition of Done

Sprint 16 ist abgeschlossen, wenn:

- jedes Widget ein validiertes Größen-Preset besitzen kann
- bestehende Widgets automatisch kompatibel migriert werden
- `compact`, `normal`, `wide`, `tall`, `large` unterstützt werden
- Admin UI die Größe auswählen kann
- Größe persistent gespeichert wird
- Dashboardduplikate Größen übernehmen
- Public API die Größe sicher ausliefert
- Legacy-Renderer die Größe anwendet
- schmale Displays nicht horizontal überlaufen
- Flexbox-/iOS-9-Kompatibilität erhalten bleibt
- keine CSS-Injection möglich ist
- Climate Plus/Minus weiter korrekt funktionieren
- Light-Steuerung weiter korrekt funktioniert
- Write-Allowlists unverändert bleiben
- alle bestehenden Tests grün bleiben
- neue Größen-Tests grün sind
- Cache-Version erhöht wurde
- `docs/PROJECT_STATUS.md` aktualisiert wurde
- kein Drag-and-drop implementiert wurde
- keine freien X-/Y-/Breiten-/Höhenwerte implementiert wurden

---

# Erwartetes Codex-Ergebnis

Codex soll berichten:

1. Startcommit
2. geprüfter Sprint-15-Status
3. finale Größen-Presets
4. Schemaänderung / Migration
5. Backendvalidierung
6. Admin-UI-Änderungen
7. Legacy-Renderer-Änderungen
8. CSS-Verhalten pro Breakpoint
9. Testanzahl und Ergebnis
10. Syntax-/Lint-Ergebnisse
11. neue Asset-Cache-Version
12. manuelle Tests
13. technische Einschränkungen des Flexbox-Modells
14. Voraussetzungen für Sprint 17
15. Commit-Vorschlag
16. Deploymentbefehle

---

# Codex-Prompt für Sprint 16

```text
Read:

- AGENTS.md
- README.md
- docs/CODEX_HANDOFF.md
- docs/SPRINT_ROADMAP.md
- docs/PROJECT_STATUS.md
- docs/sprints/SPRINT-14.md
- docs/sprints/SPRINT-15.md
- docs/sprints/SPRINT-16.md

Inspect the actual repository state and verify the completed Sprint 15
implementation before changing anything.

Implement Sprint 16 exactly as specified in docs/sprints/SPRINT-16.md.

Goal:

Add safe configurable tile-size presets to the persistent dashboard model,
Admin UI and legacy wall-display renderer.

Supported sizes:

- compact
- normal
- wide
- tall
- large

Existing widgets without a size must migrate safely to normal.

Use only validated preset values. Never pass arbitrary size strings into CSS
styles or class names.

The Admin UI may use modern browser technology.

The wall-display frontend must remain compatible with Safari on iOS 9 and
ECMAScript 5.

Continue using the existing Flexbox layout. Do not introduce CSS Grid.

Do not implement:

- drag-and-drop,
- x/y coordinates,
- arbitrary width or height,
- resize handles,
- per-orientation layouts,
- Home Assistant App packaging,
- HACS support,
- automatic write allowlist changes.

Preserve all existing Home Assistant security boundaries.

Run the complete test suite and add isolated tests for schema migration,
validation, persistence, Admin UI and legacy rendering.

Manually verify the size presets in portrait and landscape, especially compact
sensor cards, wide/large climate cards, plus/minus controls and light controls.

Update docs/PROJECT_STATUS.md when finished.

At the end report:

- changed files,
- schema version/migration,
- size behavior,
- Admin UI behavior,
- breakpoint behavior,
- test results,
- cache version,
- remaining limitations,
- exact prerequisites for Sprint 17.

Do not commit or push unless explicitly instructed.
```
