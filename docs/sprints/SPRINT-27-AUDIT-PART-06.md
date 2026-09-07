# Sprint 27 – Audit Part 06 Codex Prompt

```text
Execute Sprint 27 Audit Part 06 only.

Use the persistent Sprint 27 audit framework already present in the repository.

Read first:

- AGENTS.md
- docs/SPRINT_ROADMAP.md
- docs/PROJECT_STATUS.md
- docs/audits/AUDIT_INDEX.md
- docs/audits/REPAIR_QUEUE.md
- docs/audits/MANUAL_TEST_QUEUE.md
- all existing audit files from Parts 01–05
- all sprint specification files assigned to Audit Part 06 in AUDIT_INDEX.md

Inspect the actual repository state first.

IMPORTANT:

The exact Sprint scope for Part 06 is defined in:

docs/audits/AUDIT_INDEX.md

Use that definition as authoritative.

Do NOT silently expand the scope.

Do NOT start Part 07.

Do NOT perform broad repair work during this baseline audit.

For every Sprint assigned to Part 06:

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

Part 06 belongs to the Sprint 17.x UI / Legacy Safari audit sequence.

Pay particular attention to the FINAL current end-state of the Sprint 17.x
work assigned to this part.

Audit relevant areas such as:

- legacy Safari control alignment
- power button alignment
- plus/minus alignment
- button content centering
- SVG/icon centering
- control-row layout
- Focus/Grid separation
- Focus controls
- normal Dashboard controls
- touch target sizing
- legacy WebKit Flexbox behavior
- fallback alignment behavior
- iOS 9 / Safari compatibility
- ES5 compatibility

Where applicable verify the complete control hierarchy:

control row
-> control group / control cell
-> button
-> button content
-> SVG / icon
-> label

Audit relevant CSS/DOM properties including:

- display
- display:flex
- display:-webkit-flex
- justify-content
- -webkit-justify-content
- align-items
- -webkit-align-items
- text-align
- width
- min-width
- max-width
- height
- min-height
- max-height
- flex-basis
- flex-grow
- flex-shrink
- prefixed flex variants
- margin
- padding
- line-height
- vertical-align
- box-sizing
- -webkit-appearance
- button default styles
- WebKit-specific box alignment if used

Do not accept device-specific pixel offsets, transform hacks or visual-only
workarounds as satisfying a requirement if the Sprint specification explicitly
forbids them.

Where a fallback layout is used because legacy Safari Flexbox behavior is
unreliable, verify that the fallback is structurally centered and not merely
visually compensated for one screen size.

LEGACY COMPATIBILITY:

Where applicable verify the current implementation does not require:

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

SUPERSEDED REQUIREMENTS:

If a later Sprint intentionally replaced an earlier Sprint 17.x implementation,
do not mark the earlier requirement BROKEN merely because the old code no
longer exists.

Instead document:

- which later Sprint superseded it
- where the current implementation now lives
- whether the original intended end-state is still satisfied

Use where appropriate:

PASS – superseded by Sprint 17.x

or:

N/A – replaced by Sprint 17.x

Do not use "superseded" to hide a current functional regression.

If the current implementation no longer satisfies the intended end-state,
classify it honestly as PARTIAL or BROKEN.

CONTROL REGRESSION CHECK:

Where relevant verify both:

Normal Dashboard:
- Light Power
- Climate Power
- other supported controls assigned to this Sprint scope

Focus:
- Light Power
- Climate Power
- Climate minus
- Climate plus

Confirm that alignment logic is shared safely where intended while preserving
different Grid and Focus geometries.

Do not require identical pixel geometry between Grid and Focus if the Sprint
specification explicitly separated them.

ROOM CARD / LATER FEATURE INTERACTION:

Later Room Card work may now reuse shared control styles.

Do not audit Sprint 26.x itself in Part 06.

However, if later code changed a shared control primitive that Sprint 17.x
depends on, inspect whether that change currently regresses the Sprint 17.x
end-state.

Document the current regression if one exists.

Do not expand scope into a Sprint 26 audit.

IMPORTANT MANUAL TEST POLICY:

No physical iPad mini tests are being performed during Audit Part 06.

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
- required card size where relevant
- orientation
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

The instructions must be detailed enough that the test can be executed later
without needing to infer what "correct" means.

Do NOT add vague tests such as:

"Check button alignment on iPad."

Instead specify exact checks such as:

- dashboard route
- entity/card type
- card size
- Focus or Grid
- portrait or landscape
- which buttons/icons are inspected
- expected horizontal and vertical centering
- minimum touch target
- whether labels/icons must remain inside button boundaries
- whether controls remain usable after rotation

Where multiple related checks can safely be combined into one real-device test,
combine them to reduce manual test effort.

Do NOT combine tests when doing so would make failure attribution unclear.

REAL DEVICE TEST BATCHING:

Prefer, where sensible, test instructions that can later validate several
closely related control-alignment requirements in one physical session.

Example:

TEST-IPAD-CONTROLS-01:
- Light Grid Power
- Climate Grid Power
- Climate Focus Power
- Climate Focus minus/plus
- Portrait
- Landscape

But only combine them if each sub-check has its own explicit expected result
and failure criterion.

REPAIR QUEUE:

Any actionable:

PARTIAL
MISSING
BROKEN

finding goes into:

docs/audits/REPAIR_QUEUE.md

Do not repair it during this run unless only a trivial audit-document
correction is required.

Create/update the individual audit files for every Sprint assigned to Part 06:

docs/audits/sprints/SPRINT-<ID>-AUDIT.md

Do not overwrite or remove audit history from Parts 01–05.

Update:

docs/audits/AUDIT_INDEX.md
docs/audits/REPAIR_QUEUE.md
docs/audits/MANUAL_TEST_QUEUE.md

Run relevant automated tests for Part 06.

Where existing tests cover legacy control layout or rendering logic, reference
them explicitly as Evidence.

If a bounded full regression suite is practical, run it as additional evidence.

Do not mark CSS/layout behavior PASS based solely on automated unit tests if the
Sprint explicitly requires real iPad validation.

SECURITY:

Where relevant verify that control/UI changes did not weaken:

- backend-only HA token handling
- backend-only SUPERVISOR_TOKEN handling
- Admin security
- explicit write authorization
- entity/domain validation
- payload validation
- no generic HA service proxy

Do not invent unrelated security requirements.

STANDALONE / HA APP:

Where shared frontend assets are used by both deployment modes, verify there is
no deployment-specific divergence that would invalidate the audited UI
requirements.

Do not separately audit Sprint 24/25 App packaging in this part.

At the end report:

1. repository commit audited
2. exact Sprint IDs included in Part 06
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
16. Grid control findings
17. Focus control findings
18. legacy WebKit/Flexbox findings
19. control-alignment findings
20. Legacy Safari / iPad findings
21. security findings
22. Standalone/LXC relevance
23. Home Assistant App relevance
24. whether Audit Part 06 is COMPLETE
25. exact scope planned for Part 07 according to AUDIT_INDEX.md
26. recommended audit-doc commit message

Do NOT start Part 07.

Do NOT perform repair work from REPAIR_QUEUE.md.

Do NOT perform physical iPad mini tests in this run.

Do NOT commit or push until I review the result.
```
