# Sprint 27 – Audit Part 12 Codex Prompt

```text
Execute Sprint 27 Audit Part 12 only.

Use the persistent Sprint 27 audit framework already present in the repository.

Read first:

- AGENTS.md
- docs/SPRINT_ROADMAP.md
- docs/PROJECT_STATUS.md
- docs/audits/AUDIT_INDEX.md
- docs/audits/REPAIR_QUEUE.md
- docs/audits/MANUAL_TEST_QUEUE.md
- all existing audit files from Parts 01–11
- all sprint specification files assigned to Audit Part 12 in AUDIT_INDEX.md

Inspect the actual repository state first.

IMPORTANT:

The exact Sprint scope for Part 12 is defined in:

docs/audits/AUDIT_INDEX.md

Use that definition as authoritative.

According to the current Sprint 27 plan, Part 12 is expected to cover:

- Sprint 22
- Sprint 23

If AUDIT_INDEX.md differs, use AUDIT_INDEX.md as the source of truth and report
the discrepancy.

Do NOT silently expand the scope.

Do NOT start Part 13.

Do NOT perform broad repair work during this baseline audit.

For every Sprint assigned to Part 12:

1. Read the complete Sprint specification.
2. Compare every requirement against the CURRENT repository implementation.
3. Verify source code, configuration, persistence, routes, backend processing,
   frontend behavior, data flow and tests where relevant.
4. Do not rely only on PROJECT_STATUS or previous Codex summaries.

Classify individual requirements only as:

PASS
PARTIAL
MISSING
BROKEN
NOT TESTED
N/A

For overall Sprint result use:

PASS
PARTIAL
FAIL
BLOCKED
NOT TESTED

Every PASS/PARTIAL/BROKEN result should include concrete evidence where
practical:

- source file
- function
- class/module
- route
- configuration field
- state/persistence implementation
- test file / test name
- manual-test reference

SUPERSEDED REQUIREMENTS:

If a later Sprint intentionally replaced an earlier implementation, do not
mark the earlier requirement BROKEN merely because the original code no longer
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

==================================================
SPRINT 22 FOCUS – RULES, GRACE PERIODS & DEVICE AGGREGATION
==================================================

Where Sprint 22 is in scope, audit the complete rule-processing architecture.

Verify the intended processing pipeline, where applicable:

Normalized Entity / Issue
-> Risk Classification
-> Rule Resolution
-> Grace Period
-> Expected Offline
-> Flapping
-> Severity
-> Device Aggregation
-> Presentation

Confirm the actual current implementation follows a deterministic pipeline and
does not apply the same rule in inconsistent places.

RULE RESOLUTION:

Where applicable inspect:

- default rules
- domain/device_class rules
- entity-specific overrides
- risk-class overrides
- explicit security/safety overrides
- device-wide hints
- configured expected-offline behavior
- precedence ordering

Verify precedence is deterministic and documented.

If the same entity can match multiple rules, confirm the winner is predictable.

Do not accept order-dependent accidental behavior from unsorted object/array
iteration if the Sprint requires explicit precedence.

GRACE PERIODS:

Where applicable verify:

- unknown grace period
- unavailable grace period
- risk-specific grace period
- entity-specific override
- default fallback
- timer/reset behavior
- recovery behavior

Inspect whether grace timers use:

- first-seen timestamp
- last transition timestamp
- process-local state
- persisted state if required

Verify repeated polling does not restart a grace period indefinitely.

Verify recovery clears or resets the correct state.

EXPECTED OFFLINE:

Where applicable verify:

- expected offline affects unavailable behavior as specified
- expected offline does NOT automatically convert unknown into acceptable state
  unless explicitly specified
- "ignore" and "expected offline" remain distinct concepts
- expected offline does not suppress unrelated critical/security conditions
- scope can be entity/device/rule based only where specified
- configuration is validated

FLAPPING:

Where applicable verify bounded in-memory flapping detection.

Audit:

- transition tracking
- bounded memory
- per-entity isolation
- threshold/window
- recovery
- restart behavior
- stale data cleanup
- no unbounded arrays/maps
- no false flapping caused by normal polling

If persistence was explicitly not required, do not mark process-restart reset
as BROKEN.

If later changes introduced persistence, document current behavior.

STABLE RECOVERY:

Where applicable verify:

- entities do not immediately oscillate healthy/unhealthy because of one sample
- recovery logic follows Sprint specification
- stable recovery does not hide a renewed critical issue
- recovery state is cleared correctly
- no memory leak accumulates recovered entities indefinitely

DEVICE AGGREGATION:

Where applicable verify:

- aggregation happens after issue/rule/severity resolution where specified
- grouping uses stable real device_id
- no display-name grouping
- child issues remain available
- device severity reflects intended child severity
- expected-offline child behavior does not incorrectly hide another critical
  child
- device-wide hints are applied only where intended
- missing registry metadata fails safely

RULE CONFIGURATION / ADMIN:

Where relevant verify:

- rule overrides are persisted
- invalid config is rejected/sanitized
- Admin authentication is required
- no Home Assistant registry/config mutation is introduced
- app-owned rule config remains separate from HA labels/registry writes
- configuration changes take effect predictably
- save/discard semantics match the specification

==================================================
SPRINT 23 FOCUS – AUTOMATION IMPACT & ADVANCED DIAGNOSTICS
==================================================

Where Sprint 23 is in scope, audit the Automation Impact / Advanced Diagnostics
architecture as a READ-ONLY diagnostic feature.

AUTOMATION INVENTORY:

Where applicable verify:

- automation inventory is normalized
- automation entity/id/name information is stable
- disabled/unavailable automations are represented accurately
- missing metadata does not crash the diagnostic view

STATIC REFERENCES:

Where applicable verify direct/static references are detected only when they
can be read reliably from available Home Assistant configuration/metadata.

Do not claim references that cannot be determined.

DYNAMIC TEMPLATES:

Where templates/dynamic entity generation prevent reliable static analysis,
verify the implementation marks the result as incomplete/unknown rather than
claiming complete coverage.

CONFIDENCE MODEL:

Where applicable verify confidence categories such as:

- direct
- indirect
- unknown

are deterministic and correctly described.

Do not present indirect or unknown evidence as confirmed causality.

CAUSALITY:

Verify the UI/API does NOT claim:

"This automation caused this failure"

unless the system has direct evidence that meets the Sprint specification.

Preferred semantics should remain:

- possible relationship
- referenced by automation
- recent trace correlation
- unknown/incomplete

not unproven causation.

TRACE SUMMARIES:

Where Home Assistant trace data is used, audit:

- capability-driven access
- graceful handling when traces are unavailable
- bounded response/data size
- no arbitrary browser WebSocket command passthrough
- safe normalization
- no secret leakage
- no raw unbounded trace dump to legacy clients
- timestamps/statuses interpreted consistently

AUTOMATION READ-ONLY SECURITY:

Verify Sprint 23 introduces no automation write capability.

Specifically audit that there is no path to:

- trigger automation
- enable automation
- disable automation
- reload automation
- edit automation
- modify automation config

through the diagnostic feature.

No generic service proxy may exist.

No arbitrary browser-supplied domain/service calls may exist.

ADVANCED DIAGNOSTIC DATA FLOW:

Where applicable trace:

Home Assistant metadata / automation / trace data
-> server-side collection
-> normalization
-> relationship/confidence model
-> bounded gateway response
-> browser rendering

Verify legacy clients receive only normalized/bounded data needed for the UI.

==================================================
CROSS-SPRINT INTERACTION
==================================================

Where Sprint 22 and Sprint 23 interact, verify:

- Automation Impact does not modify rule severity directly unless explicitly
  required
- diagnostic context does not silently turn correlation into severity
- risk engine remains deterministic without automation data
- unavailable automation/trace APIs do not break Summary/Error rendering
- diagnostic enrichment failure does not falsely downgrade critical issues

Do not silently merge rule engine and automation diagnostics into one write-capable
system.

==================================================
LEGACY / PERFORMANCE
==================================================

Where Sprint 22/23 frontend presentation exists, verify runtime code remains
compatible with the legacy browser constraints.

Where applicable current frontend code must not require:

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

For large diagnostic datasets verify:

- payloads are bounded
- rendering is bounded/practical
- no raw huge trace/config objects are pushed to iPad
- empty/loading/error states exist
- failure of diagnostic enrichment does not break the main dashboard

==================================================
SHARED ASSET / CACHE VERSION FOLLOW-UP
==================================================

The known shared-cache inconsistency from earlier audit parts must remain
tracked.

Known evidence included:

- index.html: v=51
- system.html: v=44

Do NOT repair it in Part 12.

If Sprint 22/23 pages/scripts are affected by the same shared asset references:

- append evidence to the EXISTING Repair ID
- do not create duplicate Repair IDs
- document whether stale cached logic could alter rule/diagnostic presentation

==================================================
MANUAL TEST POLICY
==================================================

No physical iPad mini tests are being performed during Audit Part 12.

All real iPad mini / iOS 9 and other runtime/manual tests will be executed only
after ALL Audit Parts have completed.

Therefore:

- do NOT mark real-device requirements PASS without existing documented
  evidence
- classify them as NOT TESTED where appropriate
- add every required manual check to:

docs/audits/MANUAL_TEST_QUEUE.md

Manual tests are not limited to iPad.

If Sprint 22/23 require real Home Assistant runtime behavior that cannot be
fully validated in automated/mock tests, queue that test too.

Use suitable Test IDs, for example:

TEST-IPAD-XXX
TEST-HAOS-XXX
TEST-HA-RUNTIME-XXX
TEST-STANDALONE-XXX

For EVERY queued manual test include:

- Test ID
- related Sprint
- Requirement
- Device/System
- Preconditions
- exact route/page/API if applicable
- exact HA entities/devices/automations/states required
- configuration required
- exact step-by-step actions
- expected result
- failure criteria
- evidence to capture
- result field

Example structure:

## TEST-HA-RUNTIME-XXX

Sprint:
Requirement:
System:
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
- screenshot / logs / observed state / API response

### Result
NOT TESTED

Do NOT add vague tests such as:

"Test grace period."

Instead specify:

- exact entity
- initial state
- state transition
- configured grace value
- observation checkpoints
- expected severity before/during/after grace
- expected recovery behavior
- precise failure criteria

For flapping tests specify:

- transition sequence
- timing/window
- expected threshold
- expected flapping state
- expected cleanup/recovery

For Automation Impact tests specify:

- automation with direct static entity reference
- automation with dynamic/template reference where possible
- expected confidence label
- expected absence of false causality
- expected read-only behavior

Where multiple related checks can safely be combined, combine them to reduce
manual effort.

Do NOT combine tests if failure attribution becomes unclear.

==================================================
REPAIR QUEUE
==================================================

Any actionable:

PARTIAL
MISSING
BROKEN

finding must be represented in:

docs/audits/REPAIR_QUEUE.md

Every NEW repair item added from Part 12 must contain:

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

Base priority on actual impact, including:

- security
- false healthy/critical classification
- incorrect grace/expected-offline behavior
- unbounded memory
- incorrect device aggregation
- automation write exposure
- false causality
- secret leakage
- legacy-client failure
- release correctness
- workaround availability

Do not classify every issue P0/P1.

EXISTING REPAIR ITEMS:

Do not duplicate existing Repair IDs.

If Part 12 adds evidence to an existing issue:

- preserve the Repair ID
- append evidence
- reference additional affected Sprint/component
- preserve finding history

REPAIR CONSISTENCY CHECK:

Before finishing Part 12 compare all new:

- PARTIAL
- MISSING
- BROKEN

findings against REPAIR_QUEUE.md.

Every actionable finding must either:

- reference an existing Repair ID
or
- create a new Repair ID

No actionable finding may remain untracked.

==================================================
AUDIT FILES
==================================================

Create/update the individual audit files for every Sprint assigned to Part 12:

docs/audits/sprints/SPRINT-<ID>-AUDIT.md

Expected if the current plan matches AUDIT_INDEX.md:

docs/audits/sprints/SPRINT-22-AUDIT.md
docs/audits/sprints/SPRINT-23-AUDIT.md

Do not overwrite or remove audit history from Parts 01–11.

Update:

docs/audits/AUDIT_INDEX.md
docs/audits/REPAIR_QUEUE.md
docs/audits/MANUAL_TEST_QUEUE.md

==================================================
AUTOMATED TESTS
==================================================

Run relevant automated tests for Part 12.

Where tests exist, explicitly reference coverage for:

Sprint 22:
- rule precedence
- risk classification
- grace periods
- unknown/unavailable differences
- expected offline
- ignore vs expected offline
- flapping
- bounded state/memory
- stable recovery
- device aggregation
- missing metadata behavior
- config validation

Sprint 23:
- automation normalization
- static direct references
- dynamic/template incomplete handling
- confidence direct/indirect/unknown
- trace unavailability
- bounded trace summaries
- read-only behavior
- no write routes/services
- error handling

If a bounded full regression suite is practical, run it as additional evidence.

Do not mark real HA runtime timing behavior PASS solely from static inspection
when the Sprint requires runtime evidence.

==================================================
SECURITY
==================================================

Where relevant verify:

- HA token backend-only
- SUPERVISOR_TOKEN backend-only
- Admin token separation
- no browser-to-HA WebSocket
- no generic WebSocket proxy
- no generic HA service proxy
- no arbitrary service/domain passthrough
- no automation trigger/enable/disable/reload/edit capability from diagnostics
- no registry/config-entry/label writes
- bounded diagnostic responses
- input validation
- secret redaction
- safe error logging

==================================================
STANDALONE / HA APP
==================================================

Where Sprint 22/23 backend data acquisition differs by deployment mode, inspect
both implementations insofar as they affect the Sprint requirements.

Verify where relevant:

Standalone:
- backend HA URL/token access

HA App:
- Supervisor/Core API path
- SUPERVISOR_TOKEN backend-only

Do not fully audit Sprint 24 packaging in Part 12.

Document any deployment-specific gap as Evidence / Repair Queue item for the
appropriate later audit.

==================================================
FINAL REPORT
==================================================

At the end report:

1. repository commit audited
2. exact Sprint IDs included in Part 12
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

Sprint 22 specific:
18. rule pipeline findings
19. rule precedence findings
20. grace-period findings
21. expected-offline findings
22. flapping findings
23. stable-recovery findings
24. device-aggregation findings
25. Admin/rule-config findings

Sprint 23 specific:
26. automation inventory findings
27. direct/dynamic reference findings
28. confidence-model findings
29. causality-safety findings
30. trace-summary findings
31. automation read-only findings

Cross-cutting:
32. shared asset/cache findings
33. Legacy Safari / iPad findings
34. security findings
35. Standalone/LXC relevance
36. Home Assistant App relevance
37. whether Audit Part 12 is COMPLETE
38. exact scope planned for Part 13 according to AUDIT_INDEX.md
39. recommended audit-doc commit message

Do NOT start Part 13.

Do NOT perform repair work from REPAIR_QUEUE.md.

Do NOT perform physical iPad mini or production-runtime manual tests in this run.

Do NOT commit or push until I review the result.
```
