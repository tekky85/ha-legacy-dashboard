# Sprint 27.1-F – Repairs & Re-Audits

## Codex-Ausführungsanweisung

```text
Execute Sprint 27.1-F only.

This repair batch contains exactly these canonical Repair Queue items:

- RQ-11-01
- RQ-12-04
- RQ-15-01
- RQ-16-02

Do NOT start any other Repair Queue item.
Do NOT start Sprint 27.1-G.
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
- every audit file referenced by RQ-11-01
- every audit file referenced by RQ-12-04
- every audit file referenced by RQ-15-01
- every audit file referenced by RQ-16-02
- every Sprint specification referenced by those Repair items

Inspect the CURRENT repository state before modifying code.

PRE-FLIGHT

Before editing:

1. Show current branch.
2. Show current commit.
3. Show git status.
4. Confirm working tree is clean or explain unrelated existing changes.
5. Resolve and summarize the canonical definitions of:
   - RQ-11-01
   - RQ-12-04
   - RQ-15-01
   - RQ-16-02
6. List:
   - affected Sprints
   - affected files/components
   - dependencies between these four repairs
   - acceptance criteria
   - security-sensitive aspects
   - RC relevance
   - audit files to re-audit
   - automated tests available
   - manual tests currently blocked by these repairs

Do not overwrite unrelated user changes.

BATCH ORDER / DEPENDENCIES

Use dependency information from REPAIR_QUEUE.md.

If no explicit dependency order exists, use this default:

1. RQ-11-01
2. RQ-12-04
3. RQ-15-01
4. RQ-16-02

If one item depends on another, follow the canonical dependency order.

If multiple items share one root cause:
- implement the shared fix once
- map evidence to every affected Repair ID
- preserve every Repair ID for traceability
- do not create duplicate implementations

GLOBAL ARCHITECTURE / SECURITY RULES

Preserve:
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
- payload/rate limits
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

RQ-11-01

Execute the canonical repair defined for RQ-11-01.

Process:
A. Confirm/reproduce.
B. Implement root-cause fix.
C. Add/update regression tests where practical.
D. Run targeted tests.
E. Re-audit linked Sprint audit files.
F. Update RQ-11-01.
G. Unblock linked manual tests where applicable.

If security-sensitive, include explicit negative tests.

RQ-12-04

Execute the canonical repair defined for RQ-12-04.

If this item shares implementation with RQ-11-01, RQ-15-01 or RQ-16-02:
- make the shared fix once
- record evidence against each affected Repair ID
- do not create parallel/duplicate implementations

RQ-15-01

Execute the canonical repair defined for RQ-15-01.

Verify:
- its own acceptance criteria
- interaction with RQ-11-01
- interaction with RQ-12-04
- interaction with RQ-16-02
- no regression in previously repaired batches where shared code is touched

RQ-16-02

Execute the canonical repair defined for RQ-16-02.

Verify:
- its own acceptance criteria
- shared-root-cause implications
- no regression of the other 27.1-F repairs
- no regression of earlier Sprint 27.1 repairs

REGRESSION PROTECTION

Explicitly assess whether changes can affect already completed repairs.

At minimum review interaction with:
- RQ-16-01
- RQ-04-01
- RQ-09-01
- RQ-12-01
- RQ-12-02
- RQ-12-03
- RQ-13-02
- RQ-14-01
- RQ-14-02
- RQ-14-05
- RQ-07-01
- RQ-08-01
- RQ-09-02
- RQ-10-01

If shared code is touched:
- run relevant regression tests
- do not reopen repaired items unless an actual regression is found
- if a regression is found, STOP before commit and report it

PUBLIC TEST RELEASE INTEGRITY CHECK

A Public Test Release may already exist from Sprint 27.2.

Do NOT overwrite or move its tag.
Do NOT rewrite published release history.

If this batch changes behavior included in the Public Test Release:
- document that this repair is newer than that release
- do not retag the prior release
- do not publish a new release in this run
- preserve version/release metadata unless canonical repair explicitly requires it

AUTOMATED / LOCAL TESTS

Run all existing tests directly related to:
- RQ-11-01
- RQ-12-04
- RQ-15-01
- RQ-16-02

Add regression coverage where practical.
Run a bounded broader regression suite if practical.

Do NOT:
- contact production Home Assistant
- use production .env
- use real HA credentials
- use real SUPERVISOR_TOKEN
- execute production HAOS operations
- publish release artifacts

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
- RQ-11-01
- RQ-12-04
- RQ-15-01
- RQ-16-02

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

Do NOT mark an item fully CLOSED if required physical/manual validation is still pending unless the queue explicitly distinguishes implementation completion from manual validation.

MANUAL TEST QUEUE UPDATE

For tests linked to these repairs:
- remove completed Repair IDs from "Blocked By Repairs" where appropriate
- keep Result = NOT TESTED
- preserve detailed test instructions
- do NOT execute physical tests

If a test is blocked by multiple repairs, remove only the Repair IDs now resolved.

ACCEPTANCE GATE – 27.1-F

Before commit verify ALL of the following:
- RQ-11-01 acceptance criteria satisfied as far as automatable
- RQ-12-04 acceptance criteria satisfied as far as automatable
- RQ-15-01 acceptance criteria satisfied as far as automatable
- RQ-16-02 acceptance criteria satisfied as far as automatable
- all relevant targeted tests pass
- targeted re-audits are complete
- no new PARTIAL/MISSING/BROKEN finding remains untracked
- no regression of previously completed Sprint 27.1 repairs
- no security regression
- no Legacy Safari/ES5 regression
- no Standalone regression
- no HA App regression
- no accidental Public Test Release tag/version rewrite
- linked manual tests are correctly blocked/unblocked
- git diff contains only intended Batch 27.1-F changes

If any acceptance item fails:
- do NOT present Batch 27.1-F as complete
- do NOT commit it as a successful repair batch
- report exact blocking Repair ID and reason
- do NOT start 27.1-G

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
- final RC gate passed
- final release ready

COMMIT & PUSH – BATCH 27.1-F

If the 27.1-F acceptance gate passes:

Review:
git status
git diff --check
git diff

Stage ONLY:
- product changes required for RQ-11-01
- product changes required for RQ-12-04
- product changes required for RQ-15-01
- product changes required for RQ-16-02
- regression tests for these repairs
- required targeted audit/documentation updates

Do not stage unrelated changes.

Commit:

git commit -m "fix(audit): repair RQ-11-01 RQ-12-04 RQ-15-01 and RQ-16-02"

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
8. Confirm prior Public Test Release tag remains untouched.
9. Determine the next canonical Repair Batch from REPAIR_QUEUE.md / REPAIR_QUEUE_CONSOLIDATION.md.

Do NOT start the next batch automatically.

FINAL REPORT

At the end report:

1. starting commit
2. branch
3. canonical definition summary for RQ-11-01
4. canonical definition summary for RQ-12-04
5. canonical definition summary for RQ-15-01
6. canonical definition summary for RQ-16-02
7. dependency/order decision inside 27.1-F

RQ-11-01:
8. defect confirmed/reproduced
9. root cause
10. files changed
11. implementation summary
12. tests
13. re-audit result
14. manual tests unblocked
15. Repair Queue status

RQ-12-04:
16. defect confirmed/reproduced
17. root cause
18. files changed
19. implementation summary
20. tests
21. re-audit result
22. manual tests unblocked
23. Repair Queue status

RQ-15-01:
24. defect confirmed/reproduced
25. root cause
26. files changed
27. implementation summary
28. tests
29. re-audit result
30. manual tests unblocked
31. Repair Queue status

RQ-16-02:
32. defect confirmed/reproduced
33. root cause
34. files changed
35. implementation summary
36. tests
37. re-audit result
38. manual tests unblocked
39. Repair Queue status

Cross-cutting:
40. regression status for previously completed Sprint 27.1 repairs
41. Public Test Release integrity check
42. security findings
43. Legacy Safari/iPad compatibility findings
44. Standalone/LXC findings
45. Home Assistant App findings
46. 27.1-F acceptance gate result
47. commit hash
48. push result
49. working tree clean: YES/NO
50. remaining P0 repairs
51. remaining P1 repairs
52. next recommended Repair Batch
53. whether Sprint 27.1 can continue

Do NOT start Sprint 27.1-G automatically.
```

## Git-Ablauf

```bash
git status
git diff --check
git diff
git add <nur Dateien für RQ-11-01, RQ-12-04, RQ-15-01, RQ-16-02 und zugehörige Tests/Audit-Dokumentation>
git commit -m "fix(audit): repair RQ-11-01 RQ-12-04 RQ-15-01 and RQ-16-02"
git push
```

Falls der aktuelle Branch noch keinen Upstream besitzt:

```bash
git push -u origin <current-branch>
```

Kein `git push --force`.
