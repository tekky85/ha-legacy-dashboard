# Sprint 21 Audit

## Audit Metadata

- Sprint: 21
- Sprint title: Registry & Diagnostic Enrichment
- Audit date: 7. September 2026
- Repository commit: `bbc30fa`
- Spec file: [`docs/sprints/SPRINT-21.md`](../../sprints/SPRINT-21.md)
- Working tree at Part-09 start: Anwendungscode und vorhandene Audit-Historie
  waren sauber; nur der vom Benutzer bereitgestellte, unversionierte
  Part-09-Prompt war vorhanden.

## Overall Result

PARTIAL

Die fachliche Sprint-21-Architektur ist vorhanden. Ein ausschließlich
serverseitiger Home-Assistant-WebSocket-Client liest über feste Adapter Entity-,
Device-, Area- und Label-Registry, Config Entries und Repairs. Die Quellen
werden unabhängig gecacht, normalisiert und in den bestehenden REST-State-
Snapshot eingehängt; Matter bleibt mangels belastbarer read-only API bewusst
`unsupported`. Browserantworten enthalten nur reduzierte Modelle und
Quellenstatus, keine Tokens, Rohregistries oder frei wählbaren WebSocket-
Commands.

Der Sprint bleibt `PARTIAL`: Ein isoliertes WebSocket-`error`-Event ohne
nachfolgendes `close` plant derzeit keinen Reconnect (`RQ-09-01`), die
umfangreiche 93-Punkte-Testmatrix ist nur teilweise als gezielte
Anforderungsmatrix nachvollziehbar (`RQ-09-02`), die routeabhängige immutable
Cacheversion betrifft auch die System-/Diagnoseoberflächen (`RQ-04-01`), und
reale Home-Assistant-/Safari-/iPad-Abnahmen stehen aus. Kein Sicherheitsbruch,
keine Registry-Schreibroute und kein Datenverlust des REST-State-Snapshots
wurde gefunden.

## Requirement Matrix

| ID | Requirement | Status | Evidence | Notes |
|---|---|---|---|---|
| 21-SEC1 | HA- und Supervisor-Token bleiben backend-only | PASS | `src/config/runtime.js:77-128`; `src/services/homeassistant-websocket.js:65-136`; Public-Source-Scan | Standalone nutzt `HA_TOKEN`, App-Modus `SUPERVISOR_TOKEN`; keine Fundstelle im Public-Frontend. |
| 21-SEC2 | Kein Browser-HA-WebSocket und keine generische WS-Proxy-API | PASS | `src/server.js:108`; `src/services/diagnostics/index.js:12-19`; `test/sprint-21.test.js` „Security-Regression …“ | CSP ist `connect-src 'self'`; Browser bestimmt keinen Command-Typ. |
| 21-SEC3 | Registry, Config Entries, Repairs und Matter bleiben read-only | PASS | feste `COMMANDS`; `src/routes/system-dashboards.js`; `src/routes/admin.js:1504`; Route-/Command-Scan | Keine Registry-, Reload-, Reauth-, Repair-, Label- oder Matter-Mutation. |
| 21-SEC4 | Bestehende Write-Autorisierung bleibt getrennt | PASS – superseded by Sprint 26.2 | `src/services/control-authorization.js`; Gateway-/Sprint-26.2-Tests | Die heutige zentrale Grant-Logik ersetzt historische Allowlists; Diagnosesichtbarkeit erteilt keinen Grant. |
| 21-WS1 | Auth-Handshake `auth_required`, `auth_ok`, `auth_invalid` | PASS | `src/services/homeassistant-websocket.js:195-257`; drei direkte WS-Tests | Token wird nur in der Backend-Auth-Nachricht verwendet und nie geloggt. |
| 21-WS2 | Eindeutige IDs und zuverlässige Antwortkorrelation | PASS | `homeassistant-websocket.js:375-420`; direkter Korrelations-/Pending-Test | Pending Requests sind ID-basiert und besitzen eigene Timeouts. |
| 21-WS3 | Connect-/Request-Timeout, Disconnect, begrenztes Backoff und kein Tight Loop | PASS | `homeassistant-websocket.js:242-290,316-372`; Timeout-/Disconnect-/Reconnect-Test | Maximal fünf Versuche, exponentiell und auf 10 s begrenzt. |
| 21-WS4 | Verbindungsfehler lösen kontrollierte automatische Erholung aus | PARTIAL | `homeassistant-websocket.js:348-356`; reproduzierter Error-only-Lauf | `error` verwirft den Connect, plant aber ohne `close` keinen Reconnect; nächster Source-Abruf kann neu verbinden. `RQ-09-01`. |
| 21-WS5 | Keine Tokens in Logs; Fehler pro Quelle isoliert | PASS | Logger-Events; Token-Logtest; unabhängige `SourceCache`-Instanzen | Logs enthalten Event/Fehlercode, keine Rohantworten. |
| 21-CAP1 | Capability-gesteuerte Quellen, unsupported statt Systemfehler | PASS | `diagnostics/index.js:88-171`; Probe-/Cache-Test | Unbekannter Command wird `unsupported`; Matter ist kontrolliert unsupported. |
| 21-ENT1 | Entity-Registry-Felder werden normalisiert | PASS | `diagnostics/normalizers.js:67-105`; Normalisierungstest | Enthält stabile IDs, Zuordnungen, Kategorie, Disabled/Hidden, Namen und Icon. |
| 21-ENT2 | `diagnostic`/`config` werden erkannt und Summary sinnvoll gefiltert | PASS | `system/enrichment.js:31-87`; `summary/engine.js`; Summary-Enrichment-Test | Keine neuen Sprint-22-Aktivitätsregeln. |
| 21-ENT3 | Disabled/Hidden/Unavailable/Unknown werden getrennt | PASS | `issues/engine.js`; Test „Disabled, hidden und registry-only …“ | Disabled wird übersprungen; Hidden allein erzeugt kein Issue, sein realer unknown-State darf weiterhin eines erzeugen. |
| 21-ENT4 | Registry-only wird nicht pauschal orphaned | PASS | Collector iteriert REST-States; Registry-only-Test | Registryeinträge synthetisieren keine Entity-Issues. |
| 21-DEV1 | Device-Felder, Name-Priorität und stabile `device_id` | PASS | `normalizers.js:108-150`; `enrichment.js:31-87`; Registrytests | `name_by_user` → Name → Friendly Name → Entity-ID. |
| 21-DEV2 | Sensible Identifier bleiben intern/außerhalb des Browserpayloads | PASS | Device-Normalisierungstest; Performance-/Payloadtest | Identifier, Connections, MAC und Seriennummer werden nicht übernommen. |
| 21-DEV3 | Aktuelles Single-Config-Entry-Modell plus defensiver Legacy-Fallback | PASS | `normalizers.js:27-64`; direkter Device-Registry-Test | Mehrdeutige Legacy-Listen ohne Primary werden nicht geraten. |
| 21-AREA1 | Entity-Area vor Device-Area, sonst keine Area | PASS | `enrichment.js:42-52`; Area-Prioritätstest | Keine Namensheuristik; fehlende/gelöschte Area ergibt `null`. |
| 21-CONF1 | Config Entries read-only normalisiert; problematische States werden Issues | PASS | `normalizers.js:200-224`; `issues/engine.js`; Config-/Repair-Test | `loaded`/unbekannt erzeugt kein Issue, `setup_retry` Warning, harte Setupzustände Error. |
| 21-REP1 | Repairs capability-gesteuert, normalisiert und ohne Aktionen | PASS | `normalizers.js:243-291`; `diagnostics/index.js`; Config-/Repair-/Probe-Tests | `fixable` ist nur Metadatum; keine Fix-/Ignore-Route. |
| 21-MAT1 | Matter ist ausschließlich capability-gesteuert/read-only | PASS | `diagnostics/index.js:127`; Securitytest | Mangels belastbarer API wird kein Matter-Command gesendet und `unsupported` geliefert. |
| 21-MAT2 | Unterstützte Matter-Korrelation/Aggregation | N/A | aktuelle Capability stets unsupported | Bedingte Anforderungen zu betroffenen Devices/Entities greifen erst bei einer zuverlässig unterstützten Quelle. |
| 21-SNAP1 | Bestehender Sprint-18-Snapshot wird um Metadata/Diagnostics/Capabilities/Sources erweitert | PASS | `system/enrichment.js:90-142`; `system/snapshot.js`; Systemtests | State-Snapshot bleibt Quellwahrheit; Enrichment ersetzt ihn nicht. |
| 21-SNAP2 | Jede Quelle besitzt supported/ok/stale/lastSuccessfulAt/errorCode | PASS | `source-cache.js`; `enrichment.js:5-17`; Admin-Diagnosemodell | Browserstatus bleibt reduziert. |
| 21-FAIL1 | Partial Failure erhält State-Logik und erfolgreiche Metadaten | PASS | Collector; Tests „Partial Failure …“ und „Kompletter WebSocket-Ausfall …“ | Kein pauschaler API-500; fehlender Kontext wird `null`. |
| 21-FAIL2 | Stale Metadaten bleiben nutzbar und Recovery erneuert sie | PASS | `source-cache.js:33-114`; Cachetest | Letzter gültiger normalisierter Snapshot bleibt erhalten. |
| 21-CACHE1 | Registry/Diagnostik serverseitig gecacht und In-flight dedupliziert | PASS | TTLs 60/30/30 s in `diagnostics/index.js`; Source-Cache-Test | Kein Registry-Fetch pro Browser-Poll. |
| 21-ERR1 | Error-Issues erhalten Device-/Area-/Integration-/Plattform-/Kategorie-Kontext | PASS | `issues/engine.js`; `system/enrichment.js`; Gateway-/Sprint-21-Tests | Ausgabe ist reduziert; spätere Device Cards nutzen denselben Kontext. |
| 21-SUM1 | Summary erhält bessere Namen/Areas und blendet diagnostic/config aus | PASS | `summary/engine.js`; direkter Sprint-21-Test | Spätere Summary-Filter sind additiv und gehören zu Part 10/11. |
| 21-ADM1 | Geschützter read-only Diagnosequellenstatus im Admin | PASS | `src/routes/admin.js:1504-1524`; `src/admin/js/app.js:2147-2198` | Route liegt hinter globaler Admin-Authentifizierung; keine Raw Registry. |
| 21-API1 | System-APIs liefern nur normalisierte erforderliche Daten | PASS | `routes/system-dashboards.js:44-112`; Gatewaytest | Keine HA-State-/Registry-Rohobjekte, Secrets oder internen Pfade. |
| 21-PERF1 | 3000 Entities/500 Devices/50 Areas/100 Entries/100 Repairs linear und kompakt | PASS | `test/sprint-21.test.js` Performancefall | Lauf grün; Map-Indizes und sanitisiertes Payload bestätigt. |
| 21-LEG1 | Betroffener Wall-Frontendpfad bleibt ES5/iOS-9-kompatibel | PASS | `src/public/js/system/*.js`; `node --check`; Forbidden-Syntax-Scan | Kein fetch, Promise, Modul, moderne Syntax oder Browser-WS. |
| 21-LEG2 | Kein CSS Grid/Flex-gap/ResizeObserver/Container Query | PASS | `src/public/css/system.css`; statischer Scan | Präfixiertes Flexbox und Media Queries. |
| 21-T1 | Vollständige 93-Punkte-Testanforderung nachvollziehbar abgesichert | PARTIAL | 15 direkte Sprint-21-Tests plus breite Regression; 153/153 Fokus | Mehrere Einzelvarianten sind nur indirekt oder nicht als eigene Assertion verknüpft; `RQ-09-02`. |
| 21-MAN1 | Reale Registry-/Diagnose-/Partial-Failure-Abnahme im modernen Safari/LXC | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-30 | Kein reales HA kontaktiert. |
| 21-MAN2 | Reale Zielgeräteabnahme mit Enrichment und Metadatenfehlern | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-32 | Kein physischer iPad-Lauf in Part 09. |
| 21-CACHE2 | Geänderte System-/Shared-Assets haben konsistente Cacheversion | PASS | Dashboard, Systemseite, Admin und Manifest referenzieren v52; `test/asset-version.test.js`; immutable Auslieferung bleibt unverändert. | RQ-04-01 code-seitig geschlossen. |
| 21-SHOT1 | Error/Summary/Admin-Diagnose-Screenshots geprüft/aktualisiert | PARTIAL | D1-Audit und `RQ-08-02` | Vorhandene System-/Adminbilder sind nach späteren sichtbaren Sprints nicht belastbar aktuell. |
| 21-DOC1 | README DE/EN, Projektstatus und Roadmap dokumentieren Architektur | PASS | README DE/EN Registry-/Diagnoseabschnitte; Roadmap; Projektstatus Sprint-21-Abschnitt | README-Sprachen sind inhaltlich parallel; der globale Statuskopf ist separat in `RQ-08-03` veraltet. |

## WebSocket Error-only Reproduction

Ein isolierter Fake-WebSocket wurde verbunden und löste ausschließlich sein
`error`-Event aus. Das Request-Promise endete kontrolliert mit
`ha_websocket_unavailable`, aber `reconnectAttempts` blieb `0`, es entstand
keine zweite Socketinstanz und nur der ursprüngliche 10-s-Connect-Timer war
registriert. Erst ein späterer Source-Abruf würde `connect()` erneut anstoßen.
Das ist kein Token-/Writeproblem und zerstört den REST-Snapshot nicht, erfüllt
aber die automatische Fehlererholung nicht vollständig (`RQ-09-01`).

## Explicit Test-Coverage Audit

Die direkten Sprint-21-Tests decken Auth, ID-Korrelation, Timeout,
Disconnect/Reconnect, Konstruktor-/Sendefehler, Registry-Normalisierung,
Single-/Legacy-Config-Entry, Area-Priorität, Disabled/Hidden/Registry-only,
Config-/Repair-Issues, Summary-Enrichment, Source-Cache, Capability-Probes,
Partial Failure, vollständigen WS-Ausfall, Performance und Security ab.

Nicht als gezielte vollständige 93-Punkte-Matrix belegt sind insbesondere:

- Error-only-Reconnect, alle Backoff-Grenzen und Tight-Loop-Negativfall;
- unbekannte Area-ID, einzelne Device-Felder sowie `config`-Kategorie als
  jeweils eigenständige Assertions;
- alle Repair-Fehlervarianten und die vier Adminstatus
  Available/Unsupported/Stale/Error als UI-Matrix;
- bedingte Matter-Supported-Aggregation (derzeit N/A, weil bewusst
  unsupported);
- jede historische Summary/Error/Focus/Control/Theme-Regression mit
  ausdrücklicher Zuordnung zu den Nummern 67–93.

Das ist zusätzlich zum konkreten Error-only-Befund ein P2-Testhärtungspunkt
`RQ-09-02`, kein Nachweis weiterer Laufzeitfehler.

## Current Registry and System Data Flow

```text
Standalone: HA_URL + backend-only HA_TOKEN
HA App: Supervisor Core REST/WS + backend-only SUPERVISOR_TOKEN
                |
                +-> REST /api/states -> normalized shared state snapshot
                +-> server-only WebSocket -> fixed registry/diagnostic adapters
                                              -> per-source TTL/cache/stale
                -> enrichment by stable entity/device/area/config-entry IDs
                -> shared issue and summary engines
                -> device presentation aggregation
                -> reduced Gateway GET APIs
                -> Legacy.http/XHR browser rendering
```

Keine Stufe erlaubt dem Browser freie WebSocket-Commands oder leitet Registry-
Metadaten in Write-Autorisierung um.

## Superseded Requirements

- Sprint 21.1 ergänzt echte `device_id`-Gruppen als reine Presentation.
- Sprint 21.2/21.3 härten Risk-/Severity-Klassifikation und ergänzen Label-
  Metadaten. Die Label Registry hängt am gleichen read-only Adapter-/Cachepfad.
- Sprint 21.4 ersetzt die großen Regel-Auswahlen durch den Entity Rule Manager.
- Sprint 21.5 ergänzt den kleinen Health-Status; er lädt keine Rohdiagnostik.
- Sprint 22 ergänzt Grace/Flapping/Recovery nach dem Enrichment; Sprint 23
  ergänzt feste read-only Automation-Adapter. Beide verwenden den bestehenden
  Snapshot statt eines zweiten Datenpfads.
- Sprint 24 ergänzt den Supervisor-Transport. Die Sprint-21-Sicherheitsgrenze
  bleibt erhalten; die vollständige HA-App-Verpackung wird erst in Part 13
  auditiert.

## Automated Evidence

- Part-09-Fokuslauf: 153/153 Tests bestanden;
- vollständige Regression: 329/329 Tests bestanden;
- alle 15 relevanten Backend-/Wall-JavaScript-Dateien bestanden `node --check`;
- System-JavaScript ohne verbotene Legacy-Syntax/APIs;
- System-CSS ohne CSS Grid, Flex-gap, ResizeObserver oder Container Query;
- Public-Scan ohne HA-/Supervisor-Token, Browser-WebSocket oder Service-Command;
- Tests ausschließlich gegen localhost-Mocks/Fake-Credentials, kein reales HA.

Der erste eingeschränkte Fokuslauf hatte vier `listen EPERM`-Fehler an lokalen
Mockservern. Der identische Lauf mit freigegebenem 127.0.0.1-Bind bestand
vollständig; dies war kein Produktfehler.

## Findings

- `PARTIAL`: `RQ-09-01`, `RQ-09-02` und `RQ-08-02`; `RQ-04-01` ist
  code-seitig geschlossen.
- `MISSING`: keine.
- `BROKEN`: keine bestätigte fachliche oder sicherheitsrelevante Funktion.
- `NOT TESTED`: MT-30 und MT-32; echte HAOS-Laufzeit bleibt dem Sprint-24-Audit
  vorbehalten.

## Final Assessment

Sprint 21 ist als read-only Registry-/Diagnoseanreicherung fachlich und
sicherheitsseitig implementiert. Für `COMPLETE` fehlen die dokumentierte
Error-only-Reconnect-Härtung, die explizite Testmatrix, konsistente
Cacheversionen sowie reale Safari-/HA-/iPad-Abnahmen.
