# Sprint 27 – Audit Part 13 Codex Prompt

```text
Execute Sprint 27 Audit Part 13 only.

Use the persistent Sprint 27 audit framework already present in the repository.

Read first:

- AGENTS.md
- docs/SPRINT_ROADMAP.md
- docs/PROJECT_STATUS.md
- docs/audits/AUDIT_INDEX.md
- docs/audits/REPAIR_QUEUE.md
- docs/audits/MANUAL_TEST_QUEUE.md
- all existing audit files from Parts 01–12
- all sprint specification files assigned to Audit Part 13 in AUDIT_INDEX.md

Inspect the actual repository state first.

IMPORTANT:

The exact Sprint scope for Part 13 is defined in docs/audits/AUDIT_INDEX.md.
Use that definition as authoritative.

According to the current Sprint 27 plan, Part 13 is expected to cover Sprint 24.
If AUDIT_INDEX.md differs, use AUDIT_INDEX.md as the source of truth and report
the discrepancy.

Do NOT silently expand the scope.
Do NOT start Part 14.
Do NOT perform broad repair work during this baseline audit.

For every Sprint assigned to Part 13:

1. Read the complete Sprint specification.
2. Compare every requirement against the CURRENT repository implementation.
3. Verify repository structure, packaging metadata, Docker/runtime behavior,
   backend architecture, persistence, network exposure, token handling,
   startup scripts, tests and documentation where relevant.
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
- Dockerfile
- app config file
- startup script
- route
- environment variable handling
- persistence path
- test file / test name
- documentation path
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

SPRINT 24 FOCUS – HOME ASSISTANT APP PACKAGING

Sprint 24 adds Home Assistant App / HAOS deployment as an additional deployment
mode. The application must remain an external HA Legacy Dashboard application.

Do NOT accept an architecture that converts it into Lovelace, a custom panel,
an HA-internal frontend, or a modern-browser-only frontend module.

Standalone/LXC deployment must remain supported unless the Sprint explicitly
states otherwise.

Expected high-level deployment modes:

Standalone:
-> HA REST / server-side WebSocket using backend credentials

Home Assistant App:
-> Supervisor/Core API using SUPERVISOR_TOKEN server-side

Verify the actual current implementation.

REPOSITORY / APP STRUCTURE

Where applicable inspect:
- repository.yaml
- app/config.yaml
- Dockerfile
- root filesystem layout
- startup/run script
- package.json
- architecture-specific build files
- image metadata
- app icon/logo references
- changelog/readme references

Verify:
- files are located where Home Assistant App packaging expects them
- references resolve
- no obsolete alternate packaging structure is presented as current
- duplicated packaging files do not conflict
- startup command matches the actual application
- Node/runtime version is compatible with project requirements

APP METADATA / CONFIGURATION

Where applicable inspect:
- app name
- slug
- version
- architectures
- startup
- boot behavior
- ports
- web UI URL
- homeassistant_api
- ingress if present
- host_network if present
- privileged/protected mode flags
- filesystem mounts
- options/schema
- environment mapping

Verify minimum necessary permissions.

ARCHITECTURES

Where required verify support for:
- amd64
- aarch64

Inspect metadata, Docker build, base image, native dependencies and
architecture-specific assumptions.

HOME ASSISTANT API ACCESS

Audit the HA App runtime data path.

Verify:
- SUPERVISOR_TOKEN is consumed server-side only
- browser never receives SUPERVISOR_TOKEN
- browser never receives HA long-lived token
- browser does not directly call Supervisor/Core API
- application backend remains the security boundary
- no token is embedded into HTML/JS
- logs do not print tokens

If both Standalone and App modes exist, audit mode selection and fallback.

REST / WEBSOCKET TRANSPORT

Where Sprint 24 specifies HA REST and server-side WebSocket access in App mode,
inspect the actual transport implementation.

Verify:
- REST path is correct for current architecture
- WebSocket metadata access is server-side only
- no browser-to-HA WebSocket is introduced
- no generic WebSocket proxy exists
- only required normalized metadata is exposed to the browser
- reconnect/error handling fails safely
- app startup tolerates temporary HA Core unavailability where required

SECURITY / MINIMUM PERMISSIONS

Audit App permissions carefully.

Where applicable verify:
- homeassistant_api: true only if required
- no unnecessary host_network
- no unnecessary privileged mode
- no unnecessary host PID/device access
- no broad filesystem mounts
- no /config mount unless explicitly justified
- no Docker socket
- no SSH host access
- no unrelated Supervisor permissions
- no broad network/security workaround without justification

PERSISTENCE

Where applicable verify persistent runtime data uses /data or the actual
supported Home Assistant App persistent path.

Audit persistence for:
- application config
- dashboard config
- Admin config where applicable
- uploaded background assets where later features reuse DATA_DIR
- app-owned state that must survive restart

Verify:
- DATA_DIR abstraction is used where appropriate
- Standalone still uses a valid configurable path
- App mode does not write required persistent data only into image filesystem
- no required persistent config is stored in /tmp

NETWORK / DIRECT LAN UI

Sprint 24 requires a direct LAN-accessible web UI for the legacy iPad.

Audit:
- listening interface
- exposed port
- app port mapping
- direct LAN accessibility architecture
- no accidental localhost-only bind inside the App
- no requirement for modern HA Ingress for the iPad path

Ingress may be optional.

HEALTH ENDPOINT

Where required verify:
- health endpoint exists
- endpoint is bounded
- endpoint does not expose secrets
- endpoint does not require browser HA credentials
- healthy result reflects application availability
- failure behavior is deterministic

STARTUP / SHUTDOWN / RESTART

Inspect:
- startup script
- signal handling
- Node process handling
- retry behavior for temporary HA unavailability
- config initialization
- persistent directory creation
- permissions/ownership assumptions
- graceful shutdown where implemented

STANDALONE REGRESSION

Sprint 24 must not silently break Standalone/LXC deployment.

Verify where relevant:

Standalone:
- HA_URL
- backend HA token
- server-side REST/WebSocket
- configurable DATA_DIR
- normal HTTP listener
- Admin
- dashboards

App mode:
- Supervisor/Core API
- SUPERVISOR_TOKEN
- /data
- mapped/exposed port
- same frontend

LEGACY FRONTEND

App packaging must not alter the iOS 9 / ES5 frontend contract.

Where packaging-generated runtime configuration is injected into frontend code,
verify it does not introduce modern syntax/APIs.

SHARED ASSET / CACHE VERSION FOLLOW-UP

The known shared-cache inconsistency from earlier audit parts must remain tracked.

Known evidence:
- index.html: v=51
- system.html: v=44

Do NOT repair it in Part 13.

If App packaging/build copies or transforms these files:
- determine whether App mode is affected
- append evidence to the EXISTING Repair ID
- do not create a duplicate Repair ID

DOCUMENTATION

Where Sprint 24 documentation exists, verify it matches current behavior.

Check for incorrect claims about:
- Lovelace/internal frontend
- required long-lived token in App mode
- Ingress-only access
- unsupported architectures
- persistence paths
- ports
- manual /config mounts
- broad permissions

MANUAL TEST POLICY

No production HAOS/App or physical iPad tests are being performed during
Audit Part 13 unless existing documented evidence already exists.

All remaining real-runtime/manual tests will be executed after ALL Audit Parts
have completed.

Therefore:
- do NOT mark real HAOS/App installation requirements PASS without documented
  real-runtime evidence
- use NOT TESTED where appropriate
- add required tests to docs/audits/MANUAL_TEST_QUEUE.md

Use suitable IDs:
TEST-HAOS-XXX
TEST-IPAD-XXX
TEST-STANDALONE-XXX
TEST-APP-XXX

For EVERY queued manual test include:
- Test ID
- related Sprint
- Requirement
- Device/System
- Preconditions
- install/deployment state
- exact route/port
- exact step-by-step actions
- expected logs/result
- expected functional result
- failure criteria
- evidence to capture
- result field

Examples:
- install App from repository
- start App
- inspect logs
- open /health
- open /admin via LAN IP:port
- open default dashboard
- open custom dashboard
- verify HA API data loads
- restart App and verify persistence
- restart HA Core / reconnect
- update/reinstall App and verify /data persistence
- compare Standalone behavior
- test iPad access via direct LAN port

Do NOT add vague tests such as "Test HA App."

REPAIR QUEUE

Any actionable PARTIAL / MISSING / BROKEN finding must be represented in:
docs/audits/REPAIR_QUEUE.md

Every NEW repair item added from Part 13 must contain:
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

Before finishing Part 13, ensure every actionable finding is tracked.

AUDIT FILES

Create/update:
docs/audits/sprints/SPRINT-<ID>-AUDIT.md

Expected if current plan matches AUDIT_INDEX.md:
docs/audits/sprints/SPRINT-24-AUDIT.md

Do not overwrite or remove audit history from Parts 01–12.

Update:
docs/audits/AUDIT_INDEX.md
docs/audits/REPAIR_QUEUE.md
docs/audits/MANUAL_TEST_QUEUE.md

AUTOMATED / LOCAL TESTS

Run relevant repository/local tests for Part 13.

Where possible verify:
- packaging config syntax
- app startup command
- mode selection
- Supervisor token handling
- REST base URL selection
- WebSocket URL selection
- DATA_DIR selection
- persistence path construction
- /health
- token redaction
- direct listener binding
- Standalone mode regression
- App-mode mock API behavior

Local-only mocks may be used according to AGENTS/project policy.

Do NOT contact the real Home Assistant instance.
Do NOT read/use production credentials.
Do NOT claim real HAOS installation PASS from local mocks.

SECURITY

Explicitly verify:
- HA token backend-only
- SUPERVISOR_TOKEN backend-only
- no token injected into browser
- no generic HA service proxy
- no generic WebSocket proxy
- no arbitrary browser-to-Supervisor API
- minimal App permissions
- no unnecessary /config mount
- no unnecessary host access
- secret redaction
- safe startup logging
- safe error handling

FINAL REPORT

At the end report:

1. repository commit audited
2. exact Sprint IDs included in Part 13
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
16. for EACH new Repair Queue item: Repair ID, Sprint, Priority, Finding
17. existing Repair Queue items receiving additional evidence
18. App repository/packaging structure findings
19. config.yaml / metadata findings
20. architecture support findings
21. Supervisor/Core API findings
22. REST/WebSocket transport findings
23. token/security findings
24. permission findings
25. /data persistence findings
26. direct LAN/network findings
27. health endpoint findings
28. startup/restart findings
29. Standalone regression findings
30. documentation findings
31. shared asset/cache findings
32. Legacy Safari/iPad relevance
33. security findings
34. HAOS manual-test findings
35. whether Audit Part 13 is COMPLETE
36. exact scope planned for Part 14 according to AUDIT_INDEX.md
37. recommended audit-doc commit message

Do NOT start Part 14.
Do NOT perform repair work from REPAIR_QUEUE.md.
Do NOT perform production HAOS/iPad manual tests in this run.
Do NOT commit or push until I review the result.
```
