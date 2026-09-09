# Sprint 27 – Audit Part 19 Codex Prompt

```text
Execute Sprint 27 Audit Part 19 only.

Use the persistent Sprint 27 audit framework already present in the repository.

Read first:

- AGENTS.md
- docs/SPRINT_ROADMAP.md
- docs/PROJECT_STATUS.md
- docs/audits/AUDIT_INDEX.md
- docs/audits/REPAIR_QUEUE.md
- docs/audits/MANUAL_TEST_QUEUE.md
- all existing audit files from Parts 01–18
- all sprint specification files assigned to Audit Part 19 in AUDIT_INDEX.md

Inspect the actual repository state first.

IMPORTANT:

The exact Sprint scope for Part 19 is defined in:

docs/audits/AUDIT_INDEX.md

Use that definition as authoritative.

According to the current Sprint 27 plan, Part 19 is expected to cover:

- Sprint 26
- Sprint 26.1
- Sprint 26.2

If AUDIT_INDEX.md differs, use AUDIT_INDEX.md as the source of truth and report
the discrepancy.

Part 19 is the FINAL baseline Audit Part.

Do NOT invent Part 20.
Do NOT start repair work during this baseline audit.
Do NOT perform physical iPad mini, production HAOS or production Home Assistant
manual tests in this run.

For every Sprint assigned to Part 19:

1. Read the complete Sprint specification.
2. Compare every requirement against the CURRENT repository implementation.
3. Verify frontend, backend, data model, persistence, Admin/editor behavior,
   capability/authorization logic, Home Assistant metadata usage, controls,
   tests and release-readiness implications where relevant.
4. Do not rely only on PROJECT_STATUS or previous Codex summaries.
5. Do not assume Sprint 26.1/26.2 completion merely because implementation runs
   previously reported success.

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

Every PASS/PARTIAL/BROKEN result should include concrete evidence where practical:
- source file
- function
- renderer
- route
- config key
- persistence field
- data-model field
- capability helper
- authorization helper
- test file / test name
- manual-test reference

SUPERSEDED REQUIREMENTS:

If Sprint 26.1 or Sprint 26.2 intentionally replaced an earlier Sprint 26
implementation detail, do not mark the earlier requirement BROKEN solely
because the older code no longer exists.

Instead document:
- which later Sprint superseded it
- where the current implementation now lives
- whether the original intended end-state is still satisfied

Use where appropriate:
PASS – superseded by Sprint 26.1
PASS – superseded by Sprint 26.2
N/A – replaced by Sprint 26.x

Do not use "superseded" to hide a current regression.

SPRINT 26 – DASHBOARD SECTIONS & ROOM MODEL FOUNDATION

Audit:
- per-dashboard sections
- stable section IDs
- title
- order
- showTitle
- optional areaId metadata
- optional card sectionId
- backward compatibility
- deterministic fallback for unassigned cards
- persistence
- config normalization
- migration/default behavior

Verify Section != Home Assistant Area.

SECTION CRUD / ADMIN

Where required verify Admin can:
- create section
- rename section
- reorder section
- toggle title visibility
- assign cards
- move cards between sections
- remove section

Deleting a section must NEVER delete its cards unless the Sprint explicitly
defines a different safe migration behavior.

SECTION LAYOUT

Verify where applicable:
- sections render vertically
- existing card grid remains inside each section
- empty section handling
- section titles
- unassigned/default section behavior
- card ordering within section
- no CSS Grid dependency if prohibited
- no global x/y corruption when moving cards

HA AREA METADATA

Verify:
- read-only use
- no Area writes
- no Area rename/create/delete
- missing Area metadata does not break section rendering
- areaId is metadata/reference, not section identity
- changing HA Area does not silently delete application sections

SPRINT 26.1 – NATIVE ROOM CARD MVP

Audit the Room Card end-to-end.

Do NOT rely on earlier completion reports.

Specifically verify the previously known problem areas:

1. Room Card collapse/expand behavior
2. Room Card background image visible in Admin preview but potentially missing
   in real dashboard runtime

ROOM CARD DATA MODEL

Audit the actual Room Card model and supported fields, including where specified:
- type
- title
- areaId
- imageId
- temperature
- humidity
- climate
- presence
- windows
- lights
- switches
- covers
- collapsible

Verify:
- persisted config
- config normalization
- safe defaults
- invalid/missing entity handling
- backward compatibility
- no hardcoded demo/test entity IDs

AREA-BASED AUTO-SETUP

Where Room Card supports HA Area-based suggestions, verify:
- server-side/read-only HA metadata
- suggestions only
- user can confirm/override
- no HA registry writes
- no HA Area writes
- no generic entity auto-control authorization

ROOM CARD RENDERER

Verify:
- title/identity
- temperature
- humidity
- target temperature where applicable
- presence
- windows/open state
- alerts/critical indicators
- primary controls
- secondary content
- compact/expanded states
- unknown/unavailable handling
- long names/values
- layout at valid sizes

ROOM CARD COLLAPSE / EXPAND

Audit:
- event listener
- clickable target
- touch/click behavior
- ES5-compatible event handling
- class/state toggle
- actual hidden/shown content
- persistence if specified
- interaction with card controls
- event bubbling
- no double-trigger from touch + click
- no control tap accidentally toggles collapse
- no layout/grid corruption after toggle

If collapse/expand remains broken, classify BROKEN and ensure REPAIR_QUEUE
contains a corresponding repair item.

ROOM CARD BACKGROUND RUNTIME

Trace:

Admin selection/upload
-> imageId/config
-> persisted Room Card config
-> dashboard API payload
-> Room Card view model
-> renderer
-> asset URL
-> background layer/CSS

Verify:
- Admin preview and real dashboard use compatible data paths
- imageId survives persistence
- runtime URL is valid
- background is behind content
- overlay if specified
- no touch interception
- background survives reload
- replacement/removal works
- DATA_DIR/asset route security remains intact
- no separate insecure Room Card upload path duplicates Sprint 25.3

If Admin preview works but runtime does not, classify BROKEN and identify the
exact break point.

ROOM CARD SIZE TIERS

Where Sprint 26.1 integrates Sprint 25.6 size tiers, verify intended valid
presentation sizes without overlap/clipping/unusable controls.

ROOM CARD RISK / ALERTS

Where Room Card shows alerts, verify it reuses the existing system risk/issue
engine rather than implementing a conflicting independent severity model.

SPRINT 26.2 – CONTROLLABLE ENTITY AUTHORIZATION & CLIMATE HARDENING

Audit the FINAL shared control/capability architecture carefully.

This is security-sensitive and RC-relevant.

The current implementation must NOT depend on hardcoded test entity IDs.

Audit for:
- hardcoded IDs
- writableEntities
- controlEntities
- card-specific allowlists
- dashboard-level flags
- card-level flags
- domain checks
- capability checks
- availability
- supported_features
- hvac_modes
- min_temp
- max_temp
- target_temp_step
- last non-off mode
- preferred on-mode
- backend authorization enforcement

SHARED AUTHORIZATION MODEL

Verify the same central authorization/capability model is reused across:
- Grid cards
- Focus cards
- Room Cards

Room Card must NOT have a separate generic write path.

Visible entity != automatically writable entity.
Backend must remain authoritative.

LIGHT CONTROL

Where supported/authorized:
- multiple distinct Light entity IDs work
- on -> off
- off -> on
- unavailable safely disabled
- unauthorized rejected
- wrong domain rejected
- unknown entity rejected

Verify behavior does not depend on the original test entity.

CLIMATE POWER CAPABILITY

If a Climate entity supports:
off + at least one valid non-off HVAC mode
Power may be offered.

If no `off` mode exists:
- do not render a fake Power button

Do not blindly force `heat`.

Verify Sprint-defined safe on-mode selection.

TARGET TEMPERATURE WHILE OFF

Critical requirement:

If supported by integration/capabilities, changing target temperature while
Climate is off must:
- update/set target
- keep Climate off
- NOT automatically power on

Audit:
- frontend controls while off
- backend endpoint/action
- capability validation
- min_temp
- max_temp
- target_temp_step
- numeric validation
- service failure handling
- UI rollback/reconciliation to confirmed state

If integration rejects target change while off:
- fail gracefully
- do not auto-power
- restore/retain confirmed state
- report error safely

CLIMATE RANGE / STEP VALIDATION

Verify server-side validation for:
- minimum boundary
- maximum boundary
- step
- below min
- above max
- invalid/non-numeric payload
- unsupported target-temperature capability

BACKEND WRITE SECURITY

Explicitly verify:
- no generic `/api/service`
- no generic HA service proxy
- no arbitrary browser-supplied domain/service
- entity ID validated
- domain validated
- action validated
- authorization validated
- payload validated
- capability validated
- range/step validated
- HA token backend-only
- SUPERVISOR_TOKEN backend-only

GRID / FOCUS / ROOM CARD CONSISTENCY

Audit representative behavior across:
- Grid Light
- Focus Light
- Room Light
- Grid Climate
- Focus Climate
- Room Climate where supported

Verify consistent authorization/capability decisions and safe error handling.

LEGACY SAFARI / ES5

Verify Sprint 26/26.1/26.2 frontend code does not require:
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

SHARED ASSET / CACHE VERSION FOLLOW-UP

The known shared-cache inconsistency must remain tracked.

Known evidence:
- index.html: v=51
- system.html: v=44

Do NOT repair it in Part 19.

Assess whether stale shared assets could affect:
- section rendering
- Room Card rendering
- Room Card background
- collapse logic
- Light control
- Climate power
- target temperature
- shared authorization UI state

If yes:
- append evidence to the EXISTING Repair ID
- do not duplicate the Repair ID
- preserve priority/history
- document RC relevance

MANUAL TEST POLICY

No physical iPad mini, production HAOS or production Home Assistant runtime tests
are being performed during Audit Part 19.

All real-device/runtime tests will be executed after the baseline audit and
repair phase.

Therefore:
- do NOT mark real-device/runtime requirements PASS without documented evidence
- classify them as NOT TESTED where appropriate
- queue complete test instructions in docs/audits/MANUAL_TEST_QUEUE.md

Use suitable IDs:
TEST-IPAD-SECTION-XXX
TEST-IPAD-ROOM-XXX
TEST-IPAD-CONTROL-XXX
TEST-HAOS-ROOM-XXX
TEST-HA-RUNTIME-CONTROL-XXX

For EVERY queued manual test include:
- Test ID
- related Sprint
- Requirement
- Device/System
- Preconditions
- exact route/page
- exact dashboard/section/card
- exact HA entity/entities
- entity state/capabilities required
- card size/orientation where relevant
- exact step-by-step actions
- expected visual result
- expected functional result
- failure criteria
- evidence to capture
- result field

REQUIRED SECTION MANUAL TESTS

Ensure coverage for:
- dashboard without sections
- create section
- rename section
- reorder section
- move card into section
- move card between sections
- unassigned cards
- delete section without deleting cards
- section title shown/hidden
- multiple sections
- portrait/landscape
- reload/persistence

REQUIRED ROOM CARD MANUAL TESTS

Ensure coverage for:
- Room Card creation
- HA Area suggestion
- manual override
- runtime rendering
- background image
- background reload
- collapse
- expand
- control tap does not collapse
- long values/names
- unavailable state
- risk/alert display
- valid card sizes
- portrait
- landscape
- rotation

REQUIRED CONTROL MANUAL TESTS

LIGHT:
- original test light
- second distinct light
- third distinct light
- on -> off
- off -> on
- unavailable
- unauthorized

CLIMATE:
- original thermostat
- second thermostat
- off + heat
- off + auto
- off + heat + auto
- thermostat without off
- unavailable
- unsupported on-mode

TARGET:
- change target while active
- change target while off
- verify Climate remains off
- min
- max
- step
- invalid value
- below min
- above max
- backend/service failure

CROSS-SURFACE:
- Grid Light
- Focus Light
- Room Light
- Grid Climate
- Focus Climate
- Room Climate where supported

REPAIR QUEUE

Any actionable PARTIAL / MISSING / BROKEN finding must be represented in:
docs/audits/REPAIR_QUEUE.md

Every NEW repair item from Part 19 must contain:
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

FINAL BASELINE REPAIR-QUEUE CONSISTENCY CHECK

Because Part 19 is the FINAL baseline audit part, perform a consistency review
across ALL audit files created in Parts 01–19.

Do NOT re-audit all Sprints.

Verify:
- every PARTIAL finding has a Repair ID or documented non-actionable rationale
- every MISSING finding has a Repair ID or documented non-actionable rationale
- every BROKEN finding has a Repair ID
- no obvious duplicate Repair IDs describe the same root cause
- existing Repair IDs preserve history/evidence
- priorities are present
- RC relevance is present

Do not perform repairs yet.

MANUAL TEST QUEUE CONSISTENCY CHECK

Inspect MANUAL_TEST_QUEUE.md for structural completeness.

Do NOT execute tests.

Verify every queued test has:
- Test ID
- Sprint
- Requirement
- Device/System
- Preconditions
- exact steps
- expected result
- failure criteria
- evidence field
- result/status

Correct only incomplete TEST DOCUMENTATION.
Do not change product code.

AUDIT FILES

Create/update:
docs/audits/sprints/SPRINT-<ID>-AUDIT.md

Expected if current plan matches AUDIT_INDEX.md:
docs/audits/sprints/SPRINT-26-AUDIT.md
docs/audits/sprints/SPRINT-26.1-AUDIT.md
docs/audits/sprints/SPRINT-26.2-AUDIT.md

Do not overwrite or remove audit history from Parts 01–18.

Update:
docs/audits/AUDIT_INDEX.md
docs/audits/REPAIR_QUEUE.md
docs/audits/MANUAL_TEST_QUEUE.md

AUTOMATED / LOCAL TESTS

Run relevant bounded automated tests.

Sprint 26:
- section normalization
- CRUD
- reorder
- card assignment
- section deletion preserves cards
- persistence
- backward compatibility

Sprint 26.1:
- Room Card config
- Area suggestion mapping
- renderer
- background config/path
- collapse state/event logic where testable
- risk integration
- size tiers

Sprint 26.2:
- multiple distinct Light IDs
- authorization
- unavailable/unauthorized/wrong-domain rejection
- climate capability detection
- safe on-mode selection
- thermostat without off
- target temp while off
- min/max/step validation
- failure reconciliation
- shared Grid/Focus/Room authorization

Run bounded full regression suite if practical.

Do NOT contact real Home Assistant.
Do NOT use production credentials.
Do NOT claim physical iPad/HAOS runtime PASS from local tests.

SECURITY

Explicitly verify:
- HA token backend-only
- SUPERVISOR_TOKEN backend-only
- Admin token separation
- no generic HA service proxy
- no generic WebSocket proxy
- no arbitrary browser-to-HA service/domain passthrough
- server-side write authorization
- domain validation
- entity validation
- capability validation
- payload/range validation
- HA registry/Area metadata read-only
- no Area writes
- no label writes
- controlled background asset route
- no whole DATA_DIR exposure
- secret redaction
- safe errors/logging

PART 19 FINAL REPORT

At the end report:

1. repository commit audited
2. exact Sprint IDs included in Part 19
3. overall result for each audited Sprint
4. PASS findings
5. PARTIAL findings
6. MISSING findings
7. BROKEN findings
8. NOT TESTED requirements
9. superseded requirements and replacement Sprints
10. source/test evidence
11. automated/local tests run and results
12. manual tests added
13. for each new manual test: Test ID + short description
14. confirmation that all new manual tests contain complete step-by-step
    instructions, expected results and failure criteria
15. repair items added
16. for EACH new Repair Queue item: Repair ID, Sprint, Priority, Finding
17. existing Repair Queue items receiving additional evidence

Sprint 26:
18. section data-model findings
19. CRUD/persistence findings
20. card-preservation findings
21. layout/legacy findings
22. HA Area metadata findings

Sprint 26.1:
23. Room Card model findings
24. Area auto-setup findings
25. runtime renderer findings
26. collapse/expand findings
27. Room Card background findings
28. Room Card size-tier findings
29. risk/alert findings

Sprint 26.2:
30. shared authorization architecture findings
31. hardcoded-ID/allowlist findings
32. Light control findings
33. Climate capability findings
34. safe on-mode findings
35. target-temp-while-off findings
36. min/max/step validation findings
37. Grid/Focus/Room consistency findings
38. backend write-security findings

Cross-cutting:
39. shared asset/cache findings
40. Legacy Safari/iPad findings
41. Standalone/LXC relevance
42. Home Assistant App relevance
43. security findings

Final baseline:
44. whether Audit Part 19 is COMPLETE
45. confirmation that ALL planned Audit Parts 01–19 are now complete
46. number of total Repair Queue items by priority: P0, P1, P2, P3
47. number of outstanding Manual Tests by type/system
48. any audit file missing/incomplete
49. any actionable PARTIAL/MISSING/BROKEN finding not represented in Repair Queue
50. any duplicate Repair items that should be consolidated
51. whether the project is ready for Repair-Queue Consolidation
52. recommended next step: Repair-Queue Consolidation before Sprint 27.1
53. recommended audit-doc commit message

Do NOT invent or start Part 20.
Do NOT perform product repair work yet.
Do NOT start Sprint 27.1 in this run.
Do NOT execute manual iPad/HAOS/production tests.
Do NOT publish images/releases/artifacts.
Do NOT commit or push until I review the result.
```
