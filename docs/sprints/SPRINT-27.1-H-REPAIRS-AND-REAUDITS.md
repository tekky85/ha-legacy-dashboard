# Sprint 27.1-H – Repairs & Re-Audits

## Codex-Ausführungsanweisung

```text
Execute Sprint 27.1-H only.

This repair batch contains exactly these canonical Repair Queue items:

- RQ-14-04
- RQ-14-03

Do NOT start any other Repair Queue item.
Do NOT start Sprint 27.1-I.
Do NOT execute the full manual iPad/HAOS/production acceptance phase in this run.

The canonical definitions of both Repair IDs are in:

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
- every audit file referenced by RQ-14-04
- every audit file referenced by RQ-14-03
- every Sprint specification referenced by those Repair items
- relevant prior Sprint 27.1 repair/re-audit documentation

Inspect the CURRENT repository state before modifying code.

PRE-FLIGHT

Before editing:

1. Show current branch.
2. Show current commit.
3. Show git status.
4. Confirm working tree is clean or explain unrelated existing changes.
5. Resolve and summarize the canonical definitions of:
   - RQ-14-04
   - RQ-14-03
6. List:
   - affected Sprints
   - affected files/components
   - dependencies between these two repairs
   - acceptance criteria
   - security-sensitive aspects
   - RC relevance
   - audit files to re-audit
   - automated tests available
   - manual tests currently blocked by these repairs
7. Determine the correct execution order from REPAIR_QUEUE.md.

Do not overwrite unrelated user changes.

BATCH ORDER / DEPENDENCIES

Use dependency information from REPAIR_QUEUE.md.

If no explicit dependency order exists, use this default:

1. RQ-14-04
2. RQ-14-03

If RQ-14-03 is a prerequisite for RQ-14-04, reverse the order.

If both share one root cause:
- implement the shared root-cause repair once
- map evidence to both Repair IDs
- preserve both IDs for audit traceability
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

RQ-14-04

Execute the canonical repair defined for RQ-14-04.

Process:
A. Confirm/reproduce.
B. Confirm the documented root cause still matches current code.
C. Implement the smallest correct root-cause repair.
D. Add/update regression tests where practical.
E. Run targeted tests.
F. Re-audit linked Sprint audit files.
G. Update RQ-14-04.
H. Unblock linked manual tests where applicable.

If security-sensitive, include explicit negative tests.

RQ-14-03

Execute the canonical repair defined for RQ-14-03.

Process:
A. Confirm/reproduce.
B. Confirm the documented root cause still matches current code.
C. Implement the smallest correct root-cause repair.
D. Add/update regression tests where practical.
E. Run targeted tests.
F. Re-audit linked Sprint audit files.
G. Update RQ-14-03.
H. Unblock linked manual tests where applicable.

If this repair shares implementation with RQ-14-04:
- make the shared fix once
- record evidence against both Repair IDs
- do not create parallel or duplicated code paths

REGRESSION PROTECTION

Because this is a later Sprint 27.1 batch, explicitly assess whether changes can
affect already completed repairs.

At minimum inspect all prior RQ-14 repairs already marked implemented/re-audited
in the CURRENT REPAIR_QUEUE.md.

Also inspect any previously completed repair that touches the same files or
shared components.

Do not hardcode completed status solely from this prompt.

If shared code is touched:
- run relevant regression tests
- do not reopen previous repairs unless an actual regression is found
- if an actual regression is found, STOP before commit and report it

PUBLIC TEST RELEASE INTEGRITY CHECK

A Public Test Release may already exist from Sprint 27.2.

Do NOT:
- move its tag
- overwrite its tag
- rewrite its GitHub release
- silently reuse its version
- force-update its GHCR tag

If 27.1-H changes behavior present in that Public Test Release:
- document that this batch is newer than the published test release
- do not retag the existing release
- do not publish a new release in this run
- preserve published release history

AUTOMATED / LOCAL TESTS

Run all existing tests directly related to:
- RQ-14-04
- RQ-14-03

Add/update regression coverage where practical.
Run a bounded broader regression suite if practical.

Do NOT:
- contact production Home Assistant
- use production .env
- use real HA credentials
- use real SUPERVISOR_TOKEN
- execute production HAOS operations
- modify production LXC
- publish release artifacts

Do not claim physical/runtime PASS from local mocks.

TARGETED RE-AUDITS

For each Repair ID, re-open every audit file listed under:
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

Update both canonical Repair Queue items independently:
- RQ-14-04
- RQ-14-03

For each record:
- implementation status
- files changed
- evidence
- tests run
- re-audit result
- remaining manual tests
- remaining risk
- dependency resolution
- RC blocker status

Use existing repository status conventions.

Do NOT mark an item fully CLOSED if required physical/manual validation is still
pending unless the queue explicitly distinguishes implementation completion from
manual validation.

MANUAL TEST QUEUE UPDATE

For tests linked to these repairs:
- remove resolved Repair IDs from "Blocked By Repairs" where appropriate
- keep Result = NOT TESTED
- preserve detailed test instructions
- preserve expected results
- preserve failure criteria
- do NOT execute physical tests

If a test is blocked by multiple repairs:
- remove only RQ-14-04 / RQ-14-03 where now resolved
- keep the test blocked if another required Repair ID remains OPEN

NEW FINDINGS

If implementation/re-audit discovers a new actionable defect:
1. document it
2. add or map it to REPAIR_QUEUE.md
3. assign priority
4. include evidence
5. include RC relevance
6. include manual/re-audit implications

Do NOT automatically repair a newly discovered unrelated issue.
Do NOT silently expand 27.1-H scope.

ACCEPTANCE GATE – 27.1-H

Before commit verify ALL of the following:
- RQ-14-04 acceptance criteria satisfied as far as automatable
- RQ-14-03 acceptance criteria satisfied as far as automatable
- all relevant targeted tests pass
- targeted re-audits are complete
- no new PARTIAL/MISSING/BROKEN finding remains untracked
- no regression of previously completed Sprint 27.1 repairs
- no security regression
- no Legacy Safari/ES5 regression
- no Standalone regression
- no Home Assistant App regression
- no Public Test Release history/tag was modified
- linked manual tests are correctly blocked/unblocked
- git diff contains only intended 27.1-H changes

If any acceptance item fails:
- do NOT present 27.1-H as complete
- do NOT commit it as a successful repair batch
- report exact blocking Repair ID and reason
- do NOT start 27.1-I

DOCUMENTATION UPDATES

Update where appropriate:
- docs/audits/REPAIR_QUEUE.md
- docs/audits/MANUAL_TEST_QUEUE.md
- docs/audits/AUDIT_INDEX.md
- affected docs/audits/sprints/SPRINT-*-AUDIT.md
- docs/PROJECT_STATUS.md

Keep PROJECT_STATUS compact.

Do not claim:
- all manual acceptance complete
- final RC gate passed
- final release ready

COMMIT & PUSH – BATCH 27.1-H

If the 27.1-H acceptance gate passes:

Review:
git status
git diff --check
git diff

Stage ONLY:
- product changes required for RQ-14-04
- product changes required for RQ-14-03
- regression tests for these repairs
- required targeted audit/documentation updates

Do not stage unrelated changes.

Commit:

git commit -m "fix(audit): repair RQ-14-04 and RQ-14-03"

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
2. Confirm RQ-14-04 has accurate status.
3. Confirm RQ-14-03 has accurate status.
4. Confirm linked audit files reference current evidence.
5. Confirm no manual test was falsely marked PASS.
6. Confirm resolved Repair IDs were removed from Blocked By Repairs only where appropriate.
7. Confirm no duplicate Repair IDs were created.
8. Confirm remaining Repair Queue priorities/order remain coherent.
9. Confirm Public Test Release tag/history remains untouched.
10. Determine the next canonical Repair Batch from CURRENT repository documentation.

Do NOT start the next batch automatically.

FINAL REPORT

At the end report:

1. starting commit
2. branch
3. canonical definition summary for RQ-14-04
4. canonical definition summary for RQ-14-03
5. dependency/execution order decision

RQ-14-04:
6. defect confirmed/reproduced
7. root cause
8. files changed
9. implementation summary
10. regression tests added/changed
11. tests run
12. test results
13. audit files re-audited
14. requirement status changes
15. manual tests unblocked
16. Repair Queue status
17. remaining manual validation
18. RC relevance after repair

RQ-14-03:
19. defect confirmed/reproduced
20. root cause
21. files changed
22. implementation summary
23. regression tests added/changed
24. tests run
25. test results
26. audit files re-audited
27. requirement status changes
28. manual tests unblocked
29. Repair Queue status
30. remaining manual validation
31. RC relevance after repair

Cross-cutting:
32. regression status for previously completed repairs
33. Public Test Release integrity check
34. security findings
35. Legacy Safari/iPad compatibility findings
36. Standalone/LXC findings
37. Home Assistant App findings
38. 27.1-H acceptance gate result
39. commit hash
40. push result
41. working tree clean: YES/NO
42. remaining P0 repairs
43. remaining P1 repairs
44. remaining P2 repairs
45. remaining P3 repairs
46. next recommended Repair Batch
47. whether Sprint 27.1 can continue

Do NOT start Sprint 27.1-I automatically.
```

## Git-Ablauf

```bash
git status
git diff --check
git diff
git add <nur Dateien für RQ-14-04, RQ-14-03 und zugehörige Tests/Audit-Dokumentation>
git commit -m "fix(audit): repair RQ-14-04 and RQ-14-03"
git push
```

Falls der aktuelle Branch noch keinen Upstream besitzt:

```bash
git push -u origin <current-branch>
```

Kein Force-Push.
