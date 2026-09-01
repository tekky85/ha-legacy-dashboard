# Sprint 17.4 Audit

## Audit Metadata

- Sprint: 17.4
- Sprint title: Focus Overlay Layout Stabilization
- Audit date: 1. September 2026
- Repository commit: `8d5b4bd`
- Spec file: [`docs/sprints/SPRINT-17.4.md`](../../sprints/SPRINT-17.4.md)
- Working tree at Part-05 start: Anwendungscode sauber; ausschließlich die
  noch nicht committeten Auditdokumente aus Parts 03 und 04 sowie der vom
  Benutzer bereitgestellte Part-05-Prompt waren vorhanden.

## Overall Result

PARTIAL

Die Focus-Geometrie verwendet reale Viewportmaße, hält die Grid-Geometrie
unverändert, priorisiert Kernwerte und Controls, sperrt und restauriert den
Hintergrundscroll und vermisst einen offenen Focus bei Resize/Rotation neu.
Sensor, Binary, Light und Climate wurden im kontrollierten Browser in Portrait
und Landscape geprüft; selbst der Climate-Focus passte bei 320×460 ohne
horizontalen oder vertikalen Overflow. Der Sprint bleibt dennoch `PARTIAL`,
weil die ausdrücklich verlangte physische iPad-mini-/iOS-9-Abnahme in diesem
Audit-Part nicht durchgeführt wurde.

## Requirement Matrix

| ID | Requirement | Status | Evidence | Notes |
|---|---|---|---|---|
| 17.4-RC1 | Tatsächliche Ursache der Sprint-17.3-Regression identifizieren und dokumentieren | PASS | Historischer Diff `7afc8ac`; `docs/PROJECT_STATUS.md`, Abschnitt 8b | Der ursprüngliche Clone behielt Grid-/Expanded-Regeln; Focus nutzte feste Mindesthöhen, und Overlay sowie Shell scrollten gleichzeitig. Eine echte Viewport-Neuvermessung fehlte. |
| 17.4-SEC1 | HA-Token backend-only, keine direkte Browser-HA-Verbindung oder generische Service-API | PASS | `src/routes/api.js`; `src/services/control-authorization.js`; `test/security.test.js`; statischer Public-Scan | Focus enthält weder HTTP-Client noch Tokenbezeichner und erweitert keine Write-Fläche. |
| 17.4-SEC2 | Focus erzeugt keine Schreibrechte; stale/unavailable deaktiviert Controls | PASS | `src/public/js/focus/view-model.js`: `commonModel()`, `lightModel()`, `climateModel()`; `test/sprint-17-5.test.js` | Capabilities kommen weiterhin ausschließlich aus der serverseitigen Projektion. |
| 17.4-LEG1 | ES5/iOS-9-kompatibles Wall-JavaScript ohne Fetch, Promise oder moderne Syntax | PASS | 21 Public-JS-Dateien mit `node --check`; Forbidden-Syntax-Scan; `test/sprint-17-4.test.js` | Kein moderner Pflichtpfad im Focus. |
| 17.4-LEG2 | Kein CSS Grid, Flexbox-`gap`, ResizeObserver oder Container Query | PASS | statischer Scan `src/public`; `test/legacy-layout.test.js`, `test/system-frontend.test.js` | Focus verwendet klassisches, mit `-webkit-` ergänztes Flexbox. |
| 17.4-H1 | Informationshierarchie Identity → Primärwert → Controls → Sekundärinfo | PASS | `src/public/js/focus/renderer.js`: `header()`, typgetrennte Renderer; Focus-CSS | Climate rendert Ist/Soll und Controls vor `secondary()`, technische Details werden nicht vorgeschaltet. |
| 17.4-V1 | Geometrie aus `innerWidth`/`innerHeight` mit sicheren Fallbacks statt nur `100vh` | PASS | `src/public/js/focus/focus.js`: `getFocusViewportMetrics()`, `calculateFocusGeometry()`; `test/sprint-17-4.test.js` | 768×1024, 1024×768 und 320×460 wurden berechnet und im Browser gemessen. |
| 17.4-V2 | Focus überschreitet den sichtbaren Viewport nicht | PASS | `applyViewportGeometry()`; `.focus-overlay`, `.focus-panel`; kontrollierter Browserlauf | Panel lag in allen drei Viewports vollständig innerhalb der Grenzen. |
| 17.4-D1 | Logische Focus-Regionen für Header, Primary, Controls und Secondary | PASS – superseded by Sprint 17.5 | `src/public/js/focus/renderer.js`; `src/public/css/style.css`: `NATIVE FOCUS INTERACTION VIEW` | Sprint 17.5 ersetzte den strukturierten Clone durch echtes Focus-DOM und erfüllt die 17.4-Zielstruktur sauberer. |
| 17.4-SC1 | Kein unnötiger Focus-Scroll durch Margins, feste Min-Heights oder dekorative Elemente | PASS | Focus-CSS; kontrollierter Browserlauf | Sensor/Binary/Light/Climate hatten `clientHeight == scrollHeight`; Climate auch bei 320×460. |
| 17.4-SC2 | Header/Close bleibt sichtbar, Zusatzinhalt darf nur bei echter Überhöhe kontrolliert scrollen | PASS | `.focus-toolbar` ist nicht Teil von `.focus-content`; `.focus-content` hat `overflow-y:auto`; `.focus-secondary` eigenen Scrollschutz | Der gesamte Content ist nur ein Fallback bei echter Überhöhe; in allen geprüften Referenzgrößen war kein Scroll erforderlich. |
| 17.4-BG1 | Dashboard-Hintergrund sperren und Scrollposition beim Schließen restaurieren | PASS | `lockPageScroll()`, `unlockPageScroll()`; Test „Focus sperrt und restauriert den Dashboard-Scroll“; Browser-Außenklick | Body wird fixed/hidden und danach auf die gespeicherte Position zurückgesetzt. |
| 17.4-G1 | Focus darf Grid nicht reflowen oder neu dimensionieren | PASS | `focus.js`; Test „Focus-Refresh bewahrt … keine Grid-Geometrie“; Browsermessung | Grid-Rechteck blieb beim Öffnen unverändert; Focus erhält nur eigene Panelmaße. |
| 17.4-S1 | Sensor zeigt Identity, Wert und Unit ohne unnötigen Scroll | PASS | `renderSensorFocus()`; kontrollierter 768×1024-Lauf | 716 px breites, 244 px hohes Widget ohne Overflow. |
| 17.4-B1 | Binary zeigt Identity, Zustand und Icon ohne unnötigen Scroll | PASS | `renderBinaryFocus()`; kontrollierter 768×1024-Lauf | „Küche / Fenster rechts / Offen“ vollständig und ohne Overflow. |
| 17.4-L1 | Light zeigt Identity, Zustand und Power-Control mindestens ca. 44 px | PASS – superseded by Sprint 17.6/17.7 | `renderLightFocus()`; gemeinsame Power-Komponente; Browsermessung | Aktuelles Power-Control 180×54 px und zentriert; spätere Sprints ersetzten Glyph/Control-Hierarchie. |
| 17.4-C1 | Climate zeigt Identity, Ist, Soll, Minus, Plus und erlaubtes Power ohne unnötigen Scroll | PASS – superseded by Sprint 17.5–17.7/26.2 | `renderClimateFocus()`; Focus- und Controltests; Browsermessung | Portrait, Landscape und 320×460 vollständig; ± je 56×56 px, Power 54 px hoch. Capability/Autorisierung ist heute zentral. |
| 17.4-C2 | Landscape nutzt Breite bewusst | PASS | `.focus-layout-landscape .focus-widget-climate`; kontrollierter 1024×768-Lauf | Primärwert und Controls werden in 36/64-Prozent-Bereiche verteilt. |
| 17.4-CTL1 | Controls liegen vor Details, werden nicht abgeschnitten und bleiben außerhalb falscher Eventpfade | PASS | `renderer.js`; `app.js`: `handleDashboardInteraction()`; Browser-Control-Lauf | Plus aktualisierte den offenen Focus, ohne ein zweites Overlay zu öffnen oder zu schließen. |
| 17.4-DET1 | Optional einklappbarer technischer Detailbereich | N/A | Sprint-Spezifikation bezeichnet ihn als optional empfohlen; aktueller Renderer liefert keine technischen Raw-Details | Es besteht keine Pflicht, technische Daten in den Browser zu senden. |
| 17.4-OR1 | Orientation Change misst neu, hält Focus offen und erzeugt keinen Doppel-Focus | PASS | `handleViewportChange()`; Test „Rotation vermisst …“; Browserlauf 768×1024→1024×768→320×460 | Genau ein `.focus-widget`, korrekte Portrait/Landscape/Short-Klassen. |
| 17.4-ST1 | State Refresh hält Focus offen und aktualisiert Inhalt ohne vollständige Layoutmessung je Poll | PASS | `render()`, `refresh()`; Tests „Focus-Refresh …“ und Sprint-17.5-State-Binding | Markup wird nur bei Änderung ersetzt; Viewportmessung erfolgt nicht im normalen Refreshpfad. |
| 17.4-ST2 | Busy, stale und unavailable bleiben sicher | PASS | `disableDashboardControls()`; Focus View Model; Sprint-17.5-/26.2-Tests | Stale/unavailable deaktiviert Writes; Browser-Control blieb nach Refresh geöffnet. |
| 17.4-TH1 | Bestehende globale Theme-Logik unverändert verwenden | PASS | `src/public/js/core/theme.js`; Dark-Focus-Browsermessung; `test/sprint-17-2.test.js` | Dark Focus hatte lesbare, explizite Farben. RQ-04-01 betrifft die gemeinsame Assetversion, nicht die Focus-Theme-Logik. |
| 17.4-SYS1 | Summary-/Error-Businesslogik unverändert | PASS | `src/routes/system-dashboards.js`; `test/system-frontend.test.js`, `test/gateway.test.js` | Part 05 änderte keinen Anwendungscode. |
| 17.4-AP1 | Admin-Focus-Preview nur nachziehen, falls vorhanden | N/A | `src/admin/js/app.js` besitzt Grid-Live-Preview, aber keine Focus-Preview | Die Spezifikation verlangt keine Neueinführung. |
| 17.4-P1 | Focus-Layout nur bei Open, Orientation/Resize oder relevanter Änderung neu vermessen | PASS | `open()`, `handleViewportChange()` mit 60-ms-Debounce, `refresh()` | Poll-Refresh rendert Daten, ruft aber `applyViewportGeometry()` nicht auf. |
| 17.4-T1 | Focus-, Viewport-, Scroll-, Rotation-, State- und Securitytests | PASS | `test/sprint-17-4.test.js`, `test/sprint-17-5.test.js`, spätere Controltests | Part-05-Fokuslauf 99/99; Gesamtsuite 329/329. |
| 17.4-MAN1 | Reale iPad-mini-/iOS-9-Abnahme in Portrait und Landscape | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-18 | In Part 05 werden ausdrücklich keine physischen iPad-Tests durchgeführt. |
| 17.4-SHOT1 | Focus-Screenshot nach sichtbarer Änderung prüfen | PASS | `docs/screenshots/dashboards/focus-card.png`, 768×1024 | Visuell geprüft; zeigt den aktuellen nativen Climate-Focus ohne private IP oder Token. Keine neue Aufnahme erforderlich. |
| 17.4-DOC1 | README DE/EN, Projektstatus und Roadmap dokumentieren | PASS | `README.de.md`, `README.en.md`, `docs/PROJECT_STATUS.md`, `docs/SPRINT_ROADMAP.md` | Beide README-Sprachen beschreiben dieselbe eigenständige viewportbasierte Focus-Ansicht. |
| 17.4-N1 | Keine neuen Widgettypen, Writes oder Summary/Error-Regeln | PASS | aktueller Diff/Routes/Tests | Part 05 ist ein reines Audit und verändert keine Anwendung. |

## Automated and Controlled Browser Evidence

- Part-05-Fokuslauf: 99 Tests bestanden, 0 fehlgeschlagen.
- Der erste Fokusversuch hatte ausschließlich beim lokalen Gateway-Mock ein
  sandboxbedingtes `listen EPERM`; derselbe Lauf mit erlaubtem localhost-Bind
  bestand vollständig.
- Vollständige Suite: 329 Tests bestanden, 0 fehlgeschlagen.
- 21 Legacy-JavaScript-Dateien bestanden `node --check`.
- Statischer Scan: keine verbotene moderne JavaScript-Syntax, kein CSS Grid,
  kein Flexbox-`gap`, kein `ResizeObserver`, keine Container Query und keine
  Public-Tokenreferenz.
- Kontrollierter lokaler Browserlauf mit Fake-HA:
  - Sensor/Binary/Light/Climate bei 768×1024 ohne Focus-Overflow.
  - Light Power 180×54 px; Climate ± 56×56 px und Power 54 px.
  - Climate bei 1024×768 und 320×460 vollständig im Viewport.
  - Rotation hielt genau einen Focus offen; Grid blieb unverändert.
  - Control-Tap hielt Focus offen; Außenklick löste Body-Scroll-Lock.
  - Dark Mode lesbar; keine Console-Warnung und kein Console-Fehler.
- Ausschließlich localhost-Mocks und Fake-Credentials; kein reales Home
  Assistant und kein produktiver LXC wurden kontaktiert.

## Superseded Requirements

- Sprint 17.5 ersetzte den Sprint-17.4-Clone vollständig durch View Model und
  typgetrennte native Renderer.
- Sprint 17.6/17.7 ersetzten Power-Glyph und native Button-Flexhierarchie durch
  gemeinsames Inline-SVG, Control-Row, Group, Button und Content.
- Sprint 26.2 ersetzte die damalige Capability-/Allowlistbehandlung durch die
  zentrale explizite Light-/Climate-Autorisierung.

## Security Review

PASS – Focus konsumiert nur bereinigte Dashboardzustände und serverseitig
projizierte Capabilities. Tokens bleiben backend-only, es gibt keinen
Browser-zu-HA-WebSocket, keinen generischen Serviceproxy und keine neue
Schreibdomain.

## Runtime Relevance

- Standalone/LXC: lokaler Standalone-Pfad mit Fake-HA war grün; produktiver
  LXC wurde weder kontaktiert noch verändert.
- Home Assistant App: Focus ist unabhängig vom Backend-Verbindungsmodus. Eine
  reale HAOS-Abnahme ist kein Sprint-17.4-Pflichtpunkt und folgt später.

## Findings

- Kein aktuelles `MISSING` oder `BROKEN`.
- Kein neuer umsetzbarer Reparaturpunkt.
- `NOT TESTED`: physische iPad-mini-/iOS-9-Abnahme MT-18.
- RQ-04-01 aus Part 04 bleibt separat offen.

## Final Assessment

Sprint 17.4 erfüllt die weiterhin anwendbaren implementierbaren Anforderungen.
Wegen der fehlenden realen Zielgeräteabnahme bleibt der Sprint-27-
Baselinestatus `PARTIAL`.
