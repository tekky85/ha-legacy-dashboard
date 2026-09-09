# Sprint 27 – Audit Part 17 Codex Prompt

```text
Execute Sprint 27 Audit Part 17 only.

Use the persistent Sprint 27 audit framework already present in the repository.

Read first:

- AGENTS.md
- docs/SPRINT_ROADMAP.md
- docs/PROJECT_STATUS.md
- docs/audits/AUDIT_INDEX.md
- docs/audits/REPAIR_QUEUE.md
- docs/audits/MANUAL_TEST_QUEUE.md
- all existing audit files from Parts 01–16
- all sprint specification files assigned to Audit Part 17 in AUDIT_INDEX.md

Inspect the actual repository state first.

IMPORTANT:

The exact Sprint scope for Part 17 is defined in:

docs/audits/AUDIT_INDEX.md

Use that definition as authoritative.

According to the current Sprint 27 plan, Part 17 belongs to the Sprint 25 / 25.x audit phase.

If AUDIT_INDEX.md differs from any assumptions in this prompt, use AUDIT_INDEX.md as the source of truth and report the discrepancy.

Do NOT silently expand the scope.
Do NOT start Part 18.
Do NOT perform broad repair work during this baseline audit.

For every Sprint assigned to Part 17:

1. Read the complete Sprint specification.
2. Compare every requirement against the CURRENT repository implementation.
3. Verify frontend, backend, persistence, upload/network handling, responsive card behavior, tests and release-readiness implications where relevant.
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

Every PASS/PARTIAL/BROKEN result should include concrete evidence where practical:

- source file
- function
- renderer
- CSS class
- route
- config key
- upload/network handler
- persistence path
- test file / test name
- manual-test reference

SUPERSEDED REQUIREMENTS:

If a later Sprint intentionally replaced an earlier implementation, do not mark the earlier requirement BROKEN merely because the old implementation no longer exists.

Instead document:
- which later Sprint superseded it
- where the current implementation now lives
- whether the original intended end-state is still satisfied

Use where appropriate:
PASS – superseded by Sprint X
or:
N/A – replaced by Sprint X

Do not use "superseded" to hide a current regression.

PART 17 FOCUS – LATE SPRINT 25.x HARDENING

Part 17 belongs to the later Sprint 25.x hardening phase.

The exact assigned Sprint IDs are defined in AUDIT_INDEX.md.

Where the assigned scope includes Sprint 25.5 and/or Sprint 25.6, audit the corresponding areas below.

If those Sprint IDs are assigned elsewhere, do not audit them here.

SPRINT 25.5 – HAOS NETWORK ACCESS & BACKGROUND UPLOAD HARDENING

Where Sprint 25.5 is in scope, audit both problem areas separately:

A. HAOS / hostname / network access
B. JPEG/JPG background upload hardening

Do not conflate mDNS/DNS resolution with application port binding.

NETWORK / HOSTNAME DIAGNOSTICS

Verify the application-side network behavior.

Audit:
- listen address
- listen port
- Home Assistant App port mapping
- direct LAN accessibility
- health endpoint accessibility
- Admin accessibility
- dashboard accessibility
- no localhost-only binding inside the App
- no hardcoded IP/hostname requirement
- no application-level DNS hack
- no unnecessary host_network requirement

Distinguish clearly between:
1. application reachable by IP:port
2. hostname resolution
3. mDNS `.local` resolution
4. custom local DNS
5. Home Assistant Ingress

If IP:port works but `homeassistant.local:port` does not resolve, do not mark the application itself BROKEN unless repository evidence shows an app-side defect.

Where appropriate classify hostname resolution as environment/network-dependent and queue a manual test.

NO APP-LEVEL DNS WORKAROUND

Verify no later workaround introduced:
- hardcoded hosts mapping
- custom DNS server inside app
- mDNS daemon solely for this app
- host networking merely to force `.local`
- hostname rewrite logic in frontend

unless explicitly justified and required.

Preferred operational fallback may be:
- reserved/static IP
- stable local DNS hostname

Document this as deployment guidance, not as a code defect, when appropriate.

JPEG/JPG UPLOAD HARDENING

Where Sprint 25.5 is in scope, audit the current image validator.

Verify legitimate JPEG variants are accepted where required, including common:
- baseline JPEG
- progressive JPEG
- JFIF APP0
- Exif APP1
- ICC APP2
- EXIF orientation metadata
- embedded thumbnail metadata
- .jpg extension
- .jpeg extension

Do not assume all valid JPEG files have identical segment structure.

JPEG VALIDATION SAFETY

The hardening must not simply disable validation.

Verify rejection of:
- truncated JPEG
- malformed segment structure
- fake/disguised HTML
- fake/disguised SVG
- oversized payload
- path traversal filename
- unsupported file type

Where MIME/type sniffing is used, inspect actual implementation.

Verify a failed replacement preserves the previous valid background.

UPLOAD REGRESSION

Where applicable verify:
- PNG still works
- valid JPEG works
- valid JPG works
- replacement works
- removal works
- asset serving still works
- generated image IDs remain safe
- no original user filename is used directly as storage path
- DATA_DIR remains protected
- whole DATA_DIR is not exposed

SPRINT 25.6 – CARD SIZE MATRIX & RESPONSIVE LAYOUT HARDENING

Where Sprint 25.6 is in scope, audit the responsive card architecture.

First inventory the actual card renderers currently present in the repository.

Do not rely on a historical card list if the implementation has changed.

Build or verify a Card Type × Valid Size × Representative State audit matrix.

CARD GEOMETRY VS PRESENTATION

Verify the implementation keeps these concepts distinct:

Grid geometry:
- x
- y
- w
- h
- valid card size

Presentation tier:
- compact
- standard
- wide
- tall
- large
- or the actual equivalent implementation

Do not accept renderer logic that accidentally treats absolute grid coordinates as presentation semantics.

CLIMATE CARD RESPONSIVE LAYOUT

Where applicable audit Climate/Thermostat layouts at all valid sizes.

For large Climate cards verify deliberate content hierarchy such as:
- identity/title
- current temperature
- target temperature
- HVAC mode/action
- minus control
- plus control
- power
- secondary metadata

The exact final implementation may differ in markup, but the end-state must avoid:
- tiny content in huge empty card
- overlapping controls
- clipped values
- off-card controls
- unreadable hierarchy
- excessive dead space
- controls below unreachable/awkward regions

OTHER CARD TYPES

Audit all actual card renderers in current repo, where relevant including:
- Light
- Sensor
- Binary Sensor
- Switch
- Climate
- Room Card only if its renderer already participates in the shared size system
- other supported renderers present in current code

Do not fully audit Sprint 26 Room Card requirements in Part 17.

If shared size logic affects Room Card, inspect only that shared interaction.

REPRESENTATIVE STATES

Where applicable test layout with representative states:
- normal
- on/off
- unknown
- unavailable
- long entity name
- long friendly name
- long numeric value
- unit
- missing optional attribute
- large/small temperature values
- supported/unsupported controls

Verify state changes do not unexpectedly alter card geometry.

TOUCH TARGETS

Where card controls are present, verify the target dimensions required by the Sprint, including approximately >=44px where explicitly specified.

Audit actual hit-area element, not just SVG/icon size.

LEGACY SAFARI RESPONSIVENESS

For all Part 17 frontend code verify where applicable that current runtime code does not require:
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

Verify responsive behavior is implemented with legacy-compatible techniques.

TEST MATRIX / HARNESS

Where Sprint 25.6 requires a test-only card matrix/harness, verify:
- it exists if required
- it is not exposed as production navigation unintentionally
- it uses the real renderer code
- it covers valid size variants
- it includes representative states
- it does not rely on production credentials
- it can run with mock/local data

If a test harness is absent but the requirement exists, classify accordingly.

SHARED ASSET / CACHE VERSION FOLLOW-UP

The known shared-cache inconsistency must remain tracked.

Known evidence:
- index.html: v=51
- system.html: v=44

Do NOT repair it in Part 17.

If Part 17 frontend/CSS changes are served through these shared asset references, assess whether stale Safari caching could invalidate responsive-layout or upload-hardening fixes.

If yes:
- append evidence to the EXISTING Repair ID
- do not duplicate the Repair ID
- preserve priority/history
- document RC relevance

MANUAL TEST POLICY

No physical iPad mini, production HAOS or production network tests are being performed during Audit Part 17.

All remaining real-device/runtime tests will be executed only after ALL Audit Parts have completed.

Therefore:
- do NOT mark real-device/network/runtime requirements PASS without documented evidence
- classify them as NOT TESTED where appropriate
- queue detailed tests in docs/audits/MANUAL_TEST_QUEUE.md

Use suitable IDs:
TEST-IPAD-XXX
TEST-HAOS-XXX
TEST-NETWORK-XXX
TEST-UPLOAD-XXX
TEST-CARD-XXX

For EVERY queued manual test include:
- Test ID
- related Sprint
- Requirement
- Device/System
- Preconditions
- exact route/page
- exact dashboard/card setup
- entity/state required
- card size
- orientation where relevant
- exact step-by-step actions
- expected visual result
- expected functional result
- failure criteria
- evidence to capture
- result field

MANUAL NETWORK TEST EXAMPLES

Where Sprint 25.5 requires them, queue exact checks such as:
- open HA App by LAN IP:port
- open /health by LAN IP:port
- open /admin by LAN IP:port
- test `homeassistant.local:port`
- compare IP success vs hostname failure
- test from Mac and iPad where required
- document whether failure is DNS/mDNS or application connectivity

Do NOT mark `.local` support as application PASS solely because IP access works.
Do not mark it application FAIL solely because `.local` does not resolve.

MANUAL JPEG TEST EXAMPLES

Where applicable queue uploads of:
- baseline JPEG
- progressive JPEG
- EXIF orientation JPEG
- ICC-profile JPEG
- .jpg
- .jpeg
- PNG
- malformed/truncated JPEG
- disguised HTML/SVG
- oversized image

For each test specify whether upload must succeed or fail.

Verify previous background remains intact after a rejected replacement.

MANUAL CARD MATRIX TESTS

For iPad mini tests, provide exact matrix instructions.

Where possible combine related checks into a single physical session, but keep each sub-check independently pass/fail capable.

Example:

TEST-IPAD-CARD-MATRIX-01

Device:
iPad mini 1 / iOS 9.3.5

Dashboard:
controlled test dashboard

Cards:
- Light
- Sensor
- Binary
- Climate

Sizes:
- every valid size supported by editor for each card

Orientations:
- portrait
- landscape

For each combination verify:
- content remains inside card
- no overlap
- no clipping
- controls remain reachable
- touch target remains usable
- long names do not destroy layout
- unavailable/unknown remains legible
- no large unusable dead areas
- rotation does not leave stale geometry

Do NOT add vague manual tests such as "Check cards on iPad."

REPAIR QUEUE

Any actionable PARTIAL / MISSING / BROKEN finding must be represented in:
docs/audits/REPAIR_QUEUE.md

Every NEW repair item from Part 17 must contain:
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

Base priority on actual impact including:
- network inaccessibility
- upload security
- valid JPEG rejection
- unsafe malformed-file acceptance
- background data loss
- unusable card layout
- clipped/inaccessible controls
- legacy iPad failure
- release correctness
- workaround availability

Do not classify every issue P0/P1.
Do not duplicate existing Repair IDs.

Before finishing Part 17:
- compare every new PARTIAL/MISSING/BROKEN finding with REPAIR_QUEUE.md
- ensure every actionable finding is tracked
- append evidence to existing Repair IDs where appropriate

AUDIT FILES

Create/update:
docs/audits/sprints/SPRINT-<ID>-AUDIT.md

for every Sprint assigned to Part 17.

Do not overwrite or remove audit history from Parts 01–16.

Update:
docs/audits/AUDIT_INDEX.md
docs/audits/REPAIR_QUEUE.md
docs/audits/MANUAL_TEST_QUEUE.md

AUTOMATED / LOCAL TESTS

Run relevant bounded tests.

Where Sprint 25.5 is in scope, verify where possible:
- listen/bind config
- port config
- network-mode assumptions
- image validator
- baseline JPEG
- progressive JPEG
- common metadata segments
- malformed/truncated rejection
- SVG/HTML disguise rejection
- size limits
- replacement safety
- PNG regression
- controlled asset route

Where Sprint 25.6 is in scope, verify where possible:
- renderer inventory
- valid card sizes
- presentation-tier selection
- Climate layouts
- other actual renderers
- long text/value states
- unknown/unavailable
- control hit-area classes/geometry
- matrix/harness coverage

Do NOT contact the real Home Assistant instance.
Do NOT use production credentials.
Do NOT claim real HAOS/iPad/network PASS from local mocks.

SECURITY

Explicitly verify where relevant:
- HA token backend-only
- SUPERVISOR_TOKEN backend-only
- Admin authentication
- no generic HA service proxy
- no generic WebSocket proxy
- no arbitrary browser-to-Supervisor calls
- upload type validation
- upload size limits
- path traversal protection
- no whole-DATA_DIR exposure
- no application-level unsafe DNS workaround
- safe logging
- secret redaction

FINAL REPORT

At the end report:

1. repository commit audited
2. exact Sprint IDs included in Part 17
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
14. confirmation that every new manual test contains complete step-by-step instructions, expected results and failure criteria
15. repair items added
16. for EACH new Repair Queue item: Repair ID, Sprint, Priority, Finding
17. existing Repair Queue items receiving additional evidence

If Sprint 25.5 is in scope:
18. application network/bind findings
19. hostname/mDNS distinction findings
20. HAOS direct-LAN findings
21. JPEG/JPG validator findings
22. malformed-file rejection findings
23. upload regression findings
24. background replacement-safety findings

If Sprint 25.6 is in scope:
25. card renderer inventory
26. valid-size matrix findings
27. presentation-tier findings
28. Climate layout findings
29. other-card layout findings
30. long-value/state findings
31. touch-target findings
32. test-matrix/harness findings

Cross-cutting:
33. shared asset/cache findings
34. Legacy Safari/iPad findings
35. security findings
36. Standalone/LXC relevance
37. Home Assistant App relevance
38. whether Audit Part 17 is COMPLETE
39. exact scope planned for Part 18 according to AUDIT_INDEX.md
40. recommended audit-doc commit message

Do NOT start Part 18.
Do NOT perform repair work from REPAIR_QUEUE.md.
Do NOT perform production HAOS/iPad/network manual tests in this run.
Do NOT publish images/releases/artifacts.
Do NOT commit or push until I review the result.
```
