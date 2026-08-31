# Sprint 27 – Full Sprint Audit & RC Readiness Review

## Status
Planned

## Charakter des Sprints

Sprint 27 ist **kein Feature-Sprint**.

Er ist ein vollständiger Audit aller bisher implementierten Sprints vor dem nächsten Release Candidate.

Ziel:

```text
Sprint-Spezifikationen
-> aktueller Repository-Stand
-> Requirement-by-Requirement Audit
-> automatisierte Tests
-> Security / Legacy / HAOS Regression
-> manuelle Prüfungen markieren
-> Audit-Ergebnisse im Git dokumentieren
-> RC Readiness Entscheidung
```

## Motivation

Einzelne Sprint-Läufe wurden teilweise unterbrochen und später ergänzt. Vor dem nächsten RC soll daher nicht allein auf `PROJECT_STATUS.md`, frühere Codex-Zusammenfassungen oder vorhandene Sprint-Dateien vertraut werden.

Maßgeblich sind:

```text
aktueller Code
+ aktuelle Tests
+ aktuelle Konfiguration
+ aktuelle Runtime
+ reale manuelle Tests, soweit erforderlich
```

## Statusschema Requirements

Nur:

```text
PASS
PARTIAL
MISSING
BROKEN
NOT TESTED
```

`NOT TESTED != PASS`.

## Sprint-Gesamtstatus

Nur:

```text
PASS
PARTIAL
FAIL
BLOCKED
NOT TESTED
```

## Persistente Audit-Dokumentation

Neue Struktur:

```text
docs/audits/
├── README.md
├── sprints/
│   ├── SPRINT-17.1-AUDIT.md
│   ├── ...
│   └── SPRINT-26.2-AUDIT.md
├── parts/
│   ├── AUDIT-PART-A1.md
│   ├── ...
│   └── AUDIT-PART-A7.md
└── RC-AUDIT-SUMMARY.md
```

## Sprint-Audit Template

Jede `docs/audits/sprints/SPRINT-XX-AUDIT.md` enthält mindestens:

```markdown
# Sprint XX Audit

## Audit Metadata
Audit Date:
Repository Commit:
Sprint Specification:
Auditor:

## Overall Result
PASS / PARTIAL / FAIL / BLOCKED / NOT TESTED

## Requirement Matrix
| ID | Requirement | Status | Evidence | Notes |
|---|---|---|---|---|

## Automated Tests
...

## Manual Tests
...

## Security Regression
...

## Legacy Safari / iPad Status
...

## Home Assistant App Status
...

## Standalone Status
...

## Known Issues
...

## Open Actions
...

## Final Assessment
...
```

## Evidence Pflicht

PASS möglichst mit konkretem Beleg:

```text
src/... Datei
test/... Test
npm test Ergebnis
realer iPad-Test
realer HAOS-Test
```

Nicht nur `implemented`.

## Audit Commit

Jede Audit-Datei dokumentiert den exakten Repository Commit, gegen den geprüft wurde.

## Staleness

Wenn nach einem Audit zentrale Dateien eines Sprints geändert werden, muss der Final Consolidation Pass prüfen, ob das Audit veraltet ist.

# Audit Parts

## A1 – Core Foundation

Prüft:

```text
Sprint 18
Sprint 19
Sprint 20
Sprint 21
```

## A2 – Legacy UI & Dashboard Hardening

Prüft:

```text
Sprint 17.1
Sprint 17.2
Sprint 17.3
Sprint 17.4
Sprint 17.5
Sprint 17.6
Sprint 17.7
```

## A3 – System Dashboard Evolution

Prüft:

```text
Sprint 21.1
Sprint 21.2
Sprint 21.3
Sprint 21.4
Sprint 21.5
```

## A4 – Rules & Diagnostics

Prüft:

```text
Sprint 22
Sprint 23
```

## A5 – App / Release / RC Hardening

Prüft:

```text
Sprint 24
Sprint 25
Sprint 25.1
Sprint 25.2
Sprint 25.3
Sprint 25.4
Sprint 25.5
Sprint 25.6
Sprint 25.7
```

Bei Bedarf teilen:

```text
A5.1 – App Packaging & Release
A5.2 – RC UI/Navigation/Background
A5.3 – RC Network/Card/Kiosk
```

## A6 – Sections / Room / Controls

Prüft:

```text
Sprint 26
Sprint 26.1
Sprint 26.2
```

## A7 – Final RC Consolidation

A7 liest alle Sprint-Audits und Part-Summaries und erstellt:

```text
docs/audits/RC-AUDIT-SUMMARY.md
```

# Token-/Zeitlimit-Regel

Nicht alle Sprints in einem Lauf auditieren.

Wenn ein Part zu groß wird:

```text
STOP before token/time exhaustion
```

und bereits abgeschlossene Audit-Dateien persistieren.

Nach jedem geprüften Sprint sofort dessen Audit-Datei schreiben.

# Audit Part Summary

Jeder Part erzeugt:

```text
docs/audits/parts/AUDIT-PART-AX.md
```

mit:

```text
Base Commit
Audited Sprints
PASS
PARTIAL
FAIL
BLOCKED
NOT TESTED
Open Issues
Suggested Fix Order
```

# Audit first, fix second

Bei:

```text
MISSING
BROKEN
PARTIAL
```

zunächst dokumentieren.

Danach gezielter Completion/Fix Pass.

Kleine zwingende Audit-Fixes dürfen als `FIXED DURING AUDIT` dokumentiert werden.

# Security Baseline

Jeder relevante Sprint prüft:

```text
HA token backend-only
SUPERVISOR_TOKEN backend-only
kein generic HA service proxy
kein browser-to-HA WebSocket
keine Registry Writes
keine Label Writes
keine Area Writes
keine unnötigen App Privileges
keine Secrets in Logs
```

# Standalone Baseline

Prüfen:

```text
Node.js / Express
HA REST
HA WebSocket backend
Long-Lived Token server-side
Default Dashboard
Custom Dashboard
Admin
Summary
Errors
```

# Home Assistant App Baseline

Prüfen soweit relevant:

```text
App Packaging
Supervisor Token
Core REST Proxy
Core WebSocket Proxy
/data Persistenz
Direct LAN Port
Restart
```

# Legacy Safari Baseline

Für UI-Sprints:

```text
ES5
iOS 9
kein fetch
kein Promise
kein let/const
keine arrow functions
kein CSS Grid
kein Flexbox gap
kein ResizeObserver
```

# Manual Tests

Reale iPad-/HAOS-Anforderungen bleiben `NOT TESTED`, bis echte manuelle Evidence vorhanden ist.

Code Review allein ist kein Real-Device-PASS.

# Existing RC Checklist

Falls `docs/RC_CHECKLIST.md` existiert, nicht ersetzen. Sprint 27 referenziert und konsolidiert sie.

# Priorisierung offener Findings

```text
P0 – Security / Data Loss
P1 – RC Blocker
P2 – Functional Defect
P3 – Visual / Documentation
```

# Feature Scope

Da Sprint 26/26.1/26.2 bereits im aktuellen Branch enthalten sind, muss A7 explizit entscheiden, ob diese Features Teil des nächsten RC sind.

Wenn ja, relevante P1/BROKEN Findings blockieren RC.

# Final RC Audit Summary

`docs/audits/RC-AUDIT-SUMMARY.md` enthält mindestens:

```text
Audit Base Commit
Audit Date
Target RC Version
Sprint Coverage
Overall RC Status
PASS Sprints
PARTIAL Sprints
FAIL Sprints
BLOCKED Sprints
NOT TESTED Sprints
Security Status
Standalone Status
HA App Status
iPad Status
Open P0
Open P1
Open P2
Open P3
Required Manual Tests
Known Limitations
Final Recommendation
```

Final Recommendation nur:

```text
RC READY
RC READY WITH DOCUMENTED NON-BLOCKING LIMITATIONS
NOT RC READY
```

# Keine Release-Aktion

Sprint 27 darf nicht automatisch:

```text
Git Tag erstellen
GitHub Release veröffentlichen
GHCR Image veröffentlichen
```

# Deliverables

## A1
```text
docs/audits/sprints/SPRINT-18-AUDIT.md
docs/audits/sprints/SPRINT-19-AUDIT.md
docs/audits/sprints/SPRINT-20-AUDIT.md
docs/audits/sprints/SPRINT-21-AUDIT.md
docs/audits/parts/AUDIT-PART-A1.md
```

## A2
```text
SPRINT-17.1-AUDIT.md
SPRINT-17.2-AUDIT.md
SPRINT-17.3-AUDIT.md
SPRINT-17.4-AUDIT.md
SPRINT-17.5-AUDIT.md
SPRINT-17.6-AUDIT.md
SPRINT-17.7-AUDIT.md
AUDIT-PART-A2.md
```

## A3
```text
SPRINT-21.1-AUDIT.md
SPRINT-21.2-AUDIT.md
SPRINT-21.3-AUDIT.md
SPRINT-21.4-AUDIT.md
SPRINT-21.5-AUDIT.md
AUDIT-PART-A3.md
```

## A4
```text
SPRINT-22-AUDIT.md
SPRINT-23-AUDIT.md
AUDIT-PART-A4.md
```

## A5
```text
SPRINT-24-AUDIT.md
SPRINT-25-AUDIT.md
SPRINT-25.1-AUDIT.md
SPRINT-25.2-AUDIT.md
SPRINT-25.3-AUDIT.md
SPRINT-25.4-AUDIT.md
SPRINT-25.5-AUDIT.md
SPRINT-25.6-AUDIT.md
SPRINT-25.7-AUDIT.md
AUDIT-PART-A5.md
```

## A6
```text
SPRINT-26-AUDIT.md
SPRINT-26.1-AUDIT.md
SPRINT-26.2-AUDIT.md
AUDIT-PART-A6.md
```

## A7
```text
docs/audits/RC-AUDIT-SUMMARY.md
```

# Definition of Done

Sprint 27 ist abgeschlossen, wenn:

- `docs/audits/README.md` existiert
- alle vorgesehenen Sprint-Audits existieren
- jeder Audit einen Repository Commit enthält
- jeder Requirement Status besitzt
- Evidence dokumentiert ist
- automatisierte Tests dokumentiert sind
- manuelle Tests nicht fälschlich PASS sind
- Security Regression dokumentiert ist
- Legacy Safari Status dokumentiert ist
- Standalone Status dokumentiert ist
- HA App Status dokumentiert ist
- alle Audit Parts abgeschlossen sind
- Part Summaries existieren
- offene Findings priorisiert sind
- stale Audits im Final Pass erkannt wurden
- alle P0/P1 Findings geklärt sind
- RC Audit Summary existiert
- finale RC Empfehlung dokumentiert ist
- PROJECT_STATUS aktualisiert wurde
- SPRINT_ROADMAP aktualisiert wurde

# Empfohlene Reihenfolge

```text
A1
-> A2
-> A3
-> A4
-> A5
-> A6
-> Fix Passes für P0/P1/P2
-> A7 Final RC Consolidation
```

# Sprint 27 Master Prompt

```text
Read:

- AGENTS.md
- docs/SPRINT_ROADMAP.md
- docs/PROJECT_STATUS.md
- docs/RC_CHECKLIST.md if present
- docs/sprints/
- docs/sprints/SPRINT-27.md

Inspect the actual repository state first.

Sprint 27 is a full historical sprint-compliance audit before the next release
candidate.

Do NOT try to audit every sprint in one run.

Use the audit-part structure defined in docs/sprints/SPRINT-27.md.

Create:

docs/audits/README.md
docs/audits/sprints/
docs/audits/parts/

Use these requirement statuses only:

PASS
PARTIAL
MISSING
BROKEN
NOT TESTED

Use these sprint statuses only:

PASS
PARTIAL
FAIL
BLOCKED
NOT TESTED

Every sprint audit must record the exact repository commit used as its audit
baseline.

Do not rely on PROJECT_STATUS or previous Codex reports as proof.

Verify actual code, configuration, routes, frontend, persistence, automated
tests, security boundaries and runtime behavior where available.

For requirements that need a real iPad or real HAOS instance, use NOT TESTED
until actual manual evidence exists.

Write each sprint audit file immediately after that sprint has been audited so
progress survives an interrupted Codex run.

Audit first, fix second.

For PARTIAL/MISSING/BROKEN findings, document priority:

P0 – Security/Data Loss
P1 – RC Blocker
P2 – Functional Defect
P3 – Visual/Documentation

Do not perform large unplanned refactors during the audit.

After each audit part, create its Part Summary.

After A1–A6 and all required fix passes, execute A7 and create:

docs/audits/RC-AUDIT-SUMMARY.md

Final recommendation must be one of:

RC READY
RC READY WITH DOCUMENTED NON-BLOCKING LIMITATIONS
NOT RC READY

Do not create a Git tag, GitHub Release or publish a container image.

Do not commit or push until I review the result.
```

# Codex Prompt – Audit Part A1

```text
Execute Sprint 27 Audit Part A1 as defined in:

docs/sprints/SPRINT-27.md

Audit only:

- Sprint 18
- Sprint 19
- Sprint 20
- Sprint 21

Inspect the current repository first and record the exact base commit.

Read each original sprint specification and compare every requirement against
the actual current implementation.

Create:

docs/audits/README.md if it does not yet exist
docs/audits/sprints/SPRINT-18-AUDIT.md
docs/audits/sprints/SPRINT-19-AUDIT.md
docs/audits/sprints/SPRINT-20-AUDIT.md
docs/audits/sprints/SPRINT-21-AUDIT.md
docs/audits/parts/AUDIT-PART-A1.md

Use only:

PASS
PARTIAL
MISSING
BROKEN
NOT TESTED

for requirements.

Audit actual code/config/tests. Do not trust PROJECT_STATUS alone.

Run relevant automated tests.

For real-device/runtime tests that cannot be executed, mark NOT TESTED.

Include security regression and Standalone/App implications where relevant.

Do not perform unrelated feature development.

Do not start A2.

At the end report:
- base commit
- sprint statuses
- P0/P1/P2/P3 findings
- automated test results
- manual tests still needed
- files created
- recommended next action

Do not commit or push until I review the result.
```
