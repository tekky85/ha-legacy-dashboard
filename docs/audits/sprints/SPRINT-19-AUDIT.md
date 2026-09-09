# Sprint 19 Audit

## Audit Metadata

- Sprint: 19
- Sprint title: Summary Dashboard MVP
- Audit date: 7. September 2026
- Repository commit: `09422e0`
- Spec file: [`docs/sprints/SPRINT-19.md`](../../sprints/SPRINT-19.md)
- Working tree at Part-07 start: kein veränderter Anwendungscode; nur
  ausstehende Auditdokumente aus Part 06 und die Part-Prompts.

## Overall Result

PARTIAL

Das Summary Dashboard ist fachlich nutzbar und folgt weiterhin dem Sprint-18-
Datenfluss. Die Domainregeln, reduzierten Items, Kategorien, serverseitige
Sortierung, Privacy-Opt-in, persistente Ignore-Konfiguration, feste Route und
ES5-Darstellung sind vorhanden. Spätere Sprints haben Filter, Spalten,
Entity-Rule-Manager, sichere Rücknavigation und globale Theme-Persistenz
gezielt ergänzt; sie erhalten den ursprünglichen Endzustand.

Kein aktuelles Verhalten ist `BROKEN` oder `MISSING`. `PARTIAL` entsteht aus
drei Gründen: reale Browser-/iPad-Abnahmen fehlen, der gemeinsame
Asset-Cache-Buster aus `RQ-04-01` ist inkonsistent, und die spezifizierte
Aktivitäts-Testmatrix ist trotz grüner Gesamtsuite nicht für alle geforderten
Zustandsvarianten explizit abgesichert (`RQ-07-01`).

## Requirement Matrix

| ID | Requirement | Status | Evidence | Notes |
|---|---|---|---|---|
| 19-SEC1 | HA-/Admin-Token bleiben getrennt und backend-only | PASS | Gateway-/Admin-/Securitytests; Public-Source-Scan | Summaryantwort enthält weder Token noch Header oder Admingeheimnis. |
| 19-SEC2 | Keine direkte Browser-HA-Verbindung, generische Service-API, Schnellaktion oder neuer Write | PASS | `src/routes/system-dashboards.js`; `src/public/js/system/*`; CSP | Summaryroute ist GET/read-only. |
| 19-SEC3 | Summary-Sichtbarkeit erzeugt keine Write-Berechtigung | PASS – superseded by Sprint 26.2 | `src/services/control-authorization.js`; getrennte Summary-Config; Security-/Gatewaytests | Ignore/Anzeige und Control Grants sind getrennte Modelle. |
| 19-LEG1 | ES5-/Safari-iOS-9-JavaScript über `Legacy.http` | PASS | `common.js`, `summary.js`; Syntax-/Forbidden-Syntax-Scan; System-Frontendtest | Kein `fetch`, Promise, moderne Syntax oder Modulruntime. |
| 19-LEG2 | Kein CSS Grid, Flex-gap, ResizeObserver oder Container Query | PASS | `src/public/css/system.css`; statischer Scan | Präfixiertes Flexbox plus Margins/Media Queries. |
| 19-R1 | `/system/summary` ist fest, nicht löschbar/umbenennbar und kein Benutzergrid | PASS | `src/server.js`; `system.html`; kein Dashboardmodell-Eintrag | Filter und Spalten sind feste Systemdarstellung, kein Drag-and-drop-Raster. |
| 19-MODEL1 | „Aktiv“ wird explizit domänenspezifisch, nicht als bloßes `state != off`, bestimmt | PASS | `src/services/summary/rules.js:140-309` | Unbekannte Domains/Zustände liefern `null`. |
| 19-MODEL2 | Normalisiertes Summary Item besitzt stabile ID, Entity-IDs, Kategorie, Priorität, Titel, State, Start, Dauer, Icon und Meta | PASS | `rules.js:createItem()` | Optional Beschreibung, Area/Device/Integration und MediaTitle. Keine HA-Rohattribute. |
| 19-CAT1 | Kategorien und Prioritäten sind explizit und deterministisch | PASS | `CATEGORY_DEFINITIONS`/`CATEGORY_ORDER` in `rules.js:8-30` | Security 100, Open 90, Running/Cleaning 80, Climate 70, Media 60, Powered 50. |
| 19-L1 | Light `on` aktiv, `off` inaktiv | PASS | `rules.js:165-171`; `test/summary.test.js` | Funktion implementiert und Basispaar getestet. |
| 19-SW1 | Switch `on` aktiv, `off` inaktiv und Ignore greift | PASS | `rules.js:173-179,341-372`; Summarytests | Sichtbarkeit bleibt von Writes getrennt. |
| 19-BIN1 | Window/Door/Opening/Garage Door nur bei `on` als offen | PASS | `OPEN_DEVICE_CLASSES`; `rules.js:181-191` | Motion/sonstige Binary-Klassen fallen heraus. |
| 19-COV1 | Cover `open` → Open, `opening/closing` → Running, `closed` inaktiv | PASS | `rules.js:193-212`; Summarytests | Position wird optional reduziert dargestellt. |
| 19-VAC1 | Vacuum cleaning/returning/paused aktiv, docked inaktiv | PASS | `rules.js:214-232` | Kategorie Cleaning. |
| 19-CLI1 | Climate nur bei tatsächlicher HVAC-Aktion aktiv | PASS | `CLIMATE_ACTIONS`; `rules.js:234-250` | heating/cooling/drying/fan; bloßes `state=heat` mit idle bleibt inaktiv. |
| 19-MED1 | Media Player nur bei `playing` aktiv | PASS | `rules.js:252-265` | Idle/paused/off werden nicht aufgenommen. |
| 19-MED2 | Medientitel standardmäßig verborgen, nur per persistiertem Opt-in | PASS | `showMediaTitles`; Summary-/Persistenz-/Admin-Tests | Titel gelangt bei Opt-in reduziert in Description/Metadata. |
| 19-FAN1 | Fan `on` aktiv | PASS | `rules.js:267-273`; Summarytest | Andere States werden nicht automatisch aktiv. |
| 19-LOCK1 | Lock unlocked/unlocking/locking ist Security; locked inaktiv; jammed nicht verharmlost | PASS | `rules.js:275-293`; Summarytests | `jammed` fällt aus Summary und gehört zum Errorpfad. |
| 19-ALARM1 | Relevante Alarmzustände sind Security; disarmed inaktiv; triggered priorisiert | PASS | `ALARM_STATES`; `rules.js:295-307`; Summarytests | Triggered wird nicht als harmloses Powered-Item dargestellt. |
| 19-NUM1 | Numerische Sensoren erscheinen nicht automatisch | PASS | kein Sensor-Aktivitätszweig; Inaktivtest | Temperatur ist direkt getestet; Power folgt derselben generischen Ausschlusslogik. |
| 19-MOT1 | Motion/Presence standardmäßig nicht aktiv | PASS | relevante Binary-Allowlist; Inaktivtest mit `motion` | Keine Namensheuristik. |
| 19-UNK1 | `unknown`/`unavailable` werden nicht als normale Aktivität oder `off` interpretiert | PASS | `rules.js:161-163`; stale Meta getrennt | Errorlogik lebt separat. |
| 19-IGN1 | Persistente explizite Ignore-Liste entfernt nur Summary-Items | PASS | `systemDashboards.summary.ignoredEntities`; Configvalidierung; Entity Rule Manager | Unbekannte IDs sind nach Schema nur syntaktisch gültig erforderlich. |
| 19-INC1 | Keine Include-Konfiguration im MVP | N/A | Sprint-19-Spezifikation erklärt Include als nicht erforderlich | Es wurde kein zweiter Regelpfad erfunden. |
| 19-SORT1 | Sortierung Priorität → Kategorie → Dauer → Titel → Entity-ID | PASS | `rules.js:314-336`; Determinismus-/Sortiertest | Security/Open stehen vor Powered; stabiler finaler Tie-Breaker. |
| 19-DUR1 | Dauer stammt aus normalisiertem `last_changed` | PASS | `durationSeconds()`/`createItem()`; Summarytest | Ungültiger Zeitwert ergibt sicher `null`. |
| 19-AREA1 | Area/Device-Kontext ist optional und Name-Heuristiken sind nicht erforderlich | PASS – superseded by Sprint 21 | `entity.context` aus Registry-Enrichment; `createItem()` Metadata | Fehlende Area verhindert Summary nicht. |
| 19-GRP1 | Server liefert nur nichtleere, priorisierte Kategoriegruppen | PASS | `groupActivities()`; `buildSummary()` | Client rendert diese Gruppen und reevaluiert keine Domainregeln. |
| 19-UI1 | Kompakte Touch-orientierte Summary-Darstellung mit Icon, Titel, Kurztext und Dauer | PASS | `summary.js:createItem()`; `system.css` | Reale Legacy-Gerätewirkung bleibt MT-25. |
| 19-UI2 | DOM wird aus reduzierten Items aufgebaut; keine Rohstate-Flut | PASS | `summary.js:228-302`; 3000-Entity-Test | Nur sichtbare fachliche Gruppen/Items gelangen in den DOM. |
| 19-HEAD1 | Header zeigt Summary und Gesamtzahl eindeutig | PASS – superseded by Sprint 21.4 | `system.html`; `summary.js:305-345`; Sprint-21.4-Test | Spätere Vereinfachung zeigt die Gesamtzahl prominent nur einmal. |
| 19-EMPTY1 | Frischer leerer Snapshot zeigt echten Empty State | PASS | `engine.js:55-60`; `summary.js`; Frontendtest | Nicht mit offline/stale verwechselt. |
| 19-STALE1 | Stale behält letzte Items und markiert Metastatus | PASS | Sprint-18 Cache; Summary stale-Test; System-Frontendtest | Keine falsche Aussage „keine Aktivitäten“. |
| 19-OFF1 | Offline ohne Snapshot ist eindeutig | PASS | `common.js`; System-Foundation-/Frontendtests | Overview wird nicht als gesund/leer behauptet. |
| 19-REC1 | Recovery rechnet neu und zeigt Wiederherstellung | PASS | `common.js`/`summary.js`; Frontendtest | Danach normales Polling. |
| 19-POLL1 | Polling verwendet gemeinsames Gatewaymodell und vermeidet Doppelabruf | PASS | `common.js:598-623`; Systemcache | Kein HA-Aufruf je Item. |
| 19-API1 | `GET /api/system-dashboards/summary` liefert serverseitig normalisierte Items/Gruppen/Meta | PASS | Systemrouter 76-88; Gatewaytest | Keine Rohstates, Secrets oder Allowlists. |
| 19-LOGIC1 | Keine doppelte Fachlogik im Frontend | PASS | Domainregeln nur `services/summary/rules.js`; Client rendert Kategorien | Spätere Clientfilter verwenden serverseitige Kategoriezuordnung. |
| 19-ADM1 | Geschützter Admin kann Summary Ignore und Medientitel-Opt-in bearbeiten/persistieren | PASS – superseded by Sprint 21.4 | `src/admin/js/system-dashboards.js`, `entity-rules.js`; Admin-/Persistenztests | Große Einzelauswahl wurde bewusst durch Entity Rule Manager mit Batch Save/Discard ersetzt. |
| 19-ADM2 | Entity-Auswahl nutzt vorhandenes sanitiertes Inventar, keine Browser-HA-Abfrage | PASS | Admin Entity Rule Manager und Admin API | Admin-Token bleibt Session-only und getrennt. |
| 19-NAV1 | Summary ist direkt und aus dem Produkt intern erreichbar | PASS – superseded by Sprint 21.5/25.2 | `system-navigation.js`; Sprint-21.5-/25.2-Tests | Immer sichtbare Summary-Navigation, validiertes Return-Ziel, same-window/same-origin. |
| 19-PERF1 | Gemeinsamer Snapshot, keine N+1-HA-Aufrufe | PASS | Systemcache/Collector; Gatewaytest `systemStateRequests === 1` | Summaryberechnung ist rein in-memory. |
| 19-PERF2 | Große Installation bleibt deterministisch und Payload reduziert | PASS | 1500 aktive Summary-Entities und 3000 irrelevante Entities in Tests | Laufzeiten unter 2 s; irrelevante Rohattribute/Entities fehlen in Public-Payload. |
| 19-PRIV1 | Antwort filtert Token, Header, Rohattribute, Allowlists und Medientitel standardmäßig | PASS | Gateway-/Summarytests | Fehlerlogs enthalten nur kontrollierte Typen/Codes. |
| 19-ERR1 | Einzelne unpassende/fehlende Attribute brechen Engine nicht | PASS | defensive Defaults in `rules.js`; System-/Summarytests | Unbekannte Zustände werden ausgelassen. |
| 19-T1 | Fachlogik ist automatisiert abgedeckt | PARTIAL | `test/summary.test.js` besitzt sechs breite Tests; Gesamtsuite 329/329 | Mehrere der 70 vorgeschriebenen Einzelvarianten besitzen keine gezielte Assertion; `RQ-07-01`. |
| 19-T2 | API-, Admin-, Legacy- und Regressionstests | PASS | Gateway-, Admin-UI/API-, Persistenz-, System-Frontend-, Security- und Layouttests | 104/104 Fokuslauf und 329/329 Gesamtsuite. |
| 19-MAN1 | Manuelle Abnahme im modernen Browser einschließlich Adminsettings | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-24 und MT-26 | Keine aktuelle manuelle Safari-Abnahme. |
| 19-MAN2 | Reale iPad-mini-Abnahme Portrait/Landscape, Themes, lange/große Listen | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-25 | Gemäß Part-07-Regel nicht physisch ausgeführt. |
| 19-CACHE1 | Nach Frontendänderungen einheitlich erhöhte Cacheversion | PASS | System, Dashboard, Admin und Manifest verwenden einheitlich v52; `test/asset-version.test.js`; immutable Header unverändert. | RQ-04-01 code-seitig geschlossen. |
| 19-DOC1 | README, Projektstatus und Roadmap dokumentieren Regeln, Datenschutz, Route und Error-Abgrenzung | PASS – superseded by Sprint D1 | README DE/EN; Projektstatus; Roadmap | Root-README ist seit D1 Sprach-/Projekt-Landingpage; D1 wird erst in Part 08 auditiert. |
| 19-N1 | Keine Error-Fachlogik, Registryanalyse, Historie, Templates, neuen Writes oder generische Automation | N/A – replaced by later Sprints | Sprint 20–23 | Historische Nicht-Ziele waren erfüllt; spätere geplante Erweiterungen bleiben read-only. |

## Explicit Activity and Test-Coverage Audit

Die aktuelle Implementierung deckt die vollständige spezifizierte
Zustandsmenge ab. Die fokussierten Unit-Tests prüfen jedoch nicht jede in der
Spezifikation nummerierte Variante eigenständig. Ohne direkte Regression sind
insbesondere:

- Door `on`, Window `off`;
- Cover `closing`;
- Vacuum `returning` und `paused`;
- Climate `hvac_action=cooling`;
- Media Player `idle`;
- numerischer Power-Sensor;
- `unknown` als eigener Summaryfall;
- unbekannte syntaktisch gültige Ignore-ID;
- expliziter Nachweis, dass Ignore keine Control Grants ändert;
- mehrere Admin/API-Kombinationen wie Reload des Ignore-Werts und Offline-
  Summary ohne früheren Snapshot als eigenständige Summary-API-Assertion.

Breite Aggregat-, Persistenz-, Security- und Systemtests liefern teilweise
indirekte Evidenz, ersetzen aber nicht die verlangte explizite Matrix. Deshalb
ist dies kein bestätigter Funktionsdefekt, aber ein umsetzbarer P2-Testbefund
`RQ-07-01`.

## Current Summary Data Flow

```text
shared normalized System Snapshot
  -> summary/rules.collectActivities()
  -> normalized/sorted SummaryItems + non-empty groups
  -> GET /api/system-dashboards/summary
  -> common.js connection/polling state
  -> summary.js presentation and client-only category filtering
```

Der Client verändert weder Aktivitätsdefinition noch globale Health-/Error-
Semantik. Die späteren Sprint-21.2-Filter schränken lediglich bereits
normalisierte Kategorien im DOM ein.

## Automated Evidence

- fokussierter Part-07-Lauf: 104/104 Tests bestanden;
- vollständige Regression: 329/329 Tests bestanden;
- 14 Syntaxchecks bestanden;
- System-Wall-JS ohne verbotene moderne Syntax/APIs;
- System-CSS ohne Grid, Flex-gap, ResizeObserver oder Container Queries;
- keine Public-Tokens, Browser-HA-Verbindung oder neue Writefläche.

Der erste eingeschränkte Sandboxlauf scheiterte ausschließlich viermal an
`listen EPERM` für lokale Mockports. Der identische Lauf mit erlaubtem
127.0.0.1-Bind bestand vollständig.

## Superseded Requirements

- Sprint 21 ergänzt Registry-/Area-Kontext und hält fehlenden Kontext optional.
- Sprint 21.2 ergänzt Clientfilter und persistente Spalten ohne neue HA-Abfrage.
- Sprint 21.4 ersetzt die großen Auswahlfelder durch den Entity Rule Manager
  und vereinfacht den Header.
- Sprint 21.5 integriert Summary/Health in jedes Dashboard und validiert das
  Rückkehrziel.
- Sprint 25.1 vereinheitlicht globale Theme-Persistenz.
- Sprint 25.2 erzwingt same-window/same-origin HomeScreen-Navigation.
- Sprint 26.2 zentralisiert Write Grants; Summary-Konfiguration bleibt davon
  getrennt.

## Findings

- Kein aktuelles `MISSING` oder `BROKEN`.
- `PARTIAL`: `RQ-07-01` (P2 explizite Summary-Testmatrix); `RQ-04-01` ist
  code-seitig geschlossen.
- `NOT TESTED`: MT-24 bis MT-26.

## Final Assessment

Sprint 19 ist fachlich implementiert und die vorhandenen Tests sind grün. Der
Sprint bleibt im Baseline-Audit `PARTIAL`, bis die explizite Zustandsmatrix
nachgerüstet, die gemeinsame Cacheversion repariert und die realen Browser-
Abnahmen dokumentiert sind.
