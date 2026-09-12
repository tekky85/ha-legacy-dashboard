# Sprint 21.3 Audit

## Audit Metadata

- Sprint: 21.3
- Sprint title: Error Filtering & Critical Device Detection Modes
- Audit date: 7. September 2026
- Repository commit: `bbc30fa`
- Spec file: [`docs/sprints/SPRINT-21.3.md`](../../sprints/SPRINT-21.3.md)
- Working tree at Part-10 start: Anwendungscode unverändert; die offenen
  Auditdokumente aus Part 09 und bereitgestellten Audit-Prompts wurden bewahrt.

## Overall Result

PARTIAL

Das aktuelle Error Dashboard trennt Severity und State. Severity-Matches sind
exakt; beide Dimensionen werden mit AND auf demselben Child angewandt. Bei
Device Groups werden zuerst Children gefiltert und daraus sichtbare Severity,
Counts und State neu abgeleitet. Die unveränderte Servergesamtmenge bleibt die
Quelle für globalen Error-/Health-Status.

Die Kritikalitätsmodi `device_class` und `ha_label` sind versioniert
persistiert. Label-Zuweisungen werden read-only aus Entity und echtem Device
ausgewertet, nicht aus Areas. Last-known Labeldaten bleiben bei stale erhalten;
unverfügbare/unsupported oder gelöschte Labels erzeugen einen sichtbaren
Fehler und keinen stillen Device-Class-Fallback.

Der Sprint bleibt `PARTIAL` wegen `RQ-08-02` und
ausstehender realer Admin-/HA-/iPad-Abnahmen. Der Error-only-
WebSocket-Reconnectbefund `RQ-09-01` wurde in Sprint 27.1-C code-seitig
geschlossen; reale Label-Recovery bleibt `NOT TESTED`.

## Requirement Matrix

| ID | Requirement | Status | Evidence | Notes |
|---|---|---|---|---|
| 21.3-SEC1 | Label Registry wird ausschließlich read-only gelesen | PASS | fester Command `config/label_registry/list` in `diagnostics/index.js` | Keine Create/Update/Delete-Commands. |
| 21.3-SEC2 | Keine Area-/Registry-/Label- oder sonstige HA-Write-Fähigkeit | PASS | Route-/Command-Scan; Securitytest | Kein generischer WS-/Service-Proxy. |
| 21.3-SEC3 | Tokens bleiben backend-only | PASS | HA-/Supervisor-Transport; Admin-Auth; Public-Scan | Browser erhält weder HA-, Supervisor- noch Admin-Token. |
| 21.3-SEC4 | Kritikalität erteilt keine Control Grants | PASS | `rule-engine.js` getrennt von `control-authorization.js` | Sprint 26.2 zentralisiert Writes unabhängig. |
| 21.3-LEG1 | ES5/Safari-iOS-9-kompatible Error UI | PASS | `errors.js`; Syntax-/Forbidden-Scan | Kein fetch/Promise/let/const/arrow/modernes Modul. |
| 21.3-LEG2 | Kein CSS Grid/Flex-gap/ResizeObserver/Container Query | PASS | `system.css`; statischer Scan | Präfixierte Flexbox/Margins. |
| 21.3-FIL1 | Severityfilter Alle/Critical/Error/Warning/Info | PASS – hardened by Sprint 25.1 | `errors.js:issueMatches()`; System-Frontendtest | Strikte Gleichheit, keine kumulative Schwelle. |
| 21.3-FIL2 | Statusfilter Alle/Unavailable/Unknown | PASS | `errors.js:issueMatches()` | State bleibt eigene Dimension. |
| 21.3-FIL3 | Severity und State verwenden AND auf demselben Issue | PASS – hardened by Sprint 25.1 | `issueMatches()`; Cross-Child-Regressionstest | Kein Match über zwei verschiedene Children. |
| 21.3-FIL4 | Device Children werden vor der Group gefiltert | PASS – hardened by Sprint 25.1 | `errors.js:visibleGroup()` | Gruppe ohne Match verschwindet. |
| 21.3-FIL5 | Sichtbare Group Severity kommt nur aus gematchten Children | PASS – hardened by Sprint 25.1 | `visibleGroup()` berechnet `visibleSeverity` und Counts neu | Source-Payload bleibt unverändert. |
| 21.3-FIL6 | Standalone-Issue folgt derselben exakten Logik | PASS | Standalone trägt ein normalisiertes Child; Frontendtest | Kein Sonderfall mit kumulativer Severity. |
| 21.3-FIL7 | Filtercounts bleiben getrennt nach Severity und State | PASS | `presentation.js:filterCounts()`; Sprint-21.3-Test | Counts basieren auf Children. |
| 21.3-FIL8 | Filterung verändert globalen Error-/Health-Status nicht | PASS – hardened by Sprint 25.1/21.5 | `renderOverall(payload.overallStatus)`; `/status` baut serverseitig vollständige Summary | UI-Filter sind lokal und unveränderlich. |
| 21.3-FIL9 | Filterwechsel ohne Reload/zusätzliche HA-Abfrage | PASS | System-Frontendtests | Requestzahl bleibt konstant. |
| 21.3-MOD1 | Konfigurierbare Modi `device_class` und `ha_label` | PASS | `dashboard.js:validateSystemDashboards()` | Andere Modi werden abgewiesen. |
| 21.3-MOD2 | Modus und stabile Label-ID sind versioniert/persistiert | PASS | `criticalDetectionMode`, `criticalLabelId`; Migration-/Persistenztest | Aktuelles Gesamtschema 12; Einführungsmigration aus Schema 6. |
| 21.3-DC1 | Safety-Set CO/gas/moisture/smoke/safety | PASS | `risk.js`; Sprint-21.3-Test | Zusätzlich `carbon_monoxide` und `water`. |
| 21.3-DC2 | Security-Set door/garage_door/lock/opening/window | PASS | `risk.js`; direkter Test | Nur definierte Metadaten. |
| 21.3-DC3 | `problem`/`tamper` sind nicht pauschal critical | PASS | Risk-Test | Fallen ohne Override auf normal/diagnostic. |
| 21.3-DC4 | Cover door/garage/gate/window ist security | PASS | `COVER_SECURITY_DEVICE_CLASSES`; Test | Domain und Device Class werden gemeinsam geprüft. |
| 21.3-DC5 | Cover shade/shutter ist nicht automatisch security | PASS | Sprint-21.3-Risk-Test | Keine pauschale Cover-Domainregel. |
| 21.3-DC6 | Kein pauschales Domain-/Namensrisiko | PASS | `risk.js`; Named-Leak-Test aus 21.2 | `lock`/Alarm sind bewusst definierte sichere Domains. |
| 21.3-LBL1 | Admin kann Label-Modus auswählen | PASS – current UI from Sprint 21.4 | `src/admin/index.html`; `system-dashboards.js` | Aktueller Entity Rule Manager bleibt daneben bestehen. |
| 21.3-LBL2 | Admin lädt sanitisierte Labelauswahl | PASS | geschütztes `GET /api/admin/labels`; `System.getCriticalLabels()` | Nur ID, Name und Source-Status. |
| 21.3-LBL3 | Kein fest verdrahteter Labelname | PASS | persistierte stabile `criticalLabelId`; Registry liefert Anzeigename | Rename behält ID-Zuordnung. |
| 21.3-LBL4 | Entity-Label-Zuweisung wird berücksichtigt | PASS | `engine.js:criticalDetection()`; direkter Test | Normalisierte `entity.labelIds`. |
| 21.3-LBL5 | Device-Label gilt für seine echten Child-Entities | PASS | `criticalDetection()`; direkter Test | Verknüpfung über stabile `deviceId`. |
| 21.3-LBL6 | Area-Label wird nicht transitiv angewandt | PASS | direkter Label-Mode-Test | `area.labelIds` wird von Critical Detection nicht gelesen. |
| 21.3-LBL7 | Label-Modus nutzt keinen stillen Device-Class-Fallback | PASS | `rule-engine.js:classifyWithoutAutomaticCritical()`; Test | Ungelabeltes Window bleibt mild. |
| 21.3-LBL8 | Explizite Security-Entity hat höchste Kritikalitätspriorität | PASS – superseded by Sprint 21.4/22 | `rule-engine.js`; Test | Heute Entity-/Device-Rule vor Mode/Risk. |
| 21.3-LBL9 | Labelstatus/-name wird reduziert im View Model geführt | PASS | `detected.criticalDetection`; Error-Payloadtests | Keine Raw Registry. |
| 21.3-CACHE1 | Labelquelle besitzt TTL, Dedup und Last-known stale | PASS | `diagnostics/index.js`; Read-only-Cachetest | 60-s-TTL, letzter gültiger Snapshot bleibt. |
| 21.3-FAIL1 | Erste unavailable/unsupported Labelquelle bleibt sichtbar | PASS | `criticalDetectionIssue()`; Source-Status | Kein falsches Gesund und kein stiller Fallback. |
| 21.3-FAIL2 | Gelöschtes konfiguriertes Label erzeugt Warn-/Fehlerzustand | PASS | Status `missing`; Sprint-21.3-Test; Adminwarnung | Konfiguration wird nicht heimlich ersetzt. |
| 21.3-FAIL3 | Stale Labelquelle behält bekannte Zuweisungen | PASS | direkter Stale-Test | Detectionstatus `stale`, Child bleibt critical. |
| 21.3-FAIL4 | Labelquelle erholt sich selbständig nach Transportstörung | PASS | gemeinsamer Backend-WebSocket; Sprint-27.1-C-Tests für Error-only, Error+Close und Backoff | Der idempotente Disconnectpfad plant auch bei isoliertem `error` automatisch genau einen Reconnect. Reale Labelquelle bleibt MT-35/36. |
| 21.3-ADM1 | Label-Modus ohne gültige ID wird serverseitig abgewiesen | PASS | Configvalidator; Migration-/Validationtest | Clientprüfung ist nicht Sicherheitsgrenze. |
| 21.3-ADM2 | Unsupported/error/stale/missing werden im Admin unterscheidbar angezeigt | PASS | `src/admin/js/system-dashboards.js`; Admin-UI-Tests | Reale Safari-/HA-Wirkung bleibt MT-36. |
| 21.3-ADM3 | Save/Discard und bestehende Regeln bleiben erhalten | PASS – superseded by Sprint 21.4 | Entity Rule Manager + System-Dashboard-Draft | Mode/Label liegen im gemeinsamen persistierten Draft. |
| 21.3-PERF1 | 3000 Entities/500 Devices/100 Labels/500 Zuweisungen performant | PASS | Sprint-21.3-Performance-Test | Lineare Maps/Sets; Testgrenze <1,5 s. |
| 21.3-T1 | Vollständige nummerierte 96-Punkte-Testmatrix ist rückverfolgbar | PASS | Sprint-21.3-/System-/WebSockettests plus maschinengeprüfte Traceability | Alle Nummern sind direkt/äquivalent zugeordnet; horizontaler Realgeräte-Overflow bleibt MT-34. |
| 21.3-MAN1 | Error-Filter/Risk auf iPad mini | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-34 | Kein physischer Zielgerätetest. |
| 21.3-MAN2 | Device-Class-/Label-Modi gegen reales Test-HA | NOT TESTED | MT-35 | Keine reale HA-/Admin-Abnahme in Part 10. |
| 21.3-MAN3 | Label-Rename/Ausfall/stale/delete/recovery | NOT TESTED | MT-36 | Keine echte Labelquellenstörung durchgeführt. |
| 21.3-SHOT1 | Aktuelle echte Filter-/Label-Admin-Screenshots | PARTIAL | D1-Audit, `RQ-08-02`, MT-29 | Vorhandene Systembilder sind nach späteren UI-Änderungen veraltet. |
| 21.3-DOC1 | Modi, Policy, Filter, Fail-Safe und Grenzen dokumentiert | PASS | README DE/EN, Projektstatus, Roadmap | Keine Label-Writes versprochen. |
| 21.3-ASSET1 | Geänderte geteilte Assets besitzen konsistente Cacheversion | PASS | System, Dashboard, Admin und Manifest verwenden v53; `test/asset-version.test.js`. | RQ-04-01 bleibt code-seitig geschlossen; Realgerät bleibt manuell. |

## Exact Error Filter Semantics

```text
severity match = All OR child.severity === selectedSeverity
state match    = All OR child.state === selectedState
visible child  = severity match AND state match
visible group  = at least one visible child
group severity = highest severity among visible children only
```

`visibleGroup()` erstellt eine flache sichtbare Kopie und ersetzt deren
Children/Counts/Severity. Das originale API-Payload und `overallStatus` bleiben
unverändert. Der separate kleine `/api/system-dashboards/status`-Pfad wird aus
allen serverseitigen Issues erzeugt und kennt die UI-Filter nicht.

## Critical Detection Data Flow

```text
backend-only HA WebSocket
  -> fixed config/label_registry/list + entity/device registries
  -> sanitized labelId/name + entity/device labelIds
  -> TTL/last-known diagnostics snapshot
  -> configured device_class OR ha_label mode
  -> central Sprint-22 rule engine
  -> reduced issues/presentation payload
```

Im Labelmodus zählen nur die direkte Entity-Zuweisung und die Zuweisung des
über echte `device_id` verknüpften Devices. Area-Zuweisungen sind ausdrücklich
keine transitive Kritikalitätsquelle.

## Current Later-Sprint Interactions

- Der Sprint-21.4-Entity-Rule-Manager ist die aktuelle Adminoberfläche für
  `Ignore in Summary`, `Security Relevant` und `Ignore in Errors`; die
  Critical-Detection-Mode-/Label-Auswahl bleibt Teil desselben gemeinsamen
  Draft-/Save-/Discard-Modells.
- Sprint 21.4 zeigt die Gesamtzahl in den System-Headern nur einmal prominent.
- Sprint 21.5 ergänzt die stets sichtbare neutrale Summary-Navigation und den
  bedingten Health-Indikator auf User-Dashboards. Der kleine serverseitige
  Statusendpunkt verwendet die vollständige Issue-Menge; lokale Error-Filter
  können den globalen Health-Zustand nicht ändern.
- Sprint 25.2 hält interne Navigation same-origin/same-window und validiert das
  exakte Rückziel. Diese Navigation benötigt weder Admin-Credentials noch
  zusätzliche HA-Daten.

## Superseded Requirements

- Sprint 21.4 integriert Mode/Label in die aktuelle Systemkonfiguration und
  ersetzt die Entity-Auswahllisten durch den Entity Rule Manager.
- Sprint 22 erweitert die Prioritätsreihenfolge durch Entity-/Device-Regeln,
  Grace, Expected Offline, Flapping und Recovery, ohne Label-/Device-Class-
  Modus oder fail-safe Safety/Security zu entfernen.
- Sprint 25.1 ist die aktuelle maßgebliche Implementierung für exakte
  Severity-/State-AND-Filter und child-first Device Groups.
- Sprint 21.5 hält den globalen Health-Indikator vollständig getrennt vom
  lokalen Filterzustand.

## Automated Evidence

- Part-10-Fokuslauf: 142/142 Tests bestanden;
- vollständige Regression: 329/329 Tests bestanden;
- 15 relevante JavaScript-Dateien bestanden `node --check`;
- statische Legacy-/CSS-/Security-Scans ohne unzulässige moderne Wall-Syntax,
  CSS Grid, Flex-gap, Label-Writes, generische WS-Commands oder Browser-Token;
- ausschließlich localhost-Mocks und Fake-Credentials.

## Findings

- `PARTIAL`: `RQ-08-02`; `RQ-10-01`, `RQ-04-01` und `RQ-09-01` sind
  code-seitig geschlossen.
- `MISSING`: keine.
- `BROKEN`: kein aktueller fachlicher Filter-/Detection-Defekt bestätigt.
- `NOT TESTED`: MT-34 bis MT-36.

## Final Assessment

Sprint 21.3 ist fachlich und sicherheitsseitig vorhanden. Vor `COMPLETE` sind
Screenshots zu schließen und die reale Label-/Admin-/iPad-Abnahme zu
dokumentieren.

## Sprint-27.1-C-Re-Audit

Die gemeinsame WebSocket-Recovery ist nach `RQ-09-01` automatisiert PASS. Der
Labeladapter bleibt fest codiert, read-only und last-known/stale-fähig; der
Transportfix ergänzt weder Label-Writes noch Browser-WebSocketzugriff. MT-35
und MT-36 sind nun ausführbar, ihre Resultate bleiben `NOT TESTED`.

## Sprint-27.1-E-Re-Audit

`RQ-10-01` ist für Sprint 21.3 code-seitig geschlossen. Der neue direkte
Label-Lifecycle-Test belegt First Failure und eine Umbenennung bei stabiler
Label-ID; die vollständige 96-Punkte-Zuordnung bindet exakte Filter,
Same-Child-AND, child-first Groups sowie Sprint-27.1-C-Recovery ein. MT-34 bis
MT-36 bleiben `NOT TESTED`.
