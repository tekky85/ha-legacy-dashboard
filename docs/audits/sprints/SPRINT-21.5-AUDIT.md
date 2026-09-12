# Sprint 21.5 Audit

## Audit Metadata

- Sprint: 21.5
- Sprint title: System Dashboard Navigation & Global Health Indicator
- Audit date: 7. September 2026
- Repository commit: `bbc30fa`
- Spec file: [`docs/sprints/SPRINT-21.5.md`](../../sprints/SPRINT-21.5.md)
- Working tree at Part-11 start: Anwendungscode unverändert; offene
  Auditdokumente und bereitgestellte Auditprompts wurden bewahrt.

## Overall Result

PARTIAL

Default- und Custom-Dashboards verwenden dieselbe globale Navigation: Summary
ist immer sichtbar, der Health-Link nur bei frischem Healthy/Info-only
ausgeblendet. Warning, Error und Critical werden nach der globalen ungefilterten
Issue-Zusammenfassung dargestellt; stale, unknown und API-Fehler bleiben
sichtbar und können daher keinen falschen Healthy-Zustand erzeugen. Der kleine
GET-Status teilt den vorhandenen System-Snapshot-/Issue-Cache und liefert weder
Listen noch Rohzustände.

Der server- und clientseitig validierte `returnTo` akzeptiert nur `/` oder eine
tatsächlich vorhandene `/d/<id>`-Route. Die durch Sprint 25.2 gehärtete aktuelle
Navigation verwendet ausschließlich same-window/same-origin und erhält damit
den ursprünglichen Sprint-21.5-Endzustand. Die Code-/Traceability-Befunde
`RQ-04-01` und `RQ-11-01` sind geschlossen. `PARTIAL` beruht auf
`RQ-08-02` und den ausstehenden realen Browser-/iPad-
Abnahmen; kein neuer funktionaler oder Security-Defekt wurde gefunden.

## Requirement Matrix

| ID | Requirement | Status | Evidence | Notes |
|---|---|---|---|---|
| 21.5-NAV1 | Gemeinsame globale Navigation auf Default und allen Custom Dashboards | PASS | `src/public/index.html`; `system-navigation.js:initializeDashboard()` | Alle normalen Routen rendern denselben Entry Point. |
| 21.5-NAV2 | Neutraler Summary-Link ist immer sichtbar | PASS | `#systemSummaryLink`; `setLink()`; Sprint-21.5-Test | Kein Alarmstil und kein Pflichtcount. |
| 21.5-NAV3 | Sichtbarer Health-Link öffnet Errors | PASS | `setLink("systemHealthLink", systemUrl("/system/errors", currentPath))` | Unabhängig von Dashboard-ID. |
| 21.5-NAV4 | Interne Navigation bleibt im selben Browsing Context | PASS – superseded by Sprint 25.2 | `navigateInternal()` nutzt `window.location.href`; `target="_self"`; `test/sprint-25-2.test.js` | Kein `_blank` und kein `window.open()`. Physischer HomeScreen-Nachweis bleibt MT-40/41. |
| 21.5-NAV5 | Routen sind same-origin/relativ und frei von festem Host, IP oder Protokoll | PASS | `systemUrl()`/`validateInternalPath()`; statischer Public-Scan | Nur Pfade unter demselben Origin. |
| 21.5-HEALTH1 | Fresh Healthy ohne relevante Issues blendet Indicator aus | PASS | `renderHealth()`; Sprint-21.5-Test | Abwesenheit bedeutet nur dann healthy, wenn Metadaten zuverlässig fresh sind. |
| 21.5-HEALTH2 | Fresh Info-only blendet Alarmindikator aus | PASS | `relevant = critical + error + warning`; Status-Test | Info bleibt im Payloadcount, zählt aber nicht als Alarm. |
| 21.5-HEALTH3 | Warning ist sichtbar und korrekt beschriftet | PASS | `severityFromCounts()`; `health-warning`; ARIA/Title | Nicht nur Farbe: Symbol, Titel und `aria-label`. |
| 21.5-HEALTH4 | Error ist sichtbar und korrekt beschriftet | PASS | `health-error`; Sprint-21.5-Test | 44-px-Linkfläche im CSS. |
| 21.5-HEALTH5 | Critical ist sichtbar; dezentes Pulsieren verursacht keinen Layoutwechsel | PASS | `health-critical`; `health-indicator-pulse` als optionale Opacity-Animation | Statischer Critical bleibt auch ohne Animation verständlich. |
| 21.5-HEALTH6 | Höchste relevante Severity bestimmt Darstellung | PASS | `severityFromCounts()` priorisiert critical → error → warning → info | Serverseitiges `highest_severity` wird ebenfalls reduziert geliefert. |
| 21.5-HEALTH7 | Stale Healthy bleibt als unbekannter/nicht aktueller Status sichtbar | PASS | `renderHealth(payload, true)`; `health-stale` | Kein false healthy. |
| 21.5-HEALTH8 | Last-known Critical bleibt bei stale sichtbar | PASS | `lastHealthPayload`; Test „Last-known Critical“ | Kombinierter Critical/Stale-Zustand. |
| 21.5-HEALTH9 | Vor erstem gültigem Status bleibt Unknown sichtbar | PASS | `initializeDashboard()` → `renderHealth(null, true)` | Startzustand ist nicht „alles OK“. |
| 21.5-HEALTH10 | API-Fehler, Timeout, leere oder malformed Antwort fallen sicher auf stale/unknown | PASS | Fehlercallback in `refreshHealth()`; defensive Normalisierung; `Legacy.http` Timeout | Letzter gültiger Problemstatus wird nicht verworfen. |
| 21.5-HEALTH11 | Indicator hat echten Link, Fokus, ARIA/Title und ca. 44 × 44 px Touchziel | PASS | `index.html`; `.system-health-link`; `setLink()` | Reale iPad-Wirkung bleibt MT-40. |
| 21.5-STATUS1 | Kleiner bestehender `GET /api/system-dashboards/status` wird verwendet | PASS | `src/routes/system-dashboards.js`; `src/services/system/status.js` | Keine neue parallele Status-API. |
| 21.5-STATUS2 | Payload ist normalisiert und enthält keine Entity-/Issue-/Registry-/Repairlisten | PASS | `Status.build()`; Gatewaytest „System-Dashboard-APIs teilen einen reduzierten Snapshot“ | Test begrenzt Response zusätzlich auf unter 5000 Bytes. |
| 21.5-STATUS3 | Status basiert auf globaler ungefilterter Issue-Menge | PASS | `Status.build()` → `Issues.buildIssues()`; `summaryCounts()` | Clientfilter und Spaltenwerte sind keine Eingaben. |
| 21.5-STATUS4 | Indicator lädt weder vollständige Errors noch Summary | PASS | `refreshHealth()` ruft ausschließlich `/status` | Summary-Link selbst verursacht keinen Datenabruf. |
| 21.5-STATUS5 | Vorhandener Snapshot-/Issue-Cache wird wiederverwendet | PASS | `src/services/system/index.js:getSnapshot()`; 3-s-Cache | Gatewaytest weist eine geteilte HA-State-Abfrage nach. |
| 21.5-STATUS6 | Kein zweiter eigener Polling-Loop oder unnötige HA-Abfrage | PASS | `app.js:loadDashboard()` ruft `refreshHealth()` im vorhandenen 5-s-Refresh auf; kein `setInterval` in Navigation | Ein In-flight-Guard vermeidet parallele Statusrequests. |
| 21.5-STATUS7 | Health aktualisiert sich nach Recovery bzw. Warning→Critical ohne Seitenreload | PASS | wiederholtes `refreshHealth()`; Signaturvergleich in `renderHealth()` | Header wird nur bei geänderter Signatur neu gesetzt. |
| 21.5-FILT1 | Summary-/Error-Filter ändern nur sichtbare Präsentation | PASS | `summary.js`, `errors.js`, `common.js` | Keine Filterparameter gehen an `/status`. |
| 21.5-FILT2 | Ausgefiltertes Critical kann globalen Health-Status nicht auf Healthy setzen | PASS | eigener `/status`; System-Frontendtest bewahrt `overallStatus: critical` | Error-UI arbeitet auf einer gefilterten Kopie. |
| 21.5-FILT3 | Spaltenpräferenzen beeinflussen globalen Health nicht | PASS | `createColumnController()` speichert nur CSS-Präferenz | Keine Backendmutation oder Statusneuberechnung. |
| 21.5-RET1 | Aktueller exakter Dashboardpfad wird als `returnTo` mitgeführt | PASS | `currentDashboardPath()`; `systemUrl()` | `/` und `/d/<id>` einschließlich sicher normalisiertem Slash. |
| 21.5-RET2 | Clientvalidator akzeptiert nur `/` und syntaktisch gültige `/d/...` | PASS | `validateDashboardPath()`/`validateInternalPath()` | Query/Fragment/andere Systempfade werden kontrolliert begrenzt. |
| 21.5-RET3 | Servervalidator verlangt zusätzlich ein existierendes Dashboard | PASS | `src/services/dashboard-return-target.js`; `src/server.js` | Unbekannte IDs werden nicht als Rückziel ausgegeben. |
| 21.5-RET4 | Externe, protocol-relative, javascript:, data: und malformed encoded Ziele werden abgewiesen | PASS | `safeQueryValue()`; Return-Securitytests | Kein Open Redirect und kein Script-Schema. |
| 21.5-RET5 | Ungültiges Queryziel wird serverseitig auf die Systemroute ohne Query bereinigt | PASS | `src/server.js` Redirectpfad; Gatewaytest | Ziel bleibt intern; anschließend gilt sicherer Fallback. |
| 21.5-RET6 | Summary/Errors tragen das Rückziel beim Wechsel untereinander weiter | PASS | `initializeSystemPage()` setzt beide Systemlinks mit demselben Context | Reload erhält den Queryparameter. |
| 21.5-RET7 | Back priorisiert gültiges Ziel, sichere interne History, dann `/` | PASS | `safeHistoryTarget()`; `initializeSystemPage()` | Direkte System-URL fällt auf `/` zurück. |
| 21.5-RET8 | Custom Dashboard kehrt zu genau seinem Pfad zurück | PASS | Sprint-21.5-/25.2-Tests mit `/d/...` | Nicht pauschal `/`. |
| 21.5-HDR1 | Summary-/Error-Header enthalten Back, kompakten Titel/Total und Systemnavigation | PASS | `src/public/system.html`; `.system-dashboard-header` | Keine Dashboard-Write-Controls im Systemheader. |
| 21.5-HDR2 | Header wiederholt Gesamtcount nicht und bewahrt globalen qualitativen Status | PASS | Sprint-21.4-Test; `summary.js`; `errors.js` | Systemstatus ist semantisch, keine zweite Summe. |
| 21.5-HDR3 | Kein redundanter Header-/Footer-Navigationsduplikat | PASS | `index.html`; `system.html` | Pro Kontext genau eine Navigationsleiste. |
| 21.5-LEG1 | Navigation und Statuspolling sind ES5-/iOS-9-kompatibel | PASS | `system-navigation.js`; `node --check`; Forbidden-Scan | `var`, Callbacks, `Legacy.http`; kein fetch/Promise/Arrow/Module. |
| 21.5-LEG2 | Wall-CSS benötigt kein Grid, Flex-gap, ResizeObserver oder Container Query | PASS | `style.css`, `system.css`; statischer Scan | Präfixierte Flexbox und Media Queries. |
| 21.5-LEG3 | Touch-/Click-Navigation benötigt kein modernes Pointer-API | PASS | native Link-`click`-Handler mit `preventDefault()` | Physische iOS-9-Ausführung bleibt MT-40. |
| 21.5-REG1 | Sprint-21.1–21.4 Device Groups, Filter, Modes, Columns und Entity Rules bleiben erhalten | PASS | Part-09-/10-Audits; Fokuslauf 165/165 | Header-/Navigation ändert keine Businesslogik. |
| 21.5-REG2 | Default/Custom Grid, Focus, Controls und Theme bleiben erhalten | PASS | vollständige Suite 329/329; Sprint-17.7-/25.2-Tests | Kein Anwendungscode im Audit geändert. |
| 21.5-SEC1 | Status, Summary und Errors bleiben read-only | PASS | ausschließlich `router.get()` in `system-dashboards.js` | Späterer Trace-GET bleibt ebenfalls read-only, ist nicht Teil der 21.5-Funktion. |
| 21.5-SEC2 | Kein generischer HA-Service-/WebSocket-Proxy oder beliebige Domain/Service-Aktion | PASS | Route-/Public-Scan; `test/security.test.js` | Browser kommuniziert nur mit dem Gateway. |
| 21.5-SEC3 | HA_TOKEN, SUPERVISOR_TOKEN und Admin-Token bleiben getrennt/backend-only | PASS | HA-Connection/Auth-Module; Securitytests | Systemnavigation benötigt keinerlei Credential. |
| 21.5-SEC4 | Sichtbarkeit und Navigation erteilen keine Write-Autorisierung | PASS | `control-authorization.js`; Systemnavigation enthält keine POST/PUT-Aufrufe | Control Grants bleiben explizit serverseitig. |
| 21.5-DEP1 | Relative Routenkonstruktion funktioniert gemeinsam in Standalone/LXC und HA App | PASS | Pfadbasierte Express-Routen; keine Host-/Portkonstante | Reale HA-App-/LXC-Abnahme gehört zu späteren Auditparts. |
| 21.5-PERF1 | Große Zustandsmengen verwenden nur die bestehende lineare Issuepipeline und kleinen Status | PASS | Sprint-21-/22-Performancetests; Gateway-Payloadtest | Kein N+1 und kein zweiter großer Datenpfad. |
| 21.5-PERF2 | Langzeitbetrieb ohne Memory Leak | NOT TESTED | MT-42 | Unit-/Statischnachweis ersetzt keinen längeren Browserlauf. |
| 21.5-T1 | Vollständige nummerierte 73-Punkte-Testmatrix ist einzeln rückverfolgbar | PASS | Sprint-21.5-/Gateway-/System-/25.2-/Securitytests plus maschinengeprüfte Sprint-27.1-F-Traceability | Alle Nummern sind direkt, äquivalent oder für echte Touchwirkung MT-40/MT-41 zugeordnet. |
| 21.5-MAN1 | iPad mini/iOS 9 HomeScreen: Health/Navi/Return in Portrait und Landscape | NOT TESTED | MT-40 | Kein physischer Test in Part 11. |
| 21.5-MAN2 | iPad Air 2: Same-Window-Navigation und Return | NOT TESTED | MT-41 | Kein physischer Test in Part 11. |
| 21.5-MAN3 | macOS Safari: Healthzustände, API-Ausfall und Filterunabhängigkeit | NOT TESTED | MT-42 | Kein realer Safari-Lauf in Part 11. |
| 21.5-SHOT1 | Aktuelle echte Dashboard-/Summary-/Error-Screenshots | PARTIAL | D1-Audit, `RQ-08-02`, MT-29 | Vorhandene Bilder belegen Navigation/Health des heutigen Builds nicht vollständig. |
| 21.5-DOC1 | README DE/EN, Roadmap und Projektstatus dokumentieren Navigation/Health/Return | PASS | `README.de.md`; `README.en.md`; Roadmap; Projektstatus | Fachbeschreibung ist in beiden Sprachen vorhanden. |
| 21.5-CACHE1 | Navigation/Health und gemeinsame Styles besitzen routeübergreifend konsistente Cacheversion | PASS | Dashboard und Systemseite laden `system-navigation.js`/`style.css` mit v53; Admin/Manifest sind ebenfalls v53; `test/asset-version.test.js`. | RQ-04-01 code-seitig geschlossen. |

## Current Health and Navigation Flow

```text
existing dashboard refresh
  -> GET /api/system-dashboards/status
  -> shared cached normalized snapshot
  -> central global issue summary
  -> reduced counts + public freshness metadata
  -> renderHealth():
       fresh + no warning/error/critical -> hidden
       fresh + info only                -> hidden
       warning/error/critical           -> visible severity
       stale/unknown/API failure        -> visible fail-safe state

current route `/` or `/d/<id>`
  -> strict encoded returnTo
  -> Summary or Errors in same window/origin
  -> strict server + client validation
  -> exact dashboard Back target, safe history, then `/`
```

Filter und Column Controller arbeiten ausschließlich auf dem bereits geladenen
Systemseitenpayload und können die globale Statuspipeline nicht beeinflussen.

## Superseded Requirements

- Sprint 25.2 ersetzt gewöhnliche interne Linknavigation durch den aktuellen
  validierten `window.location.href`-/`target=_self`-Helper. Dies härtet den
  HomeScreen-Kontext, ohne Return-Semantik oder same-origin-Ziel zu ändern.
- Sprint 22 verändert die serverseitige Issue-Sicht durch Grace, Expected
  Offline, Flapping und Recovery. Der kleine Status verwendet weiterhin genau
  dieselbe globale zentrale Issue-Menge; Part 11 auditiert Sprint 22 nicht.
- Sprint 25.1 härtet die sichtbaren Error-Filter. Weil `/status` davon getrennt
  ist, bleibt das ursprüngliche globale Health-Verhalten erhalten.

## Automated Evidence

- Part-11-Fokuslauf: 165/165 Tests bestanden;
- vollständige Regression: 329/329 Tests bestanden;
- Statuspayload unter 5000 Bytes, geteilter Cache und eine HA-State-Abfrage im
  Gatewaytest;
- 14 relevante JavaScript-Dateien bestanden `node --check`;
- Same-window-/Open-Redirect-/malformed-Query-/Custom-Return-Tests grün;
- Legacy-/CSS-/Security-Scans grün;
- nur localhost-Mocks/Fake-Credentials, kein reales Home Assistant.

## Manual Evidence Required

- MT-40: vollständiger iPad-mini-/iOS-9-HomeScreen-Ablauf;
- MT-41: iPad-Air-2-Same-Window- und Return-Nichtregression;
- MT-42: macOS-Safari-Health-/Failure-/Filter-/Langzeitlauf;
- MT-39 deckt zugleich die Systemheader auf dem Legacy-Gerät ab;
- MT-29 bleibt für aktuelle echte Produktaufnahmen maßgeblich.

## Repair Mapping

- `RQ-04-01` – Navigation/Health-Cachepfad in Sprint 27.1-B code-seitig
  geschlossen;
- `RQ-08-02` – veraltete Produktbilder;
- `RQ-11-01` – in Sprint 27.1-F code-seitig geschlossen; reale Abnahmen
  bleiben `NOT TESTED`.

## Security and Deployment Review

PASS – Alle Systemendpunkte sind read-only; Returnziele werden beidseitig
begrenzt und können nicht als Open Redirect dienen. Relative Routen funktionieren
unabhängig vom Standalone- oder App-Transport. Kein Token, Registry-Rohdatum,
Browser-WebSocket oder HA-Write wurde hinzugefügt.

## Remaining Sprint 21.5 Gaps

Keine bestätigte fachliche Laufzeitlücke. Vor RC sind `RQ-08-02` sowie die
realen MT-40 bis MT-42 abzuschließen; `RQ-11-01` ist code-seitig geschlossen.

## Sprint-27.1-F-Re-Audit

`RQ-11-01` ist **CODE CLOSED / MANUAL PENDING**. Alle 73 Testnummern besitzen
direkte, äquivalente oder konkrete manuelle Evidenz. Healthzustände, kleiner
Statuspayload, Cache-/Recoverypfad, Default-/Custom-Return, Open-Redirect-
Abwehr und Same-Window-Navigation bleiben grün. Fokuslauf 151/151 und
Gesamtsuite 377/377 bestanden; MT-40 bis MT-42 bleiben `NOT TESTED`.
