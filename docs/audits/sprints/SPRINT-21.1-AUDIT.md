# Sprint 21.1 Audit

## Audit Metadata

- Sprint: 21.1
- Sprint title: Error Dashboard Device Aggregation & Navigation
- Audit date: 7. September 2026
- Repository commit: `bbc30fa`
- Spec file: [`docs/sprints/SPRINT-21.1.md`](../../sprints/SPRINT-21.1.md)
- Working tree at Part-09 start: kein veränderter Anwendungscode; ausschließlich
  der bereitgestellte Part-09-Prompt war unversioniert.

## Overall Result

PARTIAL

Die aktuelle Presentation-Schicht gruppiert Entity-State-Issues ausschließlich
über echte Registry-`device_id`-Werte. Entities ohne Device-ID sowie System-,
Config-Entry-, Repair- und Matter-Issues bleiben Standalone. Severity,
Security-Flag, ältester aktiver Start, Child-Counts und Sortierung werden
deterministisch abgeleitet; der Browser rendert reduzierte, standardmäßig
eingeklappte Childdetails mit ES5-`onclick` und ARIA-Zustand.

Spätere Sprints haben die einfache Kategorienavigation bewusst in getrennte
Severity-/State-Filter und das Zwei-Spalten-Ziel in persistente 1/2/3-Spalten-
Ansichten weiterentwickelt. Der ursprüngliche Endzustand bleibt erfüllt. Der
Sprint bleibt dennoch `PARTIAL`, weil reale Safari-/iPad-Abnahmen, die
vollständig explizite 77-Punkte-Testmatrix, konsistente immutable
Cacheversionen und ein aktueller Error-Screenshot fehlen. Kein fehlerhaftes
Cross-Device-Grouping und keine Write-Erweiterung wurde gefunden.

## Requirement Matrix

| ID | Requirement | Status | Evidence | Notes |
|---|---|---|---|---|
| 21.1-SEC1 | Gruppierung, Filter und Details bleiben read-only | PASS | `src/services/issues/presentation.js`; `src/routes/system-dashboards.js`; Sprint-21.1-Securitytest | Keine neue HA-Abfrage oder Write-Route. |
| 21.1-SEC2 | Device Group/Childdetail erteilen keine Schreibrechte | PASS – superseded by Sprint 26.2 | zentrale Control Grants; Gateway-/Securitytests | Presentation kennt keine Control-Autorisierung. |
| 21.1-LEG1 | ES5/Safari-iOS-9-JavaScript ohne moderne APIs | PASS | `src/public/js/system/errors.js`; Syntax-/Forbidden-Scan | Explizites `onclick`, Klassen/ARIA; kein `<details>`-Zwang. |
| 21.1-LEG2 | Kein CSS Grid/Flex-gap/ResizeObserver/Container Query | PASS | `src/public/css/system.css`; statischer Scan | Präfixiertes Flexbox und Margins. |
| 21.1-NAV1 | Alle/Critical/Error/Warning/Unknown navigieren ohne Reload | PASS – superseded by Sprint 21.2/21.3/25.1 | `errors.js:539-650,993-1038`; System-Frontendtests | Heute getrennte exakte Severity-/State-Filter mit AND auf demselben Child; Einzelfilter bleiben möglich. |
| 21.1-NAV2 | Unknown bleibt State und nicht künstlich Severity | PASS – superseded by Sprint 21.3 | getrennte `filters.severity`/`filters.state`; Sprint-21.3-/25.1-Tests | Semantisch präziser als das historische Einzelfiltermodell. |
| 21.1-NAV3 | Aktiver Filter ohne reine Farbcodierung erkennbar, Reset/Empty State vorhanden | PASS | Filterbuttons mit Text/`aria-pressed`; `errors.js`; Frontendtest | Reale Safari-Wirkung bleibt MT-31/32. |
| 21.1-DEV1 | Gleiche echte `device_id` ergibt eine Device Group | PASS | `presentation.js:376-475`; Sprint-21.1-Aggregationstest | Map `issuesByDeviceId`; Child-Issues bleiben erhalten. |
| 21.1-DEV2 | Keine Gruppierung über Name, Domain, Area, Präfix oder Integration | PASS | `presentation.js:417-444`; Test mit gleichen Namen/verschiedenen IDs | Zwei gleich benannte Geräte bleiben getrennt. |
| 21.1-DEV3 | Entities ohne `device_id` bleiben sichtbar und Standalone | PASS | `presentation.js:424-434`; Aggregationstest | Kein Friendly-Name-Fallback zur Gruppierung. |
| 21.1-DEV4 | System-, Config-Entry-, Repair- und Matter-Issues bleiben Standalone | PASS | `presentation.js:406-416`; Standalone-Test | Nur Source `entity_state` ist gruppierbar. |
| 21.1-AGG1 | Höchste Child-Severity bestimmt Group Severity | PASS | `presentation.js:addToDeviceGroup()`; Sortier-/Aggregationstest | Reihenfolge critical → error → warning → info. |
| 21.1-AGG2 | Security-Relevanz propagiert | PASS | `addToDeviceGroup()`; Aggregationstest | Mindestens ein Child genügt. |
| 21.1-AGG3 | Dauer verwendet ältesten aktiven Child-Start | PASS | minimale Startzeit/maximale Dauer in Presentation; Test erwartet 1080 s | Kein Durchschnitt. |
| 21.1-AGG4 | Counts und `issueCount` sind Child-basiert korrekt | PASS | `filterCounts()`/`incrementCounts()`; Sprint-21.1-/21.2-Tests | Spätere Filter leiten sichtbare Gruppenseverity erst nach Childfilter ab. |
| 21.1-TITLE1 | Titelpriorität und technische Fallbackbezeichnung | PASS | `presentation.js:139-152` | `name_by_user` → Device Name → Friendly Name → Registry Name → neutrale Bezeichnung. |
| 21.1-CTX1 | Area/Integration kompakt aus Registry-Kontext, ohne Heuristik | PASS | `presentation.js:154-180`; Aggregationstest | Fehlende Metadaten ergeben `null`, kein Crash. |
| 21.1-CHILD1 | Child enthält Name/ID, State, Severity und optionale Dauer | PASS | `presentation.js:75-137`; `errors.js:658-678` | Keine Rohregistry und keine Roh-HA-State-Objekte. |
| 21.1-DET1 | Device Cards starten collapsed und lassen sich öffnen/schließen | PASS | `errors.js:680-847`; System-Frontendtest | Button + Klasse + `aria-expanded`/`aria-hidden`, kein modernes HTML-Feature nötig. |
| 21.1-DET2 | Control-/Write-Ereignisse können Details nicht versehentlich auslösen | N/A | Sprint-21.1-Device Cards besitzen keine Controls | Spätere Automation-Impact-Toggles sind separate read-only Buttons. |
| 21.1-LAY1 | Schmal eine, breit mindestens zwei Spalten, kein Overflow/Overlap | PASS – superseded by Sprint 21.2 | `system.css:533-556,1384-1490`; Spaltentest | Heute wählbare 1/2/3 Spalten; unter 700 px erzwungen 100 %. Reales iPad bleibt NOT TESTED. |
| 21.1-LAY2 | Expanded Card wächst in ihrer Spalte ohne Masonry | PASS | Flex-wrap-Cards; Details werden innerhalb der Card eingefügt | Keine Masonry-/Grid-Abhängigkeit. |
| 21.1-HDR1 | Status und Filtercounts verständlich im Header | PASS – superseded by Sprint 21.4 | `system.html`; `errors.js`; Header-/Frontendtests | Sprint 21.4 zeigt die Gesamtzahl prominent nur einmal. |
| 21.1-SORT1 | Severity, Security, Dauer und Name deterministisch sortiert | PASS | `presentation.js`; direkter Sortiertest | Wiederholter Lauf liefert identische Reihenfolge. |
| 21.1-VM1 | Serverseitiges Presentation View Model trennt Fachlogik vom Browser | PASS | `presentation.js:482-503`; `/errors`-Route | Browser filtert nur das bereits normalisierte Gruppenmodell. |
| 21.1-PAY1 | Browserpayload enthält keine Raw Registries/HA States | PASS | Presentation-/Gatewaytests | Identifier, Connections und Manufacturer fehlen ausdrücklich. |
| 21.1-ADM1 | Keine neue Admin-Konfiguration | N/A | keine Sprint-21.1-Configfelder/-Routen | Spätere Spaltenwahl ist lokaler View-Zustand, kein HA-Write. |
| 21.1-SUM1 | Summary bleibt unverändert funktionsfähig | PASS | getrennte `/summary`-Route/Engine; Fokus-/Gesamtsuite | Keine zusätzliche HA-Abfrage nur für Gruppen. |
| 21.1-ERR1 | Sprint-20/21-Erkennung und Severity bleiben vor Presentation erhalten | PASS | Data Flow `Issues.buildIssues()` → `Presentation.build()` | Spätere Risk-Regeln ändern zentral die Children, nicht die Gruppierungsregel. |
| 21.1-PERF1 | 3000 Entities/500 Devices/200 Issues effizient per Map | PASS | Sprint-21.1-Performance-Test | 50 Device Groups, 200 Issues, Lauf unter gesetzter Grenze. |
| 21.1-CACHE1 | Gruppierung erzeugt keine neue HA-Abfrage | PASS | `system/index.js`; Route nutzt vorhandenen Error-Snapshot | Presentation arbeitet synchron auf Snapshot/Issues. |
| 21.1-T1 | Vollständige 77-Punkte-Testanforderung nachvollziehbar abgesichert | PASS | Sprint-21.1-/System-Frontendtests plus maschinengeprüfte Traceability | Alle Nummern sind direkt, äquivalent oder für reale Layoutwirkung explizit MT-31/MT-32 zugeordnet. |
| 21.1-MAN1 | Moderne Safari-Abnahme von Gruppen, Filtern, Details und Layout | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-31 | Kein realer Safari-Lauf in Part 09. |
| 21.1-MAN2 | iPad mini/iOS 9 Portrait/Landscape/HomeScreen | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-32 | Kein physischer Zielgerätetest. |
| 21.1-CACHE2 | Systemassets besitzen konsistente Cacheversion | PASS | Systemseite, Dashboard, Admin und Manifest verwenden v53; `test/asset-version.test.js`. | RQ-04-01 code-seitig geschlossen. |
| 21.1-SHOT1 | Stark geändertes Error Dashboard besitzt aktuellen echten Screenshot | PARTIAL | D1-Audit; `RQ-08-02`; MT-29 | Vorhandene Error-Aufnahme ist formatseitig falsch benannt und nach späteren Änderungen nicht belastbar. |
| 21.1-DOC1 | Device Groups, Filter, Spalten, Standalone und Details dokumentiert | PASS | README DE/EN, Projektstatus, Roadmap | Spätere Filter-/Spaltensemantik ist als aktuelle Wahrheit dokumentiert. |

## Grouping and Missing-Metadata Audit

Die Zuordnung verwendet ausschließlich `context.deviceId` oder die stabile
Registry-`deviceId` derselben Entity. Existiert die Device-Registry-Zeile
nicht mehr, bleibt die echte ID Gruppierungsquelle; Titel und Kontext fallen
auf reduzierte Entity-/Registrywerte oder eine neutrale Bezeichnung zurück.
Ohne Entity-Registry-Zuordnung bleibt das Issue Standalone. Gleichnamige
Geräte oder Entities werden niemals zusammengeführt.

Stale Registrydaten werden vom gemeinsamen Source Cache als letzter gültiger
normalisierter Snapshot gehalten. Die Presentation berechnet keine Severity
neu und kann daher bei fehlendem Namen/Area/Integration die bereits von der
Issue-/Risk-Engine festgelegte Child-Severity nicht still herabsetzen.

## Explicit Test-Coverage Audit

Direkt belegt sind echte Device-ID-Gruppierung, Nichtgruppierung gleicher
Namen, Standalone-Quellen, Severity/Security/Dauer/Counts, deterministische
Sortierung, 3000/500/200-Performance sowie ES5/read-only/CSS-Grenzen. Die
System-Frontendtests ergänzen Filter, Details ohne Reload, exakte spätere
AND-Filter, Empty State und Spaltenfallback.

Sprint 27.1-E verknüpft alle 77 Anforderungen lückenlos mit direkter,
dokumentiert äquivalenter oder manueller Evidenz. Long-Name-Schutz sowie
fehlender Device-/Area-/Config-Kontext besitzen automatisierte Regressionen;
Filter, Details und Standalone-Gruppen verweisen auf konkrete aktuelle Tests.
Reale iOS-9-Touch-, Scroll-, Portrait-/Landscape-, variable-Höhen- und
Theme-Wirkung bleibt korrekt MT-31/MT-32 zugeordnet und `NOT TESTED`.
`RQ-09-02` ist code-seitig geschlossen.

## Current Error Presentation Data Flow

```text
shared normalized state + cached registry metadata
  -> central issue/risk/rule engine
  -> immutable normalized child issues
  -> issues/presentation.js
       real device_id -> Device Group
       no device_id/system/config/repair/matter -> Standalone
  -> reduced GET /api/system-dashboards/errors
  -> Legacy.http/XHR
  -> client-only Severity/State filters + collapsed ES5 details
```

Filter und Details lösen keine HA-Abfrage aus und ändern weder Child-Issues
noch den globalen Health-Status oder Write Grants.

## Superseded Requirements

- Sprint 21.2 ergänzt persistente 1/2/3-Spaltenansichten und fail-safe
  Risk-Severity; das ursprüngliche responsive Ein-/Zweispaltenziel bleibt
  enthalten.
- Sprint 21.3 ersetzt den einfachen Kategorieumschalter durch getrennte
  Severity-/State-Dimensionen und read-only Label-/Device-Class-Modi.
- Sprint 21.4 vereinfacht den Header und ersetzt Konfigurationslisten durch den
  Entity Rule Manager.
- Sprint 22 ergänzt Device Failure Hints erst nach zentraler Regelauswertung;
  die Gruppierung über echte `device_id` bleibt unverändert.
- Sprint 23 ergänzt Automation Impact read-only; Config-/Repair-/Matter- und
  Automation-Issues ohne echtes Entity-Device bleiben Standalone.
- Sprint 25.1 filtert Device Children zuerst und leitet die sichtbare
  Gruppenseverity exakt aus denselben gematchten Children ab.

## Automated Evidence

- Part-09-Fokuslauf: 153/153 Tests bestanden;
- vollständige Regression: 329/329 Tests bestanden;
- relevante Backend-/Wall-Dateien bestanden `node --check`;
- Legacy- und CSS-Forbidden-Scans ohne Fund;
- nur lokale Mocks/Fake-Credentials, kein reales HA.

## Findings

- `PARTIAL`: `RQ-08-02`; `RQ-09-02` und `RQ-04-01` sind code-seitig geschlossen.
- `MISSING`: keine.
- `BROKEN`: keine fachliche Gruppierungs-/Navigationsfunktion bestätigt.
- `NOT TESTED`: MT-31 und MT-32.

## Final Assessment

Sprint 21.1 ist fachlich, architektonisch und sicherheitsseitig vorhanden.
Für `COMPLETE` fehlen aktuelle echte Screenshots sowie dokumentierte moderne
Safari- und reale iPad-mini-/iOS-9-Abnahmen.

## Sprint-27.1-E-Re-Audit

`RQ-09-02` ist code-seitig geschlossen. Alle 77 Nummern sind lückenlos
zugeordnet. Der statische Legacy-Test prüft Long-Name-Schutz; reine physische
Overflow-, variable-Höhen- und Expanded-Details-Wirkung bleibt ehrlich auf
MT-31/MT-32 abgebildet und `NOT TESTED`.
