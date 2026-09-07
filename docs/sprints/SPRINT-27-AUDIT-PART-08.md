# Sprint 27 – Audit Part 08 Codex Prompt

```text
Execute Sprint 27 Audit Part 08 only.

Use the persistent Sprint 27 audit framework already present in the repository.

Read first:

- AGENTS.md
- docs/SPRINT_ROADMAP.md
- docs/PROJECT_STATUS.md
- docs/audits/AUDIT_INDEX.md
- docs/audits/REPAIR_QUEUE.md
- docs/audits/MANUAL_TEST_QUEUE.md
- all existing audit files from Parts 01–07
- all sprint specification files assigned to Audit Part 08 in AUDIT_INDEX.md

Inspect the actual repository state first.

IMPORTANT:

The exact Sprint scope for Part 08 is defined in:

docs/audits/AUDIT_INDEX.md

Use that definition as authoritative.

Do NOT silently expand the scope.

Do NOT start Part 09.

Do NOT perform broad repair work during this baseline audit.

For every Sprint or documentation item assigned to Part 08:

1. Read the complete specification.
2. Compare every requirement against the CURRENT repository implementation.
3. Verify source code, configuration, persistence, routes, frontend behavior,
   documentation and tests where relevant.
4. Do not rely only on PROJECT_STATUS or previous Codex summaries.

Classify individual requirements only as:

PASS
PARTIAL
MISSING
BROKEN
NOT TESTED
N/A

For the overall Sprint/result use:

PASS
PARTIAL
FAIL
BLOCKED
NOT TESTED

Every PASS/PARTIAL/BROKEN result should include concrete evidence where
practical:

- source file
- function
- renderer
- CSS class
- route
- configuration field
- persistence implementation
- test file / test name
- documentation path
- screenshot path
- manual-test reference

SUPERSEDED REQUIREMENTS:

If a later Sprint intentionally replaced an earlier implementation, do not
mark the earlier requirement BROKEN merely because the old code no longer
exists.

Instead document:

- which later Sprint superseded it
- where the current implementation now lives
- whether the original intended end-state is still satisfied

Use where appropriate:

PASS – superseded by Sprint X

or:

N/A – replaced by Sprint X

Do not use "superseded" to hide a current regression.

If the current implementation no longer satisfies the intended end-state,
classify it honestly as PARTIAL or BROKEN.

PART 08 FOCUS:

Part 08 belongs to the Sprint 18–20 / D1 audit phase according to the current
Sprint 27 Audit Part plan.

However, the authoritative scope remains the exact mapping in:

docs/audits/AUDIT_INDEX.md

Audit only the Sprint IDs / D1 item assigned there.

Where relevant, focus on:

- completion of System Dashboard foundation
- Summary Dashboard MVP
- Error Dashboard MVP
- system page layout
- system data rendering
- issue grouping
- severity presentation
- status presentation
- empty/loading/error states
- navigation
- theme consistency
- shared frontend assets
- read-only diagnostic boundaries
- D1 bilingual documentation and screenshot baseline if assigned here

SYSTEM PAGE END-STATE:

Where applicable verify the current implementation of:

- /system/summary
- /system/errors
- supporting API endpoints
- shared system page renderer
- issue normalization
- issue list/group rendering
- loading state
- empty state
- API error state
- stale/unknown presentation where relevant

Trace the data flow where applicable:

Home Assistant / Gateway
-> normalized state / issue model
-> backend endpoint
-> browser response
-> filter/group/render path
-> visible Summary/Error state

Document where later Sprint 21.x work replaced or extended this logic.

Do not audit Sprint 21.x in full during Part 08.

ERROR DASHBOARD:

Where relevant verify the original Error Dashboard end-state including:

- issue visibility
- severity labels
- error/warning/info distinctions where specified
- unknown/unavailable handling where specified
- grouping behavior present at the audited stage
- stable rendering with no issues
- stable rendering with multiple issues
- backend/API failure behavior
- navigation back to normal dashboard/system page

If later 21.x Sprints intentionally replaced filtering/grouping semantics,
document the superseding Sprint and verify the current end-state does not
violate the original safety intent.

SUMMARY DASHBOARD:

Where relevant verify:

- active/current items are surfaced according to the Sprint specification
- system summary does not silently grant control permissions
- dynamic state presentation remains read-only unless a later explicit
  authorized control feature applies
- no generic write path was introduced through Summary rendering
- empty/healthy states are handled correctly
- stale/unknown data is not falsely presented as healthy if the Sprint
  specification requires explicit handling

SHARED ASSET / CACHE VERSION FOLLOW-UP:

A previous audit found shared cache-version inconsistency, including:

- index.html: v=51
- system.html: v=44

This finding must remain tracked in docs/audits/REPAIR_QUEUE.md.

Do NOT repair it during Part 08.

During this audit:

- inspect all HTML entry points relevant to Part 08
- identify shared JS/CSS asset version parameters
- compare Dashboard, System, Admin and other relevant entry points
- append evidence to the existing Repair ID if this is the same root cause
- do NOT create duplicate Repair IDs for the same cache-version problem
- note whether Summary/Error pages are directly affected

If another independent cache/version problem exists, create a separate Repair ID.

THEME CONSISTENCY:

Where relevant verify current shared theme behavior across:

- normal dashboard
- Summary
- Errors

Audit:

- initial theme application
- persisted theme preference
- refresh behavior
- navigation behavior
- class/attribute naming
- shared theme storage/helper use

If later Sprint 25.1 replaced the original persistence implementation, document
that relationship rather than treating historical code removal as failure.

Do not audit Sprint 25.1 in full.

NAVIGATION:

Where applicable verify:

- internal Summary/Error links are same-origin
- no unnecessary target=_blank
- no window.open() for internal navigation
- safe return/back target
- no external/open redirect path introduced
- normal dashboard can reach system pages as specified
- system pages can return safely

If later 21.5/25.2 work superseded the original navigation implementation,
document it.

LEGACY COMPATIBILITY:

For all frontend code in Part 08 scope verify where applicable that current
runtime code does not require:

- fetch
- Promise
- arrow functions
- let / const
- async/await
- optional chaining
- nullish coalescing
- CSS Grid
- Flexbox gap as a hard dependency
- ResizeObserver
- Container Queries
- modern-only event APIs

Where Flexbox is used, inspect legacy WebKit fallbacks/prefixes if the Sprint
specification requires them.

D1 DOCUMENTATION / SCREENSHOT BASELINE:

If D1 is assigned to Part 08, audit it fully.

Verify:

README files:
- README.md if applicable
- README.de.md
- README.en.md

Check:

- German and English documentation are semantically synchronized
- architecture describes HA Legacy Dashboard as an EXTERNAL application
- documentation does not imply Lovelace/custom-panel architecture
- installation/deployment statements match current supported behavior
- security statements match current implementation
- documented routes resolve
- configuration examples use current keys
- no obsolete instructions are presented as current
- screenshots referenced by README/docs exist
- screenshot links resolve
- screenshot captions/descriptions match the current UI
- screenshots are from the real running application or a controlled real
  application instance
- generated mockups are not presented as product screenshots
- screenshots do not expose secrets/tokens
- screenshots do not contain misleading obsolete UI if they are claimed as
  current product screenshots

If documentation is outdated because later Sprints changed the UI, classify the
affected D1 requirement honestly as PARTIAL/BROKEN and add a Repair Queue item
where actionable.

Do not regenerate screenshots during this baseline audit unless only fixing an
invalid documentation reference is explicitly trivial.

SCREENSHOT MANUAL TESTS:

If final screenshot refresh requires real-device screenshots or confirmation,
queue the work in MANUAL_TEST_QUEUE.md with exact instructions.

Do not mark screenshot/device verification PASS merely because an image file
exists.

IMPORTANT MANUAL TEST POLICY:

No physical iPad mini tests are being performed during Audit Part 08.

All real iPad mini / iOS 9 tests will be executed only after ALL Audit Parts
have completed.

Therefore:

- do NOT mark real-device requirements PASS without existing documented evidence
- classify them as NOT TESTED where appropriate
- add every required real-device check to:

docs/audits/MANUAL_TEST_QUEUE.md

For EVERY queued manual test, create a complete test instruction.

Each manual test entry must contain:

- Test ID
- related Sprint/D1
- Requirement
- Device
- Preconditions
- exact route/page
- required dashboard/data/entity/state
- orientation if relevant
- exact step-by-step actions
- expected visual result
- expected functional result
- failure criteria
- evidence to capture
- result field

Use a structure such as:

## TEST-IPAD-XXX

Sprint:
Requirement:
Device:
Preconditions:

### Steps
1.
2.
3.

### Expected Result
- ...
- ...

### Fail If
- ...
- ...

### Evidence
- screenshot / photo / observed behavior

### Result
NOT TESTED

The instructions must be detailed enough that the user can execute the test
later without needing to infer what "correct" means.

Do NOT add vague tests such as:

"Check Errors page on iPad."

Instead specify:

- exact route
- test data/state required
- expected issue count/grouping
- expected severity/state label
- expected theme
- expected navigation
- expected scrolling/layout
- portrait/landscape if relevant
- precise failure criteria

Where multiple related checks can safely be combined into one physical session,
combine them to reduce manual effort.

Do NOT combine tests if failure attribution would become unclear.

REPAIR QUEUE:

Any actionable:

PARTIAL
MISSING
BROKEN

finding must be represented in:

docs/audits/REPAIR_QUEUE.md

Every NEW repair item added from Part 08 must contain:

- Repair ID
- Sprint / D1
- Priority
- Finding
- Evidence
- Required Repair
- RC relevance

Use priorities:

P0 – RC Blocker
P1 – must fix before RC
P2 – should fix before/around RC
P3 – may be deferred after RC

Base priority on actual impact:

- security
- functional correctness
- data integrity
- legacy iPad impact
- HA App / Standalone availability
- release correctness
- reproducibility
- workaround availability

Do not classify every issue P0/P1.

EXISTING REPAIR ITEMS:

Do not duplicate existing Repair IDs.

If Part 08 adds evidence to an existing issue:

- preserve the original Repair ID
- append the new evidence
- reference the additional affected Sprint/page
- preserve finding history

Specifically keep the shared-asset cache-version finding from Part 04 tracked.

REPAIR CONSISTENCY CHECK:

Before finishing Part 08 compare all new:

- PARTIAL
- MISSING
- BROKEN

findings against REPAIR_QUEUE.md.

Every actionable finding must be:

- linked to an existing Repair ID
or
- added as a new Repair ID

No actionable finding may remain untracked.

AUDIT FILES:

Create/update the individual audit files for every Sprint/D1 item assigned to
Part 08.

For Sprint items use:

docs/audits/sprints/SPRINT-<ID>-AUDIT.md

For D1, use the existing audit naming convention already established in
AUDIT_INDEX.md. If no D1 audit filename has yet been defined, create:

docs/audits/sprints/D1-AUDIT.md

Do not rename existing audit files unnecessarily.

Do not overwrite or remove audit history from Parts 01–07.

Update:

docs/audits/AUDIT_INDEX.md
docs/audits/REPAIR_QUEUE.md
docs/audits/MANUAL_TEST_QUEUE.md

Run relevant automated tests for Part 08.

Where tests cover:

- Summary API
- Error API
- system rendering
- issue normalization
- empty/error states
- theme
- navigation
- security boundaries

reference them explicitly as Evidence.

If a bounded full regression suite is practical, run it as additional evidence.

Do not mark real iPad layout behavior PASS based solely on automated tests.

SECURITY:

Where relevant verify:

- HA token backend-only
- SUPERVISOR_TOKEN backend-only
- Admin token separation
- no generic HA service proxy
- no arbitrary browser-supplied HA service execution
- system visibility does not imply write authorization
- diagnostic/system endpoints are read-only where specified
- browser-to-HA WebSocket is not introduced
- secret redaction
- input validation
- route validation
- safe navigation/return-target handling

STANDALONE / HA APP:

Where relevant verify that Part 08 functionality uses shared application
architecture and is not accidentally broken in one deployment mode.

Do not fully audit Sprint 24 App packaging here.

Document any discovered dependency requiring later Sprint 24/25 audit.

At the end report:

1. repository commit audited
2. exact Sprint/D1 items included in Part 08
3. overall result for each audited item
4. PASS findings
5. PARTIAL findings
6. MISSING findings
7. BROKEN findings
8. NOT TESTED requirements
9. superseded requirements and replacement Sprints
10. source/test/documentation evidence
11. automated tests run and results
12. manual tests added
13. for each new manual test: Test ID + short description
14. confirmation that every new manual test contains complete step-by-step
    instructions, expected results and failure criteria
15. repair items added
16. for EACH new Repair Queue item report:
    - Repair ID
    - Sprint/D1
    - Priority
    - Finding
17. existing Repair Queue items receiving additional evidence
18. explicit status of the Part 04 shared-asset cache-version finding
19. Summary Dashboard findings
20. Error Dashboard findings
21. system data-flow findings
22. shared asset/cache findings
23. theme/navigation findings
24. D1 documentation findings if D1 is in Part 08
25. screenshot/documentation findings
26. Legacy Safari / iPad findings
27. security findings
28. Standalone/LXC relevance
29. Home Assistant App relevance
30. whether Audit Part 08 is COMPLETE
31. exact scope planned for Part 09 according to AUDIT_INDEX.md
32. recommended audit-doc commit message

Do NOT start Part 09.

Do NOT perform repair work from REPAIR_QUEUE.md.

Do NOT perform physical iPad mini tests in this run.

Do NOT commit or push until I review the result.
```
