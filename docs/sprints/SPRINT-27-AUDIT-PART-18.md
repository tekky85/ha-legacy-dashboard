# Sprint 27 – Audit Part 18 Codex Prompt

```text
Execute Sprint 27 Audit Part 18 only.

Use the persistent Sprint 27 audit framework already present in the repository.

Read first:

- AGENTS.md
- docs/SPRINT_ROADMAP.md
- docs/PROJECT_STATUS.md
- docs/audits/AUDIT_INDEX.md
- docs/audits/REPAIR_QUEUE.md
- docs/audits/MANUAL_TEST_QUEUE.md
- all existing audit files from Parts 01–17
- all sprint specification files assigned to Audit Part 18 in AUDIT_INDEX.md

Inspect the actual repository state first.

IMPORTANT:

The exact Sprint scope for Part 18 is defined in:

docs/audits/AUDIT_INDEX.md

Use that definition as authoritative.

According to the current Sprint 27 plan, Part 18 belongs to the final Sprint
25 / 25.x audit phase.

If AUDIT_INDEX.md differs from any assumptions in this prompt, use
AUDIT_INDEX.md as the source of truth and report the discrepancy.

Do NOT silently expand the scope.

Do NOT start Part 19.

Do NOT perform broad repair work during this baseline audit.

For every Sprint assigned to Part 18:

1. Read the complete Sprint specification.
2. Compare every requirement against the CURRENT repository implementation.
3. Verify frontend behavior, kiosk/deployment documentation, legacy iPad
   assumptions, runtime prerequisites, tests and release-readiness implications
   where relevant.
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
- config/documentation path
- deployment instruction
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
PART 18 FOCUS – FINAL SPRINT 25.x VALIDATION / LEGACY IPAD KIOSK
==================================================

Part 18 is the final audit block of the Sprint 25 / 25.x sequence.

The exact assigned Sprint IDs are defined in AUDIT_INDEX.md.

Where the assigned scope includes Sprint 25.7, audit the kiosk/deployment
requirements below.

If additional Sprint 25.x items are assigned to Part 18, audit them according to
their specification as well.

Do NOT audit Sprint 26.x in this run.

==================================================
SPRINT 25.7 – LEGACY IPAD KIOSK DEPLOYMENT
==================================================

Where Sprint 25.7 is in scope, audit the documented and implemented kiosk
deployment approach for:

- iPad mini 1
- iOS 9.3.5
- Safari / HomeScreen web app
- Guided Access / Geführter Zugriff
- direct LAN dashboard access

The expected deployment strategy is conceptually:

HomeScreen web app
+
Guided Access
=
single-purpose wall display

For stricter managed environments, Supervision + Single App Mode / App Lock may
be documented as an alternative.

Do not claim unsupported modern iPadOS-only functionality works on iOS 9.

==================================================
KIOSK DOCUMENTATION
==================================================

Where required verify:

docs/IPAD_KIOSK.md

or the actual current documentation path exists and covers:

- prerequisites
- target device
- iOS version
- direct LAN URL
- HomeScreen installation
- Guided Access setup
- hardware-button restrictions
- Auto-Lock / sleep behavior
- rotation behavior
- power/charging expectations
- recovery/exit procedure
- reboot limitations
- known limitations
- security considerations

If the file/path differs, follow the Sprint spec and current repo.

==================================================
GUIDED ACCESS
==================================================

Where the Sprint requires Guided Access guidance, verify documentation clearly
distinguishes what Guided Access can and cannot do.

Expected concepts:

- lock the device to one app
- optionally restrict hardware buttons
- optionally restrict touch areas/features
- reduce accidental exit from dashboard
- suitable for a single unmanaged legacy iPad

Do not falsely claim Guided Access guarantees:

- automatic app relaunch after reboot
- unattended boot directly into dashboard
- enterprise-grade kiosk management
- remote fleet management

Those require stronger supervised/managed-device approaches where supported.

==================================================
SUPERVISION / SINGLE APP MODE
==================================================

If documented as an optional stricter mode, verify the docs clearly distinguish:

Guided Access:
- local/manual kiosk lock

Supervision + Single App Mode/App Lock:
- managed/supervised kiosk model
- potentially stricter behavior
- requires appropriate Apple configuration/management tooling

Do not make modern MDM assumptions that are not validated for iOS 9.

==================================================
HOMESCREEN WEB APP
==================================================

Audit the app prerequisites for HomeScreen use:

- correct mobile-web-app meta behavior where required
- same-origin internal navigation
- no target=_blank for internal routes
- no window.open() for internal routes
- safe route transitions
- direct LAN access
- no forced Ingress-only navigation
- no hardcoded origin that changes browsing context

If Sprint 25.2 established the navigation helper, document that dependency.

Do not re-audit Sprint 25.2 in full.

==================================================
KIOSK ROUTE / STARTUP URL
==================================================

Verify documentation uses a stable supported URL format.

Preferred examples may be:

http://<HA-IP>:3000/
http://<HA-IP>:3000/d/<dashboard-id>

Do not hardcode the user's actual production IP into generic release docs unless
the Sprint intentionally provides an example clearly labeled as such.

Where hostname guidance exists, distinguish:

- IP:port
- custom local DNS
- `.local` mDNS

Do not promise `.local` reliability where earlier audit evidence showed it may
be environment-dependent.

==================================================
SCREEN / POWER / AUTO-LOCK
==================================================

Where the kiosk guide covers power behavior, verify:

- Auto-Lock considerations
- charging/power supply
- screen-on expectations
- sleep/wake behavior
- what requires manual device settings
- no unsupported claim that the web app itself can disable all iOS power
  management

If the implementation uses no Wake Lock API because iOS 9 lacks it, that is
expected.

Do not introduce modern Wake Lock API dependencies.

==================================================
ROTATION
==================================================

Where Sprint 25.7 documents portrait/landscape use, verify:

- dashboard layout is intended to survive rotation
- no kiosk instruction assumes a modern orientation-lock API from the web app
- Guided Access/orientation behavior is documented accurately where known
- physical iPad validation remains NOT TESTED unless documented evidence exists

Do not conflate application responsiveness with device orientation lock.

==================================================
HARDWARE BUTTONS / TOUCH
==================================================

Where documentation covers Guided Access options, verify it explains how the
user can configure:

- Home button behavior
- volume buttons
- sleep/wake button
- touch
- motion/rotation where applicable

Use wording appropriate to iOS 9 where the exact current-device UI is not
verified.

If exact menu labels are uncertain, mark that portion for real-device/manual
validation rather than inventing modern labels.

==================================================
REBOOT / RECOVERY LIMITATIONS
==================================================

The guide must clearly state the operational limitation:

Guided Access is not equivalent to a fully managed auto-start kiosk after device
reboot.

Audit whether documentation covers:

- what happens after reboot
- whether the user must reopen the HomeScreen app
- whether Guided Access must be re-entered
- how to recover from app/browser failure
- how to exit kiosk intentionally

This is release-critical operational documentation for a wall-display use case.

==================================================
SECURITY / ADMIN BOUNDARY
==================================================

Kiosk mode must not replace application security.

Verify documentation does NOT imply:

- Guided Access protects Admin routes by itself
- kiosk mode is a substitute for Admin authentication
- physical device lock grants HA write authorization

Application security remains:

- Admin auth/token separation
- backend-only HA credentials
- explicit write authorization
- no generic HA service proxy

==================================================
DIRECT LAN / HA APP INTERACTION
==================================================

Where Sprint 25.7 assumes the Home Assistant App deployment, verify the kiosk
docs use the direct LAN web port required for legacy Safari.

Do not require modern HA Ingress for the kiosk path.

If both deployment modes are supported, document where appropriate:

Standalone/LXC:
- direct dashboard URL

HA App:
- direct mapped LAN port

==================================================
LEGACY SAFARI COMPATIBILITY
==================================================

Audit any kiosk-specific frontend code/configuration for compatibility with:

- iOS 9 Safari
- ES5

No kiosk feature should introduce hard dependency on:

- fetch
- Promise
- arrow functions
- let / const
- async/await
- optional chaining
- nullish coalescing
- Wake Lock API
- Service Worker requirement
- modern PWA APIs unsupported by iOS 9
- Web App Manifest as sole launch mechanism

If modern metadata exists as progressive enhancement, it must not be required for
the legacy iPad path.

==================================================
DOCUMENTATION LANGUAGE / D1 CONSISTENCY
==================================================

Where Sprint 25.7 changes product documentation, verify:

- German/English README references remain semantically synchronized where needed
- kiosk docs are linked from relevant README/install docs
- instructions do not contradict current HA App/Standalone docs
- screenshots, if any, are real application/device screenshots or controlled
  real app screenshots
- no generated mockups are presented as real-device evidence
- no production secrets/IPs/tokens are exposed

==================================================
SHARED ASSET / CACHE VERSION FOLLOW-UP
==================================================

The known shared-cache inconsistency remains tracked.

Known evidence:

- index.html: v=51
- system.html: v=44

Do NOT repair it in Part 18.

Because kiosk/HomeScreen Safari may cache aggressively, assess whether this
finding is particularly relevant for:

- theme persistence
- navigation helper
- layout updates
- control alignment
- kiosk reliability after app updates

If yes:

- append evidence to the EXISTING Repair ID
- do not duplicate the Repair ID
- preserve priority/history
- document explicit RC/kiosk relevance

==================================================
MANUAL TEST POLICY
==================================================

No physical iPad mini tests are being performed during Audit Part 18.

All real-device tests will be executed only after ALL Audit Parts have completed.

Therefore:

- do NOT mark Guided Access/HomeScreen/kiosk behavior PASS without documented
  real-device evidence
- classify it as NOT TESTED where appropriate
- create complete test instructions in:

docs/audits/MANUAL_TEST_QUEUE.md

Use suitable IDs:

TEST-IPAD-KIOSK-XXX
TEST-HOMESCREEN-XXX
TEST-IPAD-ROTATION-XXX
TEST-IPAD-POWER-XXX

For EVERY queued manual test include:

- Test ID
- related Sprint
- Requirement
- Device
- iOS version
- Preconditions
- exact dashboard URL
- deployment mode
- exact device settings required
- exact step-by-step actions
- expected visual result
- expected functional result
- failure criteria
- evidence to capture
- result field

==================================================
REQUIRED IPAD KIOSK TEST SET
==================================================

Where Sprint 25.7 is in scope, ensure MANUAL_TEST_QUEUE contains sufficiently
detailed tests for at least the following:

1. HomeScreen launch
2. Guided Access activation
3. Home button restriction
4. dashboard remains in same app context
5. Summary navigation
6. Errors/health navigation
7. Back/return navigation
8. custom dashboard return
9. portrait layout
10. landscape layout
11. rotation during active dashboard
12. screen sleep/wake behavior
13. Auto-Lock configuration
14. continuous charging/power scenario
15. Guided Access exit/recovery
16. device reboot behavior
17. post-reboot dashboard relaunch
18. post-reboot Guided Access behavior
19. direct LAN URL availability
20. theme persistence in HomeScreen mode

Where applicable combine these into efficient physical test sessions, but each
sub-check must retain an explicit expected result and failure criterion.

==================================================
EXAMPLE TEST STRUCTURE
==================================================

Example:

## TEST-IPAD-KIOSK-01

Sprint:
25.7

Requirement:
HomeScreen launch + Guided Access confinement

Device:
iPad mini 1

iOS:
9.3.5

Preconditions:
- dashboard reachable by direct LAN URL
- HomeScreen shortcut created
- Guided Access enabled in iOS settings

Steps:
1. Launch dashboard from HomeScreen icon.
2. Verify dashboard opens without Safari chrome where expected.
3. Start Guided Access using the documented iOS 9 procedure.
4. Attempt to exit using Home button.
5. Navigate Summary and return.
6. Navigate Errors and return.

Expected:
- dashboard remains usable
- internal navigation stays in same web-app context
- Home button does not exit while Guided Access is active
- return navigation restores the originating dashboard

Fail If:
- Safari opens a separate tab/window
- dashboard exits to Home Screen
- navigation loses origin/return target
- Guided Access cannot confine the app as documented

Evidence:
- photos/screenshots
- observed behavior notes

Result:
NOT TESTED

Do NOT add vague tests such as:

"Test kiosk mode."

==================================================
REPAIR QUEUE
==================================================

Any actionable:

PARTIAL
MISSING
BROKEN

finding must be represented in:

docs/audits/REPAIR_QUEUE.md

Every NEW repair item from Part 18 must contain:

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

- unusable kiosk path
- HomeScreen navigation escape
- misleading reboot behavior
- incorrect Guided Access documentation
- inaccessible direct LAN URL
- Admin/security misconception
- legacy iPad incompatibility
- release documentation error
- workaround availability

Do not classify every issue P0/P1.

Do not duplicate existing Repair IDs.

Before finishing Part 18:

- compare every new PARTIAL/MISSING/BROKEN finding with REPAIR_QUEUE.md
- ensure every actionable finding is tracked
- append evidence to existing Repair IDs where appropriate

==================================================
AUDIT FILES
==================================================

Create/update:

docs/audits/sprints/SPRINT-<ID>-AUDIT.md

for every Sprint assigned to Part 18.

Expected where the current plan maps it here may include:

docs/audits/sprints/SPRINT-25.7-AUDIT.md

Use AUDIT_INDEX.md as source of truth.

Do not overwrite or remove audit history from Parts 01–17.

Update:

docs/audits/AUDIT_INDEX.md
docs/audits/REPAIR_QUEUE.md
docs/audits/MANUAL_TEST_QUEUE.md

==================================================
AUTOMATED / LOCAL TESTS
==================================================

Run relevant bounded local tests where applicable.

Possible checks:

- HomeScreen meta tags
- internal link targets
- absence of window.open() for internal routes
- navigation helper
- return-target validation
- direct relative route generation
- no mandatory modern PWA API
- no Wake Lock dependency
- kiosk documentation links
- documentation references
- legacy JS syntax checks

Do NOT claim physical Guided Access behavior PASS from repository inspection.

Do NOT contact production Home Assistant.

Do NOT use production credentials.

==================================================
SECURITY
==================================================

Explicitly verify where relevant:

- HA token backend-only
- SUPERVISOR_TOKEN backend-only
- Admin authentication remains required
- Guided Access is not treated as application authorization
- no generic HA service proxy
- no generic WebSocket proxy
- no arbitrary browser service/domain passthrough
- safe return-target validation
- no open redirect
- no production credentials in kiosk docs
- no secret leakage in screenshots/examples

==================================================
FINAL REPORT
==================================================

At the end report:

1. repository commit audited
2. exact Sprint IDs included in Part 18
3. overall result for each audited Sprint
4. PASS findings
5. PARTIAL findings
6. MISSING findings
7. BROKEN findings
8. NOT TESTED requirements
9. superseded requirements and replacement Sprints
10. source/test/documentation evidence
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

If Sprint 25.7 is in scope:
18. kiosk documentation findings
19. Guided Access findings
20. HomeScreen findings
21. direct-LAN findings
22. rotation findings
23. power/Auto-Lock findings
24. reboot/recovery findings
25. supervision/Single-App-Mode findings
26. security-boundary findings
27. required iPad kiosk manual-test coverage

Cross-cutting:
28. shared asset/cache findings
29. Legacy Safari/iPad findings
30. documentation findings
31. security findings
32. Standalone/LXC relevance
33. Home Assistant App relevance
34. whether Audit Part 18 is COMPLETE
35. confirmation that the Sprint 25 / 25.x audit sequence is now complete
36. exact scope planned for Part 19 according to AUDIT_INDEX.md
37. recommended audit-doc commit message

Do NOT start Part 19.

Do NOT perform repair work from REPAIR_QUEUE.md.

Do NOT perform physical iPad mini/Guided Access tests in this run.

Do NOT publish images/releases/artifacts.

Do NOT commit or push until I review the result.
```
