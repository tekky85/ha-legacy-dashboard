# Sprint 21.2 Audit

## Audit Metadata

- Sprint: 21.2
- Sprint title: System Dashboard Filters, Column Views & Risk Severity
- Audit date: 7. September 2026
- Repository commit: `bbc30fa`
- Spec file: [`docs/sprints/SPRINT-21.2.md`](../../sprints/SPRINT-21.2.md)
- Working tree at Part-10 start: Anwendungscode unverändert; nicht committete
  Auditdokumente aus Part 09 und die bereitgestellten Part-09-/10-Prompts waren
  vorhanden und wurden bewahrt.

## Overall Result

PARTIAL

Summary- und Error-Filter arbeiten auf bereits geladenen, normalisierten
Payloads und lösen weder Reloads noch zusätzliche HA-Aufrufe aus. Summary
verwendet die bestehenden Sprint-19-Kategorien; Summary und Errors besitzen
getrennt persistierte 1/2/3-Spaltenpräferenzen mit sicherem responsivem Cap.
Die zentrale Risk-Klassifikation und Severity behandeln Safety-/Security-
Entities bei `unknown` und `unavailable` fail-safe als `critical` und bewahren
normale bzw. diagnostische Entities auf milderen Stufen.

Der fachliche Endzustand ist vorhanden. Assetversion und 92-Punkte-
Traceability sind inzwischen code-seitig geschlossen (`RQ-04-01`,
`RQ-10-01`). `PARTIAL` entsteht weiterhin durch nicht aktuelle System-
Screenshots (`RQ-08-02`) und ausstehende reale Safari-/iPad-Abnahmen. Kein
neuer aktueller Laufzeitdefekt wurde gefunden.

## Requirement Matrix

| ID | Requirement | Status | Evidence | Notes |
|---|---|---|---|---|
| 21.2-SEC1 | HA-/Supervisor-Token bleiben backend-only | PASS | `src/services/homeassistant.js`; `src/services/ha-connection.js`; Securitytests | Kein Token im Systempayload oder Wall-Code. |
| 21.2-SEC2 | Filter/Spalten ändern keine Write-Berechtigung | PASS | `src/public/js/system/{summary,errors,common}.js`; zentrale Control-Grants | Rein lokaler View-Zustand. |
| 21.2-SEC3 | Keine neue HA-Abfrage oder Write-Fähigkeit | PASS | GET-only `src/routes/system-dashboards.js`; Fokus-/Securitytests | Filter und Spalten arbeiten auf dem geladenen Payload. |
| 21.2-SEC4 | Keine Browser-HA-Verbindung/generische Service-API | PASS | CSP `connect-src 'self'`; Route-/Public-Scan | Nur Gateway-XHR über `Legacy.http`. |
| 21.2-LEG1 | ES5/Safari-iOS-9-kompatibles Wall-JavaScript | PASS | `common.js`, `summary.js`, `errors.js`; `node --check`; Forbidden-Scan | Kein `fetch`, Promise, moderne Syntax oder Modulzwang. |
| 21.2-LEG2 | Kein CSS Grid/Flex-gap/ResizeObserver/Container Query | PASS | `src/public/css/system.css`; statischer Scan | Präfixiertes Flexbox, Margins und Media Queries. |
| 21.2-LEG3 | Touchziele und nicht nur farbliche Aktivmarkierung | PASS | `system.css`; Filter-/Column-Buttons mit Text und `aria-pressed` | Reale iPad-Wirkung bleibt MT-33/34. |
| 21.2-SUM1 | Summary bietet Alle, Offen, Eingeschaltet, Aktiv, Klima, Medien und Sicherheit | PASS | serverseitige `summary.filters`; `summary.js`; Sprint-21.2-Test | Kategorien stammen aus Sprint-19-Auswertung. |
| 21.2-SUM2 | Summary klassifiziert Zustände nicht erneut im Browser | PASS | `summary.js:matchesFilter()` nutzt nur Payload-Kategorie | Keine zweite Businesslogik. |
| 21.2-SUM3 | Summary-Filter funktionieren ohne Reload/HA-Request | PASS | gemeinsamer Filtercontroller; System-Frontendtest | Requestzahl bleibt unverändert. |
| 21.2-SUM4 | Aktiver Filter und Counts sind sichtbar | PASS | `common.js:createFilterController()`; `system.html` | Text, Count und ARIA-Zustand. |
| 21.2-SUM5 | Eigener Filter-Empty-State | PASS | `summaryFilterEmpty`; System-Frontendtest | Nicht mit globalem No-Activity-State verwechselt. |
| 21.2-SUM6 | Stale/Offline bleibt trotz Filter sichtbar | PASS | `common.js` Network Banner; Summary-Stale-Test | Filter leert weder Banner noch Statusmeldung. |
| 21.2-SUM7 | Defaultfilter ist Alle und nicht zwingend persistent | PASS | `summary.js` initialisiert `all` | Keine fachliche Persistenz nötig. |
| 21.2-SHARE1 | Summary/Errors nutzen gemeinsame Filterkomponente | PASS | `common.js:createFilterController()` | Seiten liefern nur Definitionen und Matchfunktion. |
| 21.2-SHARE2 | Gemeinsame Komponente verarbeitet Active State, Count, Reset und Empty State | PASS | `common.js`; Frontendtests | Reset entspricht Auswahl `all`. |
| 21.2-ERR1 | Bestehende Error-Filter bleiben erhalten | PASS – superseded by Sprint 21.3/25.1 | `errors.js:issueMatches()`/`visibleGroup()` | Heute präziser als getrennte exakte Severity-/State-Dimensionen. |
| 21.2-ERR2 | Error-Filter lösen keinen Reload/neue HA-Abfrage aus | PASS | System-Frontendtests prüfen konstante Requestzahl | Client-only. |
| 21.2-COL1 | Summary und Errors bieten 1/2/3 Spalten | PASS | `system.html`; `common.js:createColumnController()`; CSS-Klassen | Buttons mit Text/ARIA. |
| 21.2-COL2 | Getrennte Präferenzen je Systemseite | PASS | `systemSummaryColumns`, `systemErrorsColumns` | Direkter Frontendtest. |
| 21.2-COL3 | Speicherung in sicher behandeltem localStorage | PASS | `Legacy.theme.getStoredValue/setStoredValue`; Storage-Fehlertest | Fehler blockiert Seite nicht. |
| 21.2-COL4 | Nur Werte 1/2/3 werden akzeptiert | PASS | `common.js:normalizeColumnCount()` | Ungültige Werte fallen sicher zurück. |
| 21.2-COL5 | Kleine Viewports erzwingen maximal eine Spalte | PASS | `effectiveColumns()`; CSS `max-width:700px` | Präferenz wird nicht zerstört. |
| 21.2-COL6 | Mittlere Viewports begrenzen auf zwei Spalten | PASS | `effectiveColumns()` | Bei Verbreiterung kehrt die Präferenz zurück. |
| 21.2-COL7 | Breite Viewports erlauben drei echte Spalten | PASS | `system-columns-3` mit 31,333 % | Kein einspaltiges Containerlimit. |
| 21.2-COL8 | Flexbox mit kompatiblen Fallbacks statt CSS Grid | PASS | `system.css` | `display:-webkit-flex`, Wrap und Margins. |
| 21.2-COL9 | Column-Wechsel ohne Reload/HA-Request | PASS | System-Frontendtest | Nur Klassen-/Storageänderung. |
| 21.2-RISK1 | Zentrale Klassen safety/security/normal/diagnostic | PASS | `src/services/issues/risk.js`; spätere Rule Engine | Risk liegt im normalisierten Issue. |
| 21.2-RISK2 | Safety: smoke, carbon_monoxide/CO, gas, moisture und äquivalentes water | PASS | `risk.js:SAFETY_DEVICE_CLASSES`; Sprint-21.2-Test | Keine Name-only-Leak-Heuristik; `water` wird unterstützt. |
| 21.2-RISK3 | Safety unknown/unavailable wird critical | PASS | `severity.js`; Sprint-21.2-Test | Spätere Sprint-22-Grace bleibt für Safety 0. |
| 21.2-RISK4 | Security: door/window/opening/garage_door/lock | PASS | `risk.js`; direkter Test | Verlässliche Device-Class-/Domainmetadaten. |
| 21.2-RISK5 | Security unknown/unavailable wird critical | PASS | `severity.js`; Sprint-21.2-Test | Keine lange Sicherheits-Grace. |
| 21.2-RISK6 | Normale Temperatur/Feuchte bleiben mild | PASS | Sprint-21.2-Test | `unknown` info, `unavailable` warning. |
| 21.2-RISK7 | Diagnostik/Batterie/Signal bleibt mild | PASS | `risk.js`; Sprint-21.2-Test | Entity Category `diagnostic` hat eigene Klasse. |
| 21.2-RISK8 | Explizite Security-Konfiguration hat Vorrang | PASS – superseded by Sprint 21.4/22 | `rule-engine.js`; `securityEntities`; Entity Rule Manager | Zentral, nicht im Renderer. |
| 21.2-RISK9 | Risk-/Domain-/Fallback-Priorität ist zentral | PASS – superseded by Sprint 22 | `rule-engine.js` Priorität entity → device → explicit security → mode/risk → domain/default | Spätere Regeln erweitern, ohne fail-safe Risiko zu verlieren. |
| 21.2-RISK10 | Keine Namensheuristik als primäre Klassifikation | PASS | `risk.js`; Test `sensor.named_leak` bleibt normal | Entity-ID/Friendly Name erzeugt kein Risiko. |
| 21.2-RISK11 | Risk Class wird im reduzierten Issue geführt | PASS | `engine.js:createIssue()`; Presentationtests | Browser muss nicht neu klassifizieren. |
| 21.2-GRP1 | Device Severity ist höchste Child-Severity | PASS | `presentation.js:addToDeviceGroup()`; direkter Test | Critical Child macht Gruppe critical. |
| 21.2-GRP2 | Counts/State bleiben Child-basiert | PASS | `presentation.js:filterCounts()`; Tests | Späterer Filter bildet sichtbare Counts erneut. |
| 21.2-GRP3 | Filterung verändert keine globale Issue-Severity | PASS – superseded by Sprint 25.1 | `errors.js` erstellt flache sichtbare Kopie; `/status` nutzt Servergesamtmenge | Kein Mutieren des Payloads. |
| 21.2-PERF1 | Filter/Spalten bleiben bei großen Listen performant | PASS | reine lineare DOM-/Arrayfilter; 3000-Entity-Test in Sprint 21.3 | Keine N+1-Aufrufe. |
| 21.2-T1 | Vollständige nummerierte 92-Punkte-Testmatrix ist rückverfolgbar | PASS | Sprint-21.2-/Systemtests plus maschinengeprüfte Traceability | Jede Nummer ist direkt, äquivalent oder für reale Viewportwirkung MT-33/MT-34 zugeordnet. |
| 21.2-MAN1 | Summary-Abnahme Portrait/Landscape auf iPad mini | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-33 | Kein physischer Test in Part 10. |
| 21.2-MAN2 | Error-/Spalten-/Risk-Abnahme auf iPad mini | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-34 | Kein physischer Test in Part 10. |
| 21.2-SHOT1 | Aktuelle echte Summary-/Error-Screenshots | PARTIAL | D1-Audit, `RQ-08-02`, MT-29 | Vorhandene Systembilder belegen den heutigen Stand nicht vollständig. |
| 21.2-DOC1 | Filter, Spalten und Risk Severity dokumentiert | PASS | README DE/EN, Roadmap, Projektstatus | Spätere Rule-/Filtersemantik als aktuelle Wahrheit dokumentiert. |
| 21.2-CACHE1 | Geänderte geteilte Assets besitzen konsistente Cacheversion | PASS | Dashboard, System, Admin und Manifest verwenden v53; `test/asset-version.test.js`; immutable Header unverändert. | RQ-04-01 code-seitig geschlossen. |

## Current Filter and Column Flow

```text
normalized Summary/Error payload
  -> one XHR through Legacy.http
  -> shared createFilterController()
  -> page-specific category or exact issue match
  -> DOM-only visible groups + own empty state

safe localStorage preference (Summary and Errors separately)
  -> requested 1/2/3 columns
  -> viewport cap 1/2/3
  -> prefixed flex class, no CSS Grid
```

Keiner dieser Schritte verändert den serverseitigen Issuebestand, den globalen
Health-Status oder Control Grants.

## Superseded Requirements

- Sprint 21.3 ersetzt den einfachen Error-Filter durch getrennte exakte
  Severity-/State-Dimensionen.
- Sprint 21.4 ersetzt große Regel-Auswahlfelder durch den Entity Rule Manager.
- Sprint 22 zentralisiert Override-, Risk-, Domain- und Default-Priorität samt
  Grace/Recovery; Safety/Security bleiben fail-safe.
- Sprint 25.1 härtet exakte Filterung, same-child-AND, child-first-Gruppen und
  die Trennung vom globalen Health-Status.

## Automated Evidence

- Part-10-Fokuslauf: 142/142 Tests bestanden;
- vollständige Regression: 329/329 Tests bestanden;
- 15 relevante JavaScript-Dateien bestanden `node --check`;
- Legacy-/CSS-/Security-Scans ohne verbotene Syntax, CSS Grid, Flex-gap,
  Browser-Token oder generische Write-Route;
- ausschließlich localhost-Mocks/Fake-Credentials, kein reales HA.

Ein erster eingeschränkter Fokuslauf hatte ausschließlich zwei
sandboxbedingte `listen EPERM`-Fehler. Der unveränderte Lauf mit erlaubtem
127.0.0.1-Bind war vollständig grün.

## Findings

- `PARTIAL`: `RQ-08-02`; `RQ-10-01` und `RQ-04-01` sind code-seitig geschlossen.
- `MISSING`: keine.
- `BROKEN`: kein aktueller fachlicher Filter-/Risk-/Spaltendefekt bestätigt.
- `NOT TESTED`: MT-33 und MT-34.

## Final Assessment

Sprint 21.2 ist fachlich, architektonisch und sicherheitsseitig implementiert.
Für `COMPLETE` fehlen aktuelle echte Screenshots und die dokumentierte reale
iPad-/Safari-Abnahme.

## Sprint-27.1-E-Re-Audit

`RQ-10-01` ist für Sprint 21.2 code-seitig geschlossen. Die 92 Nummern sind
lückenlos direkter oder äquivalenter Evidenz zugeordnet; nur die ausdrücklich
reale Portrait-/Landscape-Wirkung bleibt über MT-33/MT-34 `NOT TESTED`.
