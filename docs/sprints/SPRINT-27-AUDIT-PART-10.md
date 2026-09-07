# Sprint 27 – Audit Part 10 Codex Prompt

```text
Execute Sprint 27 Audit Part 10 only.

Use the persistent Sprint 27 audit framework already present in the repository.

Read first:

- AGENTS.md
- docs/SPRINT_ROADMAP.md
- docs/PROJECT_STATUS.md
- docs/audits/AUDIT_INDEX.md
- docs/audits/REPAIR_QUEUE.md
- docs/audits/MANUAL_TEST_QUEUE.md
- all existing audit files from Parts 01–09
- all sprint specification files assigned to Audit Part 10 in AUDIT_INDEX.md

Inspect the actual repository state first.

IMPORTANT:
- The exact Sprint scope for Part 10 is defined in docs/audits/AUDIT_INDEX.md.
- Use that definition as authoritative.
- Do NOT silently expand the scope.
- Do NOT start Part 11.
- Do NOT perform broad repair work during this baseline audit.

For every Sprint assigned to Part 10:

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

Every PASS/PARTIAL/BROKEN result should include concrete evidence where practical:
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

If a later Sprint intentionally replaced an earlier implementation, do not mark
the earlier requirement BROKEN merely because the old code no longer exists.

Instead document:
- which later Sprint superseded it
- where the current implementation now lives
- whether the original intended end-state is still satisfied

Use where appropriate:
PASS – superseded by Sprint X
or:
N/A – replaced by Sprint X

Do not use "superseded" to hide a current regression.

PART 10 FOCUS:

Part 10 belongs to the Sprint 21.x audit phase according to the current Sprint 27
Audit Part plan.

However, the authoritative scope remains the exact mapping in:
docs/audits/AUDIT_INDEX.md

Audit only the Sprint IDs assigned there.

Where relevant, focus on:
- Error Dashboard device aggregation
- Summary/Error filtering
- column-view preferences
- risk severity
- critical entity detection
- severity/state filter separation
- rule/configuration UI
- Entity Rule Manager
- system dashboard header simplification
- navigation and global health indicator

Do not audit Part 11 scope in advance.

FILTER SEMANTICS:

Where applicable verify exact current filter semantics.

Severity:
Critical -> only critical
Error    -> only error
Warning  -> only warning
Info     -> only info

Do NOT accept threshold semantics such as severity >= selected unless explicitly
required by the Sprint specification.

Where status/state filters exist, verify they operate on the same child issue as
severity when combined.

Example:
Severity=Warning AND State=Unavailable
must match one child issue satisfying both.

Do not allow cross-child matching.

DEVICE GROUP FILTERING:

Where grouped devices are filtered:
1. filter child issues first
2. keep the group only if at least one child remains
3. derive visible/group severity from filtered children where specified
4. preserve original/unfiltered group severity internally where needed for All

Verify filtering does not mutate canonical issue data.

COLUMN VIEW PREFERENCES:

Where applicable verify:
- supported values exactly match the Sprint spec
- invalid values fall back safely
- preferences persist if specified
- Summary and Errors have separate settings if specified
- layout remains legacy Safari-compatible
- no CSS Grid dependency
- no Flexbox gap dependency
- one/two/three-column modes render safely

RISK SEVERITY:

Where applicable verify deterministic handling of:
- safety
- security
- normal
- diagnostic

If unknown/unavailable safety/security entities are intended to remain critical,
verify missing metadata does not silently downgrade them.

CRITICAL ENTITY DETECTION:

Where applicable verify configured detection modes, for example:
- device_class
- ha_label

If HA labels are used:
- labels are read-only
- no label write endpoint exists
- no Area label propagation is silently invented
- missing/stale label metadata does not silently downgrade critical entities

ENTITY RULE MANAGER / ADMIN:

Where applicable verify:
- searchable entity rule management
- friendly-name search
- entity_id search
- device search
- area search
- domain filters
- device filters
- batch save/discard
- reuse of existing configuration arrays where specified
- no giant uncontrolled dropdown regression
- Admin authentication enforced
- writes restricted to the app's own config model
- no HA registry/device/label mutation introduced

SYSTEM HEADER / NAVIGATION:

Where applicable verify:
- Summary/Error headers match the simplified design
- navigation remains same-origin
- no target=_blank for internal navigation
- no window.open() for internal navigation
- return/back target is validated
- external/protocol-relative/javascript/data return targets are rejected
- health/status indicator logic is not affected by active UI filters

GLOBAL HEALTH INDICATOR:

Where applicable verify:
- only intended severities trigger alert/health state
- Info-only does not incorrectly show alert where prohibited
- Warning/Error/Critical remain visible according to design
- stale/unknown does not become falsely healthy
- selected UI filters do not alter global health result

SHARED ASSET / CACHE VERSION FOLLOW-UP:

The previously identified shared-cache inconsistency must remain tracked.

Known evidence included:
- index.html: v=51
- system.html: v=44

Do NOT repair it in Part 10.

If Part 10 reveals further affected assets/pages:
- append evidence to the existing Repair ID if same root cause
- do not duplicate the Repair ID
- document whether stale shared JS/CSS can affect filter/header/health logic

LEGACY FRONTEND COMPATIBILITY:

For frontend code touched by Part 10 verify where applicable that runtime code
does not require:
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

IMPORTANT MANUAL TEST POLICY:

No physical iPad mini tests are being performed during Audit Part 10.

All real iPad mini / iOS 9 tests will be executed only after ALL Audit Parts
have completed.

Therefore:
- do NOT mark real-device requirements PASS without existing documented evidence
- classify them as NOT TESTED where appropriate
- add every required real-device check to docs/audits/MANUAL_TEST_QUEUE.md

For EVERY queued manual test, include:
- Test ID
- related Sprint
- Requirement
- Device
- Preconditions
- exact route/page
- required HA state/data
- required filter configuration
- required device/entity setup
- required column mode where relevant
- orientation if relevant
- exact step-by-step actions
- expected visual result
- expected functional result
- failure criteria
- evidence to capture
- result field

Use detailed instructions, not vague checks.

REPAIR QUEUE:

Any actionable PARTIAL / MISSING / BROKEN finding must be represented in:
docs/audits/REPAIR_QUEUE.md

Every NEW repair item added from Part 10 must contain:
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

Do not duplicate existing Repair IDs.

Before finishing Part 10, compare all new actionable findings against
REPAIR_QUEUE.md and ensure each is tracked.

AUDIT FILES:

Create/update:
docs/audits/sprints/SPRINT-<ID>-AUDIT.md

Do not overwrite or remove audit history from Parts 01–09.

Update:
docs/audits/AUDIT_INDEX.md
docs/audits/REPAIR_QUEUE.md
docs/audits/MANUAL_TEST_QUEUE.md

Run relevant automated tests for Part 10.

Where tests cover:
- exact severity filters
- status filters
- combined severity/status filters
- child-first device filtering
- visible severity
- column preference persistence
- risk classification
- critical detection mode
- HA label handling
- Entity Rule Manager
- safe return target
- global health indicator

reference them explicitly as Evidence.

SECURITY:

Where relevant verify:
- HA token backend-only
- SUPERVISOR_TOKEN backend-only
- Admin token separation
- no browser-to-HA WebSocket
- no generic WebSocket proxy
- no registry writes
- no label writes
- no generic HA service proxy
- no arbitrary service/domain passthrough
- safe Admin config writes
- safe return-target validation
- input validation
- secret redaction

STANDALONE / HA APP:

Where Part 10 behavior uses shared system-dashboard frontend/backend logic,
verify there is no accidental deployment-mode divergence.

Do not fully audit Sprint 24 packaging in this part.

At the end report:

1. repository commit audited
2. exact Sprint IDs included in Part 10
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
14. confirmation that every new manual test contains complete step-by-step instructions, expected results and failure criteria
15. repair items added
16. for EACH new Repair Queue item: Repair ID, Sprint, Priority, Finding
17. existing Repair Queue items receiving additional evidence
18. exact severity-filter findings
19. status-filter findings
20. combined filter/device-group findings
21. column-view findings
22. risk/critical-detection findings
23. HA-label findings where applicable
24. Entity Rule Manager/Admin findings
25. system header/navigation findings
26. global health indicator findings
27. shared asset/cache findings
28. Legacy Safari / iPad findings
29. security findings
30. Standalone/LXC relevance
31. Home Assistant App relevance
32. whether Audit Part 10 is COMPLETE
33. exact scope planned for Part 11 according to AUDIT_INDEX.md
34. recommended audit-doc commit message

Do NOT start Part 11.
Do NOT perform repair work from REPAIR_QUEUE.md.
Do NOT perform physical iPad mini tests in this run.
Do NOT commit or push until I review the result.
```
