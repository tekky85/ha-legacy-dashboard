# Sprint 27 – Audit Part 05 Codex Prompt

```text
Execute Sprint 27 Audit Part 05 only.

Use the persistent Sprint 27 audit framework already present in the repository.

Read first:

- AGENTS.md
- docs/SPRINT_ROADMAP.md
- docs/PROJECT_STATUS.md
- docs/audits/AUDIT_INDEX.md
- docs/audits/REPAIR_QUEUE.md
- docs/audits/MANUAL_TEST_QUEUE.md
- all existing audit files from Parts 01–04
- all sprint specification files assigned to Audit Part 05 in AUDIT_INDEX.md

Inspect the actual repository state first.

IMPORTANT:

The exact Sprint scope for Part 05 is defined in:

docs/audits/AUDIT_INDEX.md

Use that definition as authoritative.

Do NOT silently expand the scope.

Do NOT start Part 06.

Do NOT perform broad repair work during this baseline audit.

For every Sprint assigned to Part 05:

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

Because Part 05 is part of the Sprint 17.x UI / Legacy Safari audit range,
pay particular attention to the current end-state of:

- Focus rendering
- Focus overlay layout
- Focus/Grid separation
- widget-specific Focus renderers
- control alignment
- control geometry
- touch interaction
- card content hierarchy
- Safari iOS 9 behavior
- iPad-specific layout constraints
- ES5 compatibility

Where applicable verify that the current code does not require:

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

Also audit whether later Sprint 17.x changes intentionally superseded earlier
implementations.

SUPERSEDED REQUIREMENTS:

If a later Sprint intentionally replaced an earlier implementation, do not
mark it BROKEN merely because the original implementation no longer exists.

Instead document:

- which later Sprint superseded it
- where the current implementation lives
- whether the intended end-state is still satisfied

Use, where appropriate:

PASS – superseded by Sprint 17.x

or:

N/A – replaced by Sprint 17.x

Do not use "superseded" to hide a current regression.

If the current behavior no longer satisfies the original requirement, classify
it honestly as PARTIAL or BROKEN.

FOCUS-SPECIFIC CHECKS:

Where relevant audit:

- Focus does not clone/carry grid x/y/w/h geometry incorrectly
- dedicated Focus renderers exist where required
- Sensor Focus
- Binary Focus
- Light Focus
- Climate Focus
- primary content is visible without unnecessary scrolling
- controls remain reachable
- focus panel does not become tiny/compressed on iPad
- focus overlay remains above dashboard/background layers
- controls do not accidentally trigger card/overlay navigation
- unavailable/stale state disables unsafe controls correctly
- Focus layout works independently of compact grid presentation classes

CONTROL ALIGNMENT:

Where relevant verify the complete hierarchy:

control row
control group
button
button content
SVG/icon
label

Audit:

- width
- height
- padding
- margin
- line-height
- text-align
- display
- flex alignment
- prefixed WebKit flex properties where needed
- box-sizing
- -webkit-appearance
- button defaults
- touch target size

Do not accept transform/pixel-offset hacks as a valid stable solution if the
spec explicitly prohibited them.

IMPORTANT MANUAL TEST POLICY:

No physical iPad mini tests are being performed during Audit Part 05.

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
- required card/entity/state
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

The test instructions must be executable later without needing to infer what
"correct" means.

Do NOT add vague tests such as:

"Check Focus layout on iPad."

Instead specify exactly:

- which dashboard
- which card type
- which card state
- whether Focus should open
- which controls must be visible
- whether scrolling should be necessary
- what alignment is expected
- portrait/landscape where required

Where multiple related checks can safely be combined into one real-device test,
combine them to reduce manual effort.

Do NOT combine tests if doing so makes failure attribution unclear.

REPAIR QUEUE:

Any actionable:

PARTIAL
MISSING
BROKEN

finding goes into:

docs/audits/REPAIR_QUEUE.md

Do not repair it during this run unless only a trivial audit-document
correction is required.

Create/update the individual audit files for every Sprint assigned to Part 05:

docs/audits/sprints/SPRINT-<ID>-AUDIT.md

Do not overwrite or remove audit history from Parts 01–04.

Update:

docs/audits/AUDIT_INDEX.md
docs/audits/REPAIR_QUEUE.md
docs/audits/MANUAL_TEST_QUEUE.md

Run relevant automated tests for Part 05.

If a bounded full regression suite is practical, run it as additional evidence.

SECURITY:

Where relevant verify that UI/Focus/control changes did not weaken:

- backend-only HA token handling
- backend-only SUPERVISOR_TOKEN handling
- Admin security
- explicit write authorization
- payload validation
- domain/entity authorization

Do not invent unrelated security requirements.

At the end report:

1. repository commit audited
2. exact Sprint IDs included in Part 05
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
    instructions and expected results
15. repair items added
16. Focus-specific findings
17. Legacy Safari / iPad findings
18. control-alignment findings
19. security findings
20. Standalone/LXC relevance
21. Home Assistant App relevance
22. whether Audit Part 05 is COMPLETE
23. exact scope planned for Part 06 according to AUDIT_INDEX.md
24. recommended audit-doc commit message

Do NOT start Part 06.

Do NOT perform repair work from REPAIR_QUEUE.md.

Do NOT perform physical iPad mini tests in this run.

Do NOT commit or push until I review the result.
```
