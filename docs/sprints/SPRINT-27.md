# Sprint 27 – Full Sprint Audit & RC Readiness Review

## Status
Planned / Audit Program

## Ziel

Sprint 27 ist kein Feature-Sprint, sondern ein vollständiges Audit aller
vorhandenen Sprint-Spezifikationen gegen den aktuellen Repository-Stand.

Der Audit startet beim frühesten tatsächlich vorhandenen Sprint-Dokument.

Wenn `SPRINT-1.md` existiert, beginnt der Audit mit Sprint 1.
Wenn nicht, beginnt er mit dem frühesten vorhandenen Sprint.

Keine Anforderungen für nicht vorhandene Sprint-Dokumente erfinden.

---

# Audit-Workflow

```text
Sprint Spec
-> aktueller Repo-Stand
-> Requirement-by-Requirement Audit
-> PASS / PARTIAL / MISSING / BROKEN / NOT TESTED
-> Audit-Dokument im Git
-> Repair Queue
-> Re-Audit
-> Final RC Review
```

---

# Warum chronologisch

Frühere Architekturentscheidungen können spätere Sprints beeinflussen:

- Dashboard data model
- Persistence
- Admin security
- API routing
- Legacy browser compatibility
- Write authorization
- Grid/layout architecture

Spätere Sprints können frühere Anforderungen bewusst ersetzen. Solche Fälle
nicht fälschlich als BROKEN markieren, sondern als superseded dokumentieren.

---

# Sprint Inventory

Codex inventarisiert zuerst alle Dateien unter:

```text
docs/sprints/
```

Erfasst werden:

- Sprint ID
- Titel
- Dateiname
- relevante Komponenten
- Abhängigkeiten
- Audit-Part
- Auditstatus

Numerisch/logisch sortieren:

```text
1
2
...
17
17.1
17.2
...
21
21.1
...
26
26.1
26.2
```

---

# Persistente Audit-Struktur

Anlegen:

```text
docs/audits/
  AUDIT_INDEX.md
  REPAIR_QUEUE.md
  MANUAL_TEST_QUEUE.md
  RC_AUDIT_SUMMARY.md
  sprints/
    SPRINT-1-AUDIT.md
    SPRINT-2-AUDIT.md
    ...
```

`RC_AUDIT_SUMMARY.md` wird erst am Ende vollständig befüllt.

---

# Audit-Datei pro Sprint

Jeder Sprint erhält:

```text
docs/audits/sprints/SPRINT-<ID>-AUDIT.md
```

Pflichtstruktur:

```text
# Sprint X Audit

## Audit Metadata
- Sprint:
- Sprint title:
- Audit date:
- Repository commit:
- Spec file:

## Overall Result
PASS / PARTIAL / FAIL / BLOCKED / NOT TESTED

## Requirement Matrix

| ID | Requirement | Status | Evidence | Notes |
|----|-------------|--------|----------|-------|

## Automated Tests
...

## Manual Tests
...

## Security Review
...

## Legacy Safari / iPad Review
...

## Home Assistant App Review
...

## Standalone/LXC Review
...

## Findings
...

## Repair Required
...

## Final Assessment
...
```

Nicht relevante Bereiche mit `N/A`.

---

# Requirement Status

Nur:

```text
PASS
PARTIAL
MISSING
BROKEN
NOT TESTED
N/A
```

Bedeutung:

- PASS: im aktuellen Repo vorhanden und belegt
- PARTIAL: nur teilweise umgesetzt
- MISSING: fehlt
- BROKEN: vorhanden, aber entspricht der Spec nicht
- NOT TESTED: ohne reale/manuelle Prüfung nicht belastbar bestätigt
- N/A: nachweislich nicht anwendbar

Overall Sprint:

```text
PASS
PARTIAL
FAIL
BLOCKED
NOT TESTED
```

---

# Evidence Pflicht

PASS/PARTIAL/BROKEN möglichst mit konkreter Evidence:

- Source file
- Function
- Route
- Config key
- Test file / test name
- Manual test reference

Nicht nur „looks implemented“.

---

# Keine künstlichen PASS-Werte

Insbesondere reale Punkte nicht als PASS markieren, wenn nicht tatsächlich
getestet:

- iPad mini
- HAOS App installation
- HomeScreen behavior
- Guided Access
- reale HA Integration
- reale Write Controls

Dann `NOT TESTED` und in die Manual Test Queue.

---

# Manual Test Queue

Datei:

```text
docs/audits/MANUAL_TEST_QUEUE.md
```

Erfasst:

- Sprint
- Requirement
- Device/System
- Test steps
- Status

Beispiele:

- iPad mini
- HAOS
- HomeScreen
- Guided Access
- real Light
- real Climate

---

# Repair Queue

Datei:

```text
docs/audits/REPAIR_QUEUE.md
```

Alle actionable:

- PARTIAL
- MISSING
- BROKEN

Punkte aufnehmen.

---

# Audit und Repair trennen

Bevorzugter Ablauf:

```text
Audit Part
-> Review
-> Commit Audit Docs
-> Repair Pass
-> Commit Repair
-> Re-Audit betroffene Requirements
```

Nicht große Reparaturen während des Baseline-Audits vermischen.

---

# Re-Audit

Nach Repair Audit-Datei nicht einfach überschreiben.

Dokumentieren:

```text
Initial: BROKEN
Repair commit: abc123
Re-test: PASS
```

---

# Audit Parts

Sprint 27 wird wegen Token-/Zeitlimit in mehrere Codex-Läufe geteilt.

Bevorzugt:

```text
3–5 normale Sprints pro Part
```

oder weniger bei großen Specs.

Ein Part lieber zu klein als zu groß.

Ziel:

```text
ein Codex-Lauf < 5h Limit
```

mit Reserve für Review.

---

# Part-Planung

Codex erstellt nach Inventory selbst einen konkreten Plan auf Basis der
tatsächlich vorhandenen Sprint-Dateien.

Beispiel:

```text
Part 01 – Sprints 1–4
Part 02 – Sprints 5–8
Part 03 – Sprints 9–12
...
```

Sub-Sprints normalerweise direkt nach dem Hauptsprint.

---

# Security Audit

Bei relevanten Sprints prüfen:

- HA token backend-only
- SUPERVISOR_TOKEN backend-only
- Admin security
- explicit write endpoints
- no generic service proxy
- no arbitrary browser service calls
- secret redaction
- input validation
- path traversal
- upload validation
- open redirect protection

---

# Legacy Compatibility Audit

Bei Frontend-Sprints:

- ES5
- iOS 9 Safari
- kein fetch
- kein Promise
- keine arrow functions
- kein let/const
- kein optional chaining
- kein CSS Grid
- kein Flexbox gap als Voraussetzung
- Touch targets
- HomeScreen behavior

---

# Standalone Audit

Bei relevanten Sprints:

- Startup
- HA URL/token handling
- REST
- WebSocket metadata
- DATA_DIR
- Admin
- Dashboard

---

# HA App Audit

Bei relevanten Sprints:

- App packaging
- Supervisor token
- REST proxy
- WebSocket proxy
- /data
- port
- direct LAN access
- permissions
- restart persistence

---

# PROJECT_STATUS

`docs/PROJECT_STATUS.md` bleibt kompakte Übersicht und verlinkt auf:

```text
docs/audits/AUDIT_INDEX.md
docs/audits/RC_AUDIT_SUMMARY.md
```

---

# Final RC Summary

Nach allen Parts:

```text
docs/audits/RC_AUDIT_SUMMARY.md
```

Enthält:

- audited commit
- audited sprints
- Sprint status overview
- open repair items
- manual test status
- security status
- Standalone status
- HA App status
- Legacy iPad status
- known limitations
- RC blockers
- RC recommendation

---

# Final RC Gate

RC kann empfohlen werden, wenn:

- keine offenen RC-kritischen MISSING/BROKEN Requirements
- keine Security FAILs
- Standalone Kernpfad PASS
- HA App Kernpfad PASS
- iPad Kernpfad PASS
- Write Controls PASS
- Persistence PASS
- HomeScreen Navigation PASS
- relevante Manual Tests PASS

---

# Run 1

Der erste Codex-Lauf macht NUR:

1. vollständiges Sprint Inventory
2. Audit-Struktur anlegen
3. token-sicheren Part-Plan erzeugen
4. nur Part 01 abarbeiten

Nicht Part 02 starten.

---

# Run 1 Deliverables

Mindestens:

```text
docs/audits/AUDIT_INDEX.md
docs/audits/REPAIR_QUEUE.md
docs/audits/MANUAL_TEST_QUEUE.md
docs/audits/sprints/<erste Audit-Dateien>
```

---

# Definition of Done – Sprint 27

Sprint 27 ist komplett, wenn:

- alle vorhandenen Sprint-Specs inventarisiert
- jeder Sprint eine Audit-Datei besitzt
- Requirements klassifiziert
- Evidence dokumentiert
- Repair Queue abgearbeitet oder bewusst akzeptiert
- Manual Test Queue abgearbeitet oder klar NOT TESTED
- Security Review abgeschlossen
- Standalone Review abgeschlossen
- Home Assistant App Review abgeschlossen
- Legacy iPad Review abgeschlossen
- RC_AUDIT_SUMMARY.md erstellt
- RC Blocker dokumentiert
- finale RC-Entscheidung möglich

---

# Codex Prompt – Run 1

```text
Start Sprint 27 – Full Sprint Audit & RC Readiness Review.

Read:
- AGENTS.md
- docs/SPRINT_ROADMAP.md
- docs/PROJECT_STATUS.md
- all files under docs/sprints/

Inspect the actual repository state first.

IMPORTANT:
Do NOT try to audit every sprint in one run.

This first run has four tasks only:

1. Inventory every existing sprint specification under docs/sprints/
2. Build the persistent audit structure
3. Create a token-safe chronological Audit Part plan
4. Execute only the FIRST audit part, starting with the earliest existing
   sprint specification

If SPRINT-1.md exists, begin with Sprint 1.

If Sprint 1 does not exist, begin with the earliest actual sprint spec.

Do not invent requirements for missing sprint documents.

Create:

docs/audits/AUDIT_INDEX.md
docs/audits/REPAIR_QUEUE.md
docs/audits/MANUAL_TEST_QUEUE.md
docs/audits/sprints/

For each sprint audited, create:

docs/audits/sprints/SPRINT-<ID>-AUDIT.md

Every audit must compare the sprint specification against the CURRENT actual
repository implementation.

Use requirement statuses only:

PASS
PARTIAL
MISSING
BROKEN
NOT TESTED
N/A

For overall sprint status use:

PASS
PARTIAL
FAIL
BLOCKED
NOT TESTED

Every PASS/PARTIAL/BROKEN result should include concrete evidence where
practical:
- source file
- function
- route
- config key
- test file/test name
- manual test reference

Do not rely only on docs/PROJECT_STATUS.md.

Do not mark real-device/runtime requirements PASS if they were not actually
tested.

Put such checks into docs/audits/MANUAL_TEST_QUEUE.md.

Put actionable PARTIAL/MISSING/BROKEN findings into
docs/audits/REPAIR_QUEUE.md.

Do not perform broad repair work during this baseline audit run.

If later sprints intentionally supersede an earlier requirement, document that
explicitly rather than falsely marking it broken.

Audit chronologically.

Choose the first Audit Part small enough to fit comfortably within the usage
limit. Prefer roughly 3–5 normal sprints, fewer if the specs are large.

At the end report:

1. repository commit audited
2. complete sprint inventory
3. proposed Audit Part plan
4. which sprints were audited in Part 01
5. overall result per audited sprint
6. PARTIAL/MISSING/BROKEN findings
7. manual tests queued
8. repair items queued
9. security findings
10. test results
11. next Audit Part
12. recommended commit message

Do not start Audit Part 02 in this run.

Do not commit or push until I review the result.
```
