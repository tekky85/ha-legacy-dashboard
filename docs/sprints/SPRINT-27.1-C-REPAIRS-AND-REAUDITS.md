# Sprint 27.1-C – Repairs & Re-Audits

## Codex-Ausführungsanweisung

```text
Execute Sprint 27.1-C only.

This repair batch contains exactly these canonical Repair Queue items:

- RQ-09-01
- RQ-12-01
- RQ-12-02
- RQ-12-03

Do NOT start any other Repair Queue item.
Do NOT start Sprint 27.1-D.
Do NOT execute the full manual iPad/HAOS/production acceptance phase in this run.

The canonical definitions of all Repair IDs are in:

docs/audits/REPAIR_QUEUE.md

Use those entries as the authoritative source for:

- finding
- root cause
- affected Sprints
- affected components
- evidence
- required repair
- acceptance criteria
- dependencies
- security relevance
- RC relevance
- manual tests affected
- audit files to re-audit

Do NOT infer or invent repair requirements from the Repair IDs.

If this prompt conflicts with REPAIR_QUEUE.md, REPAIR_QUEUE.md wins.

READ FIRST

Read:

- AGENTS.md
- docs/SPRINT_ROADMAP.md
- docs/PROJECT_STATUS.md
- docs/audits/AUDIT_INDEX.md
- docs/audits/REPAIR_QUEUE.md
- docs/audits/REPAIR_QUEUE_CONSOLIDATION.md
- docs/audits/MANUAL_TEST_QUEUE.md
- every audit file referenced by RQ-09-01
- every audit file referenced by RQ-12-01
- every audit file referenced by RQ-12-02
- every audit file referenced by RQ-12-03
- every Sprint specification referenced by those Repair items

Inspect the CURRENT repository state before modifying code.

PRE-FLIGHT

Before editing:

1. Show current branch.
2. Show current commit.
3. Show git status.
4. Confirm working tree is clean or explain unrelated existing changes.
5. Resolve and summarize the canonical definitions of:
   - RQ-09-01
   - RQ-12-01
   - RQ-12-02
   - RQ-12-03
6. List:
   - affected Sprints
   - affected files/components
   - dependencies between these four repairs
   - acceptance criteria
   - security-sensitive aspects
   - audit files to re-audit
   - automated tests available
   - manual tests currently blocked by these repairs

Do not overwrite unrelated user changes.

BATCH ORDER / DEPENDENCIES

Use dependency information from REPAIR_QUEUE.md.

If no explicit dependency order exists, use this default:

1. RQ-09-01
2. RQ-12-01
3. RQ-12-02
4. RQ-12-03

If multiple RQ-12 items share one root cause:

- implement the shared root-cause repair once
- map evidence to all affected Repair IDs
- do not create duplicate implementations
- preserve each Repair ID for traceability

GLOBAL RULES

Preserve all existing security boundaries:

- HA token backend-only
- SUPERVISOR_TOKEN backend-only
- Admin token separation
- no generic HA service proxy
- no arbitrary browser-supplied domain/service passthrough
- no generic WebSocket proxy
- no browser-to-HA WebSocket
- HA registry/config-entry/Area/label metadata read-only unless explicitly required otherwise
- explicit server-side write authorization
- input validation
- rate/payload limits
- security headers
- secret redaction

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
- no Flexbox gap as hard dependency
- no ResizeObserver
- no Container Queries
- no modern-only browser API as required path

Preserve deployment compatibility:

- Standalone/LXC
- Home Assistant App
- direct LAN access where required

REPAIR EXECUTION – GENERAL RULE

For EACH Repair ID:

1. Confirm the defect still exists.
2. Reproduce with automated/local evidence where practical.
3. Confirm the canonical root cause still matches current code.
4. Implement the smallest correct root-cause repair.
5. Add/update regression tests where practical.
6. Run targeted tests.
7. Re-audit all linked requirements.
8. Update Repair Queue evidence/status.
9. Update linked Manual Test Queue entries.
10. Continue only if the repository remains stable and secure.

If a defect is already resolved:

- do not modify code unnecessarily
- perform targeted re-audit
- update Repair Queue status/evidence
- preserve traceability

RQ-09-01

Execute the canonical repair defined for RQ-09-01.

Process:

A. Confirm/reproduce.
B. Implement root-cause fix.
C. Add/update regression test.
D. Run targeted tests.
E. Re-audit linked Sprint audit files.
F. Update RQ-09-01.
G. Unblock linked manual tests where applicable.

If security-sensitive, add explicit negative tests for the affected boundary.

RQ-12-01

Execute the canonical repair defined for RQ-12-01.

Follow the same repair/test/re-audit discipline.

If this item shares implementation with RQ-12-02 or RQ-12-03:

- make the shared fix once
- record evidence against each affected Repair ID
- do not create parallel/duplicate implementations

RQ-12-02

Execute the canonical repair defined for RQ-12-02.

Verify:

- its own acceptance criteria
- interaction with RQ-12-01
- interaction with RQ-12-03
- no regression in previously repaired RQ-16-01 / RQ-04-01 behavior where shared code is touched

RQ-12-03

Execute the canonical repair defined for RQ-12-03.

Verify:

- its own acceptance criteria
- shared-root-cause implications
- no regression of related RQ-12 fixes
- no regression in previously repaired batches

REGRESSION PROTECTION

Because this is a later repair batch, explicitly check whether changes can affect:

- RQ-16-01
- RQ-04-01

If yes:

- run their relevant regression tests
- do not re-open them unless a regression is found
- if a regression is found, STOP and report it before commit

AUTOMATED / LOCAL TESTS

Run all existing tests directly related to:

- RQ-09-01
- RQ-12-01
- RQ-12-02
- RQ-12-03

Add regression coverage where practical.

Run a bounded broader regression suite if practical.

Do NOT:

- contact production Home Assistant
- use production .env
- use real HA credentials
- use real SUPERVISOR_TOKEN
- execute production HAOS operations

Do not claim physical/runtime PASS from local mocks.

TARGETED RE-AUDITS

For every Repair ID, re-open audit files listed under:

Audit Files To Re-Audit

For each linked requirement:

- compare current code to original Sprint requirement
- update status honestly
- update evidence
- reference tests
- retain manual-only requirements as NOT TESTED unless real evidence exists

Valid statuses:

PASS
PARTIAL
MISSING
BROKEN
NOT TESTED
N/A

Do NOT re-audit all Parts 01–19.

Only expand scope if a shared component directly affects another audited requirement.
Document any such expansion.

REPAIR QUEUE UPDATE

Update each canonical Repair Queue item independently:

- RQ-09-01
- RQ-12-01
- RQ-12-02
- RQ-12-03

For each record:

- implementation status
- files changed
- evidence
- tests run
- re-audit result
- remaining manual tests
- remaining risk
- dependency resolution
- whether RC blocker status changes

Use existing repository status conventions.

Do NOT mark an item fully CLOSED if required physical/manual validation remains pending, unless the queue explicitly distinguishes implementation completion from manual validation.

MANUAL TEST QUEUE UPDATE

For tests linked to these repairs:

- remove completed Repair IDs from "Blocked By Repairs" where appropriate
- keep Result = NOT TESTED
- preserve detailed test instructions
- do NOT execute physical tests

If a test is blocked by multiple repairs, remove only the Repair IDs now resolved.

ACCEPTANCE GATE – 27.1-C

Before commit verify ALL of the following:

- RQ-09-01 acceptance criteria satisfied as far as automatable
- RQ-12-01 acceptance criteria satisfied as far as automatable
- RQ-12-02 acceptance criteria satisfied as far as automatable
- RQ-12-03 acceptance criteria satisfied as far as automatable
- all relevant targeted tests pass
- targeted re-audits are complete
- no new PARTIAL/MISSING/BROKEN finding remains untracked
- no regression of RQ-16-01
- no regression of RQ-04-01
- no security regression
- no Legacy Safari/ES5 regression
- no Standalone regression
- no HA App regression
- linked manual tests are correctly blocked/unblocked
- git diff contains only intended Batch 27.1-C changes

If any acceptance item fails:

- do NOT present Batch 27.1-C as complete
- do NOT commit as a successful repair batch
- report the exact blocking Repair ID and reason
- do NOT start 27.1-D

DOCUMENTATION UPDATES

Update where appropriate:

- docs/audits/REPAIR_QUEUE.md
- docs/audits/MANUAL_TEST_QUEUE.md
- docs/audits/AUDIT_INDEX.md
- affected docs/audits/sprints/SPRINT-*-AUDIT.md
- docs/PROJECT_STATUS.md

Keep PROJECT_STATUS compact.

Do not claim:

- manual acceptance complete
- RC ready
- final RC gate passed

COMMIT & PUSH – BATCH 27.1-C

If the acceptance gate passes:

Review:

git status
git diff --check
git diff

Stage ONLY:

- product changes required for RQ-09-01
- product changes required for RQ-12-01
- product changes required for RQ-12-02
- product changes required for RQ-12-03
- regression tests for these repairs
- required targeted audit/documentation updates

Do not stage unrelated changes.

Commit:

git commit -m "fix(audit): repair RQ-09-01 and RQ-12-01 through RQ-12-03"

Push:

git push

If upstream is not configured:

git push -u origin <current-branch>

Do NOT force-push.

After push record:

- branch
- commit hash
- push result

POST-COMMIT CONSISTENCY CHECK

After push:

1. Confirm working tree is clean.
2. Confirm all four Repair IDs have accurate statuses.
3. Confirm linked audit files reference current evidence.
4. Confirm no manual test was falsely marked PASS.
5. Confirm resolved Repair IDs were removed from Blocked By Repairs only where appropriate.
6. Confirm no duplicate Repair IDs were created.
7. Confirm remaining Repair Queue priorities/order remain coherent.
8. Determine the next canonical Repair Batch from REPAIR_QUEUE.md / REPAIR_QUEUE_CONSOLIDATION.md.

Do NOT start the next batch automatically.

FINAL REPORT

At the end report:

1. starting commit
2. branch
3. canonical definition summary for RQ-09-01
4. canonical definition summary for RQ-12-01
5. canonical definition summary for RQ-12-02
6. canonical definition summary for RQ-12-03
7. dependency/order decision inside 27.1-C

RQ-09-01:
8. defect confirmed/reproduced
9. root cause
10. files changed
11. implementation summary
12. tests
13. re-audit result
14. manual tests unblocked
15. Repair Queue status

RQ-12-01:
16. defect confirmed/reproduced
17. root cause
18. files changed
19. implementation summary
20. tests
21. re-audit result
22. manual tests unblocked
23. Repair Queue status

RQ-12-02:
24. defect confirmed/reproduced
25. root cause
26. files changed
27. implementation summary
28. tests
29. re-audit result
30. manual tests unblocked
31. Repair Queue status

RQ-12-03:
32. defect confirmed/reproduced
33. root cause
34. files changed
35. implementation summary
36. tests
37. re-audit result
38. manual tests unblocked
39. Repair Queue status

Cross-cutting:
40. regression status for RQ-16-01
41. regression status for RQ-04-01
42. security findings
43. Legacy Safari/iPad compatibility findings
44. Standalone/LXC findings
45. Home Assistant App findings
46. 27.1-C acceptance gate result
47. commit hash
48. push result
49. working tree clean: YES/NO
50. remaining P0 repairs
51. remaining P1 repairs
52. next recommended Repair Batch
53. whether Sprint 27.1 can continue

Do NOT start Sprint 27.1-D automatically.
```

## Git-Ablauf

```bash
git status
git diff --check
git diff
git add <nur Dateien für RQ-09-01, RQ-12-01, RQ-12-02, RQ-12-03 und zugehörige Tests/Audit-Dokumentation>
git commit -m "fix(audit): repair RQ-09-01 and RQ-12-01 through RQ-12-03"
git push
```

Falls der aktuelle Branch noch keinen Upstream besitzt:

```bash
git push -u origin <current-branch>
```

Kein `git push --force`.
