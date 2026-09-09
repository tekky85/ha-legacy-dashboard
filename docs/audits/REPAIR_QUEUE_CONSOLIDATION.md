# Sprint 27 – Repair Queue Consolidation

## 1. Konsolidierungsrahmen

- Datum: 9. September 2026
- Branch: `main`
- geprüfter Repository-Commit:
  `593ba5a2660121f6d4af9340499c6d860e754524`
- Auditabdeckung: Parts 01 bis 19, 37 Auditdateien
- Produktcode geändert: nein
- Reparaturen oder manuelle Tests ausgeführt: nein
- Veröffentlichung, Commit, Push oder Rollout: nein

Primäre Quellen sind alle Dateien unter `docs/audits/sprints/`, danach
`REPAIR_QUEUE.md`, `MANUAL_TEST_QUEUE.md`, die Sprint-Spezifikationen und die
tatsächlichen aktuellen Dokumentations-/Quellreferenzen. Eine grüne
Gesamtsuite ersetzt keine reale iPad-/HAOS-/LXC-/Home-Assistant-Abnahme.

## 2. Vollständiges Finding-Inventar und Abdeckung

Der maschinelle und manuelle Abgleich aller Requirement-Matrizen ergab:

- 139 Zeilen mit `PARTIAL`, `MISSING` oder `BROKEN`;
- 121 umsetzbare Finding-/Symptomzeilen mit eindeutiger Repair-Zuordnung;
- 18 echte manuelle oder evidenzabhängige Punkte ohne Produktreparatur;
- 25 kanonische Repair-Root-Causes;
- keine umsetzbare Finding-Zeile ohne Repair-ID;
- keine Repair-ID ohne Auditreferenz;
- keine unbekannte, doppelte oder syntaktisch kollidierende Repair-ID.

Mehrere Zeilen beschreiben bewusst denselben Root Cause. 121 umsetzbare
Finding-Zeilen werden daher auf 25 kanonische Repairs verdichtet; 96
Symptom-/Wiederholungsreferenzen bleiben an diesen IDs erhalten. Es wurde keine
bestehende Repair-ID gelöscht oder umnummeriert.

## 3. Kanonisches Reparaturinventar

| Repair ID | Original Findings / Audits | Status | Hauptkomponenten |
|---|---|---|---|
| RQ-04-01 | Sprint 17.2/17.3, 18–26.2: alle Cache-/Shared-Asset-Findings | PARTIAL | Public HTML, Wall-CSS/JS, Static Cache, Admin Preview |
| RQ-07-01 | Sprint 19 `19-T1` | PARTIAL | Summary Engine/Testmatrix |
| RQ-08-01 | Sprint 20 `20-T3` | PARTIAL | Issue Engine, Error API/UI/Admin/Testmatrix |
| RQ-08-02 | D1-S5/S6/S8/M1/M2/M3/T1 und spätere Screenshot-Findings | BROKEN | README-Galerie, echte Screenshots, Datenschutz, Formate |
| RQ-08-03 | D1-D3, Sprint 24-DOC-03, 25-DOC-04 | BROKEN | PROJECT_STATUS, Roadmap-/Verpackungsstatus |
| RQ-09-01 | Sprint 21-WS4, 21.3-FAIL4, 23-FAIL4, 24-WS-01, 25.4-Recovery | PARTIAL | HA WebSocket Lifecycle/Reconnect |
| RQ-09-02 | Sprint 21-T1, 21.1-T1 | PARTIAL | Registry-/Device-/Area-/Repair-/Matter-Tests |
| RQ-10-01 | Sprint 21.2-T1, 21.3-T1 | PARTIAL | Filter, Spalten, Critical Modes, Tests |
| RQ-11-01 | Sprint 21.4-T1, 21.5-T1 | PARTIAL | Entity Rules, Health, Return, Tests |
| RQ-12-01 | Sprint 22-PRIO6 | BROKEN | Rule Engine `ruleSource` |
| RQ-12-02 | Sprint 23-CONF3 | MISSING | Dynamic Automation Impact/Unknown-Kontext |
| RQ-12-03 | Sprint 23-CACHE3 | BROKEN | Automation Reference Cache/Inventory-Merge |
| RQ-12-04 | Sprint 22-T1, 23-T1 | PARTIAL | Regel-/Automation-Testmatrizen |
| RQ-13-01 | Sprint 24-IMAGE/VERSION, Sprint 25-VERSION, Sprint 25.4 | BROKEN | Version/Tag/Commit/GHCR/App-Image |
| RQ-13-02 | Sprint 24-REP-04/DOC-02 | BROKEN | Supervisor-Dev-Kontext/App-Metadaten |
| RQ-14-01 | Sprint 25-BUNDLE/DOC, Sprint 25.4-RELEASE/DOC | BROKEN | Standalone-Bundle und enthaltene Anleitung |
| RQ-14-02 | Sprint 25-UPGRADE/ROLLBACK, Sprint 25.4-RELEASE-04 | PARTIAL | Cross-Version-Upgrade/Rollback/Datenintegrität |
| RQ-14-03 | Sprint 25-MATRIX-01 | PARTIAL | commitbezogene Release-Testmatrix |
| RQ-14-04 | Sprint 25-TYPE/GATE, Sprint 25.1–25.4 | PARTIAL | technisch erzwungenes Stable-Gate |
| RQ-14-05 | Sprint 25-SEC-04, Sprint 25.4-MATRIX | PARTIAL | Produktionsdependency `qs` |
| RQ-15-01 | Sprint 25.1-TEST-01, 25.2-TEST-01 | PARTIAL | Theme/Filter/HomeScreen-Testmatrix |
| RQ-16-01 | Sprint 25.3-UPLOAD/STORE, 25.4-BG, 25.5-SAFE, 26.1-D2 | BROKEN | PNG-Parser und atomarer Background-Replace |
| RQ-16-02 | Sprint 25.3-TEST-02 | PARTIAL | Background-/Upload-Testmatrix |
| RQ-17-01 | Sprint 25.4-DOCKER/MATRIX/BLOCK/RC | BROKEN | commitkohärente RC-Checkliste |
| RQ-18-01 | Sprint 25.6 Matrix/Harness, Sprint 26.1-I5, 26.2-MATRIX1 | BROKEN | aktuelle Card-/Room-/Capability-Matrix und Browsergate |

Die vollständigen historischen Findingtexte, Evidence und Required Repairs
bleiben in [`REPAIR_QUEUE.md`](REPAIR_QUEUE.md). Dessen zusätzliche kanonische
Metadatenmatrix ist für Abhängigkeiten, Manuelltests, Re-Audits und Batches
verbindlich.

## 4. Coverage-, Dubletten- und Stale-Prüfung

- Fehlende Repair-IDs: **0**.
- Neu erzeugte Repair-IDs: **0**.
- Zusammengelegte alte Repair-IDs: **0**.
- Unter bestehenden IDs konsolidierte Symptomreferenzen: **96**.
- Umnummerierte IDs: **0**.
- Stale/ungültige Einträge entfernt: **0**.
- Normalisiert: alle 25 Einträge erhielten RC-Blockerstatus, Security-Flag,
  Komponenten, Dependencies, Blocks, Manuelltests, Re-Auditziele und Batch.
- Prioritätskorrektur: `RQ-08-02` von P1 auf P2. Der Befund ist wichtig für
  öffentliche Dokumentation und Datenschutz, unterbricht aber keinen
  Kernruntimepfad.
- Bereits in Part 19 erweiterte Evidenz: RQ-04-01, RQ-16-01 und RQ-18-01.

## 5. Prioritäten

| Priorität | Anzahl | Reparaturen | Begründung |
|---|---:|---|---|
| P0 | 0 | – | Keine gebrochene Credential-/Write-Grenze, kein generischer HA-Proxy und kein nicht startfähiger Kernpfad gefunden. |
| P1 | 7 | RQ-04-01, RQ-13-01, RQ-14-01, RQ-14-02, RQ-14-04, RQ-16-01, RQ-17-01 | Legacy-Cache, falsches Image, Distributions-/Upgradefähigkeit, Stable-Gate, Uploaddatenintegrität und RC-Evidenz. |
| P2 | 18 | alle übrigen IDs | Begrenzte Funktions-/Recoverydefekte sowie Test-, Diagnose- und Dokumentationslücken. |
| P3 | 0 | – | Kein Root Cause ist ausschließlich optionale Politur. |

## 6. RC-Blocker

### RC Blocker: YES (6)

- `RQ-04-01`: Legacy Safari kann routeabhängig alten Clientcode halten.
- `RQ-13-01`: veröffentlichtes App-Image bildet den aktuellen Code nicht ab.
- `RQ-14-01`: Standalone-Bundle ist nicht selbsttragend dokumentiert.
- `RQ-14-02`: echter N→N+1-/Rollbacknachweis fehlt.
- `RQ-16-01`: ungültige PNGs können ein gültiges Background verdrängen.
- `RQ-17-01`: RC-Matrix vermischt Commits/Artefakte und falsche PASS-Aussagen.

### RC Blocker: CONDITIONAL (5)

- `RQ-08-02`: vor einer öffentlichen RC-Dokumentationsfreigabe.
- `RQ-13-02`: vor einer lokalen HAOS-Source-/Supervisor-Abnahme.
- `RQ-14-04`: zwingend vor einem Stable-Release; ein Test-RC darf vorher
  erzeugt werden.
- `RQ-14-05`: falls das Moderate-Risiko weder behoben noch ausdrücklich und
  commitbezogen akzeptiert wird.
- `RQ-18-01`: vor einer verbindlichen visuellen/iPad-Card-Matrix-Abnahme.

Ein konsolidierter Backlog ist ausdrücklich kein bestandenes RC-Gate.

## 7. Security-sensitive Repairs (11)

- `RQ-08-02`: Screenshot-/Dokumentationsdatenschutz.
- `RQ-09-01`: backend-only HA-WebSocket und feste read-only Commands.
- `RQ-12-02`, `RQ-12-03`: sanitisiertes Automation-/Trace-Metadatenmodell;
  keine Raw Config/Trace im Browser.
- `RQ-13-01`, `RQ-13-02`: App-Image, minimale Permissions und backend-only
  Supervisor-/HA-Credentials.
- `RQ-14-01`, `RQ-14-02`, `RQ-14-04`: secretfreie Artefakte, nichtdestruktive
  Datenmigration und technisch belastbares Releasegate.
- `RQ-14-05`: Produktionsdependency-/HTTP-Risikobewertung.
- `RQ-16-01`: Uploadparser, Traversal-/DATA_DIR-Schutz und Last-valid-Replace.

Für jeden dieser Repairs sind die jeweils betroffenen Securitygrenzen als
negative Regression zu prüfen. Insbesondere dürfen weder generische Service-
oder WebSocket-Proxys, automatische Write-Grants, Registry-/Area-/Label-Writes,
Tokenlogs noch eine ganze DATA_DIR-Auslieferung entstehen.

## 8. Abhängigkeitsgraph und empfohlene Reihenfolge

```text
RQ-16-01 -> RQ-16-02 -> Background-Manuelltests
RQ-04-01 -> RQ-15-01 -> Legacy-/HomeScreen-Manuelltests
RQ-09-01 -> RQ-09-02 -> Registry-/HAOS-Recoverytests
RQ-09-01 + RQ-12-01/02/03 -> RQ-12-04 -> Automation-/Regeltests
RQ-14-01 -> RQ-14-02 -> RQ-14-03
RQ-13-02 + Runtime/P1-Repairs + Releasegates -> RQ-13-01
RQ-13-01 + RQ-08-03 + RC/P1-Status -> RQ-17-01
UI-/Runtime-Endstand -> RQ-08-02
alle erforderlichen Repairs + Manuellabnahme -> finales RC-Gate
```

Empfohlene Reihenfolge:

1. Uploaddatenintegrität `RQ-16-01`.
2. Gemeinsamer Legacy-Cache `RQ-04-01`.
3. WebSocket-/Rule-/Automation-Korrektheit `RQ-09-01`, `RQ-12-01/02/03`.
4. App-/Bundle-/Upgrade-Grundlage `RQ-13-02`, `RQ-14-01/02/05`.
5. Fachliche und sicherheitsrelevante Testmatrizen.
6. Aktuelles visuelles Card-/Room-Gate `RQ-18-01`.
7. Technisches Stable-/Release-Gate.
8. Projektstatus und echte Screenshots nach stabilem UI-Endstand.
9. Neue Version/Image und danach commitkohärente RC-Matrix.
10. Entsperrte Manuelltests und finales RC-Gate.

Damit werden Screenshots, Version und RC-Dokumentation nicht vor späteren
Code-/UI-Änderungen erneut erzeugt.

## 9. Vorgeschlagene Sprint-27.1-Reparaturbatches

### 27.1-A – Upload Integrity

- Repairs: `RQ-16-01`
- Sprints: 25.3, 25.4, 25.5, 26.1
- Erwartete Komponenten: `dashboard-backgrounds.js`, Admin-Replacepfad,
  Upload-/Room-Backgroundtests
- Re-Audit: Sprint 25.3/25.4/25.5/26.1
- Entsperrt: MT-51/54/58–62/69/70 teilweise

### 27.1-B – Shared Legacy Asset Cache

- Repairs: `RQ-04-01`
- Sprints: 17.2 bis 26.2 laut kanonischer Zuordnung
- Erwartete Komponenten: Public-/System-/Admin-HTML, Cacheheader,
  Versionsgleichheitstest
- Re-Audit: alle Auditdateien mit `RQ-04-01`, kein vollständiger Neuaudit
- Entsperrt: zentrale Legacy-/HomeScreen-/Section-/Room-/Controltests

### 27.1-C – Backend Recovery and Diagnostics Correctness

- Repairs: `RQ-09-01`, `RQ-12-01`, `RQ-12-02`, `RQ-12-03`
- Sprints: 21, 21.3, 22, 23, 24
- Erwartete Komponenten: HA-WebSocket-Lifecycle, Rule Engine,
  Automation Impact/Indexes und fokussierte Tests
- Re-Audit: Sprint 21/21.3/22/23/24
- Entsperrt: MT-30/35/36/43–50

### 27.1-D – App/Standalone Distribution Foundation

- Repairs: `RQ-13-02`, `RQ-14-01`, `RQ-14-02`, `RQ-14-05`
- Sprints: 24, 25, 25.4
- Erwartete Komponenten: Supervisor-Dev-Paketierung, Bundleinclude/docs,
  Cross-Version-Fixtures, Dependencylock
- Re-Audit: Sprint 24/25/25.4
- Entsperrt: lokale HAOS-Sourceabnahme, MT-52/55/56 teilweise

### 27.1-E – System Dashboard Test Coverage

- Repairs: `RQ-07-01`, `RQ-08-01`, `RQ-09-02`, `RQ-10-01`
- Sprints: 19, 20, 21, 21.1, 21.2, 21.3
- Erwartete Komponenten: ausschließlich fokussierte Tabellen-/Gateway-/UI-
  Tests und Traceability
- Re-Audit: die sechs betroffenen Auditdateien
- Entsperrt: belastbare Summary-/Error-/Registry-Featureabnahme

### 27.1-F – Rules, Navigation and Upload Test Coverage

- Repairs: `RQ-11-01`, `RQ-12-04`, `RQ-15-01`, `RQ-16-02`
- Sprints: 21.4, 21.5, 22, 23, 25.1, 25.2, 25.3
- Erwartete Komponenten: fokussierte Testmatrizen/Traceability
- Re-Audit: nur die genannten Sprints
- Entsperrt: vollständige Entity-Rule-/Health-/HomeScreen-/Background-Gates

### 27.1-G – Current Card Matrix

- Repairs: `RQ-18-01`
- Sprints: 25.6, 26.1, 26.2
- Erwartete Komponenten: Card-Matrix-Dokument, Fixtures, echter Browser-CI-
  Lauf, Room/Tall/Capabilities
- Re-Audit: Sprint 25.6/26.1/26.2
- Entsperrt: MT-63/69/72 und aktuelle Produktscreenshots

### 27.1-H – Release Gate Traceability

- Repairs: `RQ-14-04`, `RQ-14-03`
- Sprints: 25 bis 25.4
- Erwartete Komponenten: geschütztes Stable-Approval, commitbezogene
  Resultmatrix und Releasechecks
- Re-Audit: Sprint 25/25.1–25.4
- Entsperrt: MT-55/57 nach aktuellem Kandidaten

### 27.1-I – Status and Screenshot Documentation

- Repairs: `RQ-08-02`, `RQ-08-03`
- Sprints: D1 und alle dokumentierten aktuellen UI-/Packaging-Sichten
- Erwartete Komponenten: PROJECT_STATUS/README/Roadmap und echte, anonymisierte
  Real-App-Screenshots mit korrektem Format
- Re-Audit: D1 sowie die referenzierten Screenshot-/Statuszeilen
- Entsperrt: öffentliche Dokumentationsfreigabe

### 27.1-J – Versioned Candidate and RC Evidence

- Repairs: `RQ-13-01`, `RQ-17-01`
- Sprints: 24, 25, 25.4
- Erwartete Komponenten: konsistente Version/Tag/Image/Release und neue, exakt
  commit-/artefaktbezogene RC-Matrix
- Re-Audit: Sprint 24/25/25.4
- Entsperrt: aktuelle HAOS-/Release-/Kiosk-Abnahme und finales RC-Gate

Die Batches sind Vorschläge. Kein Batch wurde in diesem Pass gestartet.

## 10. Manuelle Testabhängigkeiten

`MANUAL_TEST_QUEUE.md` enthält für MT-01 bis MT-72 nun eine eigene
Abhängigkeitsmatrix:

- `CAN RUN NOW`: 10 Tests (MT-03/04/07/08/10/17/26/31/37/38);
- `BLOCKED`: 60 Tests;
- `RUN AFTER ALL VISIBLE REPAIRS`: MT-29;
- `RUN AFTER ALL REPAIRS`: MT-57.

Vierzehn Repairs blockieren mindestens eine verbindliche Manuellabnahme:

- RQ-04-01, RQ-09-01;
- RQ-12-01, RQ-12-02, RQ-12-03;
- RQ-13-01, RQ-13-02;
- RQ-14-01, RQ-14-02, RQ-14-04, RQ-14-05;
- RQ-16-01, RQ-17-01, RQ-18-01.

Die zehn derzeit ausführbaren Tests dürfen schon explorativ laufen. Für eine
finale RC-Abnahme sollen sie jedoch mit demselben späteren Kandidaten erneut
beziehungsweise eindeutig commitbezogen protokolliert werden.

## 11. Zielgerichtete Re-Audit-Map

| Repair/Batch | Auditdateien |
|---|---|
| RQ-16-01 / 27.1-A | Sprint 25.3, 25.4, 25.5, 26.1 |
| RQ-04-01 / 27.1-B | nur Auditdateien mit Cachefinding: Sprint 17.2/17.3, 18–26.2 gemäß Queue |
| 27.1-C | Sprint 21, 21.3, 22, 23, 24 |
| 27.1-D | Sprint 24, 25, 25.4 |
| 27.1-E | Sprint 19, 20, 21, 21.1, 21.2, 21.3 |
| 27.1-F | Sprint 21.4, 21.5, 22, 23, 25.1, 25.2, 25.3 |
| RQ-18-01 / 27.1-G | Sprint 25.6, 26.1, 26.2 |
| 27.1-H | Sprint 25, 25.1, 25.2, 25.3, 25.4 |
| 27.1-I | D1; betroffene Status-/Screenshotzeilen in Sprint 21–26.1 |
| 27.1-J | Sprint 24, 25, 25.4 |

Ein vollständiger Parts-01–19-Neuaudit ist nach keinem Einzelrepair nötig.
Nach Abschluss aller Batches wird nur die globale Queue-/RC-Konsistenz erneut
geprüft.

## 12. Deferred P3

Es existiert kein kanonischer P3-Repair. P2-Testmatrix- oder Dokumentations-
Repairs dürfen nur nach ausdrücklicher Risikoentscheidung hinter einen Test-RC
verschoben werden; vor Stable gelten weiterhin RQ-14-04 und die dokumentierten
Pflichtgates.

## 13. Ungeklärte Entscheidungen

- `RQ-12-02`: Wie dynamische Automationreferenzen ohne falsche Kausalität als
  `unknown` sichtbar werden, benötigt eine kleine fachliche Designentscheidung.
- `RQ-14-05`: kompatibles Dependencyupdate versus dokumentierte zeitlich
  begrenzte Risikoakzeptanz muss im Batch entschieden werden.
- `RQ-13-01`: neue Versionsnummer und Tag dürfen erst nach festgelegtem
  Kandidatenstand gewählt werden.
- `RQ-13-02`: die lokale Supervisor-Source-Build-Variante muss anschließend auf
  einem echten Test-HAOS bestätigt werden.
- Physische iPad-/HAOS-/LXC-/Home-Assistant-Ergebnisse bleiben unbekannt, bis
  die zugeordneten Manuelltests wirklich ausgeführt wurden.

Keine dieser Ambiguitäten verhindert den Start des ersten Reparaturbatches.

## 14. Readiness-Entscheidung

**Repair Queue: READY FOR SPRINT 27.1**

Begründung:

- vollständige Baseline Parts 01–19;
- jeder umsetzbare Befund besitzt genau einen kanonischen Root Cause;
- Prioritäten, RC-Status, Securityflags, Abhängigkeiten, Batches, Manual-
  Blocker und Re-Auditziele sind festgelegt;
- Reihenfolge verhindert vorzeitige Screenshots, Versionierung und RC-
  Dokumentation;
- keine Produktreparatur wurde im Konsolidierungspass vorweggenommen.

**Projekt/Release Candidate: NOT READY.** Sieben P1-Repairs, sechs direkte
RC-Blocker, fünf bedingte Blocker und 72 noch nicht ausgeführte Manuelltests
bleiben offen. Empfohlene nächste Aktion ist Sprint 27.1-A (`RQ-16-01`), danach
27.1-B (`RQ-04-01`).
