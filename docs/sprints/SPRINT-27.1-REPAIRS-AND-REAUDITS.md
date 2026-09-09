# Sprint 27.1 – Repairs & Re-Audits

## Codex-Ausführungsanweisung

```text
Execute Sprint 27.1 – Repairs & Re-Audits.

This run contains exactly two ordered repair batches:

1. Batch 27.1-A
   Repair ID: RQ-16-01

2. Batch 27.1-B
   Repair ID: RQ-04-01

The order is mandatory.

Complete, test, document, re-audit, commit and push Batch 27.1-A first.

Only if Batch 27.1-A is successfully completed and its required automated
re-audit passes, continue with Batch 27.1-B.

If Batch 27.1-A is BLOCKED or introduces unresolved regressions, STOP before
Batch 27.1-B and report the blocker.

Do NOT start any other Repair Queue item.

Do NOT execute the full manual iPad/HAOS acceptance phase in this run.

READ FIRST

Read:

- AGENTS.md
- docs/SPRINT_ROADMAP.md
- docs/PROJECT_STATUS.md
- docs/audits/AUDIT_INDEX.md
- docs/audits/REPAIR_QUEUE.md
- docs/audits/REPAIR_QUEUE_CONSOLIDATION.md
- docs/audits/MANUAL_TEST_QUEUE.md

Then read:

- every audit file referenced by RQ-16-01
- every audit file referenced by RQ-04-01
- every Sprint specification referenced by those Repair items

Inspect the CURRENT repository state before modifying code.

IMPORTANT:

The canonical definitions of RQ-16-01 and RQ-04-01 are in:

docs/audits/REPAIR_QUEUE.md

Use those canonical Repair Queue entries as authoritative for:

- root cause
- evidence
- affected Sprints
- affected components
- acceptance criteria
- dependencies
- security relevance
- RC relevance
- manual tests affected
- audit files to re-audit

Do NOT infer or invent repair requirements from the Repair ID.

If this prompt and REPAIR_QUEUE.md differ, REPAIR_QUEUE.md wins.

GLOBAL RULES

Preserve all existing architectural/security boundaries:

- HA token backend-only
- SUPERVISOR_TOKEN backend-only
- Admin token separated from HA credentials
- no generic HA service proxy
- no arbitrary browser-supplied service/domain passthrough
- no generic WebSocket proxy
- no browser-to-HA WebSocket
- registry/config-entry/Area/label metadata remains read-only unless an
  explicit existing product requirement says otherwise
- system-dashboard visibility does not grant write access
- explicit domain/entity/action/payload authorization for writes
- input validation
- secret redaction
- existing rate/payload/security limits

Preserve legacy frontend compatibility:

- ES5
- iOS 9 Safari
- no fetch requirement
- no Promise requirement
- no arrow functions
- no let / const
- no async/await
- no optional chaining
- no nullish coalescing
- no CSS Grid
- no Flexbox gap as a hard dependency
- no ResizeObserver
- no Container Queries
- no modern-only browser API as a required path

Do not perform broad refactoring unless the canonical Repair item requires a
shared root-cause change.

Prefer the smallest correct repair that addresses the canonical root cause and
all linked audit findings.

PRE-FLIGHT

Before editing:

1. Show current branch.
2. Show current commit.
3. Show git status.
4. Confirm working tree is clean or explain existing unrelated changes.
5. Resolve the canonical definitions of RQ-16-01 and RQ-04-01.
6. List:
   - affected files/components
   - affected Sprints
   - acceptance criteria
   - targeted re-audit files
   - automated tests available
   - manual tests that remain pending

Do not overwrite unrelated user changes.

==================================================
BATCH 27.1-A
Repair: RQ-16-01
==================================================

Execute RQ-16-01 only.

A1 – Reproduce / confirm

- Confirm the current defect from repository evidence and tests where possible.
- Reference original audit findings.
- Confirm the root cause in REPAIR_QUEUE.md still matches current code.
- If already resolved by another later change, do not modify code unnecessarily.
  Re-audit and update documentation instead.

A2 – Implement

Implement the canonical Required Repair for RQ-16-01.

Requirements:

- repair the root cause, not only one visible symptom
- preserve unrelated behavior
- preserve Standalone/LXC support
- preserve Home Assistant App support
- preserve legacy iPad compatibility
- preserve security boundaries
- do not modify unrelated Repair Queue items

A3 – Automated tests

Run all existing relevant tests.

Add/update regression tests where practical.

Regression tests must specifically cover the repaired failure mode.

Run a bounded broader regression suite if practical.

Do NOT use:

- production .env
- real HA credentials
- real SUPERVISOR_TOKEN
- production Home Assistant
- production HAOS

Local-only mocks may be used according to project policy.

A4 – Targeted re-audit

Re-open every audit file listed under RQ-16-01 / Audit Files To Re-Audit.

For each linked requirement:

- compare CURRENT code against original Sprint requirement
- update status only when supported by evidence
- update evidence
- update automated-test references
- keep physical/manual requirements NOT TESTED unless real evidence exists
- do not fake PASS

Valid statuses:

PASS
PARTIAL
MISSING
BROKEN
NOT TESTED
N/A

A5 – Repair Queue update

Update RQ-16-01 in docs/audits/REPAIR_QUEUE.md.

Use the repository's existing status convention.

Record:

- files changed
- tests run
- re-audit result
- remaining manual tests
- remaining risk

Do NOT mark the item fully closed if required manual acceptance is still pending,
unless the existing queue convention explicitly distinguishes code closure from
manual validation.

A6 – Manual test queue update

For tests linked to RQ-16-01:

- remove RQ-16-01 from "Blocked By Repairs" if now unblocked
- keep Result = NOT TESTED
- do NOT execute physical tests
- preserve detailed steps, expected results and failure criteria

A7 – Project/audit status

Update where appropriate:

- docs/audits/AUDIT_INDEX.md
- docs/PROJECT_STATUS.md

Keep updates compact.

Do not claim final RC readiness.

BATCH 27.1-A ACCEPTANCE GATE

Before committing Batch 27.1-A, verify:

- canonical RQ-16-01 acceptance criteria satisfied
- relevant automated tests pass
- targeted re-audit completed
- no new PARTIAL/MISSING/BROKEN finding left untracked
- no new security regression
- no new legacy Safari regression
- manual tests remain correctly queued
- unrelated behavior not intentionally changed

If this gate FAILS:

- do NOT commit a knowingly broken repair as completed
- do NOT start Batch 27.1-B
- report BLOCKED/PARTIAL and exact reason

COMMIT & PUSH – BATCH 27.1-A

If Batch 27.1-A passes:

Review:

git status
git diff --check
git diff

Stage only files belonging to Batch 27.1-A and its required audit documentation.

Commit:

git commit -m "fix(audit): repair RQ-16-01 and re-audit affected sprints"

Push:

git push

If upstream is not configured:

git push -u origin <current-branch>

Do not force-push.

After push record:

- commit hash
- branch
- push result

==================================================
BATCH 27.1-B START GATE
==================================================

Only continue with Batch 27.1-B if:

- Batch 27.1-A implementation is complete
- targeted re-audit passed as far as automatable
- required manual tests are correctly pending/unblocked
- Batch 27.1-A commit succeeded
- Batch 27.1-A push succeeded
- working tree is clean after commit

Otherwise STOP.

==================================================
BATCH 27.1-B
Repair: RQ-04-01
==================================================

Execute RQ-04-01 only.

B1 – Reproduce / confirm

- Confirm current defect/evidence.
- Read every linked audit finding.
- Confirm canonical root cause.
- If current code already satisfies the repair, avoid unnecessary changes and
  re-audit/document instead.

B2 – Implement

Implement the canonical Required Repair for RQ-04-01.

Preserve:

- architecture
- security
- ES5/iOS 9
- Standalone/LXC
- Home Assistant App
- unrelated behavior

B3 – Automated tests

Run relevant targeted tests.

Add/update regression coverage where practical.

Run bounded broader regression suite if practical.

No production systems or credentials.

B4 – Targeted re-audit

Re-audit only audit files linked to RQ-04-01 plus any additional audit file
directly affected by the same shared root cause.

Update statuses and evidence honestly.

Do not perform a full Parts 01–19 re-audit.

B5 – Repair Queue update

Update RQ-04-01 with:

- implementation status
- evidence
- changed files
- tests
- re-audit result
- remaining manual tests
- remaining risk

B6 – Manual test queue update

Unblock linked manual tests where applicable.

Keep:

Result = NOT TESTED

unless pre-existing real evidence exists.

Do not execute physical/manual acceptance tests in this run.

B7 – Project/audit status

Update:

- docs/audits/AUDIT_INDEX.md
- docs/PROJECT_STATUS.md

only where appropriate.

BATCH 27.1-B ACCEPTANCE GATE

Before committing Batch 27.1-B, verify:

- canonical RQ-04-01 acceptance criteria satisfied
- relevant automated tests pass
- targeted re-audit completed
- no new untracked findings
- no security regression
- no legacy Safari regression
- manual tests correctly queued/unblocked
- working tree contains only Batch 27.1-B changes

If gate fails, report blocker and do not present batch as complete.

COMMIT & PUSH – BATCH 27.1-B

If Batch 27.1-B passes:

Review:

git status
git diff --check
git diff

Stage only Batch 27.1-B and its required audit documentation.

Commit:

git commit -m "fix(audit): repair RQ-04-01 and re-audit affected sprints"

Push:

git push

If upstream is not configured:

git push -u origin <current-branch>

Do not force-push.

Record:

- commit hash
- branch
- push result

==================================================
POST-BATCH CONSISTENCY CHECK
==================================================

After both batches inspect:

- docs/audits/REPAIR_QUEUE.md
- docs/audits/MANUAL_TEST_QUEUE.md
- docs/audits/AUDIT_INDEX.md

Verify:

- RQ-16-01 has accurate status
- RQ-04-01 has accurate status
- all re-audited findings reference current evidence
- no linked manual test remains incorrectly blocked
- no manual test was falsely marked PASS
- no duplicate replacement Repair ID was created
- remaining Repair Queue order is coherent
- priorities of unrelated repairs were not changed without evidence

DO NOT RUN FULL MANUAL ACCEPTANCE YET

Do not execute:

- physical iPad Mini acceptance
- Guided Access testing
- production HAOS installation/update
- production Home Assistant runtime tests
- final RC gate

Default behavior:

automated repair
+
targeted re-audit
+
manual tests remain queued

FINAL REPORT

At the end report:

1. starting repository commit
2. branch
3. canonical definition summary for RQ-16-01
4. canonical definition summary for RQ-04-01

Batch 27.1-A:
5. defect reproduced/confirmed
6. root cause
7. files changed
8. implementation summary
9. regression tests added/changed
10. tests executed
11. test results
12. audit files re-audited
13. requirement status changes
14. manual tests unblocked
15. Repair Queue status for RQ-16-01
16. Batch 27.1-A acceptance gate result
17. commit hash
18. push result

Batch 27.1-B:
19. whether Batch 27.1-B was started
20. defect reproduced/confirmed
21. root cause
22. files changed
23. implementation summary
24. regression tests added/changed
25. tests executed
26. test results
27. audit files re-audited
28. requirement status changes
29. manual tests unblocked
30. Repair Queue status for RQ-04-01
31. Batch 27.1-B acceptance gate result
32. commit hash
33. push result

Cross-cutting:
34. security findings
35. Legacy Safari/iPad compatibility findings
36. Standalone/LXC findings
37. Home Assistant App findings
38. remaining P0 repairs
39. remaining P1 repairs
40. next recommended Repair Batch according to current REPAIR_QUEUE.md
41. whether repository working tree is clean
42. whether Sprint 27.1 can continue with the next Repair Batch

Do NOT start the next Repair Batch automatically.

Stop after Batch 27.1-B and its commit/push.
```

## Erwarteter Git-Ablauf

Codex soll **je Batch separat committen und pushen**.

### Batch 27.1-A

```bash
git status
git diff --check
git diff
git add <nur Dateien aus RQ-16-01 und zugehörige Audit-Dokumentation>
git commit -m "fix(audit): repair RQ-16-01 and re-audit affected sprints"
git push
```

Falls für den Branch noch kein Upstream existiert:

```bash
git push -u origin <current-branch>
```

### Batch 27.1-B

```bash
git status
git diff --check
git diff
git add <nur Dateien aus RQ-04-01 und zugehörige Audit-Dokumentation>
git commit -m "fix(audit): repair RQ-04-01 and re-audit affected sprints"
git push
```

Falls für den Branch noch kein Upstream existiert:

```bash
git push -u origin <current-branch>
```

Kein `git push --force`.
