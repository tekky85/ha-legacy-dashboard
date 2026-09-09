# Sprint 27 – Audit Part 15 Codex Prompt

```text
Execute Sprint 27 Audit Part 15 only.

Use the persistent Sprint 27 audit framework already present in the repository.

Read first:

- AGENTS.md
- docs/SPRINT_ROADMAP.md
- docs/PROJECT_STATUS.md
- docs/audits/AUDIT_INDEX.md
- docs/audits/REPAIR_QUEUE.md
- docs/audits/MANUAL_TEST_QUEUE.md
- all existing audit files from Parts 01–14
- all sprint specification files assigned to Audit Part 15 in AUDIT_INDEX.md

Inspect the actual repository state first.

IMPORTANT:

The exact Sprint scope for Part 15 is defined in:

docs/audits/AUDIT_INDEX.md

Use that definition as authoritative.

According to the current Sprint 27 plan, Part 15 belongs to the Sprint 25 / 25.x
audit phase.

If AUDIT_INDEX.md differs, use AUDIT_INDEX.md as the source of truth and report
the discrepancy.

Do NOT silently expand the scope.
Do NOT start Part 16.
Do NOT perform broad repair work during this baseline audit.

For every Sprint assigned to Part 15:

1. Read the complete Sprint specification.
2. Compare every requirement against the CURRENT repository implementation.
3. Verify frontend, backend, persistence, routes, theme/navigation behavior,
   tests and release relevance where applicable.
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
- localStorage/storage key
- persistence implementation
- test file / test name
- manual-test reference

SUPERSEDED REQUIREMENTS

If a later Sprint intentionally replaced an earlier implementation, do not mark
the earlier requirement BROKEN merely because the old implementation no longer exists.

Instead document:
- which later Sprint superseded it
- where the current implementation now lives
- whether the original intended end-state is still satisfied

Use where appropriate:
PASS – superseded by Sprint X
or:
N/A – replaced by Sprint X

Do not use "superseded" to hide a current regression.

PART 15 FOCUS – PRE-RELEASE UI / NAVIGATION CORRECTNESS

Where the assigned Sprint scope includes Sprint 25.1 and/or Sprint 25.2,
audit the current end-state of:

- global theme persistence
- theme sharing across normal/system pages
- exact Error Dashboard filter semantics
- device-group filtering
- filtered visible severity
- severity/status AND semantics
- global health independence from filters
- HomeScreen standalone navigation
- same browsing context
- safe same-origin navigation
- return-target preservation
- no open redirect regression

The authoritative Sprint IDs remain those assigned to Part 15 in AUDIT_INDEX.md.

THEME PERSISTENCE

Where applicable verify one global persistent theme preference is shared by:

- /
- /d/...
- /system/summary
- /system/errors
- Admin where the Sprint requires it

Audit:
- storage key
- initialization path
- refresh behavior
- navigation behavior
- default fallback
- light/dark application
- shared helper usage
- page-specific duplicate logic
- stale/legacy theme keys

Verify navigation between pages does not reset the selected theme.

ERROR FILTER SEMANTICS

Where applicable verify exact severity semantics:

Critical -> only critical
Error    -> only error
Warning  -> only warning
Info     -> only info

Do NOT accept threshold semantics such as severity >= selected unless explicitly
required by the Sprint specification.

Where device groups exist:
1. filter child issues first
2. keep a device group only if matching child issues remain
3. derive visibleSeverity from filtered children where specified
4. preserve original group severity internally for All view where required

Verify filtering does not mutate canonical issue data.

SEVERITY + STATUS COMBINATION

Where both Severity and Status filters exist, verify AND semantics apply to the
same child issue.

Example:

Severity=Warning
AND
Status=Unavailable

must require one child issue satisfying both.

Do not allow cross-child matching.

GLOBAL HEALTH INDICATOR

Where applicable verify:
- UI filters do NOT alter global health
- filtered-out critical issues do not make the system appear healthy
- global status uses canonical backend/system state
- Info-only behavior follows the Sprint requirements
- stale/unknown/API failure does not collapse into false healthy state

HOMESCREEN STANDALONE NAVIGATION

Where Sprint 25.2 is in scope, audit internal navigation behavior for iOS
HomeScreen standalone mode.

Inspect:
- navigation helper
- Summary link
- Errors/health link
- Back/return link
- default dashboard
- custom /d/... dashboard
- system pages

Verify internal navigation uses the SAME browsing context / same web-app instance.

Do NOT accept:
- window.open() for internal routes
- target="_blank" for internal routes
- forced new Safari tabs/windows
- absolute hostnames/IPs that break deployment portability

Prefer:
- relative routes
- same-origin URLs
- location assignment/helper suitable for ES5/iOS 9

RETURN TARGET

Where system pages preserve source dashboard, verify safe return targets.

Valid examples where specified:
/
valid /d/...

Reject:
- external absolute URLs
- protocol-relative URLs
- javascript:
- data:
- malformed encoded external targets

Verify custom dashboard return does not always collapse to `/`.

DEPLOYMENT PORTABILITY

Audit internal navigation for assumptions about:
- fixed IP
- homeassistant.local
- fixed hostname
- fixed protocol
- fixed port
- Ingress path

LEGACY COMPATIBILITY

For frontend code touched by Part 15 verify where applicable that current runtime code
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

Audit navigation/theme helpers specifically for ES5 compatibility.

SHARED ASSET / CACHE VERSION FOLLOW-UP

The known shared-cache inconsistency from earlier audit parts must remain tracked.

Known evidence:
- index.html: v=51
- system.html: v=44

Do NOT repair it in Part 15.

Because theme and navigation rely on shared frontend assets, explicitly assess whether
the cache mismatch can cause:
- stale theme persistence logic
- stale navigation helper logic
- inconsistent behavior between normal and system pages

If yes:
- append evidence to the EXISTING Repair ID
- do not duplicate the Repair ID
- document RC relevance

MANUAL TEST POLICY

No physical iPad mini tests are being performed during Audit Part 15.

All real-device/manual tests will be executed only after ALL Audit Parts have completed.

Therefore:
- do NOT mark HomeScreen/iPad behavior PASS without existing documented evidence
- classify as NOT TESTED where appropriate
- add required tests to docs/audits/MANUAL_TEST_QUEUE.md

Use suitable Test IDs:
TEST-IPAD-XXX
TEST-HOMESCREEN-XXX
TEST-SAFARI-XXX

For EVERY queued manual test include:
- Test ID
- related Sprint
- Requirement
- Device
- Preconditions
- exact route/page
- exact theme/filter/system state
- HomeScreen or Safari mode
- portrait/landscape if relevant
- exact step-by-step actions
- expected visual result
- expected functional result
- failure criteria
- evidence to capture
- result field

Do NOT write vague tests such as "Test HomeScreen navigation."

REPAIR QUEUE

Any actionable PARTIAL / MISSING / BROKEN finding must be represented in:
docs/audits/REPAIR_QUEUE.md

Every NEW repair item added from Part 15 must contain:
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
- broken theme persistence
- incorrect Error filtering
- false healthy state
- HomeScreen navigation escaping into Safari/new tab
- open redirect
- deployment-specific broken routes
- legacy iPad impact
- release correctness
- workaround availability

Do not duplicate existing Repair IDs.

Before finishing Part 15 compare all new actionable findings against REPAIR_QUEUE.md.
No actionable finding may remain untracked.

AUDIT FILES

Create/update:
docs/audits/sprints/SPRINT-<ID>-AUDIT.md

Do not overwrite or remove audit history from Parts 01–14.

Update:
docs/audits/AUDIT_INDEX.md
docs/audits/REPAIR_QUEUE.md
docs/audits/MANUAL_TEST_QUEUE.md

AUTOMATED / LOCAL TESTS

Run relevant bounded tests for Part 15.

Where possible verify:
- theme storage/init
- theme persistence across page initialization
- exact severity filters
- status filters
- same-child AND semantics
- filtered device group severity
- global health filter independence
- navigation helper
- safe same-origin navigation
- return-target validation
- open redirect rejection
- custom dashboard return target
- no window.open()
- no target=_blank on internal routes

If a bounded full regression suite is practical, run it as additional evidence.

Do not mark physical iPad/HomeScreen behavior PASS based solely on automated tests.

SECURITY

Explicitly verify where relevant:
- HA token backend-only
- SUPERVISOR_TOKEN backend-only
- no generic HA service proxy
- no arbitrary service/domain passthrough
- safe return-target validation
- no open redirect
- no external-origin navigation injection
- input validation
- secret redaction

FINAL REPORT

At the end report:

1. repository commit audited
2. exact Sprint IDs included in Part 15
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
14. confirmation that every new manual test contains complete step-by-step instructions,
    expected results and failure criteria
15. repair items added
16. for EACH new Repair Queue item: Repair ID, Sprint, Priority, Finding
17. existing Repair Queue items receiving additional evidence

If Sprint 25.1 is in scope:
18. theme persistence findings
19. Error severity filter findings
20. status filter findings
21. same-child AND findings
22. device-group visibleSeverity findings
23. global health filter-independence findings

If Sprint 25.2 is in scope:
24. HomeScreen navigation findings
25. same-context findings
26. safe same-origin route findings
27. return-target findings
28. open-redirect findings
29. deployment portability findings

Cross-cutting:
30. shared asset/cache findings
31. Legacy Safari/iPad findings
32. security findings
33. Standalone/LXC relevance
34. Home Assistant App relevance
35. whether Audit Part 15 is COMPLETE
36. exact scope planned for Part 16 according to AUDIT_INDEX.md
37. recommended audit-doc commit message

Do NOT start Part 16.
Do NOT perform repair work from REPAIR_QUEUE.md.
Do NOT perform physical iPad mini/HomeScreen tests in this run.
Do NOT commit or push until I review the result.
```
