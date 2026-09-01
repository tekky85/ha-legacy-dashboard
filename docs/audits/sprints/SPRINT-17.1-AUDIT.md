# Sprint 17.1 Audit

## Audit Metadata

- Sprint: 17.1
- Sprint title: Grid Refinement + Responsive Card Content
- Audit date: 1. September 2026
- Repository commit: `8d5b4bd`
- Spec file: [`docs/sprints/SPRINT-17.1.md`](../../sprints/SPRINT-17.1.md)
- Working tree at Part-03 start: clean; Branch `main` entsprach `origin/main`.

## Overall Result

PARTIAL

Die feinere 6-/12-Spalten-Auflösung, einmalige 3/6-Migration, typspezifischen
Mindestgrößen, Trennung von Geometrie und Präsentation, responsive Inhalte,
Legacy-Kompatibilität und System-Dashboard-Regression sind im aktuellen Code
vorhanden. Spätere Sprints haben die damaligen drei Presentation Modes bewusst
auf fünf pixel- und inhaltsabhängige Tiers erweitert und Grid-Controls in eine
native Focus-Ansicht verlagert. Der beabsichtigte Endzustand ist damit weiter
erfüllt. Die reale visuelle und Touch-Abnahme auf dem iPad mini 1/iOS 9.3.5
fehlt; deshalb bleibt das Gesamtergebnis `PARTIAL`.

## Requirement Matrix

| ID | Requirement | Status | Evidence | Notes |
|---|---|---|---|---|
| 17.1-F1 | Bestehende Sprint-17-Layouts verfeinern, nicht parallel ersetzen | PASS | `src/services/layout.js`; `src/config/dashboard.js`; historischer Commit `53ce672` | Dasselbe `dashboard.layouts`-Modell wird bis Schema 12 weiterverwendet. |
| 17.1-F2 | Sprint-18-System-Dashboard-Architektur nicht verändern | PASS | `src/routes/system-dashboards.js`; `src/public/system.html`; `test/system-frontend.test.js` | Summary/Errors bleiben feste, getrennte Systemrouten und nicht Teil des Benutzergrids. |
| 17.1-G1 | Portrait 6 und Landscape 12 Spalten | PASS | `src/services/layout.js`: `PROFILE_COLUMNS`; `src/admin/js/layout.js`: `COLUMNS`; `src/public/js/core/layout.js` | Browserlauf bestätigte 6/12 im Admin und beide Wall-Profile. |
| 17.1-G2 | Bestehende 3/6-Layouts mit `x*2`, `w*2`, unverändertem `y/h` migrieren | PASS | `src/services/layout.js`: `migrateLegacyLayouts()`; `test/layout.test.js`; `test/dashboard-persistence.test.js` | Beispiel `{1,7,1,2}` wird `{2,7,2,2}`. |
| 17.1-G3 | Migration exakt einmal, deterministisch und über bestehende Architektur | PASS | `src/config/dashboard.js`: `GRID_SCHEMA_VERSION=3`, `LAYOUT_SCHEMA_VERSION=4`, `migrateConfiguration()`; Tests | Bereits aktuelle Schemas werden nicht erneut skaliert. |
| 17.1-G4 | IDs erhalten, keine Kollisionen, Bounds erneut validieren | PASS | `src/services/layout.js`: `validateLegacyLayouts()`, `validateLayouts()`; `test/layout.test.js` | Dashboard- und Widget-IDs bleiben unverändert. |
| 17.1-P1 | Gridgeometrie strikt von Widgetpräsentation trennen | PASS | `src/public/js/core/layout.js`: Geometrie/`resolvePresentationMode()`; `src/public/js/core/presentation.js`; `test/sprint-17-2.test.js`, `test/sprint-25-6.test.js` | Persistiert werden nur `x/y/w/h`; Präsentation ist abgeleitet. |
| 17.1-P2 | Keine globale Skalierung oder `transform: scale()`/`zoom` | PASS | statischer Scan `src/public/`; `src/public/js/core/presentation.js` | Inhalte werden selektiv per festen Klassen angepasst. |
| 17.1-P3 | Presentation aus Typ, Breite und Höhe ableiten | PASS – superseded by Sprint 25.6 | `src/public/js/core/presentation.js`: `getMode()`; `src/public/js/core/layout.js`: `resolvePresentationMode()` | Die heutige Ableitung berücksichtigt zusätzlich echte Pixel, Content-Dichte, Controls und Secondary Content. |
| 17.1-P4 | Damalige Modi `compact`, `normal`, `expanded` | N/A | Sprint 25.6; `src/public/js/core/presentation.js`: `TIERS`; `test/sprint-25-6.test.js` | Bewusst erweitert auf `compact`, `standard`, `wide`, `tall`, `large`; alte Klassen werden beim Anwenden entfernt. |
| 17.1-P5 | Presentation nicht persistieren | PASS | `src/config/dashboard.js`: Dashboard-/Widgetschema; `src/public/js/core/layout.js`: Cache nur im Browser | Kein Präsentationsfeld wird gespeichert oder über Admin-API angenommen. |
| 17.1-P6 | Neu ableiten bei Load, Profil-/Orientierungswechsel, nicht unnötig bei unveränderter Geometrie | PASS | `src/public/js/core/layout.js`: `presentationCache`, Signatur; `src/public/js/app.js`: Resize-Handler; `test/legacy-layout.test.js` | Cache umfasst Profil, Typ, Gridgröße, Pixelmaße und Inhalts-Hints. |
| 17.1-S1 | Sensor Compact: Wert primär, Unit sinnvoll, redundante Texte verdichten | PASS – superseded by Sprint 25.6 | `src/public/js/widgets/sensor.js`; `src/public/css/style.css`; `test/legacy-layout.test.js`, `test/sprint-25-6.test.js` | Heutige fünf Tiers behandeln kurze/lange/negative/dezimale Werte. |
| 17.1-B1 | Binary Compact: Zustand eindeutig und nicht nur über Farbe | PASS | `src/public/js/widgets/binary.js`; `src/public/css/style.css`; Matrix-/Legacy-Tests | Textzustände bleiben im DOM und sichtbar. |
| 17.1-L1 | Light Compact: Status sichtbar, Control touchfreundlich, keine Überlappung | PASS – superseded by Sprint 17.3/17.6–17.7 | `src/public/js/widgets/light.js`; `src/public/js/focus/`; `src/public/css/style.css`; Controltests | Gemeinsames SVG-Power-Control und Focus-Renderer ersetzen den damaligen Card-Control-Pfad. Reale iPad-Abnahme bleibt MT-09. |
| 17.1-L2 | Light-Steuerlogik/Allowlist unverändert | PASS | `src/services/control-authorization.js`; `src/routes/api.js`; `test/sprint-26-2.test.js` | Spätere zentrale Grants bleiben explizit und serverseitig; kein Layoutgrant. |
| 17.1-C1 | Climate Compact zeigt Ist- und Solltemperatur | PASS | `src/public/js/widgets/climate.js`; kontrollierter Wall-/Focus-Browserlauf; Card-Matrix-Tests | Grid zeigt aktuelle Temperatur; Focus zeigt aktuelle und Zieltemperatur. |
| 17.1-C2 | Climate Minus/Plus sichtbar, zentriert und mindestens ca. 44×44 px | PASS – superseded by Sprint 17.3/17.5–17.7 | `src/public/js/focus/renderer.js`; `src/public/css/style.css`; kontrollierter Browserlauf | Controls sind heute bewusst in Focus: je 56×56 px und symmetrisch zentriert. Physisches iPad bleibt MT-09. |
| 17.1-C3 | HVAC-Text darf verdichtet werden; keine überlappenden Controls | PASS | `src/public/js/widgets/climate.js`; `src/public/js/focus/renderer.js`; `test/sprint-25-6.test.js` | Focus trennt Status, Primärwerte und Controls architektonisch. |
| 17.1-C4 | Optimistisches Update und Refreshschutz unverändert | PASS | `src/public/js/app.js`; `test/climate-flow.test.js` | Präsentationswechsel greift nicht in den Write-/Refreshzustand ein. |
| 17.1-C5 | Climate-Allowlist unverändert | PASS | `src/services/control-authorization.js`; `src/config/dashboard.js`: separates `control`-Modell; Securitytests | Sprint 26.2 zentralisierte Berechtigungen später ausdrücklich, ohne Layoutkopplung. |
| 17.1-MIN1 | Widgettypabhängige Mindestgrößen im Backend und Editor | PASS | `src/services/layout.js`: `WIDGET_MINIMUM_SIZES`; `src/admin/js/layout.js`: `MINIMUM_SIZES`; `test/layout.test.js`, `test/admin-ui.test.js` | Sensor/Binary/Light 2×1; Climate Portrait 2×1, Landscape 3×1. |
| 17.1-MIN2 | Climate darf nicht in unbedienbare Größe verkleinert werden | PASS | Backend-/Editor-Minimum; Focus-Control-Architektur; Tests | Landscape unter 3 Spalten wird serverseitig und im Editor abgewiesen. |
| 17.1-A1 | Admin zeigt feines Raster und snappt Drag/Resize darauf | PASS | `src/admin/js/app.js`: `renderLayoutEditor()`, Pointer-Handler; `src/admin/js/layout.js`: `cellFromPoint()`; `test/admin-ui.test.js` | Reale Pointer-Geste bleibt MT-08. |
| 17.1-A2 | Editor stoppt Resize an Grenze, Minimum oder Kollision | PASS | `src/admin/js/layout.js`: `isValidCandidate()`; kontrollierter Browserlauf | Unmögliche Änderung wird ohne Draftmutation verständlich gemeldet. |
| 17.1-A3 | Backend bleibt autoritative zweite Validierung | PASS | `src/routes/admin.js`: `persistConfiguration()`; `src/config/dashboard.js`; `test/admin-api.test.js` | Manipulierte Clientdaten werden mit HTTP 400 abgewiesen. |
| 17.1-A4 | Keine DOM-Explosion durch explizite Rasterzellen | PASS | `src/admin/js/app.js`: ein `.layout-editor-grid`, Tiles und eine Preview; kontrollierter Browserlauf | Keine Zelle pro Gridkoordinate; Linien entstehen im Admin per CSS-Hintergrund. |
| 17.1-TEXT1 | Lange Texte, Werte und Units dürfen Layout nicht zerstören | PASS – superseded by Sprint 25.6 | `src/public/css/style.css`; `src/public/js/core/presentation.js`; `test/sprint-25-6.test.js` | Matrix deckt lange Namen/Werte, negative und dezimale Werte sowie Overflow ab. |
| 17.1-ICON1 | Icons und Schrift responsiv je Präsentation | PASS – superseded by Sprint 25.6 | `src/public/css/style.css`: `card-presentation-*`; Matrix-Tests | Fünf Tiers ersetzen die damalige Drei-Stufen-Skalierung. |
| 17.1-TOUCH1 | Interaktive Controls behalten mindestens ungefähr 44 px | PASS | `src/public/css/style.css`; `test/legacy-layout.test.js`; kontrollierter Browserlauf | Grid-Power 46–48 px; Focus ± 56 px und Power 54 px hoch. Reales iPad bleibt offen. |
| 17.1-R1 | Orientation Change wendet Geometrie/Presentation neu an, ohne State-Reload | PASS | `src/public/js/app.js`: `applyDashboardLayoutAfterResize()`; `src/public/js/core/layout.js`; Tests | Kontrollierter Viewportwechsel 768×1024→1024×768 blieb ohne horizontalen Overflow. |
| 17.1-SYS1 | Summary-/Errors-Routen und Business-Logik nicht in Benutzergrid integrieren | PASS | `src/routes/system-dashboards.js`; `src/public/system.html`; `test/gateway.test.js`, `test/system-frontend.test.js` | Spätere Navigation verlinkt nur, verschiebt die System-Dashboards aber nicht ins Grid. |
| 17.1-PERS1 | Neue Rasterdaten persistent; Atomic Write und Backup bleiben | PASS | `src/services/dashboard-config-store.js`; `test/dashboard-persistence.test.js`; kontrollierter Save/Reload | Save validiert zuerst, schreibt temporär und ersetzt atomar. |
| 17.1-DUP1 | Dashboardduplikat und Widget-ID-Remapping bleiben korrekt | PASS | `src/admin/js/dashboards.js`; `src/admin/js/layout.js`: `remapLayouts()`; `test/admin-ui.test.js` | Beide Profile werden mit neuer ID abgebildet. |
| 17.1-LEG1 | Legacy-Bundle bleibt ES5 und ohne Fetch/Promise/moderne Syntax | PASS | statischer Scan; 21× `node --check`; `test/admin-ui.test.js` | Kein moderner Pflichtpfad im Wall-Display. |
| 17.1-LEG2 | Kein CSS Grid, Flexbox `gap`, ResizeObserver oder Container Queries im Legacy-Frontend | PASS | statischer Scan `src/public`; `test/legacy-layout.test.js`, `test/system-frontend.test.js` | Admin darf modern bleiben und ist getrennt. |
| 17.1-SEC1 | Token ausschließlich backendseitig; keine Browser-HA-Verbindung | PASS | `src/services/homeassistant.js`; `src/services/homeassistant-websocket.js`; Securitytests | HA-WebSocket existiert nur im Backend. |
| 17.1-SEC2 | Keine neuen Schreibendpunkte, Domains oder Sichtbarkeits-/Layoutrechte | PASS | `src/routes/api.js`; `src/services/control-authorization.js`; `test/sprint-17-3.test.js`, `test/sprint-25-6.test.js` | Grid/Presentation konsumieren nur vorhandene explizite Capabilities. |
| 17.1-T1 | Geforderte Migration-, Presentation-, Inhalt-, Minimum-, Admin- und Regressionstests | PASS | `test/layout.test.js`, `test/legacy-layout.test.js`, `test/admin-ui.test.js`, `test/dashboard-persistence.test.js`, spätere Matrix-/Systemtests | Fokuslauf 114/114; Gesamtsuite 329/329. |
| 17.1-MAN1 | Alle kleinsten/normalen/großen Varianten in beiden Orientierungen auf realem iPad prüfen | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-09 | Einschließlich Sensor, Binary, Light, Climate, langer Texte und Themes. |
| 17.1-MAN2 | Climate Compact und Focus auf iPad: Ist/Soll, ±, Zentrierung, Touch | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-09 | Chromium-Messungen sind keine iOS-9-Abnahme. |
| 17.1-MAN3 | Summary/Errors nach Grid-Verfeinerung auf realem iPad regressionsprüfen | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-09 | Automatisierte Systemtests sind grün. |
| 17.1-MAN4 | Layoutpersistenz über LXC-/systemd-Neustart | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-10 | Lokaler Save/Reload ist belegt, realer Produktionsneustart nicht. |
| 17.1-N1 | Keine freie Pixelpositionierung, System-Business-Änderung, neue Writes, HA App oder HACS | PASS | Layout-/System-/Securityquellen und Tests | Spätere App-Verpackung ist eigenständig und verändert das Rastermodell nicht. |
| 17.1-DOC1 | Status/Roadmap/Cache dokumentiert | PASS | `docs/PROJECT_STATUS.md`, `docs/SPRINT_ROADMAP.md`; historischer Commit `53ce672`; `src/public/index.html` | Aktuell einheitlicher Assetparameter `v=51`. |

## Automated Tests

- Part-03-Fokuslauf: 114/114 bestanden.
- Gesamtsuite: 329/329 bestanden.
- Relevante Dateien: `test/layout.test.js`, `test/legacy-layout.test.js`,
  `test/admin-ui.test.js`, `test/dashboard-persistence.test.js`,
  `test/admin-api.test.js`, `test/system-frontend.test.js`,
  `test/sprint-17-2.test.js`, `test/sprint-25-6.test.js` und
  `test/sprint-26.test.js`.
- 21 Legacy-JavaScript-Dateien bestanden `node --check`.
- Der statische Scan fand keine verbotene moderne Syntax und keine der
  ausgeschlossenen CSS-/Browserfunktionen im Wall-Frontend.

## Controlled Browser Evidence

- Portrait 768×1024 und Landscape 1024×768: kein horizontaler Overflow,
  Profilwechsel und valide absolute Geometrie.
- Die sichtbaren Karten erhielten ausschließlich bekannte aktuelle
  Presentation-Tiers.
- Climate-Focus zeigte Ist-/Solltemperatur, HVAC-Status, zwei 56×56-px-
  Step-Controls und einen 54-px-hohen Power-Control ohne inneren Overflow.
- Admin-Resize, Kollision, Discard und Save/Reload wurden gegen eine temporäre
  Schema-12-Konfiguration verifiziert.
- Keine Console-Warnungen/-Fehler.

## Superseded Requirements

- Sprint 17.2 ersetzte die ursprüngliche Raster-Zeilenformel durch
  proportionale, reale Pixelmaße berücksichtigende Geometrie.
- Sprint 17.3 und 17.5 trennten Grid-DOM und Focus-DOM; interaktive Climate-
  Controls liegen heute absichtlich in der Focus-Ansicht.
- Sprint 17.6/17.7 vereinheitlichten Power-SVG und die vollständige
  Control-Hierarchie für Mobile Safari.
- Sprint 25.6 ersetzte `compact/normal/expanded` durch
  `compact/standard/wide/tall/large` und ergänzt Inhalts-/Capability-Hints.
- Sprint 26 isoliert dieselben Gridkoordinaten je Section; die persistierte
  Layoutarchitektur bleibt dieselbe.

## Security Review

PASS – die Gridverfeinerung und Präsentationslogik haben keine Schreibfläche.
Tokens bleiben backendseitig, Admin- und HA-Token getrennt, Clientdaten werden
serverseitig validiert und Sichtbarkeit/Layout erteilen keine Control-Grants.

## Legacy Safari / iPad Review

PARTIAL – alle statischen und automatisierten Legacy-Grenzen sind grün; die
physische iOS-9-Render-, Rotation- und Touch-Abnahme ist weiterhin offen.

## Standalone/LXC Review

PARTIAL – lokale Standalone-Laufzeit, Persistenz und Reload sind belegt. Der
produktive LXC wurde nicht kontaktiert oder neu gestartet.

## Home Assistant App Review

N/A – App-Verpackung war ein ausdrückliches Nicht-Ziel und wurde erst mit
Sprint 24 eingeführt. System-Dashboard- und Layoutdaten bleiben unabhängig vom
Runtime-Modus; die reale HAOS-Abnahme folgt später.

## Findings

- Kein aktuelles `MISSING` oder `BROKEN`.
- Keine Reparaturwarteschlange erforderlich.
- `NOT TESTED`: echte Pointer-/Touch-Gesten im Admin, physisches iPad mini und
  LXC-/systemd-Restart.

## Final Assessment

Sprint 17.1 erfüllt die weiterhin anwendbaren implementierbaren Anforderungen.
Die spätere Architektur ist eine dokumentierte Weiterentwicklung und keine
verdeckte Regression. Wegen der fehlenden realen iPad-/Runtime-Abnahmen bleibt
der Sprint-27-Baselinestatus `PARTIAL`.
