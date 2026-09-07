# Sprint 27 – Audit Part 07 Codex Prompt

```text
Execute Sprint 27 Audit Part 07 only.

Use the persistent Sprint 27 audit framework already present in the repository.

Read first:

- AGENTS.md
- docs/SPRINT_ROADMAP.md
- docs/PROJECT_STATUS.md
- docs/audits/AUDIT_INDEX.md
- docs/audits/REPAIR_QUEUE.md
- docs/audits/MANUAL_TEST_QUEUE.md
- all existing audit files from Parts 01–06
- all sprint specification files assigned to Audit Part 07 in AUDIT_INDEX.md

Inspect the actual repository state first.

IMPORTANT:

The exact Sprint scope for Part 07 is defined in:

docs/audits/AUDIT_INDEX.md

Use that definition as authoritative.

Do NOT silently expand the scope.

Do NOT start Part 08.

Do NOT perform broad repair work during this baseline audit.

For every Sprint assigned to Part 07:

1. Read the complete Sprint specification.
2. Compare every requirement against the CURRENT repository implementation.
3. Verify source code, configuration, persistence, routes, frontend behavior
   and tests where relevant.
4. Do not rely only on PROJECT_STATUS or previous Codex summaries.

Classify individual requirements only as:

PASS
PARTIAL
MISSING
BROKEN
NOT TESTED
N/A

For the overall Sprint result use:

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

PART 07 FOCUS:

Part 07 belongs to the Sprint 18–20 / D1 phase according to the current
Sprint 27 Audit Part plan.

However, the authoritative scope remains the exact mapping in
docs/audits/AUDIT_INDEX.md.

Audit only the Sprint IDs assigned there.

Where relevant, inspect the foundation for:

- System Dashboard structure
- Summary Dashboard foundation
- Error Dashboard foundation
- route separation
- dashboard/system page separation
- data normalization
- system page rendering
- shared frontend assets
- shared theme behavior
- shared navigation behavior
- backend read-only system endpoints
- severity/state presentation
- entity/device issue rendering
- error/summary page layout
- D1 documentation and screenshot baseline, if assigned to this part

SYSTEM DASHBOARD ARCHITECTURE:

Where applicable verify:

- system dashboards remain part of the external HA Legacy Dashboard
- they are NOT converted into Lovelace/custom-panel functionality
- browser does not receive HA credentials
- system pages use the existing gateway architecture
- read-only system/diagnostic data stays read-only
- displaying an entity does not grant write permissions
- system visibility does not bypass normal write authorization
- no generic HA service proxy is introduced

SHARED ASSET / CACHE VERSION AUDIT:

Part 04 already identified a concrete issue:

- index.html uses shared asset cache version v=51
- system.html uses shared asset cache version v=44

This finding MUST remain in the repair history / REPAIR_QUEUE.

Do NOT repair it in Part 07.

During Part 07:

- inspect whether any additional HTML entry points use shared assets
- identify all cache-busting/version references for shared CSS/JS
- verify whether Admin, Dashboard, Summary, Errors or other entry points
  use divergent version numbers
- document additional inconsistencies as PARTIAL/BROKEN where appropriate
- link them to the existing shared-cache repair item where they are the same
  root cause
- do not create unnecessary duplicate repair items

If the current implementation already has a centralized version mechanism,
document the evidence and explain why the Part 04 finding is still valid or
has been superseded.

Do not silently remove the previous finding.

SUMMARY / ERROR DATA FLOW:

Where applicable trace:

Home Assistant / gateway data
-> normalization
-> system issue model
-> API response
-> system page renderer
-> filter / grouping / severity presentation

Verify that the current implementation preserves the intended semantics.

Where later 21.x Sprints expanded or replaced logic, document that cleanly
instead of treating missing historical code as a failure.

LEGACY COMPATIBILITY:

For system page frontend code, where applicable verify that the current
implementation does not require:

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

Audit relevant CSS/JS paths used specifically by system pages.

THEME / NAVIGATION:

Where applicable verify:

- Light/Dark behavior
- shared theme application
- theme persistence architecture
- Summary/Error navigation
- return/back navigation
- current route handling
- safe same-origin internal navigation
- no target=_blank for internal system navigation
- no window.open() for internal routes

If a later Sprint, especially 21.5 / 25.1 / 25.2, superseded the original
implementation, document the current replacement.

Do not audit those later Sprints in full.

D1 DOCUMENTATION / SCREENSHOT BASELINE:

If D1 is assigned to Part 07, verify:

- README.de.md and README.en.md semantic synchronization
- screenshots are from the real application or controlled real app instance
- no generated mockups are presented as product screenshots
- screenshot references resolve
- screenshots reflect the current visible UI where the documented requirement
  still applies
- documentation does not claim unverified runtime behavior as confirmed

If D1 is assigned to Part 08 instead, do not audit it here.

IMPORTANT MANUAL TEST POLICY:

No physical iPad mini tests are being performed during Audit Part 07.

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
- related Sprint
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

"Check Summary dashboard on iPad."

Instead specify:

- exact route
- expected header
- expected sections/cards/issues
- expected navigation behavior
- expected theme state
- expected scrolling/layout
- portrait/landscape if required
- precise failure criteria

Where multiple related tests can safely be combined into one physical session,
combine them to reduce manual effort.

Do NOT combine tests when doing so makes failure attribution unclear.

REPAIR QUEUE:

Any actionable:

PARTIAL
MISSING
BROKEN

finding goes into:

docs/audits/REPAIR_QUEUE.md

Do not repair it during this run unless only a trivial audit-document
correction is required.

NEW REPAIR QUEUE REQUIREMENT:

Every NEW repair item added from Part 07 must have:

- Repair ID
- Sprint
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

Do not arbitrarily classify all findings as P0/P1.

Base priority on:

- security impact
- functional impact
- data integrity
- legacy iPad impact
- release correctness
- reproducibility
- availability of workaround

For an existing repair item discovered in an earlier Part:

- do not duplicate it
- append additional evidence if Part 07 provides new evidence
- preserve the original finding history

The known shared-asset cache version mismatch from Part 04 must remain tracked
and should normally be treated as at least P1 unless repository evidence shows
a different justified priority.

REPAIR CONSISTENCY CHECK:

Before finishing Part 07, compare:

- new PARTIAL findings
- new MISSING findings
- new BROKEN findings

against docs/audits/REPAIR_QUEUE.md.

Confirm that every actionable finding is either:

- represented by an existing Repair ID
or
- added as a new Repair ID

Do not leave actionable findings untracked.

AUDIT FILES:

Create/update the individual audit files for every Sprint assigned to Part 07:

docs/audits/sprints/SPRINT-<ID>-AUDIT.md

Do not overwrite or remove audit history from Parts 01–06.

Update:

docs/audits/AUDIT_INDEX.md
docs/audits/REPAIR_QUEUE.md
docs/audits/MANUAL_TEST_QUEUE.md

Run relevant automated tests for Part 07.

Where existing tests cover system dashboard data flow, rendering, filters,
navigation, theme behavior or API responses, reference them explicitly as
Evidence.

If a bounded full regression suite is practical, run it as additional evidence.

Do not mark CSS/layout behavior PASS based solely on automated tests if the
Sprint explicitly requires real-device validation.

SECURITY:

Where relevant verify:

- HA token backend-only
- SUPERVISOR_TOKEN backend-only
- Admin security
- no generic HA service proxy
- no arbitrary browser-supplied HA domain/service calls
- registry/config-entry/diagnostic functionality remains read-only
- browser-to-HA WebSocket is not introduced
- secret redaction
- input validation
- safe route handling

STANDALONE / HA APP:

Where system dashboard code is shared across deployment modes, verify that
the implementation is not accidentally tied only to Standalone or only to
HA App mode.

Do not fully audit Sprint 24 App packaging in this part.

Document deployment-specific dependencies if discovered.

At the end report:

1. repository commit audited
2. exact Sprint IDs included in Part 07
3. overall result for each audited Sprint
4. PASS findings
5. PARTIAL findings
6. MISSING findings
7. BROKEN findings
8. NOT TESTED requirements
9. superseded requirements and replacement Sprints
10. source/test evidence
11. automated tests run and results
12. manual tests added
13. for each new manual test: Test ID + short description
14. confirmation that every new manual test includes complete step-by-step
    instructions, expected results and failure criteria
15. repair items added
16. for EACH new Repair Queue item report:
    - Repair ID
    - Sprint
    - Priority
    - Finding
17. existing Repair Queue items that received additional evidence
18. explicit status of the Part 04 shared-asset cache-version finding
19. system dashboard architecture findings
20. Summary/Error data-flow findings
21. shared asset/cache findings
22. theme/navigation findings
23. D1 findings if D1 is in Part 07
24. Legacy Safari / iPad findings
25. security findings
26. Standalone/LXC relevance
27. Home Assistant App relevance
28. whether Audit Part 07 is COMPLETE
29. exact scope planned for Part 08 according to AUDIT_INDEX.md
30. recommended audit-doc commit message

Do NOT start Part 08.

Do NOT perform repair work from REPAIR_QUEUE.md.

Do NOT perform physical iPad mini tests in this run.

Do NOT commit or push until I review the result.
```
