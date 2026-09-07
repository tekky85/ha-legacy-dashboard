# Sprint 20 Audit

## Audit Metadata

- Sprint: 20
- Sprint title: Error Dashboard MVP
- Audit date: 7. September 2026
- Repository commit: `09422e0`
- Spec file: [`docs/sprints/SPRINT-20.md`](../../sprints/SPRINT-20.md)
- Working tree at Part-08 start: kein veränderter Anwendungscode; vorhanden
  waren ausschließlich noch nicht committete Auditdokumente aus Part 06/07
  sowie die bereitgestellten Part-Prompts.

## Overall Result

PARTIAL

Das Sprint-20-Entity-State-MVP ist im aktuellen System weiterhin vollständig
erkennbar: `unavailable` und `unknown` werden serverseitig getrennt
normalisiert, Severity, Dauer, Titel, Status, Sortierung und Gesamtstatus
werden in der Issue Engine gebildet, `/system/errors` rendert nur reduzierte
Issue-Daten, und der gemeinsame System-Snapshot erhält letzte bekannte Issues
bei HA-Ausfall als stale. Spätere Sprints 21 bis 23 erweitern dieselbe Engine
read-only um Registry-Kontext, Geräteaggregation, Regeln und Automation-
Diagnostik; sie ersetzen das MVP nicht durch einen zweiten Fehlerpfad.

Kein aktuelles fachliches Verhalten wurde als `MISSING` oder `BROKEN`
gefunden. Der Gesamtstatus bleibt `PARTIAL`, weil die reale Safari-/iPad-
Abnahme aussteht, der bekannte routeabhängige Cache-Buster `RQ-04-01` auch die
Error-Seite betrifft und die ausdrücklich verlangte 82-Punkte-Testmatrix nur
teilweise mit gezielten Einzelassertions belegt ist (`RQ-08-01`).

## Requirement Matrix

| ID | Requirement | Status | Evidence | Notes |
|---|---|---|---|---|
| 20-SEC1 | HA- und Supervisor-Token bleiben ausschließlich im Backend | PASS | `src/services/homeassistant.js`; `src/services/ha-connection.js`; Gateway-/Securitytests; Public-Source-Scan | Error-Payload und Logs enthalten keine Tokens oder Authorization-Header. |
| 20-SEC2 | Browser spricht nur mit dem Gateway; kein Browser-HA-WebSocket | PASS | `src/public/js/system/common.js`; CSP `connect-src 'self'`; statischer Part-08-Scan | Der Client verwendet `Legacy.http.get` auf `/api/system-dashboards/errors`. |
| 20-SEC3 | Keine neue generische Service-, Repair-, Reload-, Reauth- oder Schnellaktion | PASS | `src/routes/system-dashboards.js`; Systemrouter-Scan | Die Error-Hauptfunktion und spätere Diagnoseerweiterungen sind GET/read-only. |
| 20-SEC4 | Sichtbarkeit, Security-/Ignore-Regeln und Writes bleiben getrennt | PASS – superseded by Sprint 26.2 | `src/services/control-authorization.js`; Config- und Gatewaytests | Heutige Control Grants ersetzen die alten festen Allowlists, ohne Error-Konfiguration als Grant zu verwenden. |
| 20-SEC5 | Eingaben, Payloads, Header und Fehler bleiben begrenzt bzw. kontrolliert | PASS | `src/server.js`; `src/config/dashboard.js:validateSystemDashboards()`; Admin-/Gatewaytests | API trägt `no-store`; Browser erhält generische Fehlercodes statt Stacktraces. |
| 20-LEG1 | System-Wall-JavaScript bleibt ES5/Safari-iOS-9-kompatibel | PASS | `common.js`, `errors.js`, `theme.js`, `system-navigation.js`; Syntax- und Forbidden-Syntax-Scan | Kein `fetch`, Promise, moderne Syntax, Modulruntime oder Browser-HA-WebSocket. |
| 20-LEG2 | Kein CSS Grid, Flex-gap, ResizeObserver oder Container Query | PASS | `src/public/css/system.css`; statischer Part-08-Scan | Präfixiertes Flexbox, Inline-/Blocklayout, Margins und Media Queries. |
| 20-R1 | `/system/errors` ist feste, nicht lösch-/umbenennbare Systemroute | PASS | `src/server.js:267-306`; `src/public/system.html`; Gatewaytest | Kein Eintrag im Dashboard-/Widget-Raster. |
| 20-R2 | Summary und Error bleiben fachlich getrennt | PASS | `src/services/summary/*`; `src/services/issues/*`; getrennte API-Routen/Renderer | Gemeinsamer Snapshot, aber getrennte Engines und Payloads. |
| 20-SRC1 | MVP erkennt `unavailable`, `unknown`, HA-Ausfall, stale, Security und Dauer | PASS | `src/services/issues/engine.js`; `severity.js`; `test/issues.test.js` | Spätere Quellen sind additive read-only Erweiterungen. |
| 20-MOD1 | Normalisiertes Issue besitzt stabile ID, Source, Severity, Status, Titel, Entity, State und Security-Flag | PASS | `engine.js:createIssue()` | Zusätzlich reduzierte optionale Kontext-/Regelfelder; keine Rohattribute. |
| 20-MOD2 | Start-/Updatezeit, Dauer, Domain, Device Class, Beschreibung und Metadata sind optional robust | PASS | `createIssue()`; `durationSeconds()`; Robustheitstest | Ungültige Zeitwerte werden kontrolliert behandelt. |
| 20-SEV1 | Vier Severity-Stufen und zentrale Policy | PASS | `severity.js:LEVELS`, `issueSeverity()` | Reihenfolge `critical`, `error`, `warning`, `info`. |
| 20-SEV2 | Normales `unavailable` ist Warning | PASS | `severity.js:23-27`; Issue-/Gatewaytests | Zustand bleibt ausdrücklich `unavailable`. |
| 20-SEV3 | Normales `unknown` ist Info | PASS | `severity.js:29-33`; Issue-/Gatewaytests | Dokumentierte zulässige Sprint-20-Entscheidung. |
| 20-SEV4 | Explizite Safety/Security-Ausfälle sind erhöht, `unavailable` critical | PASS – superseded by Sprint 21.2/21.3 | `risk.js`; `rule-engine.js`; Sprint-21.2/21.3-Tests | `unknown` und `unavailable` werden heute für echte Safety/Security-Risiken fail-safe critical. |
| 20-STATE1 | `unavailable`, `unknown` und `off` werden nicht vermischt | PASS | `test/issues.test.js` „unavailable und unknown …“; getrennte Filtercounts | Keine Umdeutung zu off/closed/idle. |
| 20-CON1 | HA-Ausfall erzeugt niemals falsches OK/„keine Fehler“ | PASS | `engine.js:overallStatus()`; Systemcache- und Frontendtests | Ohne Snapshot `unknown`, mit letztem Erfolg `stale`. |
| 20-CON2 | Letzte bekannte Issues und Startzeit bleiben bei stale erhalten | PASS | `system/cache.js`; `snapshot.js:createStale()`; Issue-/Frontendtests | Stale verwendet die letzte erfolgreiche Beobachtungszeit. |
| 20-CON3 | Recovery rechnet neu, entfernt stale und behobene Issues | PASS | Issue- und System-Frontendtest | Kein Reload erforderlich; keine resolved History erfunden. |
| 20-CFG1 | Persistente explizite `securityEntities`-Liste | PASS – superseded by Sprint 21.4 | `systemDashboards.errors.securityEntities`; Schema-/Persistenz-/Admin-Tests | Bedienung heute über den Entity Rule Manager. |
| 20-CFG2 | Persistente `ignoredEntities`-Liste | PASS – superseded by Sprint 21.4 | `systemDashboards.errors.ignoredEntities`; Config-/Admin-Tests | Ignore bleibt von Expected Offline und Writes getrennt. |
| 20-CFG3 | Entity-Auswahl verwendet sanitiertes Admin-Inventar | PASS | Admin Entity Rule Manager; Admin API-/UI-Tests | Keine direkte Browserabfrage an HA. |
| 20-CFG4 | Security-Markierung erteilt keine Light-/Climate-Schreibrechte | PASS – superseded by Sprint 26.2 | zentrale Control-Grants; Admin-/Gateway-/Sprint-26.2-Tests | Keine automatische Write-Autorisierung. |
| 20-RULE1 | Keine unsichere Namensheuristik als Kritikalitätsquelle | PASS | `risk.js`; `rule-engine.js`; Label-/Device-Class-Tests | Nur explizite Regeln und verlässliche normalisierte Metadaten. |
| 20-RULE2 | Keine Grace Period im historischen MVP | N/A – replaced by Sprint 22 | `src/services/issues/rule-engine.js`; Sprint-22-Tests | Später ausdrücklich durch risikoklassenspezifische Grace-, Flapping- und Recovery-Regeln ersetzt. |
| 20-DUR1 | Dauer basiert auf `last_changed`, bleibt nicht negativ | PASS | `engine.js:durationSeconds()`; Issue-Dauertest | Spätere Regelengine bewahrt eine sichere beobachtete Problemstartzeit. |
| 20-TXT1 | Titelpriorität Config → Kontext/Friendly Name → Entity-ID | PASS | `engine.js:50-57`; Issue-Test mit konfiguriertem Titel | Registry-Gerätename ist eine spätere verlässliche Ergänzung. |
| 20-TXT2 | Verständliche Beschreibung unterscheidet unavailable/unknown | PASS | `engine.js:73-81`; Error-Renderer | Zusätzliche spätere Flapping-/Recovery-Texte sind getrennt. |
| 20-SORT1 | Deterministische Sortierung nach Severity, Security, Dauer, Titel | PASS | `severity.js:67-90`; Sortiertest | Entity-ID ist stabiler finaler Tie-Breaker. |
| 20-OVER1 | OK nur bei frischem Snapshot ohne Issues | PASS | `engine.js:overallStatus()`; Issue-/Frontendtests | Info-only wird auf der Error-Seite bewusst als Warnzustand statt OK behandelt. |
| 20-OVER2 | Warning/Error/Critical sowie stale/unknown werden unterschieden | PASS | `overallStatus()`; `errors.js:STATUS`; Tests | Späterer kleiner Health-Endpunkt trennt Info-only vom Alarmindikator. |
| 20-UI1 | Gesamtstatus besitzt Text, Symbol und Severity, nicht nur Farbe | PASS | `system.html:169-174`; `errors.js:renderOverall()`; Frontendtest | Reale Safari-Wirkung bleibt MT-27/MT-28. |
| 20-UI2 | Einzelissues zeigen Titel, Severity, State, Dauer und Kontext kompakt | PASS – superseded by Sprint 21.1/23 | `issues/presentation.js`; `errors.js`; System-CSS | Gerätecards und Automation Impact erweitern die reduzierte Darstellung. |
| 20-UI3 | Empty State nur bei frischem, fehlerfreiem Snapshot | PASS | `engine.js:551-560`; `errors.js:render()`; Frontendtest | Offline/stale bleibt sichtbar und wird nicht geleert. |
| 20-UI4 | Lange/große Listen bleiben begrenzt und nicht animiert | PASS | `errors.js:MAX_RENDERED_ISSUES=200`; System-CSS; Frontendtest mit 205 Issues | Gruppen/Device Cards werden erst aus reduzierter Presentation gebaut. |
| 20-ENG1 | Fachlogik lebt in eigener serverseitiger Issue Engine | PASS | `services/issues/{engine,severity,rule-engine}.js` | Router analysiert keine Entity-States oder Severity. |
| 20-API1 | `GET /api/system-dashboards/errors` liefert reduzierte Issues, Counts und Meta | PASS | `routes/system-dashboards.js:91-112`; Gatewaytest | Aktuelle Presentation ergänzt Gruppen/Filter, ohne Rohstates auszugeben. |
| 20-API2 | API enthält keine Rohstates, Tokens, internen Pfade oder Write-Allowlists | PASS | Gatewaytest „System-Dashboard-APIs …“; Snapshot-Allowlist | Antwort und Status-Endpunkt sind datenreduziert. |
| 20-API3 | Error-API ist `no-store`, Fehler kontrolliert | PASS | `src/server.js:setApiHeaders()`; Gatewaytest | 503-Code `system_snapshot_unavailable`; keine Browser-Stacktraces. |
| 20-PERF1 | Gemeinsamer Sprint-18-Snapshot, keine HA-State-Abfrage pro Issue | PASS | `src/services/system/index.js`; Gateway erwartet eine State-Sammelabfrage | Spätere Diagnostik nutzt eigene backendseitige Caches, nicht N+1 State-Requests. |
| 20-PERF2 | 1000 Entities, 50 unavailable, 20 unknown, Security, Sortierung und reduzierte Payload | PASS | `test/issues.test.js` Performancefall | 70 Issues, deterministisch, unter 200 KB und ohne großes Rohattribut. |
| 20-ROB1 | Fehlende/ungewöhnliche Attribute brechen die Engine nicht | PASS | Issue-Robustheitstest; defensive Defaults | Unbekannte normale States erzeugen kein erfundenes Issue. |
| 20-T1 | Unavailable-/Unknown-/Security-Basisfälle | PASS | `test/issues.test.js`; Gateway-/Sprint-21.2-/21.3-Tests | Kernklassifikation ist direkt belegt. |
| 20-T2 | Severity-, Sortier-, Dauer-, Status-, stale- und Recovery-Basisfälle | PASS | Issue-, System-Foundation- und Frontendtests | Die breiten aktuellen Regressionen sind grün. |
| 20-T3 | API-, Admin-, Legacy-, Security- und Regressionstests | PARTIAL | 147/147 Part-08-Fokustests; 329/329 Gesamtsuite | Nicht jede der 82 nummerierten Sprint-20-Varianten besitzt eine gezielte Assertion; `RQ-08-01`. |
| 20-MAN1 | Manuelle moderne Browserabnahme aller Zustände und Adminregeln | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-27 | In Part 08 wurde kein physischer Safari-Lauf durchgeführt. |
| 20-MAN2 | Reale iPad-mini-/iOS-9-Abnahme Portrait/Landscape, Theme und große Listen | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-28 | Kein realer Zielgerätetest in Part 08. |
| 20-LOG1 | Keine sensitiven Attribute/Secrets in Logs | PASS | `src/services/logger.js`; Securitytest; Gateway-Outputassertions | Fehler werden auf Typ/Code reduziert. |
| 20-CACHE1 | Geänderte Legacy-Assets besitzen konsistente Cacheversion | PARTIAL | Dashboard `v=51`, Systemseite `v=44`, geteilte Admin-Assets `v=50`; immutable Static Cache | Bestehender P1-Befund `RQ-04-01`, jetzt ausdrücklich auch Sprint 20 zugeordnet. |
| 20-DOC1 | Route, States, Severity, Security/Ignore, stale/offline und Abgrenzung sind dokumentiert | PASS – superseded by Sprint D1/later docs | README DE/EN; Projektstatus; Roadmap | Grace Periods werden heute als umgesetzte Sprint-22-Regeln dokumentiert. |
| 20-N1 | Keine Registry-/Repair-/Matter-/Automation-/Grace-Erweiterung im historischen Sprint 20 | N/A – replaced by Sprints 21–23 | aktuelle read-only Diagnosearchitektur | Die später ausdrücklich geplanten Funktionen sind additiv und führen keine HA-Schreibaktionen ein. |

## Explicit Test-Coverage Audit

Die vorhandenen acht direkten Issue-Tests und die breiten Gateway-, Admin-,
Persistenz-, System-Frontend-, Security- und späteren Risk-/Rule-Tests belegen
die fachliche Basis. Sie bilden die 82 nummerierten Sprint-20-Fälle jedoch
nicht eins zu eins ab. Direkte Einzelassertions fehlen oder sind nur indirekt
vorhanden insbesondere für:

- die vollständigen vier Sortier-/Tie-Breaker-Kombinationen als Tabelle;
- `Error` als eigener Entity-/System-Gesamtstatusfall;
- fehlendes `last_changed` mit ausdrücklich `null` statt normalisiertem
  Fallback sowie stale Startzeit als eigener Fall;
- Security-Markierung eines Light und Climate gegen unveränderte Control
  Grants in demselben Test;
- Admin Save → Reload für Security und Error Ignore sowie explizite
  Nichtänderung eines User-Dashboards;
- Loading, Critical-/Warning-Gruppe, unavailable/unknown, Empty, stale,
  offline, Recovery und langer Name als jeweils eigenständige Legacy-UI-
  Regression;
- alle 82 historischen Regressionserwartungen als nachvollziehbare
  Anforderungszuordnung.

Das ist kein bestätigter Laufzeitdefekt, aber ein umsetzbarer P2-Testbefund
`RQ-08-01`.

## Current Error Data Flow

```text
backend-only HA REST /api/states
  -> shared System Collector + normalized Snapshot
  -> shared 3-second cache with last-successful/stale semantics
  -> optional read-only backend diagnostics enrichment (Sprint 21/23)
  -> issues/rule-engine + issues/engine
  -> issues/presentation (real device_id grouping and reduced context)
  -> GET /api/system-dashboards/errors
  -> common.js connection/polling state
  -> errors.js read-only rendering and client-only view filters
```

Filter und Spaltenauswahl ändern weder die serverseitige Issue-Menge noch den
kleinen globalen Health-Status. Keine Stufe dieses Pfads erteilt Write-Rechte.

## Superseded Requirements

- Sprint 21 ergänzt Registry-, Config-Entry-, Repairs- und Matter-Kontext
  ausschließlich backendseitig/read-only.
- Sprint 21.1 ersetzt Severity-Listen durch Gruppierung ausschließlich über
  reale `device_id`, ohne die Sprint-20-Issue-Erkennung zu verändern.
- Sprint 21.2/21.3 härten Safety-/Security-Severity und ergänzen getrennte
  Severity-/State-Filter sowie Device-Class-/Label-Modi.
- Sprint 21.4 ersetzt die großen Auswahlfelder durch den Entity Rule Manager.
- Sprint 21.5 ergänzt den kleinen Health-Endpunkt und sichere Navigation;
  Info-only bleibt vom Alarmindikator getrennt.
- Sprint 22 ersetzt das unmittelbare MVP-Melden durch zentrale risikobasierte
  Grace-, Flapping-, Expected-Offline- und Recovery-Regeln.
- Sprint 23 ergänzt read-only Automation Impact und Trace Summaries.
- Sprint 25.1 erzwingt exakte Filterung, Sprint 25.2 same-window/same-origin
  Navigation. Keine dieser Änderungen erweitert die Writefläche.

## Automated Evidence

- Part-08-Fokuslauf: 147/147 Tests bestanden;
- vollständige Regression: 329/329 Tests bestanden;
- relevante Issue-/System-/Admin-/Config-Dateien bestanden `node --check`;
- System-Wall-Frontend ohne verbotene moderne Syntax/APIs;
- System-CSS ohne CSS Grid, Flex-gap, ResizeObserver oder Container Queries;
- Systempfad ohne Browser-Token, Browser-HA-WebSocket oder Write-Route;
- ausschließlich localhost-Mocks und Fake-Credentials, kein reales HA.

Ein erster eingeschränkter Fokuslauf scheiterte ausschließlich zweimal mit
`listen EPERM` beim Binden lokaler Testserver. Der unveränderte Lauf mit
erlaubtem 127.0.0.1-Bind war vollständig grün.

## Findings

- Kein aktuelles `MISSING` oder fachlich `BROKEN`.
- `PARTIAL`: `RQ-04-01` (P1 Cache-Buster) und `RQ-08-01` (P2 explizite
  Sprint-20-Testmatrix).
- `NOT TESTED`: MT-27 und MT-28.

## Final Assessment

Sprint 20 ist fachlich, sicherheitsseitig und architektonisch vorhanden. Der
Baseline-Auditstatus bleibt `PARTIAL`, bis Cacheversion und Testmatrix
repariert sowie moderne Safari- und reale iPad-Abnahmen dokumentiert sind.
