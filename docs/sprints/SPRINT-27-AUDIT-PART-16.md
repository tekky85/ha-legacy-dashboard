# Sprint 27 – Audit Part 16 Codex Prompt

```text
Execute Sprint 27 Audit Part 16 only.

Use the persistent Sprint 27 audit framework already present in the repository.

Read first:

- AGENTS.md
- docs/SPRINT_ROADMAP.md
- docs/PROJECT_STATUS.md
- docs/audits/AUDIT_INDEX.md
- docs/audits/REPAIR_QUEUE.md
- docs/audits/MANUAL_TEST_QUEUE.md
- all existing audit files from Parts 01–15
- all sprint specification files assigned to Audit Part 16 in AUDIT_INDEX.md

Inspect the actual repository state first.

IMPORTANT:

The exact Sprint scope for Part 16 is defined in:

docs/audits/AUDIT_INDEX.md

Use that definition as authoritative.

According to the current Sprint 27 plan, Part 16 belongs to the Sprint 25 / 25.x
audit phase.

If AUDIT_INDEX.md differs from any assumptions in this prompt, use
AUDIT_INDEX.md as the source of truth and report the discrepancy.

Do NOT silently expand the scope.

Do NOT start Part 17.

Do NOT perform broad repair work during this baseline audit.

For every Sprint assigned to Part 16:

1. Read the complete Sprint specification.
2. Compare every requirement against the CURRENT repository implementation.
3. Verify frontend, backend, persistence, upload handling, layout, packaging,
   tests and release-readiness behavior where relevant.
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
- persistence path
- upload handler
- asset route
- test file / test name
- manual-test reference

SUPERSEDED REQUIREMENTS:

If a later Sprint intentionally replaced an earlier implementation, do not
mark the earlier requirement BROKEN merely because the old implementation no
longer exists.

Instead document:

- which later Sprint superseded it
- where the current implementation now lives
- whether the original intended end-state is still satisfied

Use where appropriate:

PASS – superseded by Sprint X

or:

N/A – replaced by Sprint X

Do not use "superseded" to hide a current regression.

==================================================
PART 16 FOCUS – SPRINT 25.x UI / BACKGROUND / RC CORRECTNESS
==================================================

Part 16 is part of the Sprint 25.x audit sequence.

The exact assigned Sprint IDs are defined in AUDIT_INDEX.md.

Where the assigned scope includes Sprint 25.3 and/or Sprint 25.4, audit the
corresponding areas below.

If those Sprint IDs are assigned elsewhere, do not audit them here.

==================================================
SPRINT 25.3 – PER-DASHBOARD BACKGROUND IMAGES
==================================================

Where Sprint 25.3 is in scope, audit per-dashboard background configuration.

Verify each normal dashboard can have its own independent background settings.

Audit:

- default dashboard
- custom /d/... dashboards
- image ID
- persisted configuration
- position preset
- cover/contain mode
- overlay/dimming setting
- showTitle
- replacement/removal
- rendering on actual dashboard
- Admin preview
- runtime asset URL

Do NOT assume Admin preview correctness proves runtime correctness.

Trace the full path:

Admin selection/upload
-> validated upload
-> generated image ID
-> persisted dashboard config
-> dashboard API payload
-> frontend view model
-> asset URL
-> rendered background layer

Verify each step.

==================================================
SECURE BACKGROUND UPLOAD
==================================================

Where applicable verify:

- JPEG/JPG accepted
- PNG accepted
- SVG rejected
- actual file type validated, not extension only
- malformed/truncated files rejected
- oversized upload rejected
- path traversal rejected
- original filename is not used as a filesystem path
- generated image ID/path is safe
- failed replacement does not destroy previous valid background
- only controlled asset route is exposed
- entire DATA_DIR is NOT publicly exposed
- secrets/config files cannot be fetched through asset route

If later Sprint 25.5 hardened JPEG handling, document the superseding
implementation without auditing Sprint 25.5 in full unless assigned to Part 16.

==================================================
CACHE BUSTING FOR BACKGROUND REPLACEMENT
==================================================

Verify replacing a dashboard background results in a new image identifier or
equivalent robust cache-busting mechanism suitable for legacy Safari.

A replacement must not rely solely on browser cache revalidation that is known
to be unreliable on the target iPad.

==================================================
DASHBOARD TITLE BEHAVIOR
==================================================

Where applicable verify:

- showTitle is persisted per dashboard
- existing dashboards default to title visible unless migration/spec says otherwise
- background image does not automatically disable title
- when title is hidden, required header controls remain available
- Summary link remains available where specified
- Health Indicator remains available where specified

==================================================
FULL-HEIGHT DASHBOARD / FOOTER
==================================================

Where Sprint 25.3 extended full-height behavior is in scope, audit:

- dashboard fills at least the viewport with 0 cards
- dashboard fills at least the viewport with 1 card
- dashboard fills at least the viewport with few cards
- long dashboard content scrolls normally
- footer follows content
- footer does not overlap cards
- footer is NOT fixed-position
- background fills the complete visible dashboard area
- title shown/hidden does not break page height
- portrait/landscape does not produce severe gaps/overlap
- HomeScreen mode is considered
- iOS 9 100vh quirks are handled conservatively

Preferred architecture:

Header
-> flexible Main
-> Footer

Do not require CSS Grid.

==================================================
FOOTER CONTENT
==================================================

Where applicable verify:

- footer is one line as specified
- last-update timestamp is centered as specified
- version is removed from normal/default/custom dashboard footer
- version remains available in intended Admin/system locations
- footer does not expose sensitive information

==================================================
BACKGROUND / FOCUS STACKING
==================================================

Verify:

- background remains behind dashboard content
- overlay remains behind cards/content
- Focus overlay remains above background/dashboard
- background does not intercept touch events
- control buttons remain usable
- z-index layering is deterministic

==================================================
DATA_DIR / APP PERSISTENCE
==================================================

Where background assets are persisted, verify:

Standalone:
- configurable DATA_DIR or intended standalone path

HA App:
- /data or current supported app-owned persistent path

Verify:

- uploaded backgrounds survive application restart where required
- app update/reinstall persistence is queued for manual HAOS validation if not
  provable locally
- no uploads are stored only in ephemeral image filesystem
- controlled asset route maps to the intended persistent store

==================================================
SPRINT 25.4 – RC CHECKUP / INSTALLATION VALIDATION
==================================================

If Sprint 25.4 is assigned to Part 16, audit it as a validation Sprint rather
than a feature Sprint.

Do not manufacture PASS results for checks that require real runtime evidence.

Review:

- Standalone/LXC validation
- Home Assistant App/HAOS validation
- repository structure
- app metadata
- Dockerfile/startup
- version consistency
- GHCR image expectations
- amd64/aarch64/multiarch expectations
- minimal permissions
- token handling
- repository addition/discovery
- App installation
- startup/logs
- /health
- Supervisor REST/WebSocket
- direct LAN UI
- Default/Custom dashboards
- Dark mode
- Error filters
- HomeScreen navigation
- backgrounds
- full-height/footer
- Focus
- controls
- restart persistence
- HA restart/reconnect
- Standalone regression

Use only:

PASS
FAIL
BLOCKED
NOT TESTED

for specific RC check results if Sprint 25.4 defines that narrower validation
status scheme.

Do not translate untested real-runtime checks into PASS.

==================================================
RC RESULT MATRIX
==================================================

Where Sprint 25.4 requires an RC matrix, verify an actual persistent result
matrix exists or should exist.

It should distinguish:

- automated/local verification
- HAOS runtime verification
- Standalone runtime verification
- iPad real-device verification
- release blockers
- NOT TESTED items

Do not treat planned tests as completed tests.

==================================================
HAOS / INSTALLATION MANUAL TESTS
==================================================

Where real Home Assistant App validation is still required, queue exact tests in:

docs/audits/MANUAL_TEST_QUEUE.md

Use IDs such as:

TEST-HAOS-XXX
TEST-APP-XXX

Each test must include exact steps.

Examples:

- add repository
- locate App
- install
- start
- inspect logs
- open /health
- open /admin via LAN IP:port
- open default dashboard
- open custom dashboard
- verify HA state data
- restart App
- verify config/background persistence
- restart HA Core
- verify reconnect
- update App
- verify /data persistence

Do NOT mark these PASS unless there is existing documented real-runtime evidence.

==================================================
IPAD / LEGACY MANUAL TESTS
==================================================

No physical iPad mini tests are being performed during Audit Part 16.

All real-device tests will be executed only after ALL Audit Parts have completed.

Therefore:

- do NOT mark physical iPad behavior PASS without existing documented evidence
- classify it as NOT TESTED where appropriate
- queue exact instructions

Potential tests where relevant:

- background rendering on default dashboard
- background rendering on custom dashboard
- title shown/hidden
- 0/1/few/many cards
- footer at viewport bottom with sparse content
- long content scrolling
- portrait/landscape
- rotation
- HomeScreen mode
- Focus above background
- theme + background interaction
- background replacement cache-busting

Every manual test must define:

- Test ID
- Sprint
- Requirement
- Device/System
- Preconditions
- exact route/page
- exact dashboard/card setup
- orientation/mode
- exact step-by-step actions
- expected visual result
- expected functional result
- failure criteria
- evidence to capture
- result field

Do NOT add vague tests such as:

"Check background on iPad."

==================================================
LEGACY COMPATIBILITY
==================================================

For frontend code touched by Part 16 verify where applicable that runtime code
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

Pay particular attention to:

- viewport-height handling
- background sizing
- footer layout
- upload-related Admin JS
- Focus stacking
- orientation changes

==================================================
SHARED ASSET / CACHE VERSION FOLLOW-UP
==================================================

The known shared-cache inconsistency must remain tracked.

Known evidence:

- index.html: v=51
- system.html: v=44

Do NOT repair it in Part 16.

Because Part 16 concerns visual/runtime correctness, explicitly assess whether
this mismatch can affect:

- background CSS
- title visibility
- footer layout
- Focus stacking
- theme behavior
- Admin/dashboard consistency

If yes:

- append evidence to the EXISTING Repair ID
- do not duplicate the Repair ID
- preserve its priority/history
- document RC relevance

==================================================
REPAIR QUEUE
==================================================

Any actionable:

PARTIAL
MISSING
BROKEN

finding must be represented in:

docs/audits/REPAIR_QUEUE.md

Every NEW repair item from Part 16 must contain:

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

- upload security
- data loss
- broken background runtime rendering
- broken persistence
- footer/content overlap
- inaccessible controls
- HAOS installation failure
- incorrect RC validation claims
- legacy iPad impact
- workaround availability

Do not classify every issue P0/P1.

Do not duplicate existing Repair IDs.

Before finishing Part 16:

- compare every new PARTIAL/MISSING/BROKEN finding with REPAIR_QUEUE.md
- ensure every actionable finding is tracked
- append additional evidence to existing Repair IDs where appropriate

==================================================
AUDIT FILES
==================================================

Create/update:

docs/audits/sprints/SPRINT-<ID>-AUDIT.md

for every Sprint assigned to Part 16.

Do not overwrite or remove audit history from Parts 01–15.

Update:

docs/audits/AUDIT_INDEX.md
docs/audits/REPAIR_QUEUE.md
docs/audits/MANUAL_TEST_QUEUE.md

==================================================
AUTOMATED / LOCAL TESTS
==================================================

Run relevant bounded tests.

Where applicable verify:

Background:
- config normalization
- upload validation
- JPEG/PNG handling
- SVG rejection
- path traversal rejection
- size limit
- replacement behavior
- generated image ID
- controlled asset route
- missing asset behavior
- removal
- per-dashboard independence

Layout:
- showTitle config
- full-height page classes/state
- footer rendering
- version/footer placement
- Focus z-index/layering where testable

RC validation:
- packaging syntax
- version consistency
- startup/local mock behavior
- health endpoint
- Standalone regression

Do NOT contact the real Home Assistant instance.

Do NOT read/use production credentials.

Do NOT claim HAOS/iPad runtime PASS from local mocks.

==================================================
SECURITY
==================================================

Explicitly verify where relevant:

- HA token backend-only
- SUPERVISOR_TOKEN backend-only
- Admin authentication on upload/config routes
- no generic HA service proxy
- no arbitrary service/domain passthrough
- typed file validation
- size limits
- path traversal protection
- controlled read-only asset route
- no whole-DATA_DIR exposure
- no secret leakage via filenames/logs
- safe removal/replacement
- no browser credential exposure

==================================================
FINAL REPORT
==================================================

At the end report:

1. repository commit audited
2. exact Sprint IDs included in Part 16
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
14. confirmation that every new manual test contains complete step-by-step
    instructions, expected results and failure criteria
15. repair items added
16. for EACH new Repair Queue item:
    - Repair ID
    - Sprint
    - Priority
    - Finding
17. existing Repair Queue items receiving additional evidence

If Sprint 25.3 is in scope:
18. background configuration findings
19. upload-security findings
20. runtime background-rendering findings
21. background persistence findings
22. cache-busting/replacement findings
23. showTitle/header findings
24. full-height layout findings
25. footer findings
26. Focus/background stacking findings

If Sprint 25.4 is in scope:
27. RC matrix findings
28. Standalone validation findings
29. HA App/HAOS validation findings
30. version/packaging findings
31. real-runtime NOT TESTED findings
32. RC blocker findings

Cross-cutting:
33. shared asset/cache findings
34. Legacy Safari/iPad findings
35. security findings
36. Standalone/LXC relevance
37. Home Assistant App relevance
38. whether Audit Part 16 is COMPLETE
39. exact scope planned for Part 17 according to AUDIT_INDEX.md
40. recommended audit-doc commit message

Do NOT start Part 17.

Do NOT perform repair work from REPAIR_QUEUE.md.

Do NOT perform production HAOS/iPad manual tests in this run.

Do NOT publish images/releases/artifacts.

Do NOT commit or push until I review the result.
```
