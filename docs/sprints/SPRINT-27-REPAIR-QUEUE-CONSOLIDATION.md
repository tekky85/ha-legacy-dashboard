# Sprint 27 – Repair Queue Consolidation Pass

```text
Execute the Sprint 27 Repair Queue Consolidation Pass only.

This is NOT a product repair sprint.

The purpose of this pass is to consolidate, normalize, deduplicate, prioritize
and validate the complete repair backlog produced by Audit Parts 01–19.

Do NOT modify product code.

Do NOT execute manual iPad, HAOS, production Home Assistant or release tests.

Do NOT start Sprint 27.1 repairs in this run.

Read first:

- AGENTS.md
- docs/SPRINT_ROADMAP.md
- docs/PROJECT_STATUS.md
- docs/audits/AUDIT_INDEX.md
- docs/audits/REPAIR_QUEUE.md
- docs/audits/MANUAL_TEST_QUEUE.md
- every audit file under docs/audits/sprints/
- all Sprint specifications referenced by those audit files where needed

Inspect the actual repository documentation state first.

==================================================
GOAL
==================================================

Produce one authoritative, clean and complete repair backlog for Sprint 27.1.

The result must answer:

- What is actually broken or incomplete?
- Which findings are duplicates of the same root cause?
- Which findings are symptoms of one shared defect?
- Which repairs are RC blockers?
- Which repairs must be completed before manual test execution?
- Which repairs can be deferred?
- Which audit files must be re-audited after each repair?
- What repair order minimizes rework?

==================================================
SOURCE OF TRUTH
==================================================

The complete baseline audit consists of Parts 01–19.

Use the audit files as primary evidence.

Do NOT rely only on REPAIR_QUEUE.md.

Cross-check every audit file for:

PARTIAL
MISSING
BROKEN

findings.

Also inspect:

- NOT TESTED findings that actually represent missing implementation rather
  than only missing manual verification
- notes that describe actionable defects but may not yet have been added to
  REPAIR_QUEUE.md

Do not convert genuine manual-only NOT TESTED items into product repairs.

==================================================
STEP 1 – COMPLETE FINDING INVENTORY
==================================================

Build a complete inventory of every actionable finding from all audit files.

For each finding capture:

- source audit file
- Sprint
- requirement
- status
- finding text
- evidence
- affected files/components
- existing Repair ID if any
- RC relevance
- manual-test dependency if any

Do not lose historical references.

==================================================
STEP 2 – REPAIR QUEUE COVERAGE CHECK
==================================================

Compare the complete finding inventory against:

docs/audits/REPAIR_QUEUE.md

Every actionable:

PARTIAL
MISSING
BROKEN

finding must be represented by exactly one appropriate Repair ID, unless
multiple findings intentionally map to one shared root-cause repair.

Identify:

- missing Repair IDs
- duplicate Repair IDs
- stale Repair IDs
- Repair IDs with insufficient evidence
- Repair IDs with vague required-repair text
- findings mapped to the wrong Sprint
- findings mapped to the wrong priority

Do not silently delete history.

==================================================
STEP 3 – ROOT-CAUSE DEDUPLICATION
==================================================

Consolidate duplicate or symptom-level findings that share one real root cause.

Examples:

- same cache-version mismatch appearing in several audit parts
- same navigation helper defect affecting multiple pages
- same authorization defect affecting Grid/Focus/Room Card
- same persistence defect affecting several dashboard surfaces
- same documentation mismatch repeated across multiple audits

Where several findings share one root cause:

- keep one canonical Repair ID
- list all affected Sprints
- list all affected components
- retain all evidence references
- record all original finding references
- document which old Repair IDs were merged

Do NOT merge unrelated issues merely because they affect the same page.

==================================================
STEP 4 – REPAIR ID NORMALIZATION
==================================================

Ensure every canonical Repair item has a stable unique ID.

Preserve existing IDs where practical.

Only renumber when necessary to resolve collisions or malformed IDs.

If an ID changes:

- document old ID
- document new ID
- preserve traceability

Do not renumber the entire queue merely for aesthetics.

==================================================
STEP 5 – PRIORITY NORMALIZATION
==================================================

Normalize priorities using:

P0 – RC Blocker
P1 – must fix before RC
P2 – should fix before/around RC
P3 – may be deferred after RC

Use consistent criteria.

P0 examples:
- security boundary broken
- arbitrary HA service access
- credentials exposed
- data loss
- App cannot start/install
- critical controls fundamentally unsafe
- false healthy state masking critical system condition
- release artifact unsafe

P1 examples:
- major functional regression
- legacy iPad core flow broken
- theme/navigation/background/control behavior required for RC broken
- shared asset cache issue that can cause stale production behavior
- persistence failure
- critical layout/control regression

P2 examples:
- non-core functional defect
- documentation gap affecting usability
- moderate UX inconsistency
- recoverable edge case

P3 examples:
- polish
- optional improvement
- non-RC documentation refinement
- accepted low-risk limitation

Do not classify all findings P0/P1.

For every priority, include a short justification.

==================================================
STEP 6 – RC BLOCKER CLASSIFICATION
==================================================

Every Repair item must explicitly state:

RC Blocker:
YES / NO / CONDITIONAL

If CONDITIONAL, explain the condition.

Example:

RC Blocker: CONDITIONAL
Condition: only if reproduced on real iPad Mini during manual acceptance

Do not leave RC relevance vague.

==================================================
STEP 7 – DEPENDENCY MAPPING
==================================================

For every repair identify dependencies.

Examples:

- Repair B depends on Repair A
- Repair C should be done after shared authorization refactor
- manual test X should run only after repair Y
- Room Card repair depends on shared Sprint 26.2 control architecture
- screenshot/documentation update should happen after UI repair

Add fields:

Depends On:
Blocks:
Manual Tests Affected:
Audit Files To Re-Audit:

==================================================
STEP 8 – REPAIR ORDER
==================================================

Create a recommended execution order for Sprint 27.1.

Prefer this general strategy:

1. P0 security/data-integrity blockers
2. shared/root-cause architecture defects
3. P1 core functional defects
4. legacy iPad / navigation / cache / layout defects
5. persistence / HA App defects
6. documentation and screenshot defects
7. P2/P3 items as appropriate

Where one shared repair resolves multiple Sprint findings, execute it before
surface-specific fixes.

Avoid repair order that causes known rework.

==================================================
STEP 9 – REPAIR BATCHES
==================================================

Because of token/time limits, split Sprint 27.1 into manageable repair batches.

Prefer:

- one shared-root-cause repair per batch when large
- 2–4 small related repairs per batch
- fewer items for security-sensitive or architecture-heavy work

Create a proposed plan such as:

27.1-A
27.1-B
27.1-C
...

For each batch list:

- Repair IDs
- affected Sprints
- rationale
- expected files/components
- re-audit scope
- manual tests unlocked after completion

Do NOT execute the batches in this run.

==================================================
STEP 10 – MANUAL TEST DEPENDENCY CHECK
==================================================

Cross-check:

docs/audits/MANUAL_TEST_QUEUE.md

For each manual test determine:

- can run now
- blocked by Repair ID(s)
- should run only after all repairs
- unaffected

Do not execute tests.

Add or update a field such as:

Blocked By Repairs:
- R-...

If a manual test is vague or lacks required steps, fix the TEST DOCUMENTATION
only.

Every manual test must include:

- Test ID
- Sprint
- Requirement
- Device/System
- Preconditions
- exact steps
- expected result
- failure criteria
- evidence
- status/result

==================================================
STEP 11 – AUDIT RE-VALIDATION MAP
==================================================

For every canonical Repair item define which audit files must be revisited
after implementation.

Example:

Audit Files To Re-Audit:
- SPRINT-17.7-AUDIT.md
- SPRINT-25.1-AUDIT.md
- SPRINT-26.2-AUDIT.md

Do not require a full 01–19 re-audit after every repair.

Use targeted re-audits.

==================================================
STEP 12 – KNOWN CACHE-VERSION FINDING
==================================================

Explicitly verify the known shared-asset cache-version issue is present and
canonicalized.

Known historical evidence:

- index.html used v=51
- system.html used v=44

This issue may affect:

- theme persistence
- navigation helper
- Summary/Error behavior
- layout
- Focus
- Room Card
- controls
- legacy Safari cache consistency

Do NOT repair it in this consolidation pass.

Ensure:

- exactly one canonical Repair ID exists for this root cause
- all affected audit references are attached
- priority is justified
- RC relevance is explicit
- re-audit targets are listed
- relevant manual iPad tests are linked

==================================================
STEP 13 – SECURITY REPAIR REVIEW
==================================================

Identify all Repair items touching:

- HA token exposure
- SUPERVISOR_TOKEN exposure
- Admin auth
- generic service proxy
- generic WebSocket proxy
- arbitrary service/domain passthrough
- write authorization
- registry/Area/label writes
- upload validation
- path traversal
- DATA_DIR exposure
- open redirect
- release secret leakage

Flag these repairs as Security-Sensitive.

For each such item include:

Security Sensitive:
YES

and required security regression tests.

Do NOT implement the repair.

==================================================
STEP 14 – DOCUMENTATION / SCREENSHOT REPAIR REVIEW
==================================================

Separate pure documentation findings from product-code findings.

Where documentation depends on UI repair:

- mark it dependent
- schedule it after UI repair

Do not refresh screenshots before final UI state is stable.

==================================================
CANONICAL REPAIR ITEM FORMAT
==================================================

Normalize every Repair item to a structure similar to:

## R-XXX – Short title

Status:
OPEN

Priority:
P0 / P1 / P2 / P3

RC Blocker:
YES / NO / CONDITIONAL

Security Sensitive:
YES / NO

Affected Sprints:
- ...

Affected Components:
- ...

Original Findings:
- audit file / requirement / status

Evidence:
- file/function/test/reference

Root Cause:
...

Required Repair:
...

Acceptance Criteria:
- ...
- ...

Depends On:
- ...

Blocks:
- ...

Manual Tests Affected:
- ...

Audit Files To Re-Audit:
- ...

Repair Batch:
27.1-X

Notes:
...

Preserve existing useful fields where the repository already has an established
format.

Do not force cosmetic restructuring if it would destroy history.

==================================================
REPAIR QUEUE SUMMARY
==================================================

At the top of docs/audits/REPAIR_QUEUE.md create/update a summary containing:

Total canonical repairs:
P0:
P1:
P2:
P3:

RC Blockers:
Security-sensitive repairs:
Repairs blocking manual tests:
Repairs with dependencies:

Status:
READY FOR SPRINT 27.1 / NOT READY

==================================================
CREATE CONSOLIDATION REPORT
==================================================

Create:

docs/audits/REPAIR_QUEUE_CONSOLIDATION.md

It must contain:

1. consolidation date
2. repository commit reviewed
3. audit coverage: Parts 01–19
4. total actionable findings discovered
5. total canonical Repair items after deduplication
6. merged duplicate items
7. newly created missing Repair items
8. stale/invalid items corrected
9. P0/P1/P2/P3 counts
10. RC blocker list
11. security-sensitive repair list
12. dependency graph / ordered list
13. proposed Sprint 27.1 repair batches
14. manual tests blocked by repairs
15. targeted re-audit map
16. known deferred P3 items
17. unresolved ambiguities
18. readiness decision for Sprint 27.1

==================================================
UPDATE AUDIT INDEX
==================================================

Update:

docs/audits/AUDIT_INDEX.md

Add a Sprint 27 baseline completion/consolidation section if appropriate.

Record:

- Parts 01–19 complete
- Repair Queue Consolidation status
- next phase = Sprint 27.1
- manual tests still pending
- final RC gate not yet executed

Do NOT mark RC ready merely because consolidation is complete.

==================================================
PROJECT STATUS
==================================================

Update docs/PROJECT_STATUS.md only if the existing project convention expects
audit-phase status there.

Keep it compact.

Do not duplicate the entire Repair Queue.

Recommended status concept:

Sprint 27 baseline audit: COMPLETE
Repair Queue Consolidation: COMPLETE
Sprint 27.1 repairs: NOT STARTED
Manual acceptance: PENDING
RC Gate: PENDING

==================================================
NO PRODUCT CHANGES
==================================================

Do NOT modify:

- application runtime code
- frontend code
- backend code
- Docker behavior
- Home Assistant App config
- release workflow

unless required only to fix broken audit-document references, and even then
prefer documentation-only changes.

This pass is documentation/backlog consolidation only.

==================================================
FINAL REPORT
==================================================

At the end report:

1. repository commit reviewed
2. number of audit files inspected
3. total actionable findings found
4. canonical Repair item count
5. P0 count
6. P1 count
7. P2 count
8. P3 count
9. RC blocker count
10. security-sensitive repair count
11. missing Repair items added
12. duplicate Repair items merged
13. stale Repair items corrected
14. exact canonical Repair ID for shared asset/cache-version mismatch
15. repairs blocking manual iPad tests
16. repairs blocking HAOS/runtime tests
17. proposed Sprint 27.1 repair batches
18. repair execution order
19. targeted re-audit map
20. manual test queue changes
21. files changed
22. whether REPAIR_QUEUE.md is now authoritative and complete
23. whether project is READY FOR SPRINT 27.1
24. recommended next action
25. recommended documentation commit message

Do NOT start Sprint 27.1.

Do NOT execute repairs.

Do NOT execute manual tests.

Do NOT publish a Release Candidate.

Do NOT commit or push until I review the result.
```
