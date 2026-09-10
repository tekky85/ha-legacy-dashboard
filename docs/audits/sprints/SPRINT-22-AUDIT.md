# Sprint 22 Audit

## Audit Metadata

- Sprint: 22
- Sprint title: Rules, Grace Periods & Device Aggregation
- Audit date: 8. September 2026
- Repository commit: `593ba5a`
- Spec file: [`docs/sprints/SPRINT-22.md`](../../sprints/SPRINT-22.md)
- Working tree at Part-12 start: Anwendungscode unverändert; ausschließlich
  der vom Benutzer bereitgestellte Part-12-Prompt war untracked und wurde
  bewahrt.

## Overall Result

PARTIAL

Die zentrale serverseitige Rule Engine ist vorhanden und in die bestehende
Issue-, Device-Group-, Presentation- und Health-Pipeline integriert. Getrennte
Grace Periods, Risk-Class-Defaults, Expected Offline, ein begrenzter
In-Memory-Ringbuffer, Flapping, Stable Recovery, echte `device_id`-Gruppierung,
Admin-Draft/Persistenz und vollständige serverseitige Validierung sind im
aktuellen Code belegt. Es gibt keine History-Abfrage, keinen zusätzlichen HA-
Poll und keine neue Write-Fähigkeit.

Sprint 27.1-C schließt den zuvor reproduzierten Erklärbarkeitsdefekt
`RQ-12-01`: Die Auflösung führt nun Herkunft pro wirksamem Regelfeld und wählt
für Expected Offline, Grace, Flapping und Recovery die tatsächlich verwendete
Quelle. Die fachliche Wertpriorität blieb unverändert. `PARTIAL` bleiben die
nicht vollständig einzeln rückverfolgbare 80-Punkte-Testmatrix, veraltete
Screenshots und ausstehende reale HA-/LXC-/iPad-Abnahmen.

## Requirement Matrix

| ID | Requirement | Status | Evidence | Notes |
|---|---|---|---|---|
| 22-ARCH1 | Zentrale serverseitige Rule Engine zwischen normalisiertem Snapshot und Presentation | PASS | `src/services/issues/rule-engine.js`; `engine.js:buildIssues()`; `presentation.js:build()` | Keine Business-Regel im Browser. |
| 22-ARCH2 | Pipeline Risk → Rule → Grace → Expected Offline → Flapping → Severity → Aggregation | PASS | `RuleEngine.evaluate()`; `createIssue()`; `Presentation.aggregate()` | Automation Impact aus Sprint 23 wird erst nach dieser Pipeline ergänzt. |
| 22-ARCH3 | Einheitliches Evaluation-Modell mit Eligibility, Severity, Risk, Grace, Expected Offline, Flapping und Recovery | PASS | Rückgaben von `RuleEngine.evaluate()`; Sprint-22-Tests | Felder werden bis Child/Group-Presentation reduziert weitergereicht. |
| 22-GRACE1 | `unknown` und `unavailable` haben getrennte Karenzzeiten | PASS | `DEFAULT_RULES`; `evaluate()` | Normal: 15.000/30.000 ms. |
| 22-GRACE2 | Risk Classes Safety, Security, Normal und Diagnostic besitzen getrennte Defaults | PASS | `DEFAULT_RULES.riskClasses`; README DE/EN | Safety 0/0, Security 0/5.000, Normal 15.000/30.000, Diagnostic 30.000/60.000 ms. |
| 22-GRACE3 | Safety-Klassen smoke/co/gas/moisture/safety erhalten keine lange Grace | PASS | `risk.js:SAFETY_DEVICE_CLASSES`; Grace-Test | Zusätzlich wird `carbon_monoxide`/`water` konservativ erkannt. |
| 22-GRACE4 | Security-Klassen door/window/opening/garage_door/lock erhalten höchstens kurze Grace | PASS | `risk.js`; Security-Grenztest | Security `unknown=0`, `unavailable=5.000`. |
| 22-GRACE5 | Grace verwendet HA-`last_changed` mit Gateway-Beobachtungszeit als sicheren Fallback | PASS | `timestampMilliseconds()`; Restart-Test | Zukunft/ungültig fällt auf Beobachtungszeit zurück. |
| 22-GRACE6 | Gateway-Neustart versteckt lange bestehendes unavailable nicht erneut | PASS | Test „Gateway-Neustart respektiert zuverlässiges last_changed“ | Prozesshistorie ist hierfür nicht erforderlich. |
| 22-GRACE7 | Browserzeit ist keine Rule-Engine-Zeitbasis | PASS | ausschließlich Snapshotzeit in `buildIssues()` | Client sendet keine Zeit-/Regelparameter. |
| 22-EXP1 | Entity-Level Expected Offline unterdrückt nur `unavailable` | PASS | `expectedOfflineAllowed()`; Expected-Offline-Test | `unknown` bleibt nach normaler Regel sichtbar. |
| 22-EXP2 | Device-Level Expected Offline gilt für echte Device-Children | PASS | `resolveRule()` über `context.deviceId`; Test | Keine Namensheuristik. |
| 22-EXP3 | Expected Offline bleibt von Ignore getrennt | PASS | `ignoredEntities` wird vor Evaluation übersprungen; Expected Offline nur in `evaluate()` | Andere Issuequellen bleiben erhalten. |
| 22-EXP4 | Safety/Security wird nicht durch allgemeines Expected Offline verborgen | PASS | `expectedOfflineAllowed()` | Nur Entity-/Device-Regel mit `allowCriticalExpectedOffline=true` darf unterdrücken. |
| 22-EXP5 | Admin warnt vor Critical-Offline-Ausnahme | PASS | `src/admin/js/app.js:createAdvancedRules()` | Zusätzliche Checkbox ist ohne Expected Offline deaktiviert. |
| 22-FLAP1 | Flapping-Schwelle und -Fenster sind konfigurierbar | PASS | `flapThreshold`, `flapWindowMs`; Configvalidator | Default vier Transitionen/600.000 ms. |
| 22-FLAP2 | Unter Threshold kein, ab Threshold verständliches Flapping-Issue | PASS | `recordTransition()`/`evaluate()`; Flapping-Test | Titel „Verbindung instabil“. |
| 22-FLAP3 | Alte Transitionen fallen aus dem Zeitfenster | PASS | `pruneTransitions()`; Quiet-/Window-Test | Nur relevante aktuelle Historie. |
| 22-FLAP4 | Ringbuffer ist pro Entity begrenzt | PASS | `MAX_TRANSITIONS=16`; `slice(-this.maxTransitions)` | Konfiguration begrenzt Threshold ebenfalls auf 16. |
| 22-FLAP5 | Gesamte Runtime-Historie ist begrenzt und veraltet | PASS | `MAX_TRACKED_ENTITIES=10000`, `TRACKING_TTL_MS`; `sweep()` | Kein persistenter Verlauf; Restart darf Historie verlieren. |
| 22-FLAP6 | Flapping-Severity folgt Risk Policy | PASS | Normal → warning; Critical Risk → critical in `evaluate()` | Nicht jedes Flapping wird pauschal critical. |
| 22-FLAP7 | Keine Home-Assistant-History-Abfrage | PASS | Rule-/Route-Scan; Sprint-22-Securitytest | Kein `history/period`, Recorder oder zusätzlicher Request. |
| 22-REC1 | Aktives Issue bleibt während Healthy-Kurzphase als `recoveryPending` sichtbar | PASS | `runtime.visible`, `healthySince`; Recovery-Test | Global Health bleibt dadurch stabil. |
| 22-REC2 | Stabile Recovery entfernt Issue erst nach `recoveryGraceMs` | PASS | `evaluate()`; 10-s-Grenztest | Default 10.000 ms. |
| 22-REC3 | Erneuter Fehler während Recovery hält Issue aktiv | PASS | Recovery-Test | Timer wird zurückgesetzt. |
| 22-HEALTH1 | Pending Grace und Expected Offline erzeugen keinen Alarmindikator | PASS | `SystemStatus.build()` nutzt nur aktive Issues; Health-Test | Info-only bleibt durch Sprint 21.5 ebenfalls neutral. |
| 22-HEALTH2 | Warning/Error/Critical und Recovery Pending bleiben sichtbar | PASS | `system/status.js`; Sprint-22-/21.5-Tests | UI-Filter verändern den globalen Status nicht. |
| 22-HEALTH3 | Stale/Offline bleibt höher priorisiert | PASS | Snapshot-/System-Navigation-Pipeline; vollständige Regression | Kein falsches Healthy bei veralteten Daten. |
| 22-DEV1 | Gruppierung bleibt ausschließlich an realer `device_id` | PASS | `presentation.js:aggregate()` | Entity-Issues ohne echte ID bleiben standalone. |
| 22-DEV2 | Device Group zählt Issue, unavailable, unknown, flapping und recoveryPending | PASS | `emptyCounts()`/`incrementCounts()` | Werte werden auf der Gruppe veröffentlicht. |
| 22-DEV3 | Höchste Child-Severity bleibt Group-Severity | PASS | `addToDeviceGroup()`; spätere exakte Filtertests | Child-first Filter aus Sprint 25.1 bleibt erhalten. |
| 22-DEV4 | Failure Hint nutzt mindestens zwei unavailable und mindestens 70 Prozent | PASS | `group.unavailableCount >= 2 && unavailableRatio >= 0.7` | Denominator sind alle aktivierten Entity-Snapshot-Einträge des Devices. |
| 22-DEV5 | Hinweis behauptet keinen sicheren physischen Geräteausfall | PASS | `deviceFailureHint`-Text | Formuliert konservativ „Mehrere Entitäten … nicht erreichbar“. |
| 22-DEV6 | Grace-/Expected-Offline-Children zählen nicht als aktive Device-Issues | PASS | Aggregation erhält nur `detected.issues` | Evaluationszähler bleiben getrennte Diagnosemetadaten. |
| 22-DEV7 | Fehlende Registry-/Device-Metadaten degradieren sicher | PASS | `aggregate()` erstellt ohne stabile ID ein Standalone-Issue | Keine Gruppierung nach Anzeigename und kein Crash. |
| 22-PRIO1 | Entity Override vor Device Override | PASS | `resolveRule()` Apply-Reihenfolge; Prioritätstest | Entity wird zuletzt angewandt. |
| 22-PRIO2 | Device Override vor Security/Critical/Risk/Domain/Default | PASS | `classifyRisk()` plus `resolveRule()` | Effektive Werte folgen der Spezifikation. |
| 22-PRIO3 | `securityEntities` vor Critical Detection und Risk | PASS | `classifyRisk()` | Explizite Security bleibt autoritativ. |
| 22-PRIO4 | Critical Detection Mode vor automatisch klassifizierter Risk Class | PASS | `modeCriticalEligible`; Label-/Device-Class-Regressionen | Kein Browserentscheid. |
| 22-PRIO5 | Risk Class vor Domain vor Default | PASS | Apply-Reihenfolge defaults → domain → risk | Effektive Feldwerte sind korrekt. |
| 22-PRIO6 | `ruleSource` bezeichnet die tatsächlich wirksame Regelquelle | PASS | `rule-engine.js:applyRule()`, `ruleSources`, `sourceForField()`; gemischter Domain/Risk/Device/Entity-Test in `test/sprint-22.test.js` | Expected Offline, Unknown/Unavailable Grace, Flapping und Recovery verwenden die Quelle des tatsächlich wirksamen Felds; Wertpriorität unverändert. `RQ-12-01` code-seitig geschlossen. |
| 22-PRIO7 | Error Ignore bleibt höchste Ausblendgrenze | PASS | `buildIssues()` überspringt Ignore vor `evaluate()` | Ignore erteilt keine Capability. |
| 22-ADM1 | Entity Rule Manager bietet Summary Ignore, Security, Error Ignore und Expected Offline | PASS | `createEntityRuleCard()` | Gemeinsamer Batch-Draft. |
| 22-ADM2 | Erweiterte Entity-/Device-Regeln sind standardmäßig eingeklappt | PASS | `<details class="entity-rule-advanced">` im modernen Admin | Admin darf moderne Browser voraussetzen. |
| 22-ADM3 | Unknown/Unavailable Grace, Recovery, Threshold und Window sind editierbar | PASS | `createAdvancedRules()` | Ganzzahlige HTML-Grenzen spiegeln Backendgrenzen. |
| 22-ADM4 | Device-Level Expected Offline und Advanced Rules sind editierbar | PASS | `.entity-device-rule`; `setScopedRule()` | Eine Device-Regel erscheint bei vorhandener sanitierter `device_id`. |
| 22-ADM5 | Save/Discard und Persistenz verwenden bestehende Konfiguration | PASS | `SystemDashboards`-Draft; Admin-/Persistenztests | Kein paralleles Regeldateiformat. |
| 22-VAL1 | Grace/Recovery >=0, Threshold >=2, Window >0 und Extremwerte begrenzt | PASS | `validateRule()`; `RULE_NUMBER_LIMITS` | Ganzzahlig, max. 24 h; Window min. 1.000 ms. |
| 22-VAL2 | Unbekannte Felder/IDs/Risk Classes werden abgewiesen | PASS | `validateRuleMap()`/`validateErrorRules()` | Vollständige Config wird vor atomarem Write validiert. |
| 22-VAL3 | Critical Offline ohne Expected Offline wird abgewiesen | PASS | `validateRule()`; Validationtest | Backend bleibt Sicherheitsgrenze. |
| 22-SUM1 | Sprint 22 verschiebt keine neue Rule Engine in die Summary-UI | PASS | Summary-Engine unverändert serverseitig; Public-Scan | Keine Browserregel oder zusätzlicher Poll. |
| 22-PERF1 | 3000 Entities, 500 Devices, 200 Issues, 100 Flaps, 500 Overrides performant | PASS | Sprint-22-Lasttest, aktueller Gesamtlauf grün | Lineare Maps und begrenzte History. |
| 22-PERF2 | Kein zusätzlicher HA-Poll | PASS | Snapshot-/Statuspfade und Request-Scan | Bestehender Snapshotcache wird geteilt. |
| 22-LEG1 | Wall-Frontend bleibt ES5/iOS-9-kompatibel | PASS | Syntax-/Forbidden-Scan; `errors.js`/`common.js` | Kein fetch/Promise/Arrow/let/const/Module. |
| 22-LEG2 | Kein CSS Grid, Flex-gap, ResizeObserver oder Container Query | PASS | statischer CSS-Scan | Präfixierte Flexbox/Margins. |
| 22-SEC1 | Keine neue Write-API, Registry-/Label-Write oder generischer Service | PASS | Route-/Command-/Securityscan | Rule Config schreibt ausschließlich Dashboardkonfiguration. |
| 22-SEC2 | HA-/Supervisor-/Admin-Token bleiben getrennt und backend-only | PASS | Public-Scan; Securitytests | Rule-Payload enthält keine Credentials. |
| 22-SEC3 | Expected Offline und Sichtbarkeit erteilen keine HA-Capability | PASS | getrennte `control-authorization.js`; Securityregression | Keine Verbindung zu Control Grants. |
| 22-DEP1 | Rule Engine ist in Standalone und HA App transportneutral | PASS | `runtime.js` löst HA-REST/Supervisor-Verbindung backendseitig; Rule Engine erhält in beiden Modi denselben Snapshot | Vollständiges Sprint-24-Packaging wird erst in Part 13 auditiert. |
| 22-REG1 | Sprint 21.x, Grid/Focus, Light/Climate, Theme und Navigation bleiben erhalten | PASS | Part-12-Fokus 118/118; Gesamtsuite 329/329 | Keine Anwendungscodeänderung im Audit. |
| 22-T1 | Alle 80 nummerierten Testanforderungen sind einzeln rückverfolgbar | PARTIAL | 11 breite direkte Sprint-22-Tests plus Issue/Admin/Gateway/21.x-Regressions | Mehrere Grenz-, UI-, Restart-, Failure- und Einzelfälle sind nur gruppiert/indirekt belegt; `RQ-12-04`. |
| 22-MAN1 | Timing-, Rule-, Expected-Offline- und Health-Abnahme gegen kontrolliertes reales HA | NOT TESTED | MT-43 | Kein reales HA in Part 12 kontaktiert. |
| 22-MAN2 | Prozessneustart, Historyverlust und Persistenz auf Standalone-LXC | NOT TESTED | MT-44 | Kein produktiver Runtime-Test in diesem Audit. |
| 22-MAN3 | Error-/Health-/Device-Group-Darstellung auf iPad mini/iOS 9 | NOT TESTED | MT-45 | Keine physische Geräteprüfung. |
| 22-SHOT1 | Aktuelle echte Errors-/Entity-Rules-Screenshots | PARTIAL | D1-Audit, `RQ-08-02`, MT-29 | Vorhandene Bilder belegen den heutigen Stand nicht vollständig. |
| 22-DOC1 | README DE/EN, Projektstatus und Roadmap dokumentieren Regeln | PASS | README DE/EN; `PROJECT_STATUS.md`; Roadmap | Semantik ist dokumentiert; allgemeine Statusdatei bleibt separat `RQ-08-03`. |
| 22-CACHE1 | Geänderte gemeinsame Assets besitzen routeübergreifend gleiche Cacheversion | PASS | Dashboard, System, Admin und Manifest verwenden v53; `test/asset-version.test.js`; immutable Header bleiben erhalten. | RQ-04-01 bleibt code-seitig geschlossen. |

## Current Rule Pipeline

```text
cached normalized HA state snapshot
  -> central risk classification
  -> defaults/domain/risk/security/device/entity resolution
  -> unknown/unavailable grace from HA last_changed
  -> expected-offline guard
  -> bounded transition/flapping evaluation
  -> stable-recovery retention
  -> issue severity
  -> real-device aggregation and conservative hint
  -> reduced Error presentation + global Health summary
```

Die Engine verwaltet maximal 16 Transitionen je Entity, höchstens 10.000
Entities und entfernt länger als 24 Stunden unbeobachtete Einträge. Ein
Prozessneustart darf diese Historie verlieren; die laufende Zustandsdauer wird
weiterhin aus zuverlässigem `last_changed` rekonstruiert.

## Superseded Requirements

- Sprint 25.1 ist die aktuelle Implementierung für exakte Severity-/State-AND-
  Filter und child-first Device Groups. Die Sprint-22-Aggregate bleiben deren
  serverseitige Quelle.
- Sprint 21.5 liefert weiterhin den kleinen globalen Health-Pfad; Sprint 22
  ersetzt nur dessen zugrunde liegende Issuebewertung durch Grace, Expected
  Offline, Flapping und Recovery.
- Sprint 26.2 zentralisiert heutige Control Grants. Rule-, Ignore- oder
  Expected-Offline-Konfiguration beeinflusst diese Autorisierung nicht.

## Automated Evidence

- Part-12-Fokuslauf: 118/118 Tests bestanden; erster eingeschränkter Lauf nur
  mit zwei sandboxbedingten `listen EPERM`, identischer localhost-Lauf grün;
- vollständige Regression: 329/329 Tests bestanden;
- 19 relevante JavaScript-Dateien bestanden `node --check`;
- Wall-JavaScript-/CSS-Scan ohne verbotene moderne Syntax, CSS Grid,
  Flexbox-gap, ResizeObserver oder Container Queries;
- Securityscan ohne Tokens, neue System-Write-Routen, generische
  Service-/WebSocket-Kommandos oder Automation-Writes;
- kontrollierte Direktprobe reproduziert ausschließlich die falsche
  `ruleSource`-Zuordnung;
- nur lokale Daten und Fake-Credentials; kein reales Home Assistant.

## Manual Evidence Required

- MT-43: reale Timing-/Rule-/Health-Abnahme;
- MT-44: Standalone-LXC-Neustart, Persistenz und kontrollierter Historyverlust;
- MT-45: iPad-mini-/iOS-9-Darstellung und Touch-/Overflow-Abnahme;
- MT-29 bleibt für aktuelle echte Produktaufnahmen maßgeblich.

## Repair Mapping

- `RQ-12-01` – in Sprint 27.1-C code-seitig geschlossen;
- `RQ-12-04` – nummerierte Sprint-22-/23-Testmatrizen rückverfolgbar härten;
- `RQ-04-01` – in Sprint 27.1-B code-seitig geschlossen;
- `RQ-08-02` – veraltete Produktbilder;
- `RQ-08-03` – veralteter globaler Projektstatus.

## Security and Deployment Review

PASS – Die Rule Engine arbeitet ausschließlich auf vorhandenen reduzierten
Snapshots und Dashboardkonfiguration. Sie liest keine HA-History und erzeugt
weder HA-Write noch neue Browser-Capability. Der Codepfad ist für Standalone/
LXC und HA App identisch; reale Neustart-/HAOS-Belege sind späteren manuellen
Tests bzw. Audit Part 13 vorbehalten.

## Remaining Sprint 22 Gaps

Vor `COMPLETE` sind `RQ-12-04`, `RQ-08-02` und die realen MT-43 bis MT-45 zu
schließen. Der zentrale Regel-, Grace-, Flapping-, Recovery- und
Autorisierungsendzustand ist ansonsten vorhanden.

## Sprint-27.1-C-Re-Audit

`RQ-12-01` ist **CODE CLOSED / MANUAL PENDING**. `resolveRule()` speichert die
Herkunft jedes effektiven Felds getrennt. Die Evaluation veröffentlicht für
den jeweils entscheidenden Pfad – Expected Offline, zustandsspezifische Grace,
Flapping oder Stable Recovery – die passende Quelle. Der Mischtest belegt
Domain, Risk Class, Device, Entity, Security Override und Critical Detection,
ohne die festgelegte Merge-Priorität zu verändern. MT-43 bis MT-45 sind nun
ausführbar und bleiben `NOT TESTED`.
