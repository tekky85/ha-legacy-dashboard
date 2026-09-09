# Sprint 18 Audit

## Audit Metadata

- Sprint: 18
- Sprint title: System Dashboard Foundation
- Audit date: 7. September 2026
- Repository commit: `09422e0`
- Spec file: [`docs/sprints/SPRINT-18.md`](../../sprints/SPRINT-18.md)
- Working tree at Part-07 start: kein veränderter Anwendungscode; vorhanden
  waren ausschließlich die noch nicht committeten Auditdokumente aus Part 06
  und die bereitgestellten Part-06-/Part-07-Prompts.

## Overall Result

PARTIAL

Die System-Dashboard-Grundlage ist im aktuellen Code vollständig vorhanden:
feste Systemrouten, serverseitige Sammelabfrage, normalisierter und reduzierter
Snapshot, gemeinsamer 3-Sekunden-Cache mit In-flight-Deduplizierung,
Last-successful-/Stale-/Offline-/Recovery-Semantik, getrennte Summary-/Issue-
Engines sowie eine gemeinsame ES5-System-Shell. Die spätere Registry-, Error-
und Automationsdiagnostik erweitert diese Architektur read-only, ohne sie zu
ersetzen. Keine aktuelle funktionale Anforderung ist `MISSING` oder `BROKEN`.

Der Gesamtstatus bleibt `PARTIAL`, weil die ausdrücklich verlangten manuellen
Abnahmen im modernen Browser und auf dem realen iPad mini nicht durchgeführt
wurden. Der in Part 04 gefundene Cache-Buster `RQ-04-01` ist seit Sprint
27.1-B code-seitig geschlossen.

## Requirement Matrix

| ID | Requirement | Status | Evidence | Notes |
|---|---|---|---|---|
| 18-ARCH1 | System-Dashboards bleiben Teil des externen Node-/Express-Gateways | PASS | `src/server.js`, feste `/system/*`-Routen; `src/routes/system-dashboards.js` | Keine Lovelace-, Custom-Panel- oder HA-Frontend-Abhängigkeit. |
| 18-SEC1 | HA-Token ausschließlich im Backend; keine direkte Browser-HA-Verbindung | PASS | `src/services/homeassistant.js:getAllEntities()`; CSP `connect-src 'self'` in `src/server.js`; Gateway-/Securitytests | Browser fragt nur `/api/system-dashboards/*` über `Legacy.http` ab. |
| 18-SEC2 | Keine generische Service-API, neue Writes, Schnell-, Repair-, Reload- oder Reauth-Aktionen | PASS | `src/routes/system-dashboards.js`; Public-Source-Scan; API-Regression | Systemrouter besitzt ausschließlich GET-Routen. Spätere Diagnoserouten sind read-only. |
| 18-SEC3 | Sichtbarkeit erzeugt keine Write-Berechtigung; Write-Autorisierung bleibt getrennt | PASS – superseded by Sprint 26.2 | `src/services/control-authorization.js`; enge Light-/Climate-Routen in `src/routes/api.js`; Securitytests | Die spätere zentrale Control-Grant-Architektur ersetzt die alten festen Allowlists und erfüllt den beabsichtigten Endzustand. |
| 18-SEC4 | Rate-/Payload-Limits, Security-Header und Secret-Redaction bleiben erhalten | PASS | `src/server.js`; `src/services/logger.js`; Gateway-/Securitytests | System-GETs schaffen keine neue Write- oder Payload-Eingabefläche. |
| 18-LEG1 | Systemseiten bleiben ES5-/iOS-9-kompatibel | PASS | `src/public/js/system/{common,summary,errors}.js`; Part-07-Syntax-/Forbidden-Syntax-Scan; `test/system-frontend.test.js` | Kein `fetch`, Promise, moderne Syntax oder Module im Wall-Systempfad. |
| 18-LEG2 | Kein CSS Grid oder Flexbox-`gap` als Voraussetzung | PASS | `src/public/css/system.css`; statischer Part-07-Scan | Präfixiertes Flexbox, Margins und normale Media Queries. |
| 18-R1 | `/system/summary` und `/system/errors` sind feste, immer vorhandene technische Routen | PASS | `src/server.js:267-299`; `test/gateway.test.js` „Feste System-Dashboard-Routen …“ | Nicht in Dashboard-Slugs oder Rastermodell enthalten. |
| 18-R2 | Unbekannte `/system/...`-Route liefert kontrolliert 404 | PASS | `src/server.js:300-306`; Gatewaytest | Antwort ist generischer Klartext ohne Stacktrace. |
| 18-R3 | Feste Routen sind nicht löschbar, nicht im Benutzergrid und nicht frei editierbar | PASS | `src/config/dashboard.js`; `src/admin/js/layout.js`; System-Shell | Keine Dashboard-/Widget-IDs oder `x/y/w/h` für Systemseiten. |
| 18-API1 | Status-, Summary- und Error-Endpunkt existieren | PASS | `src/routes/system-dashboards.js:44-112`; Mount in `src/routes/api.js`; Gatewaytest | Alle Antworten tragen `Cache-Control: no-store`. |
| 18-API2 | Unbekannte System-API liefert kontrolliertes 404 | PASS | `src/routes/system-dashboards.js:154-157`; Gatewaytest | Fehlercode `system_dashboard_not_found`. |
| 18-COL1 | Ein serverseitiger Collector lädt alle HA-States mit einer Sammelabfrage | PASS | `src/services/system/collector.js:15-76`; `homeassistant.js:getAllEntities()` → `/states`; Collector-Test | Keine Abfrage pro Systemeintrag. |
| 18-COL2 | Nur bestehende sichere MVP-Datenquellen sind für das Fundament erforderlich | PASS | State-Collector plus Gateway-/Zeit-/Source-Meta | Spätere Registry-/Repair-/Matter-/Automation-Quellen ergänzen das Modell ab Sprint 21/23 read-only. |
| 18-SNAP1 | Snapshot normalisiert Entity-ID, Domain, State und Zeitstempel | PASS | `src/services/system/snapshot.js:150-172`; Snapshot-Test | Ungültige Entity-IDs und Zeitwerte werden kontrolliert verworfen. |
| 18-SNAP2 | Nur benötigte Attribute werden übernommen und begrenzt | PASS | `snapshot.js:11-39,85-147`; Snapshot-Test | Unter anderem Friendly Name, Device Class, Unit, HVAC, Position, Media und Batterie; große/gefährliche Rohattribute fehlen. |
| 18-SNAP3 | Keine Tokens, Authorization-Header, Secrets oder Rohstate-Passthroughs | PASS | `snapshot.js:348-376`; Gatewaytest prüft Token, Secretattr und Allowlists; kein Raw-State-Endpunkt | Public Meta und fachliche Engines projizieren reduzierte Daten. |
| 18-CACHE1 | Kurzer In-memory-TTL und Cache-Reuse | PASS | `src/services/system/cache.js`, `DEFAULT_TTL_MS=3000`; Cachetest | Cache ist keine Persistenzschicht. |
| 18-CACHE2 | Parallele Anforderungen werden dedupliziert | PASS | `cache.js:50-60`; Cachetest vergleicht identische In-flight-Promise | Optionales Architekturziel ist umgesetzt. |
| 18-CACHE3 | Letzter Erfolg bleibt bei HA-Ausfall als stale erhalten | PASS | `cache.js:67-105`; `snapshot.js:createStale()`; Cache-/Frontendtests | „Keine neuen Daten“ wird nicht als leer/gesund ausgegeben. |
| 18-CACHE4 | Ausfall ohne früheren Erfolg und anschließende Recovery sind eindeutig | PASS | `test/system-foundation.test.js` „Cache behält …“; `test/system-frontend.test.js` | Offline besitzt keine erfundene Aktivitäts-/Fehlerfreiheit; Recovery ersetzt stale. |
| 18-EXT1 | Modell ist für Teilquellen erweiterbar | PASS – superseded by Sprint 21/23 | `snapshot.sources`, `src/services/system/enrichment.js`; Registry-/Diagnostik-/Automationtests | Source-Status ist pro Quelle reduziert und kann stale/unsupported/error ausdrücken. |
| 18-ENG1 | Klare `buildSummary(snapshot, config)`-Schnittstelle | PASS – superseded by Sprint 19 | `src/services/summary/engine.js:36-80` | Sprint 19 füllte dieselbe Schnittstelle fachlich. |
| 18-ENG2 | Klare `buildIssues(snapshot, config)`-Schnittstelle | PASS – superseded by Sprint 20/22 | `src/services/issues/engine.js:423-585` | Spätere Severity-, Grace- und Flapping-Logik lebt in der Engine, nicht im Router. |
| 18-ENG3 | Router enthält keine fachliche State-Normalisierung oder Domainregeln | PASS | `src/routes/system-dashboards.js`; Engines/Collector/Snapshot getrennt | Router lädt Snapshot, ruft Engine/Presentation auf und mappt Fehler. |
| 18-UI1 | Beide Routen besitzen eine gemeinsame funktionsfähige Legacy-Shell | PASS – superseded by Sprint 19/20 | `src/public/system.html`; routeabhängige Initialisierung in `summary.js`/`errors.js` | Historische Placeholder wurden bestimmungsgemäß durch funktionale Ansichten ersetzt. |
| 18-UI2 | Gemeinsame Polling-, Status-, Clock-, Loading-/Empty-/Stale-Logik ist ausgelagert | PASS | `src/public/js/system/common.js`; `test/system-frontend.test.js` | Fachrenderer bleiben getrennt. |
| 18-UI3 | Polling verwendet ausschließlich Gateway und `Legacy.http` | PASS | `common.js:598-618`; statischer Scan | Kein Browser-WebSocket zu HA und kein direktes `XMLHttpRequest` in den Systemrenderern. |
| 18-UI4 | Systemlayout bleibt fest und unabhängig von Benutzergrid-Koordinaten | PASS | `system.html`, `system.css`; kein Layout-/Widgetmodell | Spätere Filter/Spalten sind System-Präsentation, kein freies Grid. |
| 18-NAV1 | Direkte URL-Navigation ist vorhanden und interne Navigation bleibt sicher | PASS – superseded by Sprint 21.5/25.2 | `src/public/js/core/system-navigation.js`; `src/server.js:271-292`; Sprint-21.5-/25.2-Tests | Same-window, same-origin; validiertes `returnTo`; kein `_blank`/`window.open()`. |
| 18-ADM1 | Admin bleibt funktionsfähig; optionaler Systembereich darf Links anbieten | PASS – superseded by Sprint 19/21.4 | `src/admin/index.html`; Admin-UI-/API-Tests | Der heutige Systembereich ist konfigurierbar und weiterhin geschützt. |
| 18-PERF1 | Keine HA-Abfrage pro Eintrag; gemeinsamer Snapshot | PASS | Collector/Cache; Gatewaytest erwartet eine State-Sammelabfrage für Summary/Errors/Status | Error-Anreicherung nutzt spätere read-only Diagnosecaches, nicht N+1 State-Aufrufe. |
| 18-PERF2 | 1000+/3000 Entities deterministisch und reduzierte Browserantwort | PASS | `test/system-foundation.test.js` „3000 Entities …“ | 3000 interne Entities, Public-Summary unter 2 KB im irrelevanten Sensorfall. |
| 18-LOG1 | Strukturierte Snapshot-Events ohne Secret | PASS | `src/services/system/collector.js`; Collector-/Logger-/Gatewaytests | Fehlerdaten werden auf Typ/Upstreamstatus/Code reduziert. |
| 18-ERR1 | Kontrollierte Fehlercodes, keine Browser-Stacktraces | PASS | Systemrouter 503 `system_snapshot_unavailable`; 404 `system_dashboard_not_found`; Tests | HA-Ausfall im Cache wird bevorzugt als stale Payload dargestellt. |
| 18-T1 | Geforderte Collector-/Cache-/API-/Routing-/Legacy-/Performance-Tests | PASS | `test/system-foundation.test.js`, `test/gateway.test.js`, `test/system-frontend.test.js`; Fokuslauf 104/104; Gesamtsuite 329/329 | Die 42 spezifizierten Fundamentfälle sind direkt oder in äquivalenten aktuellen Regressionen abgedeckt. |
| 18-MAN1 | Manuelle Abnahme im modernen Browser | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-24 | Kein aktueller manueller Safari-/Browserlauf in Part 07. |
| 18-MAN2 | Reale iPad-mini-/iOS-9-Abnahme in Portrait/Landscape und Light/Dark | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-25 | Gemäß Part-07-Regel keine physische Abnahme. |
| 18-CACHE-V | Geänderte Legacy-Assets werden konsistent versioniert | PASS | Dashboard, System, Admin und Manifest verwenden v52; `setStaticHeaders()` bleibt immutable; `test/asset-version.test.js` verhindert erneute Abweichungen. | Sprint 27.1-B schließt RQ-04-01 code-seitig. |
| 18-DOC1 | README, Projektstatus und Roadmap dokumentieren Routen, Snapshot und read-only Semantik | PASS – superseded by Sprint D1 | README DE/EN; `docs/PROJECT_STATUS.md`; `docs/SPRINT_ROADMAP.md` | Root-README wurde in D1 bewusst zur Sprachauswahl; semantischer Inhalt lebt in DE/EN. D1 selbst gehört Part 08. |
| 18-N1 | Keine vollständige Summary-/Error-/Registry-/Repair-/Matter-/Automation-Fachlogik in Sprint 18 | N/A – replaced by later Sprints | Sprint 19, 20–23 | Historisches Scope-Limit war erfüllt; spätere geplante Sprints implementierten diese Funktionen read-only. |

## Current Data Flow

```text
Home Assistant REST /api/states (backend-only token)
  -> homeassistant.getAllEntities()
  -> system/collector.collect()
  -> system/snapshot.createSuccessful() + attribute allowlist
  -> shared system/cache (TTL 3000 ms, in-flight, last successful)
  -> Summary.buildSummary() / Issues.buildIssues()
  -> reduced GET /api/system-dashboards/{summary,errors,status}
  -> system.html + common.js + route-specific renderer
```

Die ab Sprint 21/23 ergänzten WebSocket-/Diagnosequellen existieren nur im
Backend und werden über `system/enrichment.js` reduziert an denselben Snapshot
angehängt. Der Browser erhält weder Registries noch rohe Diagnosepayloads.

## Shared Asset and Cache Finding

Der historische Ausgangsbefund `RQ-04-01` war mit allen drei relevanten Entry
Points belegt:

- Dashboard: gemeinsame Assets `theme.js`, `style.css`, `compat.js` und
  `system-navigation.js` mit `v=51`;
- Summary/Errors: dieselben gemeinsamen Assets mit `v=44`;
- Admin: die aus dem Public-Baum geteilten `icons.js` und `presentation.js`
  mit `v=50`, im Dashboard mit `v=51`.

Sprint 27.1-B setzt alle genannten Referenzen und das Manifest auf v52 und
ergänzt `test/asset-version.test.js`. Die immutable Header bleiben korrekt;
der Codebefund ist geschlossen, der reale Cachewechsel bleibt `NOT TESTED`.

## Automated Evidence

- fokussierter Part-07-Lauf: 104/104 Tests bestanden;
- vollständige Regression: 329/329 Tests bestanden;
- 14 gezielte `node --check`-Prüfungen bestanden;
- Forbidden-Syntax-/API-Scan im System-Wall-Pfad: keine Treffer;
- CSS-Scan: kein CSS Grid, `gap`, ResizeObserver oder Container Query;
- Secret-/Raw-State-/Write-Flächen-Scan: keine neue Browser-HA- oder
  generische Serviceoberfläche.

Der erste Gesamtlauf in der eingeschränkten Sandbox meldete vier
`listen EPERM`-Fehler für lokale Testserver. Derselbe unveränderte Lauf mit
freigegebenem 127.0.0.1-Bind war vollständig grün; dies war kein Produkt- oder
Testfehler.

## Findings

- Kein aktuelles `MISSING` oder `BROKEN`.
- `PASS`: gemeinsamer Asset-Cache-Buster (`RQ-04-01`) code-seitig geschlossen.
- `NOT TESTED`: moderne Browserabnahme MT-24 und physische Legacy-Abnahme
  MT-25.
- Keine neue Reparatur-ID für Sprint 18; der Befund besitzt dieselbe Root
  Cause wie Part 04.

## Final Assessment

Sprint 18 ist architektonisch, sicherheitsseitig und automatisiert vorhanden.
Die offenen manuellen Laufzeitnachweise und der bereits bekannte P1-Cache-
Befund verhindern im Sprint-27-Baseline-Audit den Gesamtstatus `PASS`.
