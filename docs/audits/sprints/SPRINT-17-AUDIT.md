# Sprint 17 Audit

## Audit Metadata

- Sprint: 17
- Sprint title: Drag-and-Drop Grid Layout
- Audit date: 1. September 2026
- Repository commit: `8d5b4bd`
- Spec file: [`docs/sprints/SPRINT-17.md`](../../sprints/SPRINT-17.md)
- Working tree at Part-03 start: clean; Branch `main` entsprach `origin/main`.

## Overall Result

PARTIAL

Das persistente Rastermodell, getrennte Portrait-/Landscape-Profile,
deterministische Platzierung, Validierung, Admin-Editor, Remapping bei
Duplikaten und der absolute Legacy-Renderer sind im aktuellen Code vorhanden.
Die heutige 6-/12-Spalten-Auflösung ersetzt die ursprüngliche 3-/6-Spalten-
Ausgangsauflösung ausdrücklich durch Sprint 17.1. Ein kontrollierter lokaler
Browserlauf belegt Editor, Kollision, Resize, Save/Discard/Reload und beide
Wall-Display-Profile. Die in Sprint 17 verlangte reale Maus-/Pointer-Abnahme
des Drag-Handles sowie die physische iPad-mini-/iOS-9-Abnahme wurden in Part 03
nicht durchgeführt. Das `PARTIAL` ist daher ein Abnahmevorbehalt, kein
festgestellter Codefehler.

## Requirement Matrix

| ID | Requirement | Status | Evidence | Notes |
|---|---|---|---|---|
| 17-F1 | Sprint 16 als Größen- und Admin-Grundlage verwenden | PASS | [`SPRINT-16-AUDIT.md`](SPRINT-16-AUDIT.md); `src/admin/js/widgets.js`; `src/services/layout.js` | Größen-Presets bleiben Initial-/Fallbackwerte. |
| 17-M1 | Persistente Layoutprofile mit Integer-`x/y/w/h` pro stabiler Widget-ID | PASS | `src/services/layout.js`: `createLayouts()`, `validateItem()`; `src/config/dashboard.js`: `layouts`; `test/layout.test.js` | Layoutreferenzen verwenden Widget-IDs, nicht Entity-IDs. |
| 17-M2 | Getrennte Profile `portrait` und `landscape` | PASS | `src/services/layout.js`: `PROFILES`; `src/public/js/core/layout.js`: `profileName()`; kontrollierter Browserlauf | Beide Profile werden unabhängig gespeichert und angewendet. |
| 17-M3 | Ursprünglich bevorzugte 3/6 Spalten | N/A | Sprint 17.1; `src/services/layout.js`: `PROFILE_COLUMNS`; `src/admin/js/layout.js`: `COLUMNS` | Bewusst durch 6/12 ersetzt; die feinere Auflösung erfüllt denselben Endzweck. |
| 17-M4 | Keine freien Pixelkoordinaten, sondern gesnapptes Ganzzahlraster | PASS | `src/services/layout.js`: `isInteger()`, `validateItem()`; `src/admin/js/layout.js`: `cellFromPoint()`, `place()` | Browser erhält nur validierte Rasterwerte; Pixelgeometrie wird daraus abgeleitet. |
| 17-S1 | Größen-Presets nur als Migration, Initialplatzierung und Fallback | PASS | `src/services/layout.js`: `SIZE_DIMENSIONS`, `getPreferredSize()`; `src/public/js/core/layout.js`: `preferredSize()`, `automaticProfile()` | Valide persistierte Layouts haben Vorrang. |
| 17-MIG1 | Bestehende Konfiguration ohne Layout deterministisch migrieren | PASS | `src/config/dashboard.js`: `migrateConfiguration()`; `test/layout.test.js`: „Schema 2 migriert deterministisch …“ | Schema 2 erhält IDs/Inhalte und erzeugt beide Profile. |
| 17-MIG2 | IDs, Reihenfolge, Sichtbarkeit und Inhalt bei Migration erhalten | PASS | `test/layout.test.js`; `test/dashboard-persistence.test.js`: Sprint-16-Schema-2-Migration | Keine fachlichen Widget- oder Dashboardfelder werden umgeschrieben. |
| 17-AP1 | Auto-Placement links nach rechts, dann nächste freie Zeile | PASS | `src/services/layout.js`: `findFirstPosition()`, `createProfile()`; `test/layout.test.js` | Schleifenreihenfolge ist `y`, danach `x`, und damit deterministisch. |
| 17-AP2 | Auto-Placement respektiert Breite, Höhe und Kollisionen | PASS | `src/services/layout.js`: `positionIsFree()`, `findFirstPosition()`; `test/layout.test.js` | Spätere Sections isolieren Kollisionen absichtlich je Abschnitt. |
| 17-V1 | Integer, nichtnegative Koordinaten, positive Größen und Bounds | PASS | `src/services/layout.js`: `validateItem()`; `MAX_LAYOUT_ROWS=100`, `MAX_ITEM_HEIGHT=4`; `test/layout.test.js` | Zu kleine typspezifische Werte werden ebenfalls abgewiesen. |
| 17-V2 | Nur bekannte Profile, Spaltenzahlen und Widget-IDs | PASS | `src/services/layout.js`: `validateLayoutsWithRules()`; `test/layout.test.js` | Fehlende Widgetpositionen und Fremdreferenzen sind ungültig. |
| 17-V3 | Keine Überlappung sichtbarer Widgets | PASS | `src/services/layout.js`: `overlaps()`, `validateLayoutsWithRules()`; kontrollierter Browserlauf | Ungültige Bewegung blieb bei `x0/y0/3×1` und zeigte eine kontrollierte Meldung. |
| 17-V4 | Ungültiges Layout liefert kontrollierten HTTP-400-Fehler und wird nicht gespeichert | PASS | `src/routes/admin.js`: `persistConfiguration()`; `test/admin-api.test.js`: „Rasterlayouts werden geschützt validiert …“ | Vollvalidierung erfolgt vor atomarer Persistenz. |
| 17-H1 | Unsichtbare Widgets blockieren keine Zellen | PASS | `src/services/layout.js`: `visibleWidgetMap()`; `test/layout.test.js` | Verborgene Positionen bleiben gespeichert. |
| 17-H2 | Reaktivierung nutzt alte freie Position oder sicheres Auto-Placement | PASS | `src/services/layout.js`: `ensureVisibleWidgetPlacement()`; `src/admin/js/layout.js`; `test/layout.test.js` | Kollisionen bei erneuter Sichtbarkeit werden deterministisch aufgelöst. |
| 17-A1 | Grafischer Admin-Rastereditor mit sichtbaren Rasterlinien | PASS | `src/admin/js/app.js`: `renderLayoutEditor()`; `src/admin/css/admin.css`: `.layout-editor-grid`; kontrollierter Browserlauf | CSS Grid ist nur im modernen Admin zulässig, nicht im Wall-Display. |
| 17-A2 | Portrait-/Landscape-Umschaltung im Editor | PASS | `src/admin/js/app.js`: `activeLayoutProfile`; kontrollierter Browserlauf | Landscape zeigte 12 Spalten, fünf Tiles, fünf Resize-Handles und 40 Alternativbuttons. |
| 17-A3 | Pointer-basierter Drag mit Snapping und Zielvorschau | PASS | `src/admin/js/app.js`: `handleLayoutPointerDown()`, `handleLayoutPointerMove()`, `showLayoutPreview()`; `test/admin-ui.test.js` | Eventpfad und Candidate-Prüfung sind automatisiert belegt; reale Maus-/Touch-Geste bleibt MT-08. |
| 17-A4 | Keine Drops außerhalb der Bounds oder auf Kollisionen | PASS | `src/admin/js/layout.js`: `canPlace()`, `isValidCandidate()`; `src/admin/js/app.js`: `finishLayoutPointer()` | Dieselbe Candidate-Logik gilt für Drag, Resize und Buttons. |
| 17-A5 | Resize nur in ganzen Zellen mit Grenzen, Minimum und Kollision | PASS | `src/admin/js/layout.js`: `resize()`, `place()`; `test/admin-ui.test.js`; kontrollierter Browserlauf | Resize 3×1→2×1 gelang; Kollision wurde abgewiesen. |
| 17-A6 | Lokaler Draft, explizites Speichern und Verwerfen | PASS | `src/admin/js/state.js`; `src/admin/js/app.js`: `saveConfiguration()`, `discardConfiguration()`; kontrollierter Browserlauf | Verwerfen stellte 3×1 wieder her; Speichern überlebte Reload in der temporären Laufzeit. |
| 17-A7 | Zugängliche Links/Rechts/Hoch/Runter-/Resize-Alternativen | PASS | `src/admin/js/app.js`: `renderLayoutTile()`; kontrollierter DOM-Snapshot | Acht beschriftete Alternativbuttons pro sichtbarer Kachel sind vorhanden. |
| 17-MIN1 | Typspezifische Mindestgrößen | PASS | `src/services/layout.js`: `WIDGET_MINIMUM_SIZES`; `src/admin/js/layout.js`: `MINIMUM_SIZES`; `test/layout.test.js` | Sensor/Binary/Light mindestens 2×1; Climate Landscape mindestens 3×1 im aktuellen Raster. |
| 17-MIN2 | Climate-/Light-Bedienbarkeit und ungefähr 44-px-Touchziele erhalten | PASS – superseded by Sprint 17.3/17.5–17.7 | `src/public/js/focus/`; `src/public/css/style.css`; kontrollierter Browserlauf; `test/sprint-17-3.test.js`, Focus-/Controltests | Controls wurden bewusst in eine native Focus-Ansicht verlagert. Gemessen: Climate ± 56×56 px, Power 54 px hoch. Reales iPad bleibt MT-09. |
| 17-D1 | Dashboard-Duplikat erzeugt neue Widget-IDs und remappt Layout | PASS | `src/admin/js/dashboards.js`: `duplicate()`; `src/admin/js/layout.js`: `remapLayouts()`; `test/admin-ui.test.js` | Geometrie bleibt erhalten; alte IDs werden nicht übernommen. |
| 17-L1 | Legacy-Renderer ohne CSS Grid: relativer Container, absolute Karten | PASS | `src/public/js/core/layout.js`: `apply()`; `src/public/css/style.css`: `.grid.grid-layout-active`; `test/legacy-layout.test.js` | Statischer Scan fand kein CSS Grid im Wall-CSS. |
| 17-L2 | Prozentuale horizontale Geometrie, definierter Gutter, Höhe bis größtes `y+h` | PASS – superseded by Sprint 17.2 | `src/public/js/core/layout.js`: `calculateGridGeometry()`, `apply()`; `test/sprint-17-2.test.js` | Sprint 17.2 ersetzte starre Zeilen durch proportionale, gepufferte Pixelgeometrie; der Container-Endzustand bleibt korrekt. |
| 17-O1 | Profil aus `innerWidth/innerHeight`; Rotation wendet Layout neu an | PASS | `src/public/js/core/layout.js`: `profileName()`; `src/public/js/app.js`: Resize-Handler; `test/legacy-layout.test.js` | Resize wendet nur Geometrie neu an und lädt nicht unnötig HA-Zustände. |
| 17-O2 | Rotation verliert keine Daten und stört Refresh nicht | PASS | `src/public/js/app.js`: `applyDashboardLayoutAfterResize()`; `test/legacy-layout.test.js` | Persistierte Profile bleiben unverändert. Physische Rotation bleibt MT-09. |
| 17-FB1 | Fehlendes/ungültiges Profil fällt sicher auf Auto-Placement aus Presets zurück | PASS | `src/public/js/core/layout.js`: `safeProfile()`, `automaticProfile()`; `test/legacy-layout.test.js` | Koordinaten des anderen Profils werden nicht blind übernommen. |
| 17-P1 | Public API liefert nur bereinigte Layouts sichtbarer Widgets | PASS | `src/config/dashboard.js`: `getPublicDashboardConfig()`; `src/services/layout.js`: `publicLayouts()`; `test/layout.test.js` | Interne unsichtbare Widgetreferenzen gelangen nicht in Public JSON. |
| 17-API1 | Layoutänderungen verwenden bestehende geschützte Admin API | PASS | `src/routes/admin.js`: `PUT /config`, Dashboard-/Widget-Routen; `test/admin-api.test.js` | Kein paralleler Layout-Endpunkt und keine Clientdateischreiblogik. |
| 17-SEC1 | Layout/Sichtbarkeit erteilt keine HA-Schreibrechte | PASS | `src/services/control-authorization.js`; `src/services/layout.js` Modulkommentar; Security-/Sprint-26.2-Tests | Persistierte `control`-Grants bleiben separat und serverseitig erzwungen. |
| 17-SEC2 | Keine freien CSS-/HTML-/JavaScriptwerte aus Layoutdaten | PASS | `src/services/layout.js`: Integer-/Profilprüfung; `src/public/js/core/layout.js`: `safeProfile()` | Inline-Styles entstehen ausschließlich aus validierten Zahlen und festen Einheiten. |
| 17-IOS1 | Wall-JavaScript bleibt ES5/iOS-9-kompatibel | PASS | 21 Public-JS-Dateien mit `node --check`; statischer Forbidden-Syntax-Scan; `test/admin-ui.test.js` | Kein `let`, `const`, Arrow, Fetch, Promise, Async/Await, Optional Chaining oder `??` im Legacy-Bundle. |
| 17-IOS2 | Legacy-CSS benötigt weder CSS Grid noch Flexbox `gap` | PASS | statischer Scan von `src/public/css/style.css`; `test/legacy-layout.test.js`, `test/system-frontend.test.js` | Moderne Admin-CSS ist bewusst getrennt und darf CSS Grid verwenden. |
| 17-T1 | Geforderte Layout-, Migration-, Admin-, Renderer- und Sicherheitstests | PASS | `test/layout.test.js`, `test/legacy-layout.test.js`, `test/admin-ui.test.js`, `test/admin-api.test.js`, `test/dashboard-persistence.test.js` | Part-03-Fokuslauf 114/114; Gesamtsuite 329/329. |
| 17-MAN1 | Moderne Maus-/Pointer-/Touch-Abnahme des Drag-/Resize-Editors | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-08 | Browserlauf belegte Buttons und Persistenz, aber keine reale Pointer-Drag-Geste. |
| 17-MAN2 | Reales iPad mini: Portrait/Landscape/Rotation, Overlap, Scroll und Controls | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-09 | Automatisierte/Chromium-Ergebnisse ersetzen iOS 9.3.5 nicht. |
| 17-MAN3 | Persistenz über produktiven LXC-/systemd-Neustart | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-10 | Lokale temporäre Save-/Reload-Persistenz war PASS; Produktionslaufzeit wurde nicht verändert. |
| 17-N1 | Keine freie Pixelposition, Überlappung, Rotation/Z-Index, neue Write-Domains oder automatische Allowlists | PASS | Layoutvalidierung, `src/routes/api.js`, Securitytests | Spätere App-/Section-/Room-Funktionen ändern diese Grid- und Write-Grenzen nicht. |
| 17-DOC1 | Projektstatus, Roadmap und Cacheversion aktualisiert | PASS | `docs/PROJECT_STATUS.md`, `docs/SPRINT_ROADMAP.md`; historische Commits `db49277`, `81466fc` | Wall-Assets verwenden heute konsistent `v=51`. |

## Automated Tests

- Part-03-Fokuslauf: 114 Tests, 114 bestanden, 0 fehlgeschlagen.
- Vollständige Suite: 329 Tests, 329 bestanden, 0 fehlgeschlagen.
- Der erste Fokuslauf hatte zwei ausschließlich sandboxbedingte
  `listen EPERM`-Fehler. Derselbe Lauf mit erlaubten localhost-Mocks war grün.
- JavaScript-Syntax: alle 21 Dateien unter `src/public/**/*.js` bestanden
  `node --check`.
- Statischer Legacy-Scan: keine verbotene moderne Syntax, kein CSS Grid, kein
  Flexbox-`gap`, kein `ResizeObserver` und keine Container Query im Wall-
  Frontend.
- Ausschließlich localhost-Mocks und Fake-Credentials; kein reales Home
  Assistant wurde kontaktiert.

## Controlled Browser Evidence

- Wall-Display Portrait 768×1024: 5 sichtbare Karten, kein horizontaler
  Overflow (`clientWidth = scrollWidth = 768`), keine überlappenden Rechtecke.
- Wall-Display Landscape 1024×768: 5 sichtbare Karten, kein horizontaler
  Overflow (`clientWidth = scrollWidth = 1024`), Profilwechsel ohne Reload.
- Focus-Climate: Minus/Plus je 56×56 px; Power 264×54 px; kein innerer
  horizontaler Overflow.
- Admin: Portrait/6 Spalten und Landscape/12 Spalten sichtbar; Resize,
  Kollision, Discard sowie Save/Reload gegen temporäre Persistenz geprüft.
- Keine Browser-Console-Warnung und kein Browser-Console-Fehler.

## Superseded Requirements

- Sprint 17.1 ersetzte 3/6 durch 6/12 Spalten und migriert `x`/`w`
  deterministisch.
- Sprint 17.2 ersetzte die ursprüngliche starre Zeilenhöhe durch proportionale,
  gutter-aware Geometrie.
- Sprint 17.3 sowie 17.5–17.7 verlagerten und stabilisierten interaktive
  Climate-/Light-Controls in einer vom Grid getrennten Focus-Ansicht.
- Sprint 25.6 erweiterte die Präsentationsableitung anhand realer Pixelmaße;
  die persistierte Gridgeometrie blieb davon getrennt.
- Sprint 26 isoliert dieselben Koordinaten je Section, ohne das Layoutformat zu
  duplizieren.

## Security Review

PASS – Layoutdaten sind rein präsentational, streng numerisch validiert und
werden über die geschützte Admin API gespeichert. HA- und Supervisor-Token
bleiben backendseitig; Layout/Sichtbarkeit verändert keine Control-Grants und
es existiert kein generischer HA-Serviceproxy.

## Legacy Safari / iPad Review

PARTIAL – ES5, CSS-Grid-Freiheit, sichere Profile, Rotation und Touchzielgrößen
sind statisch, automatisiert und in Chromium belegt. Der reale iPad-mini-1-
Lauf mit iOS 9.3.5 fehlt und bleibt deshalb `NOT TESTED`.

## Standalone/LXC Review

PARTIAL – lokale Standalone-Persistenz, API und Reload sind grün. Ein realer
systemd-Neustart des Produktions-LXC wurde in Part 03 nicht durchgeführt.

## Home Assistant App Review

N/A – die App-Verpackung war in Sprint 17 ein Nicht-Ziel und wurde erst in
Sprint 24 eingeführt. Das Layoutmodell ist speicherpfadunabhängig; eine echte
HAOS-Abnahme gehört in den späteren Audit-Part.

## Findings

- Kein aktuelles `MISSING` oder `BROKEN`.
- Keine umsetzbare Code-Reparatur.
- `NOT TESTED`: reale Pointer-Drag-Abnahme, iPad-mini-/iOS-9-Abnahme und
  produktiver LXC-Neustart.

## Final Assessment

Sprint 17 erfüllt alle weiterhin anwendbaren implementierbaren Anforderungen.
Wegen der ausdrücklich fehlenden realen Geräte-/Runtime-Abnahmen bleibt der
Sprint-27-Baselinestatus `PARTIAL`.
