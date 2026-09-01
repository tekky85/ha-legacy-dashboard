# Sprint 17.5 Audit

## Audit Metadata

- Sprint: 17.5
- Sprint title: Native Focus Renderer & Mobile Safari Stabilization
- Audit date: 1. September 2026
- Repository commit: `8d5b4bd`
- Spec file: [`docs/sprints/SPRINT-17.5.md`](../../sprints/SPRINT-17.5.md)
- Working tree at Part-05 start: kein Anwendungscode verändert; vorhandene
  uncommittete Änderungen gehörten ausschließlich zum laufenden Sprint-27-
  Audit und zum bereitgestellten Part-05-Prompt.

## Overall Result

PARTIAL

Die zentrale Architekturentscheidung ist im aktuellen Code eindeutig
umgesetzt: Focus ist eine eigene Interaction View. Ein reines Focus View Model
und vier typgetrennte Renderer erzeugen neues Focus-DOM aus Widgetdefinition,
bereinigtem State und Gateway-Capabilities. Es wird weder Grid-DOM geklont noch
werden `x/y/w/h`, Inline-Größen oder Presentation-Klassen übernommen. Der
kontrollierte Viewport-Lauf reproduzierte keine Kompression und bestätigte
vollständige Controls bis 320×460. Die von der Spezifikation verlangten realen
Abnahmen auf iPad Air 2/iPadOS 15.8.5, macOS Safari und Legacy-iOS-9 fehlen in
diesem Baseline-Part; deshalb bleibt der Gesamtstatus `PARTIAL`.

## Requirement Matrix

| ID | Requirement | Status | Evidence | Notes |
|---|---|---|---|---|
| 17.5-RC1 | Root Cause vor Implementierung vollständig untersuchen und dokumentieren | PASS | Historischer Diff `c5ae594`; `docs/PROJECT_STATUS.md`, Abschnitt 8c | 17.4 verwendete weiter `cloneNode(true)` und behielt `.card`, Typ- und Presentation-Klassen. Mobile-Media-Queries, Grid-Min-Heights und fehlender Shrink-Schutz wirkten im fixed Overlay weiter. |
| 17.5-RC2 | Viewportberechnung als mögliche Ursache prüfen | PASS | `getFocusViewportMetrics()`; historischer Bericht | Die Messung war korrekt; die verbleibende Kompression entstand aus Clone/Grid-CSS und Mobile-Safari-Flex-Min-Content, nicht aus `innerWidth/innerHeight`. |
| 17.5-A1 | Focus als separate Interaction View statt weitere Kartengröße | PASS | `src/public/js/focus/focus.js`, `view-model.js`, `renderer.js` | Dateikommentare und Datenfluss sind eindeutig vom Grid getrennt. |
| 17.5-A2 | Eigenes Focus View Model aus Widget, aktuellem State und Capabilities | PASS | `LegacyFocusViewModel.create()`; `Dashboard.getFocusSource()` | Es werden weder Layoutprofil noch gerenderte Card übergeben. |
| 17.5-A3 | Dedizierte Renderer für Sensor, Binary, Light und Climate | PASS | `renderSensorFocus()`, `renderBinaryFocus()`, `renderLightFocus()`, `renderClimateFocus()` | Alle vier liefern typgebundenes Focus-DOM. |
| 17.5-A4 | Kein `cloneNode()` als Focus-Hauptimplementierung | PASS | statischer Scan `src/public/js/focus`; `test/sprint-17-5.test.js` | Kein Clone und keine Suche nach Grid-Cards. |
| 17.5-A5 | Keine persistente Grid-Geometrie oder Grid-Inline-Styles übernehmen | PASS | `focus.js`, `renderer.js`; Tests „Focus besitzt …“, „Climate Focus …“ | Renderer-Markup enthält weder `style=` noch `card-size-*`, `card-presentation-*` oder Layoutdaten. |
| 17.5-CSS1 | Eigener Focus-CSS-Namespace ohne Grid-Selector-Vererbung | PASS | isolierter Abschnitt `NATIVE FOCUS INTERACTION VIEW`; Sprint-17.5-/17.6-/17.7-Tests | Focus-Abschnitt enthält keine `.card`-, Size- oder Presentation-Selektoren. |
| 17.5-CSS2 | Panel/Widget/Controls mit `box-sizing`, `min-width/min-height` und Shrink-Schutz | PASS | `.focus-panel`, `.focus-widget`, `.focus-action`; kontrollierter Browserlauf | Panel und alle Nachfahren verwenden border-box; wichtige Flexknoten sind `flex-shrink:0`. |
| 17.5-CSS3 | Keine Focus-Skalierung über `transform:scale()` oder `zoom` | PASS | isolierter Focus-CSS-Scan; `test/sprint-17-5.test.js` | Grid besitzt andere aktive Transformeffekte, diese liegen außerhalb des Focus-Namespace. |
| 17.5-CSS4 | Relevante Mobile-/Tablet-Media-Queries und Spezifität isolieren | PASS | `@media (max-width:520px)` enthält nur `.focus-*`; nachfolgende Card-Media-Queries verwenden `.card-*` | Grid-Regeln greifen nicht auf `.focus-widget`. |
| 17.5-V1 | Tatsächliche Viewportmaße mit Fallbacks verwenden | PASS | `getFocusViewportMetrics()`, `calculateFocusGeometry()` | Kein Bezug auf Gridbreite; Maximalbreite 760 px und reale Außenränder. |
| 17.5-V2 | Panel darf nicht winzig werden oder Viewport überschreiten | PASS | Focus-CSS/Geometrie; Browsermessungen 768×1024, 1024×768, 320×460 | Kleinster Lauf: Panel 304×380,6 px innerhalb 320×460. |
| 17.5-S1 | Sensor Focus: Identity, Wert, Unit, sinnvolle Größe, keine Gridklasse | PASS | `renderSensorFocus()`; Renderer-Test; Browserlauf | 716×244 px ohne Overflow. |
| 17.5-B1 | Binary Focus: Identity, Zustand, Icon, keine Stauchung | PASS | `renderBinaryFocus()`; Renderer-Test; Browserlauf | 716×244 px ohne Overflow. |
| 17.5-L1 | Light Focus: Identity, Zustand, bedienbares Power-Control ≥44 px | PASS – superseded by Sprint 17.6/17.7 | `renderLightFocus()`; gemeinsames Power-Control; Browserlauf | Aktuelles Control 180×54 px; SVG und Zentrierung wurden später absichtlich ersetzt/gehärtet. |
| 17.5-C1 | Climate Focus: Identity, Ist, Soll, Minus, Plus und erlaubtes Power | PASS – superseded by Sprint 17.6/17.7/26.2 | `renderClimateFocus()`; Sprint-17.5-/17.7-/26.2-Tests; Browserlauf | Aktuell ± 56×56 px, Power 54 px; sichere Power-/Setpoint-Capabilities zentral. |
| 17.5-C2 | Portrait und Landscape besitzen bewusste eigene Focus-Geometrie | PASS | `.focus-layout-landscape`, `.focus-layout-short`; Rotationstest und Browserlauf | Landscape nutzt 36/64-Aufteilung; Short ordnet Controls platzsparend um. |
| 17.5-TG1 | Direkte Control-Taps öffnen oder schließen Focus nicht versehentlich | PASS | `app.js`: `handleDashboardInteraction()`; Sprint-17.7-/26.1-Tests; Browser-Plus-Klick | Nach Control-Aktion blieb genau ein Climate-Focus offen. |
| 17.5-ST1 | Focus bindet per Widget-ID an den aktuellen Dashboardstate | PASS | `Dashboard.getFocusSource(widgetId)`; `LegacyFocus.initialize()` | Kein separater Focus-Poll und keine DOM-State-Kopie. |
| 17.5-ST2 | Refresh aktualisiert View Model/DOM, hält Focus offen und übernimmt keine Gridgeometrie | PASS | `render()`, `refresh()`; Sprint-17.4-/17.5-Tests | Scrollposition wird bewahrt; Geometrie wird beim normalen Poll nicht neu vermessen. |
| 17.5-ST3 | unavailable/stale behält Größe, zeigt Zustand und deaktiviert Writes | PASS | `commonModel()`, `wrapper()`; Test „Unavailable Focus bleibt groß …“ | Drei Climate-Writes sind im unavailable-Fixture deaktiviert. |
| 17.5-SC1 | Scroll-Policy aus Sprint 17.4 bleibt erhalten | PASS | `.focus-toolbar`, `.focus-content`, `.focus-secondary`; Part-05-Browserlauf | Kein Referenzviewport benötigte Scroll; echter Überlauf bleibt kontrolliert. |
| 17.5-BODY1 | Fixed Overlay, Hintergrund-Scroll-Lock und Close/Außenklick | PASS | `.focus-overlay`; `lockPageScroll()`/`unlockPageScroll()`; Browserlauf | Außenklick entfernte Overlayklasse und Body-Lock. |
| 17.5-G1 | Grid-Renderer und Gridgeometrie bleiben unabhängig | PASS | `Dashboard.getFocusSource()` liefert nur Daten; Focus-Renderer ohne Gridselectors | Focus-Öffnen änderte das gemessene Grid-Rechteck nicht. |
| 17.5-AP1 | Normale Admin-Live-Preview bleibt gridorientiert; Focus-Preview optional | N/A | `src/admin/js/app.js`: `renderLivePreview()` | Es existiert keine Focus-Preview und keine Pflicht zur Neueinführung. |
| 17.5-TH1 | Theme-Persistenz und Compact-Identity unverändert | PASS | `theme.js`; Presentation-/Focus-Tests; Dark-Browserlauf | RQ-04-01 bleibt als separater Cache-Buster-Befund aus Part 04 bestehen. |
| 17.5-SYS1 | Summary/Errors und deren Businesslogik unverändert | PASS | Systemtests und Gatewaytests | Gesamtsuite vollständig grün; Part 05 änderte keinen Anwendungscode. |
| 17.5-SEC1 | Keine neue Write-API, Domain oder automatische Allowlist | PASS | `src/routes/api.js`; `src/services/control-authorization.js`; Securitytests | Light/Climate bleiben enge, serverseitig autorisierte Endpunkte. |
| 17.5-SEC2 | Tokens backend-only, kein Browser-HA-WebSocket | PASS | statischer Public-Scan; `src/services/homeassistant*.js`; `test/security.test.js` | Focus-Bundle enthält keine Tokenreferenz und keinen HTTP-/WS-Client. |
| 17.5-LEG1 | ES5/Safari-iOS-9-kompatibles JavaScript | PASS | 21× `node --check`; Forbidden-Syntax-Scan | Kein `let/const`, Arrow, Fetch, Promise, Async/Await, Optional Chaining oder `??`. |
| 17.5-LEG2 | Kein CSS Grid, `gap`, ResizeObserver, Container Query, Web Component oder Shadow DOM | PASS | statischer Scan `src/public`; Legacy-/Systemtests | Admin bleibt als moderner separater Client außerhalb dieser Grenze. |
| 17.5-P1 | Kein N+1-HA-Request und kein Focus-Request pro Frame | PASS | `Dashboard.getFocusSource()` liest vorhandenen Statecache; `focus.js` ohne HTTP | Focus erzeugt keine eigene Datenpipeline. |
| 17.5-T1 | Renderer-Separation, CSS-Isolation, Viewport, Typen, State, Security und Regression testen | PASS | `test/sprint-17-5.test.js`, 17.4/17.6/17.7/25.6/26.2, Gateway/System/Security | Part-05-Fokuslauf 99/99; Gesamtsuite 329/329. |
| 17.5-MAN1 | iPad Air 2/iPadOS 15.8.5 Safari reproduzieren und abnehmen | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-19 | Der bestätigte reale Referenzfehler darf ohne Hardwarelauf nicht als PASS gelten. |
| 17.5-MAN2 | macOS 13.7.8 Safari auf Nichtregression prüfen | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-20 | Kontrollierter Chromium-Lauf ersetzt Safari nicht. |
| 17.5-MAN3 | Legacy-iPad/iOS-9 Focus in Portrait/Landscape und Controls prüfen | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-18 | Wird mit der vertieften 17.4-Abnahme kombiniert. |
| 17.5-SHOT1 | Focus-Screenshot prüfen/aktualisieren, nur reale App/Demo | PASS | `docs/screenshots/dashboards/focus-card.png` | Vorhandener 768×1024-Screenshot zeigt aktuellen nativen Climate-Focus mit SVG-Power und bleibt repräsentativ. |
| 17.5-DOC1 | Architektur, Mobile-Safari-Ansatz und Browsermatrix dokumentieren | PASS | README DE/EN; `docs/PROJECT_STATUS.md`, Abschnitt 8c; Roadmap 17.5 | README-Sprachen sind semantisch synchron. |
| 17.5-N1 | Keine neuen Widgettypen, Writes, Systemregeln, App-/HACS- oder Grid-Neuentwicklung | PASS | aktueller Repository-Diff und Routes | Spätere Features sind getrennte, spezifizierte Sprints. |

## Automated and Controlled Browser Evidence

- Part-05-Fokuslauf: 99/99 Tests bestanden.
- Der erste Lauf war nur durch ein sandboxbedingtes `listen EPERM` des lokalen
  Gateway-Mocks unvollständig; der identische freigegebene localhost-Lauf war
  vollständig grün.
- Vollständige Regression: 329/329 Tests bestanden.
- Syntax und statische Legacy-/Security-Scans vollständig grün.
- Kontrollierter Browser mit sechs Fake-Entities:
  - native Focus-DOMs für alle vier Typen sichtbar;
  - kein Grid-/Focus-Overflow in 768×1024 und 1024×768;
  - Climate auch in 320×460 vollständig, alle drei Controls erreichbar;
  - Rotation bei offenem Focus, Control-Ereignistrennung, Außenklick,
    Body-Lock und Dark Theme erfolgreich;
  - keine Console-Warnungen oder -Fehler.
- Kein reales HA, keine produktive `.env`, keine echten Credentials.

## Superseded Requirements

- Sprint 17.6 ersetzte getrennte Unicode-/SVG-Powerdarstellungen durch eine
  gemeinsame Inline-SVG-Komponente.
- Sprint 17.7 ersetzte native Button-Flex-Parents durch die explizite
  Row/Group/Button/Content-Hierarchie für Mobile Safari.
- Sprint 25.6 härtete Grid-Presentation weiter, ohne die Focus/Grid-Trennung zu
  verändern.
- Sprint 26.2 zentralisierte Light-/Climate-Capabilities und Autorisierung;
  Focus konsumiert weiterhin nur deren bereinigten Payload.

## Security Review

PASS – die native Focus-Ansicht erweitert weder Daten- noch Schreibfläche.
Entity, Domain, Aktion und Payload bleiben serverseitig validiert; HA- und
Supervisor-Token bleiben backend-only.

## Runtime Relevance

- Standalone/LXC: lokaler Standalone-Focuspfad ist mit Fake-HA grün;
  produktiver LXC wurde nicht kontaktiert.
- Home Assistant App: Renderer und State-Binding sind verbindungsmodusneutral.
  Eine reale HAOS-Abnahme gehört in spätere Audit-Parts.

## Findings

- Kein aktuelles `MISSING` oder `BROKEN`.
- Kein neuer umsetzbarer Reparaturpunkt.
- `NOT TESTED`: MT-18 (Legacy-iOS-9), MT-19 (iPad Air 2/iPadOS 15.8.5) und
  MT-20 (macOS Safari).
- RQ-04-01 bleibt unverändert offen und wird nicht in Part 05 repariert.

## Final Assessment

Sprint 17.5 ist architektonisch und automatisiert vollständig vorhanden. Die
fehlenden spezifizierten realen Safari-/iPad-Abnahmen verhindern im
Sprint-27-Baseline-Audit ein `PASS`; Gesamtstatus bleibt `PARTIAL`.
