# Sprint 27.4 – Community Test-Center: Pilot, End-to-End-Validierung & Tester-Onboarding

## Ziel

**Sprint 27.3 (GitHub-Pages-Test-Center) ist bereits implementiert.** Sprint 27.4 soll die vorhandene Lösung **nicht neu entwickeln**, sondern für die Nutzung durch mehrere externe Tester vorbereiten und den vollständigen Ablauf absichern:

`MANUAL_TEST_QUEUE.md → veröffentlichter Testkatalog → Testdurchführung auf eigener HA-App → Ergebnisdokumentation → JSON-Export → GitHub-Issue/Übergabe → Import/Validierung → zusammengeführte Auswertung → Zuordnung zur Repair Queue`

**Zielgruppe:** Personen, die HA Legacy Dashboard als **Home Assistant App in ihrer eigenen Home-Assistant-Umgebung** einsetzen. Sie müssen weder Codex noch Git oder Markdown kennen.

**Wichtig:** Codex darf automatische Tests mit synthetischen Daten durchführen. Die tatsächlichen HA-App-Tests auf den Systemen der anderen Personen erfolgen **anschließend durch die menschlichen Tester**. Diese Ergebnisse dürfen nicht vorweggenommen werden.

---

## Codex-Auftrag

```text
Execute Sprint 27.4 – Community Test-Center Pilot & End-to-End Validation.

This is a validation/onboarding sprint following the already implemented
Sprint 27.3 GitHub Pages Test-Center.

DO NOT rebuild the Test-Center, create a competing test-case database, or
redesign the website without a demonstrated blocking defect.

Primary goal: make the existing test process genuinely usable by multiple
independent Home Assistant App testers and make their results reliably
importable, comparable and actionable.

==================================================
1. READ AND DISCOVER
==================================================

Read:

- AGENTS.md
- docs/SPRINT_ROADMAP.md
- docs/PROJECT_STATUS.md
- docs/audits/AUDIT_INDEX.md
- docs/audits/MANUAL_TEST_QUEUE.md
- docs/audits/REPAIR_QUEUE.md
- relevant Sprint 27.3 documentation/implementation
- GitHub Pages publishing workflow/configuration
- test catalog generation code and schema
- Test-Center frontend code
- report JSON export/import implementation
- report validation/aggregation tools
- GitHub issue templates and available labels
- existing testing/onboarding documentation

Determine and report the REAL existing paths, commands, deployed URL,
report schema, test status enum and publishing method from the repository.
Do not guess file paths, a current release version or deployment URLs.

Confirm the committed Sprint 27.3 implementation actually exists. If not,
STOP and report what is missing rather than inventing a new product.

==================================================
2. PRE-FLIGHT AND SCOPE
==================================================

Before changing files:

- git branch --show-current
- git rev-parse HEAD
- git status --short
- inspect latest published test catalog and source test queue
- identify actual installed HA App release/tag referenced by test instructions
- identify relevant existing automated checks

Preserve unrelated changes. Do not clean/reset user changes.

Sprint 27.4 may fix narrowly scoped blocking defects discovered in the
Test-Center, schema, documentation, GitHub integration or aggregation tools.
Do not implement unrelated HA dashboard features or Sprint 27.1 repairs.

==================================================
3. VERIFY THE SINGLE SOURCE OF TRUTH
==================================================

Ensure the test-case catalog is generated from:

docs/audits/MANUAL_TEST_QUEUE.md

Use existing transformation logic if already implemented.

Verify:

- stable Test IDs
- Test ID uniqueness
- Sprint/requirement attribution
- prerequisites
- exact step-by-step instructions
- expected visual/functional results
- failure criteria
- necessary environment/capability conditions
- supported test status definitions
- test plan version / source commit or content hash
- deterministic catalog generation
- no loss of tests during transformation

Do not manually maintain a separate independent catalog.

If a test specification is incomplete, update the source test queue and
regenerate from it. Preserve original IDs.

Report source-to-generated counts and explicitly explain any excluded tests.

==================================================
4. PILOT SCENARIO SET
==================================================

Create a small, practical pilot set from EXISTING Test IDs. Do not invent
replacement IDs for the official test queue.

Prefer 8–12 representative cases, if available, covering:

- Home Assistant App installation or version verification
- HA App update / persistence (only where safe and a compatible prior
  installation exists)
- opening Admin and default/custom dashboards
- Summary and Error Dashboard navigation
- Light control with an authorized entity
- Climate/target temperature, including OFF behavior where supported
- Room Card presentation and collapse/expand
- Room Card/dashboard background
- theme/navigation/reload persistence
- an unsupported/not-applicable scenario to verify N/A handling
- an intentionally documented FAIL using a synthetic fixture to validate
  the reporting workflow, not a fake live-product failure

Select cases based on the actual catalog, device capabilities and tester
consent. Tests that write to HA (Light/Climate/etc.) require explicit
preconditions and must never execute automatically on another person's HA.

For each selected test, document:

- exact official Test ID
- purpose and required App capability
- test prerequisites / safe HA setup
- expected duration category (short/medium/long; no fabricated timing)
- whether test performs actual HA writes
- what evidence should be collected
- how to mark N/A versus BLOCKED versus FAIL

A missing required entity/capability must not automatically be counted as a
product failure.

==================================================
5. MULTI-TESTER WORKFLOW
==================================================

Make the current Test-Center usable with at least two independent users on
separate Home Assistant systems without requiring Git, Markdown or Codex.

Verify or minimally repair:

- start a test run with a unique run ID
- choose a non-sensitive tester pseudonym
- record HA Legacy Dashboard App version/tag accurately
- record Home Assistant version, installation method and architecture if known
- record browser/device when relevant
- keep Test-Center version and catalog/source version in report
- select a test and read its detailed instructions
- record PASS / FAIL / BLOCKED / NOT TESTED / N/A (or existing equivalent)
- add explanatory notes and evidence references
- save progress locally where already supported
- resume progress and/or import an earlier report
- export final JSON
- view/download a human-readable summary if already implemented
- clearly explain that local browser storage is not a shared server backup
- preserve existing results on reload and identify limitations of local storage
- avoid collisions between different runs by same/different testers

Do not require GitHub sign-in merely to READ the test catalog or EXPORT JSON.

GitHub sign-in may be needed when directly opening an Issue.

If the Test-Center supports no server-side synchronization, make that clear;
do not invent a cloud-sync guarantee.

==================================================
6. REPORT CONTRACT AND VALIDATION
==================================================

Inspect the actual Sprint 27.3 JSON schema and reuse it.

At minimum ensure the result is sufficiently structured for later analysis:

- schema version
- test run ID
- pseudonymous tester ID
- test-center/catalog version and/or commit/hash
- dashboard App version/tag
- HA version
- deployment = ha-app
- tester device/browser context (where available)
- exported timestamp
- per-test Test ID
- per-test status
- per-test notes
- issue/evidence references when supplied

If a field is missing, extend the existing schema in a backward-compatible
way. Do not introduce a second incompatible export format.

Validate:

- successful round-trip: export -> import -> same results
- old report schema compatibility or clear migration/rejection message
- unknown Test IDs are flagged, not silently discarded
- duplicate Test IDs within a run are handled deterministically
- duplicate report imports are handled/idempotent or clearly reported
- mismatched App versions remain separated in analysis
- mismatched catalog versions get an explicit warning
- corrupted/truncated/malformed JSON fails safely
- user-entered HTML/script is never executed in the Test-Center or reports
- arbitrary untrusted links are not blindly trusted
- Unicode/German notes survive import/export
- schema and size limits are bounded and documented

Every FAIL should have a useful minimum description or prompt for one.
Do not demand secrets, production entity names or raw sensitive logs.

==================================================
7. GITHUB ISSUE AND REPORT HANDOFF
==================================================

Verify the REAL existing GitHub Issue workflow from Sprint 27.3.

Keep separate concepts:

A. test-run submission (one report containing many cases)
B. defect/bug report (one independently actionable problem)

Verify:

- issue links/templates work for the actual repository
- test-run and defect information can be linked with Test IDs and run IDs
- no browser GitHub token/PAT is required or embedded in GitHub Pages
- testers can still download reports if GitHub submission fails
- clear manual fallback for non-GitHub users (send exported JSON to
  designated coordinator by an agreed channel; do not invent an email)
- no actual public test Issue is created from synthetic CI fixtures
- duplicate defect reports can be identified for later triage
- issue descriptions request App version, reproduction steps and
  sanitized evidence
- existing repository issues are not modified without explicit purpose

Use GitHub's existing Issue templates and project conventions. Do not make
unnecessary duplicate templates.

==================================================
8. CENTRAL AGGREGATION / AI-READY OUTPUT
==================================================

Validate the existing report validation and aggregation implementation using
multiple synthetic report fixtures representing different testers.

At minimum test:

- Tester A and Tester B on same App version
- Tester C on a different App version
- same Test ID tested independently by multiple testers
- PASS and FAIL for same Test ID
- BLOCKED and N/A handling
- one duplicate run/report
- one unknown Test ID
- one old catalog version
- one invalid/corrupted report
- different HA versions and supported features

The central aggregation MUST NOT:

- merge results from different App versions without showing the distinction
- count NOT TESTED / N/A as PASS
- overwrite one tester's result with another tester's result
- double-count the same imported run
- treat absence of hardware/entity support as proven software failure
- present synthetic test fixtures as real community findings

Produce an analyzable output from the aggregate tool using its existing
format. If needed, add a stable versioned machine-readable aggregate JSON
and a human-readable Markdown summary, reusing the existing implementation.

Required aggregate fields:

- App release/version
- test catalog version
- number of runs and distinct pseudonymous testers
- PASS / FAIL / BLOCKED / N/A / NOT TESTED counts
- per-Test-ID counts and detail references
- conflicting outcomes across testers
- failed cases sorted/grouped by App version
- issue IDs/links when available
- cases with no coverage
- environment/capability limitations
- confidence/coverage caveats

Create a deterministic offline command/workflow for the coordinator to:

1. collect the JSON exports
2. validate them
3. generate an aggregate
4. obtain a report usable for ChatGPT/Codex analysis

Write exact commands using the repository's actual scripts.

Do not publish testers' raw result JSON in the public Git repository by
default. Keep real submissions out of Git unless explicitly reviewed,
redacted and authorized.

==================================================
9. PRIVACY AND SECURITY
==================================================

Assume GitHub Pages and GitHub Issues are PUBLIC.

Review every tester-facing form, guide and exported field for privacy risks.

Requirements:

- pseudonyms rather than mandatory real names
- no HA access token / SUPERVISOR_TOKEN / Admin token
- no passwords, cookies or credentials
- no automatic upload of HA states or entity lists
- no automatic telemetry or undisclosed external data transfer
- no exact home address or private network configuration by default
- no unredacted logs/screenshots showing residents, names or sensitive values
- sanitize/escape displayed notes and imported data
- avoid leaking imported reports into URL query strings
- local storage disclosure and safe reset option where implemented
- no central upload endpoint without server-side authorization/data-retention
  policy; do not add one in this pilot sprint

The existing HA App permissions and Home Assistant security boundaries must
remain unchanged.

==================================================
10. HUMAN PILOT PLAN (NOT EXECUTED BY CODEX)
==================================================

Prepare a human pilot for at least two independent HA App testers,
preferably three, using independent Home Assistant installations.

Create/extend a concise GERMAN tester guide with:

1. test-center URL (derive actual URL from repository)
2. prerequisite HA App version and where to check it
3. note that the Test-Center is separate from the installed HA App
4. starting a new test run / identifying themselves pseudonymously
5. selecting the pilot test suite
6. following step-by-step instructions
7. correctly selecting PASS, FAIL, BLOCKED, N/A, NOT TESTED
8. documenting a failure with steps, observed behavior and sanitized evidence
9. saving progress / exporting JSON
10. submitting through GitHub Issue or fallback to coordinator
11. sending exact App version + JSON report
12. what to do when HA App or GitHub Pages is unavailable
13. what NOT to share for privacy/security

Create a short coordinator guide with:

- inviting testers
- assigning pilot Test IDs and optional division of work
- requiring independent result submissions
- recording which reports have arrived
- validating JSON reports
- running aggregate generation
- reviewing cross-version failures
- mapping confirmed defects to existing RQ-* or creating new ones
- keeping unresolved manual validation NOT TESTED
- deciding whether to begin the full manual acceptance run

No mandatory new user account system is required.

==================================================
11. PILOT TRACKING AND ACCEPTANCE
==================================================

Maintain a pilot tracking document in the existing testing documentation
structure (create only if not already present).

Separate:

A. TOOLING VERIFIED BY CODEX
B. REAL HUMAN PILOT TESTS PENDING

For human tests initially record:

- tester pseudonym / slot (not assumed actual person)
- assigned Test IDs
- App version to be tested
- report expected / received status
- date received when actually received
- issues linked
- result = NOT TESTED / PENDING until evidence exists

Never generate fake PASS records or fabricate feedback from outside testers.

Pilot exit criteria to be assessed AFTER real tester submissions:

- at least two independent real HA-App testers submit valid JSON reports
- reports identify actual App version and test plan version
- one report can be exported, reopened/imported and still be complete
- several reports can be aggregated without collisions or cross-version loss
- pilot testers understand test instructions and status definitions
- defects can be linked to GitHub Issues / Repair Queue
- no critical privacy or reporting defect remains
- coordinator can reproduce the aggregation commands

If real reports have not yet arrived, declare:

IMPLEMENTATION READY FOR HUMAN PILOT

not:

PILOT COMPLETED / MANUAL ACCEPTANCE PASSED.

==================================================
12. DOCS TO CREATE/UPDATE
==================================================

Use the repository's EXISTING docs/testing structure if available.
Avoid parallel duplicate manuals.

Deliver or update equivalent documents:

- tester onboarding guide (German, simple step-by-step)
- pilot test plan with actual Test IDs
- coordinator/aggregation procedure with commands
- pilot result/status tracking document
- report schema / compatibility notes where needed
- issue reporting and privacy guidance

Keep README.de.md and README.en.md semantically aligned if adding prominent
public-facing navigation/instructions. Do not replace old product screenshots
with mockups.

Keep the MANUAL_TEST_QUEUE.md as the authoritative test-case source.

Update docs/PROJECT_STATUS.md with the correct distinction between:

- Sprint 27.3 implemented
- Sprint 27.4 tooling/onboarding ready
- human pilot pending or evidenced
- full manual acceptance pending
- RC/final release gate pending

Only update REPAIR_QUEUE.md if an actionable NEW defect is actually verified.

==================================================
13. AUTOMATED TESTS AND CI
==================================================

Run and/or extend relevant automated checks, preferably reusing existing
Sprint 27.3 tests and tooling:

- catalog generation reproducibility
- catalog ID completeness/uniqueness
- webpage static build / link resolution
- JSON export/import round-trip
- schema validation and schema-version mismatch
- aggregation with multiple testers
- cross-release partitioning
- duplicate run handling
- invalid/hostile input escaping
- no accidental external data submission
- GitHub Issue template validity where checkable

Avoid requiring a live Home Assistant system for Test-Center unit tests.

Use isolated synthetic test data clearly marked as synthetic and excluded
from real result summaries.

GitHub Pages live accessibility and actual GitHub Issue creation, when not
available/authorized in the Codex environment, remain MANUAL CHECKS.
Clearly list them with step-by-step instructions and NOT TESTED status.

Do not start local servers outside 127.0.0.1. Stop any local mock servers.
Do not use the production .env.

==================================================
14. RELEASE AND EXISTING REPAIR PROTECTION
==================================================

This sprint validates the Test-Center, not the HA Legacy Dashboard runtime.

Do NOT:

- modify unrelated HA App/runtime behavior
- start another Sprint 27.1 repair batch
- publish/retag a new HA App version
- overwrite the Sprint 27.2 Public Test Release
- edit past Git tags or GitHub Releases
- claim physical iPad or HAOS testing occurred
- auto-create public Issues from test fixtures

If a Test-Center hotfix is required, scope it narrowly, test it, and allow the
existing GitHub Pages publishing workflow to deploy from its normal source.
Do not create a second Pages deployment workflow without need.

==================================================
15. ACCEPTANCE GATE
==================================================

Before commit/push require:

- existing Sprint 27.3 features retained
- full catalog derives from MANUAL_TEST_QUEUE.md
- pilot suite lists real existing Test IDs
- export/import round-trip passes
- multi-tester aggregation passes
- mixed App versions remain distinguishable
- unknown/duplicate/invalid reports handled clearly
- tester and coordinator guides usable without Codex knowledge
- no fake real test results
- no publication of private real reports
- public GitHub Issue workflow documented
- relevant automated regression tests green
- git diff contains only intended Sprint 27.4 changes

If an acceptance item is blocked, report precisely what is blocked. Do not
claim full completion or automatically expand scope.

==================================================
16. COMMIT AND PUSH
==================================================

After the AUTOMATED/TOOLING acceptance gate passes:

  git status
  git diff --check
  git diff

Stage ONLY changed Sprint 27.4 files, tests and relevant documentation.
Do not blindly stage unrelated files.

Commit:

  git commit -m "test: prepare community Test-Center pilot and report validation"

Push current branch:

  git push

If upstream is missing, determine current branch and push with upstream.
Never force-push.

Confirm GitHub Pages publishing action status where accessible. If actual
live Pages verification requires human/browser action, report it as pending
with exact verification steps.

==================================================
17. FINAL CODEX REPORT
==================================================

Report:

1. base commit and branch
2. actual Test-Center / Pages URL
3. source catalog file and generated output path
4. total source test cases vs generated cases
5. pilot test IDs and why chosen
6. export schema version and compatibility notes
7. multi-tester synthetic fixtures used
8. automated tests, commands and results
9. cross-version isolation result
10. duplicate/malformed report behavior
11. GitHub Issue workflow / fallback status
12. tester onboarding guide location
13. coordinator / aggregate procedure location
14. pilot tracking document location
15. privacy/security findings
16. known limitations
17. files changed
18. commit hash and push outcome
19. Pages deployment outcome / pending live check
20. whether tooling is READY FOR HUMAN PILOT
21. which steps still require actual HA App testers
22. whether full manual acceptance is still pending
23. recommended next step after the real pilot reports arrive

Do not mark REAL PILOT PASS without actual externally supplied evidence.
Do not automatically start another Sprint.
```

---

## Empfohlener Ablauf nach Codex

1. **Sprint 27.4 implementieren:** Tests für Import/Export und Gesamtauswertung, Tester- und Koordinatorenanleitung, Pilot-Testliste und Tracking.
2. **Pilot mit 2–3 HA-App-Testern durchführen:** Jeder verwendet seine eigene HA-Installation und exportiert einen eigenen JSON-Testreport.
3. **Reports einsammeln und gemeinsam auswerten:** Gleiche Test-IDs, unterschiedliche App-Versionen und mehrfach auftretende Fehler werden sauber unterschieden.
4. **Erst danach den vollständigen manuellen Testplan freigeben:** Offene Probleme in GitHub Issues und `REPAIR_QUEUE.md` übernehmen; gegebenenfalls gezielter Hotfix-Sprint vor Vollabnahme.

## Git

```bash
git status
git diff --check
git diff
# Nur die von Sprint 27.4 betroffenen Dateien gezielt stagen.
git commit -m "test: prepare community Test-Center pilot and report validation"
git push
```

**Hinweis:** Die realen Testergebnisse entstehen erst im anschließenden Pilot. Codex darf Testfälle und Berichte mit eindeutig gekennzeichneten synthetischen Fixtures technisch prüfen, aber keine echten Prüfergebnisse erfinden.
