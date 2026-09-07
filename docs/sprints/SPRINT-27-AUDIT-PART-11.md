# Sprint 27 – Audit Part 11 Codex Prompt

```text
Execute Sprint 27 Audit Part 11 only.

Use the persistent Sprint 27 audit framework already present in the repository.

Read first:

- AGENTS.md
- docs/SPRINT_ROADMAP.md
- docs/PROJECT_STATUS.md
- docs/audits/AUDIT_INDEX.md
- docs/audits/REPAIR_QUEUE.md
- docs/audits/MANUAL_TEST_QUEUE.md
- all existing audit files from Parts 01–10
- all sprint specification files assigned to Audit Part 11 in AUDIT_INDEX.md

Inspect the actual repository state first.

IMPORTANT:

The exact Sprint scope for Part 11 is defined in:

docs/audits/AUDIT_INDEX.md

Use that definition as authoritative.

Do NOT silently expand the scope.

Do NOT start Part 12.

Do NOT perform broad repair work during this baseline audit.

For every Sprint assigned to Part 11:

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

PART 11 FOCUS:

Part 11 is the final Audit Part of the Sprint 21 / 21.x sequence according to
the current Sprint 27 plan.

However, the authoritative scope remains:

docs/audits/AUDIT_INDEX.md

Audit only the Sprint IDs assigned there.

Where relevant, focus on the final Sprint 21.x end-state, especially:

- System Dashboard navigation
- global health indicator
- return-target handling
- safe back navigation
- status endpoint
- Summary/Error header behavior
- interaction between normal dashboards and system dashboards
- stale/unknown system-health behavior
- alert visibility rules
- read-only system-dashboard security boundaries
- legacy Safari behavior for navigation and indicators

Do not audit Sprint 22 or later in this run.

GLOBAL HEALTH INDICATOR:

Where applicable verify:

- the indicator is always based on GLOBAL system state, not currently filtered
  Summary/Error presentation
- Warning/Error/Critical states surface according to the Sprint specification
- Info-only state does not show an alert when the Sprint explicitly excludes it
- stale/unknown system state does not disappear into a false healthy condition
- API failures do not falsely show healthy
- loading/unknown state is represented safely
- the indicator remains visible where specified on normal dashboards
- the indicator does not grant any write capability

If the health indicator uses a dedicated small status endpoint, inspect:

- route
- normalization
- response size
- severity calculation
- stale/error handling
- security/read-only nature

NAVIGATION FROM NORMAL DASHBOARDS:

Where applicable verify:

- Summary is reachable from default dashboard
- Summary is reachable from custom dashboards
- Error/Health indicator navigation works when visible
- navigation stays in the same browsing context
- internal URLs are same-origin / relative where appropriate
- no target=_blank for internal navigation
- no window.open() for internal navigation
- no hardcoded host/IP/protocol that breaks deployment portability

If Sprint 25.2 later replaced the HomeScreen-specific navigation mechanism,
document that superseding relationship without auditing Sprint 25.2 in full.

RETURN TARGET / BACK NAVIGATION:

Where applicable verify supported return targets such as:

/
valid /d/... paths

Verify rejection of unsafe targets, including:

- absolute external URL
- protocol-relative URL
- javascript:
- data:
- malformed encoded external target

Audit the actual validator/helper.

Confirm the system pages cannot be abused as an open redirect.

Where a custom dashboard return target exists, verify it returns to the
intended dashboard rather than always returning to `/`.

SYSTEM PAGE HEADER:

Where applicable verify:

- Summary/Error title/header design
- Back/return control
- global/system status presentation
- compactness/simplification required by the Sprint
- no redundant navigation controls
- no accidental dashboard write controls in system headers

STATUS / FILTER INDEPENDENCE:

Verify:

- Summary/Error filters only affect visible issue presentation
- filters do NOT change the global Health Indicator
- filtered-out critical issues do not make global health appear healthy
- column preferences do not affect health state
- navigation does not reset canonical backend system state

STALE / UNKNOWN / API FAILURE:

Where applicable test or inspect behavior for:

- successful healthy state
- warning state
- error state
- critical state
- info-only state
- stale metadata
- unknown metadata
- system API failure
- timeout
- empty response / malformed response where defensive handling is required

Verify the UI fails safely rather than falsely claiming healthy state.

READ-ONLY SYSTEM SECURITY:

Verify where applicable:

- system status endpoint is read-only
- Summary/Error endpoints are read-only
- no generic service proxy
- no arbitrary HA service invocation from system pages
- no browser-to-HA WebSocket
- no registry/config-entry/label writes
- system dashboard visibility does not grant write authorization
- HA token remains backend-only
- SUPERVISOR_TOKEN remains backend-only

SHARED ASSET / CACHE VERSION FOLLOW-UP:

The known shared-cache inconsistency from earlier audit parts must remain
tracked.

Known evidence:

- index.html: v=51
- system.html: v=44

Do NOT repair it in Part 11.

Check whether Part 11 navigation/health-indicator JS or shared CSS can be
affected by divergent cache versions.

If yes:

- append evidence to the EXISTING Repair ID
- do not create a duplicate Repair ID
- document affected routes/components

LEGACY FRONTEND COMPATIBILITY:

For frontend code touched by Part 11 verify where applicable that runtime code
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

Audit navigation helpers and system-status polling specifically for ES5/iOS 9
compatibility.

HOME SCREEN / SAFARI CONTEXT:

Do not perform the Sprint 25.2 audit here.

However, if the current navigation helper used by Sprint 21.5 has since been
replaced by Sprint 25.2, verify the current helper still satisfies the
Sprint 21.5 same-context intent.

Physical HomeScreen validation remains a manual test unless already documented.

IMPORTANT MANUAL TEST POLICY:

No physical iPad mini tests are being performed during Audit Part 11.

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
- required dashboard/system state
- required severity/state setup
- orientation if relevant
- HomeScreen/Safari mode where relevant
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

"Check health indicator navigation."

Instead specify, for example:

- exact dashboard route
- required backend severity
- whether indicator should be visible
- expected icon/text/severity
- tap action
- expected destination
- expected return target
- whether Safari/HomeScreen context must remain unchanged
- exact failure criteria

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

Every NEW repair item added from Part 11 must contain:

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

- security/open redirect
- false healthy state
- missing critical alert
- broken system navigation
- legacy iPad/HomeScreen impact
- release correctness
- workaround availability

Do not classify every issue P0/P1.

EXISTING REPAIR ITEMS:

Do not duplicate existing Repair IDs.

If Part 11 adds evidence to an existing issue:

- preserve the Repair ID
- append evidence
- reference additional affected Sprint/component
- preserve finding history

REPAIR CONSISTENCY CHECK:

Before finishing Part 11 compare all new:

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

Create/update the individual audit files for every Sprint assigned to Part 11:

docs/audits/sprints/SPRINT-<ID>-AUDIT.md

Do not overwrite or remove audit history from Parts 01–10.

Update:

docs/audits/AUDIT_INDEX.md
docs/audits/REPAIR_QUEUE.md
docs/audits/MANUAL_TEST_QUEUE.md

Run relevant automated tests for Part 11.

Where tests cover:

- global health status calculation
- Info-only exclusion
- Warning/Error/Critical indicator behavior
- stale/unknown handling
- status endpoint
- navigation helper
- return-target validation
- open redirect protection
- custom-dashboard return path
- same-origin internal navigation
- filter independence

reference them explicitly as Evidence.

If a bounded full regression suite is practical, run it as additional evidence.

Do not mark physical iPad/HomeScreen behavior PASS based solely on automated
tests.

SECURITY:

Where relevant verify:

- HA token backend-only
- SUPERVISOR_TOKEN backend-only
- Admin token separation
- no browser-to-HA WebSocket
- no generic WebSocket proxy
- no generic HA service proxy
- no arbitrary service/domain passthrough
- safe return-target validation
- no open redirect
- read-only system endpoints
- input validation
- secret redaction

STANDALONE / HA APP:

Where Part 11 behavior is shared across deployment modes, verify there is no
accidental Standalone-only or HA-App-only route construction.

Do not fully audit Sprint 24 packaging in this part.

At the end report:

1. repository commit audited
2. exact Sprint IDs included in Part 11
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
18. global health indicator findings
19. status endpoint findings
20. filter-independence findings
21. normal-dashboard navigation findings
22. system Back/return-target findings
23. open-redirect/security findings
24. stale/unknown/API-failure findings
25. shared asset/cache findings
26. Legacy Safari / iPad findings
27. HomeScreen/manual-test findings
28. security findings
29. Standalone/LXC relevance
30. Home Assistant App relevance
31. whether Audit Part 11 is COMPLETE
32. confirmation that the Sprint 21/21.x audit sequence is now complete
33. exact scope planned for Part 12 according to AUDIT_INDEX.md
34. recommended audit-doc commit message

Do NOT start Part 12.

Do NOT perform repair work from REPAIR_QUEUE.md.

Do NOT perform physical iPad mini tests in this run.

Do NOT commit or push until I review the result.
```
