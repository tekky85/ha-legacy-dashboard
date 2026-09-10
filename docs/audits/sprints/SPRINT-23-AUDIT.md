# Sprint 23 Audit

## Audit Metadata

- Sprint: 23
- Sprint title: Automation Impact & Advanced Diagnostics
- Audit date: 8. September 2026
- Repository commit: `593ba5a`
- Spec file: [`docs/sprints/SPRINT-23.md`](../../sprints/SPRINT-23.md)
- Working tree at Part-12 start: Anwendungscode unverändert; ausschließlich
  der bereitgestellte Part-12-Prompt war untracked und wurde bewahrt.

## Overall Result

PARTIAL

Das Backend baut aus dem bestehenden State-Snapshot ein reduziertes Automation
Inventory, liest Konfiguration und Traces über feste read-only WebSocket-
Kommandos, extrahiert explizite Entity-/Device-/Area-/Label-Referenzen in
begrenzten Workerpools und ergänzt erst aktive Sprint-22-Issues. Raw Config,
Tracevariablen, Action-/Servicedaten und Credentials erreichen den Browser
nicht. Trace Summaries werden nur bei geöffneten Advanced Diagnostics und
vorhandenem Impact geladen; es existiert keine Automation-Write-Fläche.

Sprint 27.1-C schließt die zwei reproduzierten fachlichen Lücken: Dynamische
Referenzen erscheinen nun als begrenzter, sanitizierter und ausdrücklich
kausalitätsfreier globaler `unknown`-Kontext (`RQ-12-02`). Außerdem werden die
Reference-Indizes bei jedem Snapshot aus frischem Inventory und gecachten
Referenzen neu aufgebaut, sodass State, Disabled-Kontext, Name und
`lastTriggered` nicht mehr bis zum 60-s-TTL veralten (`RQ-12-03`). Der Sprint
bleibt wegen Testmatrix-, Screenshot- und manuellen Abnahmelücken `PARTIAL`.

## Requirement Matrix

| ID | Requirement | Status | Evidence | Notes |
|---|---|---|---|---|
| 23-INV1 | Inventory stammt aus vorhandenen normalisierten `automation.*`-States | PASS | `snapshot.js`; `automations/normalizers.js:inventory()` | Keine Einzelabfrage je Automation-State. |
| 23-INV2 | Entity ID, Name, State, Availability, lastTriggered, Mode und Laufzähler sind reduziert | PASS | `inventory()`; Sprint-23-Inventorytest | Unbekannte Attribute werden vorher verworfen. |
| 23-INV3 | on/off/unavailable/unknown/missing sind unterscheidbar | PASS | `normalizeState()` | `off` bleibt available; ungültig fällt konservativ auf unknown. |
| 23-INV4 | `off` ist Kontext und kein Error | PASS | `buildIssues()` erzeugt für gesunde States kein Issue; Health-Test | Impact markiert `disabled=true`. |
| 23-INV5 | `unavailable` wird diagnostisch, `unknown` nach Sprint-22-Regeln bewertet | PASS | `createIssue()`; Sprint-23-Test | Unavailable-Quelle `automation_unavailable`, normal standardmäßig warning. |
| 23-INV6 | Fehlendes/altes `last_triggered` erzeugt keine Severity | PASS | Normalizer/Issuepipeline | Nur Anzeigealter in `formatAge()`. |
| 23-REF1 | Fester read-only Config-Adapter liest nur bekannte Automation | PASS | `service.js:fetchConfig()` mit `type:"automation/config"` und serverseitigem Inventory | Browser liefert weder Command noch Automation-ID. |
| 23-REF2 | Explizite `entity_id` in Trigger, Condition und Action/Target wird extrahiert | PASS | `normalizers.js:references()`/`walk()`; Parser-Test | Singular- und Plural-HA-Strukturen. |
| 23-REF3 | `device_id`, `area_id` und `label_id` werden extrahiert | PASS | `referenceType()`; Parser-/Impacttests | Nur syntaktisch sichere IDs. |
| 23-REF4 | Doppelte Referenzen werden dedupliziert | PASS | `addUnique()` | Auch Sektionslisten werden dedupliziert/sortiert. |
| 23-REF5 | Trigger/Condition/Action bleiben intern getrennt | PASS | `references.sections` | Public Impact enthält keine Raw-Sektion. |
| 23-REF6 | Keine Namenheuristik | PASS | Parser reagiert ausschließlich auf exakte ID-Schlüssel | Beschreibungstext wird nicht als Entityreferenz interpretiert. |
| 23-REF7 | Parser ist gegen Tiefe/Größe begrenzt | PASS | `MAX_WALK_DEPTH=64`, `MAX_WALK_NODES=10000` | Überschreitung markiert Analyse dynamisch statt ungebunden weiterzulaufen. |
| 23-DYN1 | Jinja/Templates und Blueprints werden nicht vollständig ausgewertet | PASS | `TEMPLATE_PATTERN`; `use_blueprint`; Tests | Keine beliebige Templateausführung. |
| 23-DYN2 | Dynamische/nicht auflösbare Referenzen setzen `dynamicReferences` | PASS | `walk()`/`references()`; Tests | Advanced Diagnostics zeigt globalen Dynamic Count. |
| 23-IDX1 | Vier statische Maps indexieren Entity, Device, Area und Label | PASS | `automations/indexes.js:create()` | Keine O(n²)-Automation-Suche je Issue. |
| 23-IDX2 | Inventory ist stabil nach Automation-Entity-ID indiziert | PASS | `inventoryByEntityId` | Dient dem Impact-Kontext. |
| 23-CONF1 | Explizite Entity-/Device-Referenz ist `direct` | PASS | `impact.js:forIssue()` | Gründe `entity`/`device`. |
| 23-CONF2 | Area-/Label-Referenz ist `indirect` | PASS | `forIssue()` | Metadaten verwenden stabile Registry-IDs. |
| 23-CONF3 | Dynamische/nicht auflösbare Referenz kann als `unknown`-Impact dargestellt werden | PASS | `impact.js:analysis()` liefert begrenzte `unknownImpacts`; `errors.js:renderUnknownAutomationContext()`; Backend-/Frontendtests | Globale Liste nennt Confidence `unknown` und ordnet die Automation ausdrücklich keinem konkreten Problem zu; `forIssue()` bleibt konservativ. `RQ-12-02` code-seitig geschlossen. |
| 23-CONF4 | Confidence wird bei Mehrfachtreffern deterministisch auf stärksten Nachweis reduziert | PASS | `addReason()`/`merge()` | direct vor indirect vor unknown. |
| 23-CAUS1 | UI behauptet keine Kausalität | PASS | „möglicherweise betroffen“; `advancedDiagnosticsNote` | Referenz wird nicht als Ursache bezeichnet. |
| 23-DEV1 | Device Groups zeigen deduplizierten Impact Count und Liste | PASS | `presentation.js:createDeviceGroup()`/`addToDeviceGroup()` | Impacts mehrerer Children werden zusammengeführt. |
| 23-DEV2 | Standalone Entity Issues erhalten denselben Impactpfad | PASS | `createStandalone()` | Nicht-Entity-Diagnosen bleiben ohne falsche Zuordnung. |
| 23-DEV3 | Impactdetails sind standardmäßig collapsed | PASS | `expandedAutomationImpacts={}`; `automationImpactSection()` | Eigener expliziter Button/ARIA-Zustand. |
| 23-DEV4 | Deaktivierte/unavailable Automation wird als Kontext markiert | PASS | `automationImpactItem()` | Disabled erzeugt keine eigene Severity. |
| 23-PIPE1 | Impact wird erst nach Sprint-22-Grace/Expected Offline/Flapping/Recovery/Severity ergänzt | PASS | `IssuePresentation.build(snapshot, Issues.buildIssues(...))` | Nur `detected.issues` werden zugeordnet. |
| 23-PIPE2 | Automation Impact allein ändert Global Health nicht | PASS | `SystemStatus.build()` nutzt Issues ohne Presentation-Impact | Normaler Statuspayload enthält keine Impactlisten. |
| 23-PIPE3 | Automation-/Trace-Teilfehler downgraden Critical Issues nicht | PASS | Severity entsteht vor `AutomationImpact.forIssue()`; Config-/Trace-Catch liefert leeren/stale Kontext | Diagnoseausfall ändert weder Risk Class noch Severity. |
| 23-TRACE1 | Trace-Zugriff ist fester read-only, capability-driven Adapter | PASS | `type:"trace/list"`, `domain:"automation"`; `probeTrace()` | Unsupported ist eigener Status, kein Error-Dashboard-Ausfall. |
| 23-TRACE2 | Browser kann keine beliebige Automation/WS-Command anfordern | PASS | Route sammelt IDs ausschließlich aus serverseitiger Presentation | GET hat keine Entity-/Commandparameter. |
| 23-TRACE3 | Trace Summary ist auf drei Einträge je Automation begrenzt | PASS | `TRACE_LIMIT=3`; `Normalizers.traces()` | Route begrenzt zusätzlich auf höchstens 50 betroffene IDs. |
| 23-TRACE4 | Run-ID, Start/Ende, Dauer, Result, generischer Fehler und Triggerbeschreibung sind normalisiert | PASS | `normalizers.js:trace()` | Keine Raw-Objekte. |
| 23-TRACE5 | Condition false und Not Triggered sind keine Fehler | PASS | `failed_conditions`/`not_triggered`; Trace-Test | `hasError=false`. |
| 23-TRACE6 | Wiederholte Fehler werden kompakt gezählt | PASS | `errorCount`; `traceDescription()` | Kein Statistiksystem. |
| 23-TRACE7 | Alter erzeugt keine Severity | PASS | `formatAge()` ist reine Anzeige | Trace verändert Issue-Severity nicht. |
| 23-PRIV1 | Keine Raw Automation Config im Browser | PASS | Config wird sofort zu Referenzlisten reduziert; Payloadtest | Keine YAML/JSON-Config-Route. |
| 23-PRIV2 | Keine Raw Traces, Variables, Action-/Service-/State-Daten im Browser | PASS | `Normalizers.trace()`; Trace-Redactiontest | Fehlertext wird auf „Ausführungsfehler“ reduziert. |
| 23-PRIV3 | Config-/Trace-Inhalte und Secrets werden nicht geloggt | PASS | Logs enthalten nur Counts/Error Codes; Test mit `raw-secret` | Public-/Logscan ohne Tokens. |
| 23-ADV1 | Error Dashboard besitzt einklappbare Advanced Diagnostics | PASS | `src/public/system.html`; `errors.js:initializeAdvancedDiagnostics()` | Keine JSON-Dumps. |
| 23-ADV2 | Inventory, Config, Trace, Dynamic, Registry und Repairs werden reduziert angezeigt | PASS | `renderAdvancedDiagnostics()` | Statuslabels available/unsupported/stale/error/unknown. |
| 23-ADV3 | Trace Summaries werden erst beim Öffnen, nur bei vorhandenem Impact geladen | PASS | `loadTraceSummaries()`; System-Frontendtest | Normale Header-/Dashboardnavigation fragt keine Traces ab. |
| 23-ADM1 | Admin Diagnostic Sources enthält Inventory, Config Read und Trace Read | PASS | `src/admin/js/app.js:renderDiagnosticsStatus()` | Ausschließlich Status, keine Automation-Controls. |
| 23-CACHE1 | Config-/Reference-Cache liegt im geforderten Bereich und dedupliziert Inflight | PASS | 60-s-TTL, `configInFlight`; Config-Adapter-Test | Workerpool max. acht Requests. |
| 23-CACHE2 | Trace-Cache liegt im geforderten Bereich und dedupliziert Inflight | PASS | 30-s-TTL, `traceInFlight`; Trace-Cache-Test | Workerpool max. sechs Requests. |
| 23-CACHE3 | Aktuelle Automation-State-/Trigger-Metadaten bleiben trotz Reference-Cache aktuell | PASS | `service.js:mergeCurrentInventory()` baut bei Cache-Hit und Inflight-Rückgabe den Index neu; Cachetest `on→off→on`, Name und Triggerzeit | Referenz-TTL bleibt erhalten, während Impact-Metadaten jedem frischen State-Snapshot folgen. `RQ-12-03` code-seitig geschlossen. |
| 23-FAIL1 | Unsupported Config lässt Inventory und Dashboard nutzbar | PASS | `configFailure()`; Unsupported-Test | Capability wird `unsupported`. |
| 23-FAIL2 | Partial Config Failure behält verfügbare/last-known Referenzen | PASS | `refreshConfig()` merged vorherige Einzelreferenzen | Source meldet `automation_config_partial`; direkte Einzelmatrix bleibt `RQ-12-04`. |
| 23-FAIL3 | Trace timeout/unsupported zerstört Impact und Error Dashboard nicht | PASS | `fetchTrace()` Catch/Cache; Unsupported-Test | Ohne Cache wird nur Summary ausgelassen. |
| 23-FAIL4 | Automation-/Trace-Quelle reconnectet nach jedem Transportfehler selbständig | PASS | gemeinsamer `homeassistant-websocket.js`-Transport; Sprint-27.1-C-Error-only-/Backofftests | Isoliertes `error` und nachfolgendes `close` werden idempotent behandelt; `RQ-09-01` code-seitig geschlossen. |
| 23-PERF1 | 3000 Entities, 500 Devices, 500 Automationen, 2000 Referenzen und 100 Traces | PASS | Sprint-23-Lasttest | 200 Impactlookups über Maps, Lauf aktuell grün. |
| 23-PERF2 | Kein N+1-State-Poll | PASS | Inventory aus gemeinsamem Snapshot | Configlesevorgänge sind TTL-/workerbegrenzt und nur im Error-/Adminpfad. |
| 23-PERF3 | Browserpayload und Rendering sind begrenzt | PASS | max. drei Traces/Automation, höchstens 50 Traceziele, `MAX_RENDERED_ISSUES=200` | Keine Raw Config/Traceobjekte auf Legacy-Clients. |
| 23-UI1 | Loading-, Empty-, Error- und Unsupported-Zustände degradieren verständlich | PASS | `traceSourceLabel()`, Error-Shell und `Legacy.http`-Callbacks; System-Frontendtests | Statischer Impact bleibt bei Tracefehler erhalten. |
| 23-LEG1 | System-Wall-JavaScript bleibt ES5/iOS-9-kompatibel | PASS | `errors.js`, `common.js`; Syntax-/Forbidden-Scan | Kein fetch/Promise/Arrow/let/const/Modul. |
| 23-LEG2 | System-CSS benötigt kein Grid, Flex-gap, ResizeObserver oder Container Query | PASS | `system.css`; statischer Scan | Präfixierte Flexbox/Margins. |
| 23-SEC1 | HA-WebSocket und HA-/Supervisor-Token existieren nur im Backend | PASS | Diagnostics-/Runtime-Transport; Public-Scan | Browser sieht weder Token noch Registry-/Config-/Trace-Rohdaten. |
| 23-SEC2 | Keine Trigger-, Enable-/Disable-, Reload-, Edit-, Repair-, Registry-, Label- oder Matter-Writes | PASS | Command-/Route-/Securityscan | Nur feste read-only `automation/config` und `trace/list`. |
| 23-SEC3 | Keine generische WebSocket- oder HA-Service-Proxy-Route | PASS | `system-dashboards.js`; Securitytests | Browser kann keine Domain/Service/Command-Kombination liefern. |
| 23-DEP1 | Standalone-HA-Token bzw. HA-App-Supervisor-Token bleiben hinter demselben Backendadapter | PASS | `runtime.js`; `homeassistant-websocket.js`; Sprint-24-Regressionen im Gesamtlauf | Sprint-23-Kommandos sind transportunabhängig fest; vollständiges App-Paket folgt in Part 13. |
| 23-REG1 | Sprint-22-Regeln und Sprint-21.x-Systemfunktionen bleiben erhalten | PASS | Part-12-Fokus 118/118; Gesamtsuite 329/329 | Keine Anwendungscodeänderung im Audit. |
| 23-T1 | Alle 84 nummerierten Testanforderungen sind einzeln rückverfolgbar | PARTIAL | 12 breite direkte Sprint-23-Tests plus System/Gateway/Security/22-Regressions | Timeout-, Partial-, Inflight-, UI-/Viewport- und Einzelfälle sind nicht alle separat zugeordnet; `RQ-12-04`. |
| 23-MAN1 | Inventory/Referenzen/Capabilities/Traces gegen kontrolliertes reales HA | NOT TESTED | MT-46 | Kein reales HA in Part 12 kontaktiert. |
| 23-MAN2 | Advanced Diagnostics/Impact im aktuellen macOS Safari | NOT TESTED | MT-47 | Kein realer Safari-Lauf. |
| 23-MAN3 | Impact/Diagnostics auf iPad mini/iOS 9 | NOT TESTED | MT-48 | Keine physische Geräteprüfung. |
| 23-MAN4 | Nichtregression auf iPad Air 2/iPadOS 15.8.5 | NOT TESTED | MT-49 | Keine physische Geräteprüfung. |
| 23-SHOT1 | Aktuelle echte Errors-Impact-/Admin-Diagnostics-Screenshots | PARTIAL | D1-Audit, `RQ-08-02`, MT-29 | Vier Systembilder haben falsches Dateiformat; UI-Stand ist nicht belastbar aktuell. |
| 23-DOC1 | README DE/EN, Projektstatus und Roadmap dokumentieren Read-only-Impact/Traces | PASS | README DE/EN; Projektstatus; Roadmap | Keine Automation-Write-Funktion versprochen. |
| 23-CACHE4 | Gemeinsame Wall-Assets besitzen routeübergreifend gleiche Cacheversion | PASS | Dashboard, System, Admin und Manifest verwenden v53; `test/asset-version.test.js`. | RQ-04-01 bleibt code-seitig geschlossen. |

## Current Automation Diagnostics Flow

```text
existing normalized state snapshot
  -> automation.* inventory (current state/name/last trigger)
  -> fixed backend-only automation/config reads
  -> bounded parser for explicit entity/device/area/label IDs
  -> four reference indexes + dynamic-analysis flag

active Sprint-22 issue only
  -> stable entity/device/area/label IDs
  -> direct or indirect static impact
  -> reduced collapsed Error UI

Advanced Diagnostics opened + affected automation exists
  -> fixed backend-only trace/list
  -> max. 3 sanitized summaries per automation
  -> generic error/condition-false/not-triggered context
```

Rein dynamische Automationen werden in Advanced Diagnostics global und
kausalitätsfrei mit Confidence `unknown` angezeigt. Die sanitizierte Liste ist
auf 50 Einträge begrenzt; keine dynamische Automation wird ohne statischen
Nachweis einem konkreten Issue als Ursache oder Impact zugeordnet.

## Superseded Requirements

- Sprint 24 ergänzt den Supervisor-WebSocket-Transport für den HA-App-Modus,
  ersetzt aber weder die festen read-only Commands noch die Sanitization.
- Sprint 25.1 härtet die sichtbare child-first Errorfilterung; Impact bleibt an
  den jeweiligen sichtbaren Gruppen/Children und ändert keine Severity.
- Sprint 21.5 bleibt Quelle des kleinen globalen Healthindikators. Automation
  Impact und Traces werden dort bewusst nicht abgefragt.

## Automated Evidence

- Part-12-Fokuslauf: 118/118 Tests bestanden; identischer Lauf nach
  localhost-Freigabe grün;
- vollständige Regression: 329/329 Tests bestanden;
- alle 19 relevanten JavaScript-Dateien bestanden `node --check`;
- Legacy-/CSS-/Securityscans grün;
- kontrollierte Dynamic-Referenzprobe: `dynamicReferences=true`, globaler
  `dynamicCount=1`, aber `forIssue()` liefert keinen `unknown`-Impact;
- kontrollierte Cacheprobe: frisches Inventory `off`, Impactindex weiterhin
  `on` und alte Triggerzeit innerhalb des 60-s-TTL;
- nur lokale Mocks/Fake-Credentials, kein reales Home Assistant.

## Manual Evidence Required

- MT-46: reale HA-Automation-/Reference-/Capability-/Trace-Abnahme;
- MT-47: Desktop-Safari-UI, Collapse, lange Namen, Partial Failure;
- MT-48: iPad mini/iOS 9 in Portrait/Landscape und 1/2/3 Columns;
- MT-49: iPad Air 2/iPadOS 15.8.5-Nichtregression;
- MT-29: aktuelle datenschutzgeprüfte Produktaufnahmen.

## Repair Mapping

- `RQ-12-02` – in Sprint 27.1-C code-seitig geschlossen;
- `RQ-12-03` – in Sprint 27.1-C code-seitig geschlossen;
- `RQ-12-04` – vollständige Sprint-22-/23-Testmatrizen zuordnen/härten;
- `RQ-09-01` – in Sprint 27.1-C code-seitig geschlossen;
- `RQ-08-02` und `RQ-08-03` bleiben anwendbar; `RQ-04-01` ist code-seitig
  geschlossen.

## Security and Deployment Review

PASS – Der Browser erhält ausschließlich reduzierte Impact-/Trace-
Zusammenfassungen. Alle HA-Kommandos werden fest im Backend erzeugt; es gibt
keine Automation-, Registry-, Repair-, Label-, Matter- oder generische
WebSocket-/Service-Write-API. Standalone und HA App verwenden dieselbe
Sanitization; der reale Supervisor-/HAOS-Transport ist erst Gegenstand von
Part 13 bzw. MT-46.

## Remaining Sprint 23 Gaps

Vor `COMPLETE` sind `RQ-12-04`, `RQ-08-02` sowie MT-46 bis MT-49 zu schließen;
`RQ-04-01`, `RQ-09-01`, `RQ-12-02` und `RQ-12-03` sind code-seitig
geschlossen.

## Sprint-27.1-C-Re-Audit

`RQ-12-02` und `RQ-12-03` sind **CODE CLOSED / MANUAL PENDING**. Advanced
Diagnostics zeigt dynamische Automationen in einem eigenen globalen Abschnitt
mit Confidence `unknown`, ohne sie konkreten Issues zuzuordnen. Das Modell
enthält nur Entity-ID, Namen, reduzierten State-/Availability-/Disabled-
Kontext und `lastTriggered`; Rohkonfiguration und Traces bleiben ausgeschlossen.
Der Reference-Cache behält ausschließlich die statischen Referenzen, während
Inventory und alle Indizes je Snapshot neu zusammengesetzt werden. Backend-
und UI-Regressionen decken Begrenzung, Sanitization, Kausalitätsfreiheit sowie
`on→off→on`, Name und Triggerzeit innerhalb des TTL ab. MT-46 bis MT-49 sind
ausführbar und bleiben `NOT TESTED`.
