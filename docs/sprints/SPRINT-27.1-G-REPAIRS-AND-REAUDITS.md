# Sprint 27.1-G – Repairs & Re-Audits

## Codex-Ausführungsanweisung

```text
Execute Sprint 27.1-G only.

IMPORTANT:

The exact Repair Queue items assigned to Batch 27.1-G must be resolved from the
CURRENT repository documentation.

Use, in this order:

1. docs/audits/REPAIR_QUEUE.md
2. docs/audits/REPAIR_QUEUE_CONSOLIDATION.md
3. docs/PROJECT_STATUS.md
4. docs/audits/AUDIT_INDEX.md

Determine the canonical Repair IDs explicitly assigned or recommended for
27.1-G.

Do NOT invent Repair IDs.

Do NOT pull unrelated open repairs into this batch merely because they are high
priority.

Before modifying code, report the exact Repair IDs resolved for 27.1-G.

If repository documentation does not clearly identify the intended 27.1-G
Repair IDs:

STOP before product changes.

Report:
- which candidate Repair IDs remain open
- their priority
- their dependencies
- why the 27.1-G scope is ambiguous

Do NOT guess.

Do NOT start Sprint 27.1-H.

Do NOT execute the full manual iPad/HAOS/production acceptance phase in this run.

==================================================
READ FIRST
==================================================

Read:

- AGENTS.md
- docs/SPRINT_ROADMAP.md
- docs/PROJECT_STATUS.md
- docs/audits/AUDIT_INDEX.md
- docs/audits/REPAIR_QUEUE.md
- docs/audits/REPAIR_QUEUE_CONSOLIDATION.md
- docs/audits/MANUAL_TEST_QUEUE.md

Then read:

- every audit file referenced by each Repair ID assigned to 27.1-G
- every Sprint specification referenced by those Repair items
- relevant previous Sprint 27.1 repair/re-audit documentation

Inspect the CURRENT repository state before modifying code.

==================================================
PRE-FLIGHT
==================================================

Before editing:

1. Show current branch.
2. Show current commit.
3. Show git status.
4. Confirm working tree is clean or explain unrelated existing changes.
5. Resolve the exact canonical Repair IDs assigned to 27.1-G.
6. For each Repair ID, summarize:
   - priority
   - finding
   - root cause
   - affected Sprint(s)
   - affected files/components
   - acceptance criteria
   - dependencies
   - security-sensitive status
   - RC relevance
   - audit files to re-audit
   - manual tests blocked
7. Determine execution order inside 27.1-G.

Do not overwrite unrelated user changes.

==================================================
SCOPE LOCK
==================================================

Once the 27.1-G Repair IDs are resolved:

- lock the batch scope to exactly those Repair IDs
- do not add additional Repair IDs during implementation
- if a new defect is discovered, add/reference it in REPAIR_QUEUE.md but do not
  repair it unless it is strictly required to complete the canonical root-cause
  repair already in scope
- document any newly discovered dependency

If a Repair ID assigned to 27.1-G is already resolved by a previous change:

- do not modify product code unnecessarily
- perform the targeted re-audit
- update Repair Queue status/evidence
- preserve traceability

==================================================
BATCH ORDER / DEPENDENCIES
==================================================

Use canonical dependency information from REPAIR_QUEUE.md.

Execution rules:

1. dependencies first
2. shared/root-cause repair before surface-specific symptoms
3. security-sensitive repair before dependent UX repair
4. persistence/data-integrity repair before presentation repair
5. documentation-only follow-up after implementation stabilizes

If multiple Repair IDs share one root cause:

- implement the shared root-cause repair once
- map evidence to every affected Repair ID
- preserve every Repair ID for audit traceability
- do not duplicate code paths or tests unnecessarily

==================================================
GLOBAL ARCHITECTURE / SECURITY RULES
==================================================

Preserve all existing architectural/security boundaries:

- HA token backend-only
- SUPERVISOR_TOKEN backend-only
- Admin token separation
- no generic HA service proxy
- no arbitrary browser-supplied domain/service passthrough
- no generic WebSocket proxy
- no browser-to-HA WebSocket
- HA registry/config-entry/Area/label metadata read-only unless an explicit
  product requirement says otherwise
- explicit server-side write authorization
- entity/domain/action/payload validation for writes
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
- no Flexbox gap as a hard dependency
- no ResizeObserver
- no Container Queries
- no modern-only browser API as required path

Preserve deployment compatibility:

- Standalone/LXC
- Home Assistant App
- direct LAN access where required

==================================================
REPAIR EXECUTION – FOR EACH 27.1-G REPAIR ID
==================================================

For EACH canonical Repair ID assigned to 27.1-G:

1. Confirm the defect still exists.
2. Reproduce with automated/local evidence where practical.
3. Confirm the documented root cause still matches CURRENT code.
4. Implement the smallest correct root-cause repair.
5. Add/update regression tests where practical.
6. Run targeted tests.
7. Re-audit all linked requirements.
8. Update Repair Queue evidence/status.
9. Update linked Manual Test Queue entries.
10. Continue only if repository remains stable and secure.

Do NOT repair symptoms independently when one shared root cause explains them.

==================================================
REGRESSION PROTECTION
==================================================

This is a later Sprint 27.1 batch.

Explicitly assess whether 27.1-G changes can affect previously completed repair
batches.

At minimum review all previously completed Repair IDs recorded in
REPAIR_QUEUE.md as implemented/re-audited.

Do not hardcode status solely from this prompt; inspect the current queue.

If shared code is touched:

- run relevant regression tests for completed repairs
- do not reopen completed repairs unless an actual regression is found
- if an actual regression is found, STOP before commit and report it

==================================================
PUBLIC TEST RELEASE INTEGRITY
==================================================

A Public Test Release from Sprint 27.2 may already exist.

Do NOT:

- move its tag
- overwrite its tag
- rewrite its GitHub release
- silently reuse its version
- force-update its GHCR tag

If 27.1-G fixes behavior present in that Public Test Release:

- document that 27.1-G is newer than the published test release
- do not retag the existing release
- do not publish a new release in this run
- preserve release history

A later test release can be produced in a separate release sprint if desired.

==================================================
AUTOMATED / LOCAL TESTS
==================================================

For every Repair ID assigned to 27.1-G:

- run its directly relevant tests
- add/update regression coverage where practical
- run negative/security tests where applicable
- run persistence/data-loss tests where applicable
- run legacy frontend checks where applicable

Also run a bounded broader regression suite if practical.

Do NOT:

- contact production Home Assistant
- use production .env
- use real HA credentials
- use real SUPERVISOR_TOKEN
- execute production HAOS operations
- modify production LXC
- publish release artifacts

Local-only mocks may be used according to project policy.

Do not claim physical/runtime PASS from local mocks.

==================================================
TARGETED RE-AUDITS
==================================================

For each Repair ID:

Re-open every audit file listed under:

Audit Files To Re-Audit

For every linked requirement:

- compare CURRENT code against the original Sprint requirement
- update status honestly
- update evidence
- reference tests
- retain physical/manual requirements as NOT TESTED unless real evidence exists

Valid statuses:

PASS
PARTIAL
MISSING
BROKEN
NOT TESTED
N/A

Do NOT re-audit all Parts 01–19.

Only expand scope when a shared component directly affects another audited
requirement.

Document any expansion.

==================================================
REPAIR QUEUE UPDATE
==================================================

Update every Repair Queue item assigned to 27.1-G independently.

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
- security-sensitive status where relevant

Use existing repository status conventions.

Do NOT mark an item fully CLOSED if required physical/manual validation is still
pending unless the queue explicitly distinguishes:

IMPLEMENTATION COMPLETE
vs
MANUAL VALIDATION PENDING

==================================================
MANUAL TEST QUEUE UPDATE
==================================================

For tests linked to 27.1-G repairs:

- remove completed Repair IDs from "Blocked By Repairs" where appropriate
- keep Result = NOT TESTED
- preserve detailed steps
- preserve expected result
- preserve failure criteria
- do NOT execute physical tests

If a test is blocked by multiple repairs:

- remove only Repair IDs now resolved
- keep test blocked if another required repair remains OPEN

Do not falsely mark any manual test PASS.

==================================================
NEW FINDINGS
==================================================

If implementation/re-audit discovers a new actionable defect:

1. document it
2. add or map it to REPAIR_QUEUE.md
3. assign priority
4. include evidence
5. include RC relevance
6. include re-audit/manual-test implications

Do NOT automatically repair the new item unless it is strictly necessary for
the canonical 27.1-G repair already underway.

Do NOT silently expand batch scope.

==================================================
ACCEPTANCE GATE – 27.1-G
==================================================

Before commit verify ALL of the following:

- exact 27.1-G Repair IDs were resolved from canonical repository docs
- every in-scope Repair acceptance criterion is satisfied as far as automatable
- all relevant targeted tests pass
- targeted re-audits are complete
- no new PARTIAL/MISSING/BROKEN finding remains untracked
- no regression of previously completed Sprint 27.1 repairs
- no security regression
- no Legacy Safari/ES5 regression
- no Standalone regression
- no Home Assistant App regression
- no Public Test Release tag/history was modified
- linked manual tests are correctly blocked/unblocked
- git diff contains only intended 27.1-G changes

If any acceptance item fails:

- do NOT present 27.1-G as complete
- do NOT commit it as a successful repair batch
- report exact blocking Repair ID and reason
- do NOT start 27.1-H

==================================================
DOCUMENTATION UPDATES
==================================================

Update where appropriate:

- docs/audits/REPAIR_QUEUE.md
- docs/audits/MANUAL_TEST_QUEUE.md
- docs/audits/AUDIT_INDEX.md
- affected docs/audits/sprints/SPRINT-*-AUDIT.md
- docs/PROJECT_STATUS.md

Keep PROJECT_STATUS compact.

Record:

Sprint 27.1-G:
- Repair IDs
- status
- commit if completed
- manual validation pending where relevant

Do not claim:

- all manual acceptance complete
- final RC gate passed
- final release ready

==================================================
COMMIT & PUSH – BATCH 27.1-G
==================================================

If the 27.1-G acceptance gate passes:

Review:

git status
git diff --check
git diff

Stage ONLY:

- product changes required by canonical 27.1-G Repair IDs
- regression tests for those repairs
- required targeted audit/documentation updates

Do not stage unrelated changes.

Construct the commit message from the actual Repair IDs.

Preferred format:

git commit -m "fix(audit): repair <RQ-ID-1> <RQ-ID-2> ..."

If this becomes excessively long, use a concise batch message:

git commit -m "fix(audit): complete Sprint 27.1-G repair batch"

Push:

git push

If upstream is not configured:

git push -u origin <current-branch>

Do NOT force-push.

After push record:

- branch
- commit hash
- push result

==================================================
POST-COMMIT CONSISTENCY CHECK
==================================================

After push:

1. Confirm working tree is clean.
2. Confirm every 27.1-G Repair ID has accurate status.
3. Confirm linked audit files reference current evidence.
4. Confirm no manual test was falsely marked PASS.
5. Confirm resolved Repair IDs were removed from Blocked By Repairs only where appropriate.
6. Confirm no duplicate Repair IDs were created.
7. Confirm remaining Repair Queue priorities/order remain coherent.
8. Confirm Public Test Release tag/history remains untouched.
9. Determine the next canonical Repair Batch from current repository documentation.

Do NOT start the next batch automatically.

==================================================
FINAL REPORT
==================================================

At the end report:

1. starting commit
2. branch
3. exact Repair IDs resolved for 27.1-G
4. source used to resolve 27.1-G scope
5. dependency/execution order
6. any ambiguity encountered

For EACH Repair ID in 27.1-G report:

- Repair ID
- priority
- defect confirmed/reproduced
- root cause
- files changed
- implementation summary
- regression tests added/changed
- tests run
- test results
- audit files re-audited
- requirement status changes
- manual tests unblocked
- Repair Queue status
- remaining manual validation
- RC relevance after repair

Cross-cutting:

- regression status for previously completed repairs
- Public Test Release integrity check
- security findings
- Legacy Safari/iPad compatibility findings
- Standalone/LXC findings
- Home Assistant App findings
- 27.1-G acceptance gate result
- commit hash
- push result
- working tree clean: YES/NO
- remaining P0 repairs
- remaining P1 repairs
- remaining P2 repairs
- remaining P3 repairs
- next recommended Repair Batch
- whether Sprint 27.1 can continue

Do NOT start Sprint 27.1-H automatically.
```

## Git-Ablauf

Die konkreten Repair-IDs werden von Codex aus der aktuellen
`REPAIR_QUEUE.md` / `REPAIR_QUEUE_CONSOLIDATION.md` ermittelt.

```bash
git status
git diff --check
git diff

git add <nur Dateien des kanonischen 27.1-G-Batches und zugehörige Tests/Audit-Dokumentation>

git commit -m "fix(audit): complete Sprint 27.1-G repair batch"

git push
```

Falls der Branch noch keinen Upstream besitzt:

```bash
git push -u origin <current-branch>
```

Kein Force-Push:

```text
NO: git push --force
NO: git push --force-with-lease
```

## Scope-Regel

`27.1-G` darf ausschließlich die im aktuellen Repository für diesen Batch
vorgesehenen Repair-IDs bearbeiten.

Falls die Zuordnung nicht eindeutig dokumentiert ist, muss Codex **vor jeder
Produktänderung stoppen** und die noch offenen Kandidaten ausgeben, statt den
Scope zu erraten.
