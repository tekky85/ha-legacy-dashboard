# Sprint 17.3 Audit

## Audit Metadata

- Sprint: 17.3
- Sprint title: Live Card Preview, Unified Controls & Focus Mode
- Audit date: 1. September 2026
- Repository commit: `8d5b4bd`
- Spec file: [`docs/sprints/SPRINT-17.3.md`](../../sprints/SPRINT-17.3.md)
- Working tree at Part-04 start: Anwendungscode sauber; ausschließlich die
  noch nicht committeten Auditdokumente aus Part 03 waren vorhanden.

## Overall Result

PARTIAL

Die geschützte Live-Preview, gemeinsamen Presentation-Regeln, vereinheitlichten
Light-/Climate-Controls, enge Climate-Power-API und der heute native, vom Grid
getrennte Focus-Renderer sind implementiert. Der kontrollierte Browserlauf
belegt aktuelle Vorschauwerte, read-only Controls, Profil-/Theme-Umschaltung,
Focus ohne Grid-Reflow sowie korrekte Control-Ereignistrennung. Die spätere
Sprint-26.2-Autorisierung supersediert die ursprüngliche Power-On-Auswahl und
erfüllt deren Sicherheitsziel zentral.

Der Sprint bleibt `PARTIAL`, weil die physische iPad-mini-/iOS-9-Abnahme und
die reale moderne Safari-/Pointer-Abnahme der Preview fehlen. Außerdem betrifft
der in Sprint 17.2 dokumentierte Cache-Buster-Befund auch die in Sprint 17.3
geänderte gemeinsame Legacy-Style-Datei.

## Requirement Matrix

| ID | Requirement | Status | Evidence | Notes |
|---|---|---|---|---|
| 17.3-A1 | Admin-Layouteditor zeigt eine Live Card Preview statt Platzhalter | PASS | `src/admin/js/app.js`: `renderLivePreview()`; `src/admin/css/admin.css`; kontrollierter Admin-Lauf | Fünf aktuelle Karten wurden als Sensor/Binary/Light/Climate-Preview gerendert. |
| 17.3-A2 | Preview nutzt aktuelle, vom Gateway gelieferte und bereinigte Entity-Daten | PASS | `GET /api/admin/preview` in `src/routes/admin.js`; `sanitizePreviewEntity()`; `src/admin/js/api.js` | Payload enthält nur benötigte Zustände/Attribute und keine Tokens oder Raw-HA-Strukturen. |
| 17.3-A3 | Kein direkter HA-Zugriff und keine HA-Credentials im Admin-Browser | PASS | Admin-API-Route; CSP; Securityscan; `test/sprint-17-3.test.js` | Browser spricht ausschließlich mit demselben Gateway-Origin. |
| 17.3-A4 | Batch-/Cache-orientierter Datenfluss ohne Request pro Karte/Frame | PASS | `/api/admin/preview` sammelt alle referenzierten Entities in einer HA-Batchabfrage; `loadPreviewEntities()` mit moderatem 15-s-Intervall | Keine N+1-Abfrage je Previewkarte. |
| 17.3-A5 | Preview zeigt Identität, Icon, Wert/Zustand, Typ, Größe und Presentation Mode | PASS | `renderLivePreview()`; `LegacyPresentation.getMode()`/`getIdentity()`; kontrollierter DOM-Snapshot | Aktuelle Werte, Identitäten und `compact`-Mode waren sichtbar. |
| 17.3-A6 | Light-/Climate-Preview zeigt Controls ausschließlich read-only | PASS | `.admin-preview-*`; kontrollierter Browserlauf | Alle vier Buttons innerhalb `.layout-card-preview` waren `disabled`; Preview führte keinen Write aus. |
| 17.3-A7 | Portrait/Landscape sowie Hell/Dunkel in der Preview wählbar | PASS | `activeLayoutProfile`, `previewTheme`; Admin-Buttons; kontrollierter Browserlauf | Landscape und `preview-theme-dark` wurden ohne Persistenz-/HA-Write angewendet. |
| 17.3-A8 | Preview bleibt bei Drag/Resize sichtbar und nutzt Candidate-Geometrie | PASS | `src/admin/js/app.js`: `showLayoutPreview()`, `renderLivePreview()`; Admin-UI-Tests | Reale Pointer-Geste bleibt MT-17. |
| 17.3-R1 | Admin und Wall-Display teilen Presentation-Entscheidungen | PASS | `src/public/js/core/presentation.js` wird vor `src/admin/js/app.js` geladen; `test/sprint-17-3.test.js` | Kein unabhängiges Regelwerk für Tiers/Identität. |
| 17.3-R2 | Preview muss kein zweites vollständiges Legacy-Runtime-Frontend sein | N/A | Sprint-Spezifikation; aktuelle bewusst reduzierte Admin-DOM | Gemeinsame Regeln und aktuelle Daten werden geteilt, Runtime-Events bleiben getrennt. |
| 17.3-U1 | Native, dashboardeigene Controls ersetzen iOS-artigen Switch | PASS | `src/public/js/controls/power.js`; Light-/Climate-/Focus-Renderer; Sprint-17.6-Test | Später als gemeinsames Inline-SVG-Control gehärtet. |
| 17.3-U2 | Gemeinsame Zustände On/Off/Busy/Disabled/Unavailable | PASS | Power-Control-Renderer und CSS-Stateklassen; Sprint-17.6-/26.2-Tests | Geometrie bleibt bei Statewechsel stabil. |
| 17.3-U3 | Controls sind touchfreundlich, klar beschriftet und themenfähig | PASS | `style.css`; ARIA-Labels; Sprint-17.7-Tests; kontrollierte Messung | Focus ± 56×56 px, Power 264×54 px. Reales iPad bleibt MT-15/16. |
| 17.3-CP1 | Enger `POST /api/climate/power` akzeptiert nur Entity und On/Off-Absicht | PASS | `src/routes/api.js`: Climate-Power-Route; Gateway-/Sprint-26.2-Tests | Keine browsergelieferte Domain, Servicebezeichnung oder beliebiger Modus. |
| 17.3-CP2 | Server prüft Domain, explizite Autorisierung, Availability und Capability | PASS | `src/services/control-authorization.js`; `src/services/climate-power.js`; `src/routes/api.js` | Sichtbarkeit im Dashboard erzeugt keine Schreibberechtigung. |
| 17.3-CP3 | Power Off nutzt ausschließlich festen `climate.set_hvac_mode`-Pfad | PASS | `src/routes/api.js`; Gatewaytest „Climate Power schaltet nur über festen HVAC-Service“ | Kein generischer HA-Serviceproxy. |
| 17.3-CP4 | Power On wählt nur einen tatsächlich unterstützten sicheren Nicht-Off-Modus | PASS | `src/services/climate-power.js`: `resolveOnMode()`; Sprint-26.2-Tests | Superseded durch Sprint 26.2: last-known, explizit bevorzugt, deterministischer unterstützter Fallback; niemals blind `heat`. |
| 17.3-CP5 | Climate ohne `off` plus Nicht-Off-Modus erhält keinen falschen Power-Control | PASS | zentrale Capability-Projektion; Sprint-26.2-Capability-Matrix | UI konsumiert ausschließlich Server-Capabilities. |
| 17.3-CP6 | Write-Rate-Limit und kontrollierte HA-Fehler | PASS | `src/routes/api.js`; `src/services/rate-limit.js`; Gatewaytests | Fehler liefern generische Browserantworten und loggen keine Tokens. |
| 17.3-F1 | Tap/Klick auf Karte öffnet genau eine Focus-Ansicht | PASS | `src/public/js/app.js`: `handleDashboardInteraction()`; `src/public/js/focus/focus.js` | Aktuelle Implementierung bindet per Widget-ID, nicht per geklontem Grid-DOM. |
| 17.3-F2 | Focus ist fixed Overlay und verursacht keinen Grid-Reflow | PASS | `style.css`: `.focus-overlay`, `.focus-panel`; kontrollierter Browserlauf | Grid-Rechteck vor/nach Öffnen blieb exakt 752×895.8 px an derselben Position. |
| 17.3-F3 | Focus hat Schließen-Button und schließt per Außenklick | PASS | `focus.js`: Overlay-/Close-Handler; Focus-Tests; kontrollierter Close-Button-Lauf | Keine `<dialog>`-/`<details>`-Pflicht und kein moderner Browserzwang. |
| 17.3-F4 | Control-Tap öffnet oder schließt Focus nicht versehentlich | PASS | `handleDashboardInteraction()` mit Button-Pfad, `preventDefault()`/`stopPropagation()`; Room-/Focus-Tests | Kontrollierter Light-Power-Klick ließ Focus geschlossen. |
| 17.3-F5 | Sensor/Binary/Light/Climate besitzen typgerechte Focus-Inhalte | PASS | `src/public/js/focus/view-model.js`, `renderer.js`; Sprint-17.5-Tests | Superseded: Sprint 17.5 ersetzte den ursprünglichen Clone-Ansatz durch native Renderer. |
| 17.3-F6 | Climate Focus zeigt Identität, Ist, Soll, HVAC und sichere Controls | PASS | `focus/renderer.js`; kontrollierter Climate-Focus-Lauf; Sprint-17.5-/26.2-Tests | Vollständige Steuerung bleibt vom Grid geometrisch getrennt. |
| 17.3-F7 | Stale/Unavailable deaktiviert Writes und Focus nutzt aktuelle Dashboarddaten | PASS | `focus/view-model.js`; `focus/focus.js`: `refresh()`; Sprint-17.5-Test | Kein zweiter Poll nur für Focus. |
| 17.3-F8 | Focus-Zustand wird nicht persistiert | PASS | `focus.js`; Dashboard-Konfigurationsschema | Nur die aktuelle Widget-ID existiert flüchtig im Browser. |
| 17.3-F9 | Focus bleibt in Light/Dark lesbar | PASS | `style.css` Theme-/Focus-Regeln; kontrollierter Theme-/Focus-Lauf | Reales iPad bleibt MT-14/15. |
| 17.3-P1 | Focus/Preview erzeugen keine zusätzlichen HA-Requests pro Frame oder Control | PASS | Dashboardrefresh plus Admin-Batchroute; keine Fetch-/Observer-Schleife | Focus `refresh()` nutzt den bereits vorhandenen State. |
| 17.3-P2 | Admin-/Focus-Zustände werden nicht versehentlich persistiert | PASS | Konfigschema enthält weder Previewtheme noch Focus-ID; Tests | Layout-/Widgetänderungen bleiben explizite Admin-Drafts. |
| 17.3-ACC1 | Focus-Schließen ist beschrifteter echter Button; Controls haben ARIA-Zustände | PASS | DOM-Snapshot; `focus/renderer.js`; `controls/power.js` | Close 44×44 px, Power mit `aria-pressed` und Labels. |
| 17.3-SEC1 | HA-/Supervisor-Token bleiben backend-only, Admin bleibt geschützt | PASS | `src/routes/admin.js`: `requireAdmin()`; Securityscan; Admin-/Securitytests | Fake-Admin-Token nur im isolierten Testlauf. |
| 17.3-SEC2 | Keine generische Service-API, keine neuen Domains oder automatische Allowlists | PASS | `src/routes/api.js`; `src/services/control-authorization.js`; Sprint-17.3-/26.2-Tests | Light und Climate nutzen enge feste Endpunkte. |
| 17.3-SEC3 | Preview-Input und Power-Payload werden serverseitig validiert | PASS | Admin-Preview-Entityfilter, API-Payloadprüfung, Rate-Limit | Manipulierte Entity-/Servicewerte werden nicht durchgereicht. |
| 17.3-LEG1 | Wall-Display bleibt ES5/Safari-iOS-9-kompatibel | PASS | 21× `node --check`; statischer Forbidden-Syntax-Scan | Kein Fetch, Promise, Arrow, `let/const`, Async/Await oder moderne Module. |
| 17.3-LEG2 | Kein CSS Grid, Flexbox-`gap`, ResizeObserver oder Container Query im Wall-Frontend | PASS | statischer Scan; Legacy-/Systemtests | Focus basiert auf fixed Positioning und klassischem Flexbox. |
| 17.3-CACHE1 | Geänderte Legacy-Assets verwenden einen konsistent erhöhten Cache-Buster | PARTIAL | `index.html` nutzt `v=51`; `system.html` lädt gemeinsames `style.css`/`theme.js` mit `v=44` | Gemeinsamer Reparaturpunkt RQ-04-01; besonders relevant für aggressives Safari-Caching. |
| 17.3-REG1 | Sprint-17.2-Geometrie/Theme sowie System-Dashboards bleiben regressionsfrei | PASS | Sprint-17.2-, Legacy-, Gateway- und Systemtests; Browserlauf | Kein Summary-/Error-Businesscode wurde in Part 04 verändert. Cacheauslieferung separat `PARTIAL`. |
| 17.3-TST1 | Preview-, Control-, Climate-Power-, Focus-, Security- und Regressionstests | PASS | `test/sprint-17-3.test.js`, 17.4–17.7, 25.6, 26.2, Gateway/Security | Part-04-Fokuslauf 127/127; Gesamtsuite 329/329. |
| 17.3-MAN1 | Reale Admin-Preview-Abnahme in aktuellem Safari mit Pointer/Resize | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-17 | Kontrollierter Chromium-Lauf belegt Grundfunktion, nicht reale Safari-/Pointer-Gesten. |
| 17.3-MAN2 | Reale iPad-Abnahme für Focus, Unified Controls, Climate und Light | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-14 bis MT-16 | Part 04 führte ausdrücklich keinen physischen iPad-Test durch. |

## Automated and Controlled Browser Evidence

- Part-04-Fokuslauf: 127/127 Tests bestanden.
- Vollständige Suite: 329/329 Tests bestanden.
- Kontrollierter lokaler Browserlauf mit sechs Fake-Entities:
  - Admin-Preview zeigte fünf Karten mit aktuellen Werten und Identitäten.
  - Portrait/Landscape und Hell/Dunkel ließen sich lokal umschalten.
  - alle vier Controls innerhalb der Preview waren deaktiviert.
  - Focus öffnete als einzelnes Overlay; Grid-Rechteck blieb unverändert.
  - Light-Power-Klick öffnete Focus nicht.
  - Climate-Focus zeigte zwei 56×56-px-Schrittbuttons und einen zentrierten,
    54 px hohen Power-Control.
  - keine Browser-Console-Warnung und kein Browser-Console-Fehler.
- Nur localhost-Mocks und Fake-Credentials; kein reales Home Assistant.

## Superseded Requirements

- Sprint 17.5 ersetzte den ursprünglichen Focus-Clone durch einen nativen
  View-Model-/Renderer-Pfad und trennte Focus- und Gridgeometrie vollständig.
- Sprint 17.6/17.7 ersetzten das ursprüngliche Power-/Control-Markup durch eine
  gemeinsame SVG-Komponente und eine stabilere Mobile-Safari-Hierarchie.
- Sprint 25.6 erweiterte die gemeinsamen Presentation-Regeln auf fünf Tiers.
- Sprint 26.2 ersetzte die frühere Behandlung mehrdeutiger HVAC-Modi durch eine
  zentrale, explizit autorisierte und capabilities-basierte Modusauflösung.

## Security Review

PASS – Preview und Focus erweitern die Write-Fläche nicht. Climate Power bleibt
ein enger serverseitig autorisierter Endpunkt; Domain, Entity, Zustand,
Capability und Payload werden geprüft. Tokens bleiben backend-only, und es
existiert kein Browser-HA-WebSocket oder generischer Serviceproxy.

## Runtime Relevance

- Standalone/LXC: der lokale Standalone-Pfad mit Mock-HA war grün; der
  produktive LXC wurde weder kontaktiert noch verändert.
- Home Assistant App: Focus/Preview und Control-Projektion sind unabhängig vom
  Backend-Verbindungsmodus. Eine reale HAOS-Abnahme gehört in spätere Parts.

## Findings

- `PARTIAL`: gemeinsamer Cache-Buster-Befund RQ-04-01.
- `NOT TESTED`: reale iPad-Focus-/Control-Abnahmen MT-14 bis MT-16 und reale
  Safari-/Pointer-Preview-Abnahme MT-17.
- Kein `MISSING` und kein aktuell reproduzierter funktionaler `BROKEN`-Befund.

## Final Assessment

Sprint 17.3 ist im aktuellen Code funktional weitgehend umgesetzt. Wegen des
Cache-Buster-Befunds und der bewusst ausstehenden realen Safari-/iPad-Abnahmen
bleibt der Sprint-27-Baselinestatus `PARTIAL`.
