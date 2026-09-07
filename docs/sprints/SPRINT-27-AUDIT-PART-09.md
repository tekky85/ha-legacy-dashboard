# Sprint 27 – Audit Part 09 Codex Prompt

```text
Execute Sprint 27 Audit Part 09 only.

Use the persistent Sprint 27 audit framework already present in the repository.

Read first:

- AGENTS.md
- docs/SPRINT_ROADMAP.md
- docs/PROJECT_STATUS.md
- docs/audits/AUDIT_INDEX.md
- docs/audits/REPAIR_QUEUE.md
- docs/audits/MANUAL_TEST_QUEUE.md
- all existing audit files from Parts 01–08
- all sprint specification files assigned to Audit Part 09 in AUDIT_INDEX.md

Inspect the actual repository state first.

IMPORTANT:

The exact Sprint scope for Part 09 is defined in:

docs/audits/AUDIT_INDEX.md

Use that definition as authoritative.

Do NOT silently expand the scope.

Do NOT start Part 10.

Do NOT perform broad repair work during this baseline audit.

For every Sprint assigned to Part 09:

1. Read the complete Sprint specification.
2. Compare every requirement against the CURRENT repository implementation.
3. Verify source code, configuration, persistence, routes, frontend behavior,
   data flow and tests where relevant.
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

PART 09 FOCUS:

Part 09 belongs to the Sprint 21 / 21.x audit phase according to the current
Sprint 27 Audit Part plan.

However, the authoritative scope remains the exact mapping in:

docs/audits/AUDIT_INDEX.md

Audit only the Sprint IDs assigned there.

Where relevant, focus on:

- registry and diagnostic enrichment
- Home Assistant entity/device/area metadata
- read-only registry/config-entry metadata
- device grouping
- issue enrichment
- diagnostic/risk metadata
- system dashboard data model evolution
- Summary/Error presentation dependencies
- backend normalization/enrichment
- server-side Home Assistant WebSocket metadata access where specified
- read-only boundaries
- stale/missing metadata handling

REGISTRY / METADATA ARCHITECTURE:

Where applicable verify the intended architecture:

Home Assistant
-> server-side REST / WebSocket metadata acquisition
-> normalization / enrichment
-> gateway API
-> browser rendering

Verify that the browser does NOT connect directly to the Home Assistant
WebSocket for registry metadata.

Audit, where applicable:

- entity registry metadata
- device registry metadata
- area metadata
- config-entry metadata
- labels if relevant to the assigned Sprint
- diagnostic metadata
- source-of-truth identifiers

Confirm grouping uses stable IDs where required rather than friendly names.

DEVICE GROUPING:

Where applicable verify:

- grouping by real device_id
- entities without device_id are not falsely grouped by display name
- child issue state remains traceable
- group severity is derived according to the relevant Sprint semantics
- original child issue data is not lost
- group rendering survives missing/incomplete registry metadata
- no accidental cross-device grouping
- deterministic ordering where specified

REGISTRY FAILURE / STALE DATA:

Where relevant inspect behavior when:

- registry metadata is unavailable
- Home Assistant WebSocket cannot connect
- connection drops
- metadata is partial
- entity exists but device registry entry does not
- device exists without area
- stale metadata remains cached

Verify the implementation does not silently downgrade safety/security severity
because metadata could not be obtained.

If later Sprint 21.x work refined this behavior, document the superseding
implementation.

READ-ONLY SECURITY BOUNDARY:

Registry/config-entry/diagnostic functionality in this phase must remain
read-only unless a later explicitly authorized feature says otherwise.

Verify where applicable:

- no registry write endpoint
- no device registry modification
- no entity registry modification
- no area write
- no config-entry mutation
- no repairs mutation
- no label write
- no generic WebSocket proxy
- no arbitrary WebSocket command passthrough from browser
- browser does not receive SUPERVISOR_TOKEN
- browser does not receive HA long-lived token

If shared WebSocket infrastructure exists, inspect that it exposes only
specific normalized data required by the application.

SYSTEM DASHBOARD DATA FLOW:

Where relevant trace:

HA state/registry metadata
-> enrichment
-> issue/risk model
-> grouping
-> Summary/Error API
-> browser rendering

Verify that the resulting output is deterministic and that missing metadata
does not crash rendering.

RISK / SEVERITY INTERACTION:

Where Part 09 scope touches risk or severity enrichment, verify:

- metadata adds context but does not silently alter unrelated severity logic
- device_class handling is deterministic
- security/safety classes are handled according to the Sprint specification
- unknown/unavailable remains distinguishable
- later 21.x rule refinements are documented as superseding where appropriate

Do not fully audit later Sprint 21.x items that belong to Part 10/11.

LEGACY FRONTEND COMPATIBILITY:

For frontend paths touched by Part 09, verify where applicable that current
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

SHARED ASSET / CACHE VERSION FOLLOW-UP:

The previously identified shared-cache inconsistency must remain tracked.

Known evidence included:

- index.html: v=51
- system.html: v=44

Do NOT repair it in Part 09.

If Part 09 inspection reveals additional affected entry points or shared
registry/system JS assets:

- append evidence to the existing Repair ID if same root cause
- do not duplicate Repair IDs
- document whether stale caching could affect registry/diagnostic rendering

IMPORTANT MANUAL TEST POLICY:

No physical iPad mini tests are being performed during Audit Part 09.

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
- required Home Assistant state/data
- required device/entity setup
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

Do NOT add vague tests such as:

"Check device grouping on iPad."

Instead specify:

- exact route
- exact entities/device relationship required
- whether entities share a real device_id
- expected group count
- expected child issue count
- expected severity/status label
- expected navigation/expansion behavior
- portrait/landscape if relevant
- precise failure criteria

Where multiple related checks can safely be combined into one physical session,
combine them to reduce manual effort.

Do NOT combine tests if failure attribution becomes unclear.

REPAIR QUEUE:

Any actionable:

PARTIAL
MISSING
BROKEN

finding must be represented in:

docs/audits/REPAIR_QUEUE.md

Every NEW repair item added from Part 09 must contain:

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

Base priority on actual impact:

- security
- functional correctness
- incorrect device grouping
- incorrect risk/severity classification
- metadata loss
- legacy iPad impact
- release correctness
- workaround availability

Do not classify every issue P0/P1.

EXISTING REPAIR ITEMS:

Do not duplicate existing Repair IDs.

If Part 09 adds evidence to an existing issue:

- preserve the Repair ID
- append evidence
- reference additional affected Sprint/component
- preserve finding history

REPAIR CONSISTENCY CHECK:

Before finishing Part 09 compare all new:

- PARTIAL
- MISSING
- BROKEN

findings against REPAIR_QUEUE.md.

Every actionable finding must either:

- reference an existing Repair ID
or
- create a new Repair ID

No actionable finding may remain untracked.

AUDIT FILES:

Create/update the individual audit files for every Sprint assigned to Part 09:

docs/audits/sprints/SPRINT-<ID>-AUDIT.md

Do not overwrite or remove audit history from Parts 01–08.

Update:

docs/audits/AUDIT_INDEX.md
docs/audits/REPAIR_QUEUE.md
docs/audits/MANUAL_TEST_QUEUE.md

Run relevant automated tests for Part 09.

Where tests cover:

- registry enrichment
- metadata normalization
- device grouping
- area mapping
- config-entry metadata
- WebSocket reconnect/error handling
- system API output
- security/read-only boundaries

reference them explicitly as Evidence.

If a bounded full regression suite is practical, run it as additional evidence.

Do not mark real-device layout/interaction behavior PASS based solely on
automated tests.

SECURITY:

Where relevant verify:

- HA token backend-only
- SUPERVISOR_TOKEN backend-only
- Admin token separation
- no browser-to-HA WebSocket
- no generic WebSocket proxy
- no registry writes
- no config-entry writes
- no repairs writes
- no label writes
- no generic HA service proxy
- no arbitrary service/domain passthrough
- input validation
- secret redaction
- safe error logging

STANDALONE / HA APP:

Where registry/metadata transport differs by deployment mode, inspect both
architectures insofar as they affect the assigned Sprint requirements.

Verify, where relevant:

Standalone:
- backend HA URL/token based metadata access

HA App:
- Supervisor/Core API path
- SUPERVISOR_TOKEN backend-only

Do not fully audit Sprint 24 packaging in this part.

Document any deployment-specific gap for later Repair Queue / Sprint 24 audit.

At the end report:

1. repository commit audited
2. exact Sprint IDs included in Part 09
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
14. confirmation that every new manual test contains complete step-by-step
    instructions, expected results and failure criteria
15. repair items added
16. for EACH new Repair Queue item report:
    - Repair ID
    - Sprint
    - Priority
    - Finding
17. existing Repair Queue items receiving additional evidence
18. registry/metadata architecture findings
19. device-grouping findings
20. stale/missing metadata findings
21. server-side WebSocket findings
22. read-only boundary findings
23. system data-flow findings
24. shared asset/cache findings
25. Legacy Safari / iPad findings
26. security findings
27. Standalone/LXC relevance
28. Home Assistant App relevance
29. whether Audit Part 09 is COMPLETE
30. exact scope planned for Part 10 according to AUDIT_INDEX.md
31. recommended audit-doc commit message

Do NOT start Part 10.

Do NOT perform repair work from REPAIR_QUEUE.md.

Do NOT perform physical iPad mini tests in this run.

Do NOT commit or push until I review the result.
```
